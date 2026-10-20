import { afterEach, describe, expect, test } from "bun:test";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, truncateSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import {
  ROOT, RECIPE, approve, generate, importPath, isCurrent, loadEffects, loadManifest,
  normalizeAudio, prepare, publish, requestSound, selectEffects, withLock, type Effect,
} from "./generate.ts";

const roots: string[] = [];
const sourceEffect: Effect = {
  name: "essai", products: ["BB-01"], durationSeconds: 1, loop: false, promptInfluence: 0.5,
  source: { kind: "file", path: "test.wav", license: "CC0-1.0", url: "https://example.org/test", attribution: "Test fixture" },
};
const remoteEffect: Effect = { ...sourceEffect, source: { kind: "elevenlabs" } };

function sine(seconds = 1, amplitude = 16000): Buffer {
  const samples = Math.round(seconds * 44100);
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(44100, 24); wav.writeUInt32LE(88200, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(amplitude * Math.sin(i * 2 * Math.PI * 440 / 44100)), 44 + i * 2);
  return wav;
}

function fixture(effects: Effect[] = [sourceEffect]): string {
  const root = mkdtempSync(resolve(tmpdir(), "bureaublasters-sounds-"));
  roots.push(root);
  for (const dir of ["sounds/prompts", "sounds/sources", "sounds/tools/.generation"]) mkdirSync(resolve(root, dir), { recursive: true });
  writeFileSync(resolve(root, "sounds/tools/effects.json"), JSON.stringify({ version: 1, effects }));
  copyFileSync(resolve(ROOT, "sounds/tools/bun.lock"), resolve(root, "sounds/tools/bun.lock"));
  writeFileSync(resolve(root, "sounds/prompts/style.md"), "A playful toy sound.");
  for (const effect of effects) writeFileSync(resolve(root, `sounds/prompts/${effect.name}.md`), "One short ding.");
  writeFileSync(resolve(root, "sounds/sources/test.wav"), sine());
  return root;
}

const staged = (root: string, filename: string) => resolve(root, "sounds/tools/.generation", filename);
const build = (root: string, effects = loadEffects(root)) => withLock(root, () => generate(root, effects));
const transport = (handler: (input: Parameters<typeof fetch>[0], init?: RequestInit) => Promise<Response>): typeof fetch =>
  Object.assign(handler, { preconnect: fetch.preconnect });

afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });

describe("fiches et empreintes", () => {
  test("les neuf effets couvrent les effets sonores des fiches sans inventer de sons aux recharges", () => {
    const effects = loadEffects(ROOT);
    expect(effects).toHaveLength(9);
    expect(effects.find(effect => effect.name === "coin-coin")?.products).toEqual(["BB-05", "RE-04"]);
    expect(new Set(effects.flatMap(effect => effect.products))).toEqual(new Set([
      "BB-01", "BB-02", "BB-03", "BB-04", "BB-05", "BB-06", "BB-07", "BB-08", "RE-02", "RE-04",
    ]));
    for (const effect of effects) expect(prepare(ROOT, effect).prompt.length).toBeGreaterThan(100);
  });

  test("sélection explicite et absence de noms inconnus", () => {
    expect(selectEffects([sourceEffect], ["all"])).toEqual([sourceEffect]);
    expect(() => selectEffects([sourceEffect], [])).toThrow();
    expect(() => selectEffects([sourceEffect], ["../essai"])).toThrow();
    expect(() => selectEffects([sourceEffect], ["all", "essai"])).toThrow();
  });

  test.each([
    { durationSeconds: 0.1 }, { durationSeconds: 31 }, { promptInfluence: 1.1 },
    { name: "../essai" }, { products: [] }, { loop: "yes" }, { source: { kind: "unknown" } },
    { source: { ...sourceEffect.source, license: "" } },
  ])("refuse une fiche invalide : %j", (patch) => {
    const root = fixture([{ ...sourceEffect, ...patch } as Effect]);
    expect(() => loadEffects(root)).toThrow();
  });

  test("refuse les doublons et les chemins sortant des sources", () => {
    expect(() => loadEffects(fixture([sourceEffect, sourceEffect]))).toThrow();
    expect(() => importPath(ROOT, "../secret.wav")).toThrow();
    expect(() => importPath(ROOT, "/tmp/secret.wav")).toThrow();
    expect(() => importPath(ROOT, "playlist.m3u")).toThrow();
  });

  test("refuse les liens externes, fichiers vides et imports trop volumineux", () => {
    const root = fixture();
    const external = resolve(root, "outside.wav");
    writeFileSync(external, sine());
    symlinkSync(external, resolve(root, "sounds/sources/link.wav"));
    expect(() => importPath(root, "link.wav")).toThrow("lien d'import");
    const path = resolve(root, "sounds/sources/test.wav");
    writeFileSync(path, "");
    expect(() => prepare(root, sourceEffect)).toThrow("Import refusé");
    truncateSync(path, 26 * 1024 * 1024);
    expect(() => prepare(root, sourceEffect)).toThrow("Import refusé");
  });

  test("prompt produit, style, recette, source et verrou participent à l'identité", () => {
    const root = fixture();
    const original = prepare(root, sourceEffect).key;
    expect(prepare(root, { ...sourceEffect, loop: true }).key).not.toBe(original);
    expect(prepare(root, { ...sourceEffect, durationSeconds: 2 }).key).not.toBe(original);
    writeFileSync(resolve(root, "sounds/prompts/essai.md"), "A different sound.");
    const changed = prepare(root, sourceEffect).key;
    expect(changed).not.toBe(original);
    writeFileSync(resolve(root, "sounds/prompts/style.md"), "Another style.");
    expect(prepare(root, sourceEffect).key).not.toBe(changed);
    const beforeSource = prepare(root, sourceEffect).key;
    writeFileSync(resolve(root, "sounds/sources/test.wav"), sine(1, 8000));
    expect(prepare(root, sourceEffect).key).not.toBe(beforeSource);
    const beforeLock = prepare(root, sourceEffect).key;
    writeFileSync(resolve(root, "sounds/tools/bun.lock"), "another lock");
    expect(prepare(root, sourceEffect).key).not.toBe(beforeLock);
  });
});

describe("transport ElevenLabs sans réseau", () => {
  test("envoie le prompt au modèle audio avec tous les paramètres", async () => {
    let calls = 0;
    const bytes = await requestSound(remoteEffect, "A short ding", "test-key", transport(async (url, init) => {
      calls++;
      expect(String(url)).toBe(`${RECIPE.endpoint}?output_format=mp3_44100_128`);
      expect(init?.headers).toEqual({ "xi-api-key": "test-key", "Content-Type": "application/json" });
      expect(init?.redirect).toBe("error");
      expect(JSON.parse(String(init?.body))).toEqual({
        text: "A short ding", model_id: "eleven_text_to_sound_v2", duration_seconds: 1, prompt_influence: 0.5, loop: false,
      });
      return new Response(new Uint8Array([1, 2, 3]), { headers: { "Content-Type": "audio/mpeg" } });
    }));
    expect([...bytes]).toEqual([1, 2, 3]);
    expect(calls).toBe(1);
  });

  test("une erreur de quota ne provoque aucune relance ni fuite du corps privé", async () => {
    let calls = 0;
    await expect(requestSound(remoteEffect, "prompt", "secret", transport(async () => {
      calls++;
      return new Response("private provider error secret", { status: 429 });
    }))).rejects.toThrow("ElevenLabs HTTP 429 ; aucune relance automatique.");
    expect(calls).toBe(1);
  });

  test("refuse JSON, réponse vide et erreur réseau sans recopier les détails", async () => {
    await expect(requestSound(remoteEffect, "p", "k", transport(async () => Response.json({ error: "private" })))).rejects.toThrow("non audio");
    await expect(requestSound(remoteEffect, "p", "k", transport(async () => new Response(null, { headers: { "content-type": "audio/mpeg" } })))).rejects.toThrow("vide");
    await expect(requestSound(remoteEffect, "p", "secret", transport(async () => { throw new Error("secret"); }))).rejects.toThrow("réseau indisponible");
  });

  test("refuse une réponse audio dépassant 25 Mio", async () => {
    await expect(requestSound(remoteEffect, "p", "k", transport(async () =>
      new Response(new Uint8Array(25 * 1024 * 1024 + 1), { headers: { "content-type": "audio/mpeg" } })
    ))).rejects.toThrow("trop volumineuse");
  });

  test("clé manquante : aucun essai de génération", async () => {
    const key = process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_API_KEY;
    try { await expect(build(fixture([remoteEffect]))).rejects.toThrow("ELEVENLABS_API_KEY absente"); }
    finally { if (key !== undefined) process.env.ELEVENLABS_API_KEY = key; }
  });
});

describe("audio, validation et publication hors ligne avec FFmpeg", () => {
  test("convertit en WAV PCM mono 44,1 kHz, limite la crête et applique des fondus", () => {
    const root = fixture();
    const { wav, info } = normalizeAudio(resolve(root, "sounds/sources/test.wav"), false);
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(wav.readUInt16LE(22)).toBe(1);
    expect(wav.readUInt32LE(24)).toBe(44100);
    expect(wav.readUInt16LE(34)).toBe(16);
    expect(wav.readInt16LE(44)).toBe(0);
    expect(wav.readInt16LE(wav.length - 2)).toBe(0);
    expect(info.durationSeconds).toBe(1);
    expect(info.peakDb).toBeCloseTo(-3, 2);
    const loop = normalizeAudio(resolve(root, "sounds/sources/test.wav"), true).wav;
    expect(loop.readInt16LE(loop.length - 2)).not.toBe(0);
  });

  test("chaîne fournisseur simulé : cache hors ligne et nouvelle approbation après changement", async () => {
    const root = fixture([remoteEffect]);
    const key = process.env.ELEVENLABS_API_KEY;
    process.env.ELEVENLABS_API_KEY = "fake-key";
    let calls = 0;
    const fake = transport(async () => {
      calls++;
      return new Response(new Uint8Array(sine()), { headers: { "content-type": "audio/wav" } });
    });
    try {
      await withLock(root, () => generate(root, [remoteEffect], false, fake));
      approve(root, [remoteEffect]);
      delete process.env.ELEVENLABS_API_KEY;
      await withLock(root, () => generate(root, [remoteEffect], false, fake));
      expect(calls).toBe(1);
      process.env.ELEVENLABS_API_KEY = "fake-key";
      writeFileSync(resolve(root, "sounds/prompts/essai.md"), "One warm quack.");
      await withLock(root, () => generate(root, [remoteEffect], false, fake));
      expect(calls).toBe(2);
      expect(loadManifest(root).sounds.essai?.approvedAt).toBeUndefined();
      expect(JSON.stringify(loadManifest(root))).not.toContain("fake-key");
      expect(() => publish(root, [remoteEffect])).toThrow("non validé");
    } finally {
      if (key !== undefined) process.env.ELEVENLABS_API_KEY = key;
      else delete process.env.ELEVENLABS_API_KEY;
    }
  });

  test("refuse silence, durée excessive et données non audio", () => {
    const root = fixture();
    const path = resolve(root, "sounds/sources/test.wav");
    writeFileSync(path, sine(1, 0));
    expect(() => normalizeAudio(path, false)).toThrow("silencieux");
    writeFileSync(path, sine(31));
    expect(() => normalizeAudio(path, false)).toThrow("Durée");
    writeFileSync(path, "not audio");
    expect(() => normalizeAudio(path, false)).toThrow("indécodable");
  });

  test("import, cache, approbation et provenance de publication", async () => {
    const root = fixture();
    await build(root);
    const entry = loadManifest(root).sounds.essai!;
    expect(isCurrent(root, sourceEffect, entry)).toBe(true);
    expect(entry.rights.license).toBe("CC0-1.0");
    expect(() => publish(root, [sourceEffect])).toThrow("non validé");
    await build(root);
    expect(loadManifest(root).sounds.essai?.generatedAt).toBe(entry.generatedAt);
    approve(root, [sourceEffect]);
    publish(root, [sourceEffect]);
    const published = resolve(root, "sounds/library/essai.wav");
    const original = readFileSync(published);
    const provenance = JSON.parse(readFileSync(resolve(root, "sounds/library/generation.json"), "utf8"));
    expect(provenance.sounds.essai.rights.attribution).toBe("Test fixture");
    expect(provenance.sounds.essai.approvedAt).toBeTruthy();
    writeFileSync(resolve(root, "sounds/prompts/essai.md"), "A soft bell.");
    expect(() => approve(root, [sourceEffect])).toThrow("périmé");
    expect(() => publish(root, [sourceEffect])).toThrow("périmé");
    expect(readFileSync(published)).toEqual(original);
    await build(root);
    expect(loadManifest(root).sounds.essai?.approvedAt).toBeUndefined();
    approve(root, [sourceEffect]);
    publish(root, [sourceEffect]);
    expect(existsSync(resolve(root, "sounds/tools/.backup"))).toBe(false);
  });

  test.each(["essai.wav", "essai.native", "essai.prompt.txt"])("refuse les octets modifiés : %s", async (filename) => {
    const root = fixture();
    await build(root);
    approve(root, [sourceEffect]);
    writeFileSync(staged(root, filename), "modified");
    expect(() => publish(root, [sourceEffect])).toThrow("périmé");
    expect(() => approve(root, [sourceEffect])).toThrow("périmé");
  });

  test("refuse retry après approbation et invalide après changement de source", async () => {
    const root = fixture();
    await build(root);
    await withLock(root, () => generate(root, [sourceEffect], true));
    approve(root, [sourceEffect]);
    await expect(withLock(root, () => generate(root, [sourceEffect], true))).rejects.toThrow("son validé");
    writeFileSync(resolve(root, "sounds/sources/test.wav"), sine(1, 8000));
    expect(() => publish(root, [sourceEffect])).toThrow("périmé");
  });

  test("tous les effets doivent être approuvés avant de toucher la bibliothèque", async () => {
    const second = { ...sourceEffect, name: "second" };
    const root = fixture([sourceEffect, second]);
    await build(root, [sourceEffect]);
    approve(root, [sourceEffect]);
    expect(() => publish(root, [sourceEffect, second])).toThrow("second");
    expect(existsSync(resolve(root, "sounds/library"))).toBe(false);
  });

  test("la publication retire les effets supprimés de la configuration", async () => {
    const second = { ...sourceEffect, name: "second" };
    const root = fixture([sourceEffect, second]);
    await build(root);
    approve(root, [sourceEffect, second]);
    publish(root, [sourceEffect, second]);
    publish(root, [sourceEffect]);
    expect(existsSync(resolve(root, "sounds/library/second.wav"))).toBe(false);
  });

  test("un prompt individuel n'invalide pas les autres effets ; le style les invalide tous", async () => {
    const second = { ...sourceEffect, name: "second" };
    const root = fixture([sourceEffect, second]);
    await build(root);
    const manifest = loadManifest(root);
    writeFileSync(resolve(root, "sounds/prompts/essai.md"), "A new sound.");
    expect(isCurrent(root, sourceEffect, manifest.sounds.essai)).toBe(false);
    expect(isCurrent(root, second, manifest.sounds.second)).toBe(true);
    writeFileSync(resolve(root, "sounds/prompts/style.md"), "A new common style.");
    expect(isCurrent(root, second, manifest.sounds.second)).toBe(false);
  });

  test("une publication interrompue exige un contrôle avant tout remplacement", async () => {
    const root = fixture();
    await build(root);
    approve(root, [sourceEffect]);
    publish(root, [sourceEffect]);
    const original = readFileSync(resolve(root, "sounds/library/essai.wav"));
    mkdirSync(resolve(root, "sounds/tools/.backup"));
    expect(() => publish(root, [sourceEffect])).toThrow("Publication interrompue");
    expect(readFileSync(resolve(root, "sounds/library/essai.wav"))).toEqual(original);
  });

  test("verrou exclusif, libéré même après un échec", async () => {
    const root = fixture();
    await withLock(root, async () => {
      await expect(withLock(root, () => {})).rejects.toThrow("verrou");
    });
    await expect(withLock(root, () => { throw new Error("test"); })).rejects.toThrow("test");
    expect(existsSync(staged(root, ".lock"))).toBe(false);
  });
});
