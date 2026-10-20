import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

export const ROOT = resolve(import.meta.dir, "../..");
export const RECIPE = {
  version: 1,
  endpoint: "https://api.elevenlabs.io/v1/sound-generation",
  model: "eleven_text_to_sound_v2",
  outputFormat: "mp3_44100_128",
  delivery: { format: "wav", sampleRate: 44100, channels: 1, bits: 16, peakDb: -3, fadeMs: 5 },
};
const MAX_BYTES = 25 * 1024 * 1024;
const generatedRights = {
  license: "ElevenLabs Sound Effects terms; usage subject to the account's subscription",
  url: "https://elevenlabs.io/creative-terms",
  attribution: "Generated with ElevenLabs Sound Effects",
};
type FileSource = { kind: "file"; path: string; license: string; url: string; attribution: string };
export type Effect = {
  name: string; products: string[]; durationSeconds: number; loop: boolean; promptInfluence: number;
  source: { kind: "elevenlabs" } | FileSource;
};
type AudioInfo = { durationSeconds: number; peakDb: number; samples: number };
type Entry = {
  key: string; promptSha256: string; audioSha256: string; nativeSha256: string;
  effect: Effect; rights: typeof generatedRights; generatedAt: string; approvedAt?: string;
  audio: AudioInfo; engine: string;
};
export type Manifest = { recipe: typeof RECIPE; sounds: Record<string, Entry> };
export const sha256 = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");
const stage = (root: string, name = "") => resolve(root, "sounds/tools/.generation", name);
const text = (path: string) => readFileSync(path, "utf8");
const freshManifest = (): Manifest => ({ recipe: RECIPE, sounds: {} });

function nonempty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function importPath(root: string, path: string): string {
  const directory = resolve(root, "sounds/sources");
  const target = resolve(directory, path);
  const local = relative(directory, target);
  if (isAbsolute(path) || local === ".." || local.startsWith(`..${sep}`) || isAbsolute(local)) {
    throw new Error("Un import doit rester dans sounds/sources/.");
  }
  if (!/\.(wav|mp3|ogg|flac|aiff|m4a)$/i.test(path)) throw new Error("Format d'import audio non pris en charge.");
  if (existsSync(target)) {
    const actual = relative(realpathSync(directory), realpathSync(target));
    if (actual === ".." || actual.startsWith(`..${sep}`) || isAbsolute(actual)) {
      throw new Error("Un lien d'import ne doit pas sortir de sounds/sources/.");
    }
    const file = statSync(target);
    if (!file.isFile() || !file.size || file.size > MAX_BYTES) throw new Error("Import refusé : fichier ordinaire de 1 octet à 25 Mio requis.");
  }
  return target;
}

export function loadEffects(root: string): Effect[] {
  const config = JSON.parse(text(resolve(root, "sounds/tools/effects.json")));
  if (config.version !== 1 || !Array.isArray(config.effects) || !config.effects.length) {
    throw new Error("Configuration des sons invalide.");
  }
  const names = new Set<string>();
  for (const effect of config.effects) {
    if (!effect || typeof effect.name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(effect.name)
      || names.has(effect.name) || !Array.isArray(effect.products) || !effect.products.length
      || !effect.products.every((id: unknown) => nonempty(id) && /^[A-Z]{2}-\d{2}$/.test(id))
      || new Set(effect.products).size !== effect.products.length
      || typeof effect.durationSeconds !== "number" || !Number.isFinite(effect.durationSeconds)
      || effect.durationSeconds < 0.5 || effect.durationSeconds > 30 || typeof effect.loop !== "boolean"
      || typeof effect.promptInfluence !== "number" || !Number.isFinite(effect.promptInfluence)
      || effect.promptInfluence < 0 || effect.promptInfluence > 1
      || !effect.source || !["elevenlabs", "file"].includes(effect.source.kind)) {
      throw new Error("Fiche sonore invalide ou nom dupliqué.");
    }
    if (effect.source.kind === "file") {
      const source = effect.source;
      if (![source.path, source.license, source.url, source.attribution].every(nonempty)) {
        throw new Error(`Source, licence ou attribution absente : ${effect.name}`);
      }
      importPath(root, source.path);
    }
    names.add(effect.name);
  }
  return config.effects;
}

export function selectEffects(effects: Effect[], names: string[]): Effect[] {
  if (names.length === 1 && names[0] === "all") return effects;
  if (!names.length || names.some(name => !effects.some(effect => effect.name === name))) {
    throw new Error("Indiquer des noms d'effets connus ou all ; voir --plan.");
  }
  return effects.filter(effect => names.includes(effect.name));
}

export function prepare(root: string, effect: Effect) {
  const style = text(resolve(root, "sounds/prompts/style.md")).trim();
  const subject = text(resolve(root, "sounds/prompts", `${effect.name}.md`)).trim();
  if (!style || !subject) throw new Error(`Prompt vide : ${effect.name}`);
  const prompt = `${style}\n\n${subject}\n\nDuration: ${effect.durationSeconds} seconds. ${effect.loop ? "Seamless loop." : "Single sound effect, not a loop."}`;
  const native = effect.source.kind === "file" ? readFileSync(importPath(root, effect.source.path)) : undefined;
  if (native && (!native.length || native.length > MAX_BYTES)) throw new Error(`Taille d'import refusée : ${effect.name}`);
  const promptSha256 = sha256(prompt);
  const key = sha256(JSON.stringify({
    recipe: RECIPE, effect, promptSha256, nativeSha256: native ? sha256(native) : null,
    lockSha256: sha256(readFileSync(resolve(root, "sounds/tools/bun.lock"))),
  }));
  return { prompt, promptSha256, key, native };
}

function atomicWrite(path: string, data: string | Uint8Array): void {
  writeFileSync(`${path}.tmp`, data);
  renameSync(`${path}.tmp`, path);
}

export function loadManifest(root: string): Manifest {
  return existsSync(stage(root, "manifest.json"))
    ? JSON.parse(text(stage(root, "manifest.json"))) : freshManifest();
}

function saveManifest(root: string, manifest: Manifest): void {
  manifest.recipe = RECIPE;
  atomicWrite(stage(root, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

export async function withLock(root: string, action: () => void | Promise<void>): Promise<void> {
  mkdirSync(stage(root), { recursive: true });
  const path = stage(root, ".lock");
  try { mkdirSync(path); } catch { throw new Error("Une opération sonore est active ou un verrou subsiste : sounds/tools/.generation/.lock"); }
  try { await action(); } finally { rmSync(path, { recursive: true }); }
}

export async function requestSound(effect: Effect, prompt: string, apiKey: string, transport: typeof fetch = fetch): Promise<Uint8Array> {
  let response: Response;
  try {
    response = await transport(`${RECIPE.endpoint}?output_format=${RECIPE.outputFormat}`, {
      method: "POST", headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: prompt, model_id: RECIPE.model, duration_seconds: effect.durationSeconds,
        prompt_influence: effect.promptInfluence, loop: effect.loop,
      }),
      signal: AbortSignal.timeout(120_000), redirect: "error",
    });
  } catch { throw new Error("ElevenLabs : requête interrompue ou réseau indisponible ; aucune relance automatique."); }
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`ElevenLabs HTTP ${response.status} ; aucune relance automatique.`);
  }
  if (!response.headers.get("content-type")?.toLowerCase().startsWith("audio/")) {
    await response.body?.cancel();
    throw new Error("ElevenLabs : réponse non audio refusée.");
  }
  if (!response.body) throw new Error("ElevenLabs : réponse vide.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) throw new Error("ElevenLabs : réponse audio trop volumineuse.");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  if (!size) throw new Error("ElevenLabs : réponse vide.");
  return Buffer.concat(chunks);
}

function ffmpeg(args: string[]): Buffer {
  try {
    return execFileSync("ffmpeg", args, { maxBuffer: 8 * 1024 * 1024, timeout: 30_000, stdio: ["ignore", "pipe", "pipe"] });
  } catch { throw new Error("FFmpeg absent, délai dépassé ou fichier audio indécodable."); }
}

export function engineVersion(): string {
  return ffmpeg(["-version"]).toString().split("\n")[0]!;
}

export function normalizeAudio(path: string, loop: boolean): { wav: Buffer; info: AudioInfo } {
  const pcm = ffmpeg([
    "-v", "error", "-nostdin", "-protocol_whitelist", "file,pipe", "-i", path,
    "-t", "30.1", "-map", "0:a:0", "-vn", "-ac", "1", "-ar", "44100", "-f", "s16le", "pipe:1",
  ]);
  const samples = Math.floor(pcm.length / 2);
  const durationSeconds = samples / RECIPE.delivery.sampleRate;
  if (durationSeconds < 0.5 || durationSeconds > 30) throw new Error("Durée audio reçue hors limites : 0,5 à 30 secondes requises.");
  let peak = 0;
  for (let i = 0; i < samples; i++) peak = Math.max(peak, Math.abs(pcm.readInt16LE(i * 2)));
  if (peak < 4) throw new Error("Audio silencieux ou quasi silencieux refusé.");
  const target = Math.floor(32767 * 10 ** (RECIPE.delivery.peakDb / 20));
  const gain = target / peak;
  const fade = Math.round(RECIPE.delivery.fadeMs * RECIPE.delivery.sampleRate / 1000);
  for (let i = 0; i < samples; i++) {
    const envelope = loop ? 1 : Math.min(1, i / fade, (samples - 1 - i) / fade);
    pcm.writeInt16LE(Math.round(pcm.readInt16LE(i * 2) * gain * envelope), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(44100, 24); header.writeUInt32LE(88200, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
  let actualPeak = 0;
  for (let i = 0; i < samples; i++) actualPeak = Math.max(actualPeak, Math.abs(pcm.readInt16LE(i * 2)));
  return { wav: Buffer.concat([header, pcm]), info: { durationSeconds, samples, peakDb: 20 * Math.log10(actualPeak / 32767) } };
}

export function isCurrent(root: string, effect: Effect, entry: Entry | undefined, key = prepare(root, effect).key): entry is Entry {
  if (!entry || entry.key !== key) return false;
  const files = [
    [`${effect.name}.wav`, entry.audioSha256],
    [`${effect.name}.native`, entry.nativeSha256],
    [`${effect.name}.prompt.txt`, entry.promptSha256],
  ];
  return files.every(([name, hash]) => existsSync(stage(root, name!)) && sha256(readFileSync(stage(root, name!))) === hash);
}

export async function generate(root: string, effects: Effect[], retry = false, transport: typeof fetch = fetch): Promise<void> {
  const manifest = loadManifest(root);
  const prepared = effects.map(effect => ({ effect, input: prepare(root, effect) }));
  if (retry && prepared.some(({ effect }) => manifest.sounds[effect.name]?.approvedAt)) {
    throw new Error("Reprise refusée pour un son validé ; modifier sa fiche pour créer une nouvelle version.");
  }
  const pending = prepared.filter(({ effect, input }) => retry || !isCurrent(root, effect, manifest.sounds[effect.name], input.key));
  if (!pending.length) { console.log("Tous les sons demandés sont à jour ; aucun appel réseau."); return; }
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (pending.some(({ effect }) => effect.source.kind === "elevenlabs") && !apiKey) {
    throw new Error("ELEVENLABS_API_KEY absente ; configurer une clé ou choisir une source file.");
  }
  const engine = engineVersion();
  for (const { effect, input } of pending) {
    const native = input.native ?? await requestSound(effect, input.prompt, apiKey!, transport);
    atomicWrite(stage(root, `${effect.name}.native`), native);
    atomicWrite(stage(root, `${effect.name}.prompt.txt`), input.prompt);
    const { wav, info } = normalizeAudio(stage(root, `${effect.name}.native`), effect.loop);
    atomicWrite(stage(root, `${effect.name}.wav`), wav);
    manifest.sounds[effect.name] = {
      key: input.key, promptSha256: input.promptSha256, nativeSha256: sha256(native), audioSha256: sha256(wav),
      effect, rights: effect.source.kind === "file"
        ? { license: effect.source.license, url: effect.source.url, attribution: effect.source.attribution } : generatedRights,
      generatedAt: new Date().toISOString(), audio: info, engine,
    };
    saveManifest(root, manifest);
    console.log(`${effect.name} : ${info.durationSeconds.toFixed(2)} s, WAV à écouter dans sounds/tools/.generation/`);
  }
}

export function approve(root: string, effects: Effect[]): void {
  const manifest = loadManifest(root);
  for (const effect of effects) {
    if (!isCurrent(root, effect, manifest.sounds[effect.name])) throw new Error(`Son absent, modifié ou périmé : ${effect.name}`);
  }
  for (const effect of effects) manifest.sounds[effect.name]!.approvedAt = new Date().toISOString();
  saveManifest(root, manifest);
}

export function publish(root: string, effects: Effect[]): void {
  const manifest = loadManifest(root);
  const current = freshManifest();
  const audio = new Map<string, Buffer>();
  for (const effect of effects) {
    const entry = manifest.sounds[effect.name];
    if (!isCurrent(root, effect, entry) || !entry.approvedAt) throw new Error(`Publication refusée : ${effect.name} non validé ou périmé.`);
    const bytes = readFileSync(stage(root, `${effect.name}.wav`));
    if (sha256(bytes) !== entry.audioSha256) throw new Error(`Son modifié : ${effect.name}`);
    audio.set(effect.name, bytes);
    current.sounds[effect.name] = entry;
  }
  const temporary = resolve(root, "sounds/tools/.publish");
  const backup = resolve(root, "sounds/tools/.backup");
  const library = resolve(root, "sounds/library");
  if (existsSync(temporary) || existsSync(backup)) throw new Error("Publication interrompue : examiner sounds/tools/.publish et .backup avant de poursuivre.");
  mkdirSync(temporary);
  try {
    for (const [name, bytes] of audio) writeFileSync(resolve(temporary, `${name}.wav`), bytes);
    writeFileSync(resolve(temporary, "generation.json"), `${JSON.stringify(current, null, 2)}\n`);
    if (existsSync(library)) renameSync(library, backup);
    try { renameSync(temporary, library); }
    catch (error) { if (existsSync(backup)) renameSync(backup, library); throw error; }
    rmSync(backup, { recursive: true, force: true });
  } finally { rmSync(temporary, { recursive: true, force: true }); }
  console.log(`${effects.length} effets publiés dans sounds/library/, avec leurs attributions et provenances.`);
}

if (import.meta.main) {
  try {
    const [command, ...names] = process.argv.slice(2);
    const effects = loadEffects(ROOT);
    if (command === "--plan" && !names.length) {
      const manifest = loadManifest(ROOT);
      console.log(JSON.stringify({ recipe: RECIPE, effects: effects.map(effect => {
        const input = prepare(ROOT, effect);
        const entry = manifest.sounds[effect.name];
        return {
          ...effect, prompt: input.prompt,
          status: isCurrent(ROOT, effect, entry, input.key) ? (entry.approvedAt ? "validé" : "à écouter") : "à générer",
        };
      }) }, null, 2));
    } else if (command === "--generate" || command === "--retry" || command === "--approve") {
      const selected = selectEffects(effects, names);
      await withLock(ROOT, () => command === "--approve" ? approve(ROOT, selected) : generate(ROOT, selected, command === "--retry"));
    } else if (command === "--publish" && !names.length) {
      await withLock(ROOT, () => publish(ROOT, effects));
    } else throw new Error("Usage : --plan | --generate <effets|all> | --retry <effets|all> | --approve <effets|all> | --publish");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Échec de la génération sonore.";
    const key = process.env.ELEVENLABS_API_KEY;
    console.error((key ? message.replaceAll(key, "[secret]") : message).slice(0, 600));
    process.exitCode = 1;
  }
}
