import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, relative, resolve } from "node:path";
import { APICallError, generateImage } from "ai";
import sharp from "sharp";
import { RECIPE, ROOT, connectCpa, sha256 } from "./generate.ts";

export const POSTER = {
  version: 1,
  model: RECIPE.model,
  size: "1536x1024" as const,
  quality: "high" as const,
  outputFormat: "jpeg" as const,
  outputCompression: 95,
  maxRetries: 0,
  delivery: { ratio: [16, 9] as const, format: "jpeg", quality: 95 },
};

export type Role = "tout" | "produit" | "personnage";
export type Reference = { role: Role; spec: string; path: string };
const FLAGS: Record<string, Role> = { "--ref": "tout", "--produit": "produit", "--personnage": "personnage" };
const ROLES: Record<Role, string> = {
  tout: "reprendre la personne (visage, coiffure, carnation, silhouette, tenue) et le jouet qu’elle tient (formes, proportions, couleurs, détails, projectiles), dans une nouvelle pose de bataille",
  produit: "reprendre uniquement le jouet et ses projectiles (formes, proportions, couleurs, détails), confiés à un autre collègue ; ne pas reprendre la personne ni le décor",
  personnage: "reprendre uniquement la personne (visage, coiffure, carnation, silhouette, tenue), dans une nouvelle pose de bataille ; ne pas reprendre son jouet ni le décor",
};
const IMAGE = /\.(jpe?g|png|webp)$/i;
const out = (root: string, name = "") => resolve(root, "images/tools/.affiche", name);

export function resolveReference(root: string, spec: string, role: Role): Reference {
  const path = spec.startsWith("generation:")
    ? resolve(root, "images/tools/.generation", `${spec.slice("generation:".length)}.jpg`)
    : IMAGE.test(spec) ? resolve(root, spec) : resolve(root, "images", `${spec}.jpg`);
  if (!existsSync(path)) throw new Error(`Référence introuvable : ${spec} (${path})`);
  return { role, spec, path };
}

export function parseArgs(root: string, args: string[]): Reference[] {
  const references: Reference[] = [];
  for (let i = 0; i < args.length; i += 2) {
    const role = FLAGS[args[i]!];
    const spec = args[i + 1];
    if (!role || !spec) throw new Error(`Argument invalide : ${args[i]} ; utiliser --ref, --produit ou --personnage suivi d’une image.`);
    const reference = resolveReference(root, spec, role);
    if (references.some(r => r.path === reference.path)) throw new Error(`Référence en double : ${spec}`);
    references.push(reference);
  }
  return references;
}

export function buildPosterPrompt(root: string, references: Reference[]): string {
  const subject = readFileSync(resolve(root, "images/tools/affiche.md"), "utf8").split("\n## Scène\n")[1];
  if (!subject?.includes("## Exclusions")) throw new Error("Structure de prompt invalide : images/tools/affiche.md");
  const people = references.some(r => r.role !== "produit");
  const list = references.map((r, i) => `Image jointe ${i + 1} (${basename(r.path)}) : ${ROLES[r.role]}.`).join("\n");
  return [
    "Produis exactement une affiche photographique en format paysage. Les bandes supérieure et inférieure (environ 8 % de la hauteur chacune) seront recadrées pour obtenir un format 16:9 : garder tous les visages, jouets et projectiles importants dans la bande centrale.",
    `IMAGES DE RÉFÉRENCE\n${list || "Aucune. Inventer les collègues et les jouets."}${people
      ? "\nChaque personne reprise d’une image jointe est un collègue distinct : ne pas fusionner les visages ni dupliquer une personne. Compléter avec des collègues inventés pour atteindre quatre à six personnes."
      : ""}${references.length ? "\nNe recopier ni les poses, ni le mobilier exact, ni le cadrage des images jointes." : ""}`,
    `SUJET\n${subject.trim()}`,
  ].join("\n\n");
}

export async function cropPoster(bytes: Uint8Array): Promise<{ jpeg: Buffer; width: number; height: number }> {
  const { width = 0, height = 0 } = await sharp(bytes).metadata();
  const [w, h] = POSTER.delivery.ratio;
  if (width <= height || width < 1536) throw new Error(`Sortie refusée : ${width} × ${height}, paysage d’au moins 1536 pixels requis.`);
  const target = { width, height: Math.round(width * h / w) };
  if (target.height > height) throw new Error(`Sortie refusée : ${width} × ${height}, trop large pour un recadrage 16:9.`);
  const jpeg = await sharp(bytes).extract({ left: 0, top: Math.floor((height - target.height) / 2), ...target })
    .jpeg({ quality: POSTER.delivery.quality }).toBuffer();
  return { jpeg, ...target };
}

function atomicWrite(path: string, data: string | Uint8Array): void {
  writeFileSync(`${path}.tmp`, data);
  renameSync(`${path}.tmp`, path);
}

export async function storePoster(root: string, references: Reference[], prompt: string, bytes: Uint8Array, at = new Date()): Promise<string> {
  const dir = out(root, at.toISOString().replace(/[:.]/g, "-"));
  mkdirSync(dir, { recursive: true });
  const native = await sharp(bytes).metadata();
  const { jpeg, width, height } = await cropPoster(bytes);
  atomicWrite(resolve(dir, `affiche.native.${native.format}`), bytes);
  atomicWrite(resolve(dir, "affiche.jpg"), jpeg);
  atomicWrite(resolve(dir, "prompt.txt"), prompt);
  atomicWrite(resolve(dir, "manifest.json"), `${JSON.stringify({
    recipe: POSTER, promptSha256: sha256(prompt), generatedAt: at.toISOString(),
    references: references.map(r => ({ role: r.role, spec: r.spec, path: displayPath(root, r.path), sha256: sha256(readFileSync(r.path)) })),
    native: { width: native.width, height: native.height, format: native.format, sha256: sha256(bytes) },
    delivery: { width, height, sha256: sha256(jpeg) },
  }, null, 2)}\n`);
  return dir;
}

const displayPath = (root: string, path: string) => {
  const local = relative(root, path);
  return local.startsWith("..") || isAbsolute(local) ? path : local;
};

export function listReferences(root: string): string[] {
  const jpg = (dir: string) => existsSync(dir)
    ? readdirSync(dir).filter(f => f.endsWith(".jpg") && f.split(".").length === 2).map(f => f.slice(0, -4)).sort()
    : [];
  return [
    ...jpg(resolve(root, "images")),
    ...jpg(resolve(root, "images/tools/.generation")).map(name => `generation:${name}`),
  ];
}

export async function generatePoster(root: string, references: Reference[]): Promise<string> {
  const { provider } = await connectCpa();
  const prompt = buildPosterPrompt(root, references);
  console.log(`Affiche : ${POSTER.model}, ${references.length} référence(s)`);
  const images = references.map(r => readFileSync(r.path));
  const result = await generateImage({
    model: provider.image(POSTER.model),
    prompt: images.length ? { text: prompt, images } : prompt,
    size: POSTER.size,
    n: 1,
    maxRetries: POSTER.maxRetries,
    abortSignal: AbortSignal.timeout(300_000),
    providerOptions: { openai: {
      quality: POSTER.quality, outputFormat: POSTER.outputFormat, outputCompression: POSTER.outputCompression,
    } },
  });
  if (result.warnings.length) throw new Error(`Paramètres non respectés : ${JSON.stringify(result.warnings)}`);
  return storePoster(root, references, prompt, result.image.uint8Array);
}

if (import.meta.main) {
  try {
    const [command, ...args] = process.argv.slice(2);
    if (command === "--list" && !args.length) {
      console.log(listReferences(ROOT).join("\n"));
    } else if (command === "--plan") {
      console.log(buildPosterPrompt(ROOT, parseArgs(ROOT, args)));
    } else if (command === "--generate") {
      const dir = await generatePoster(ROOT, parseArgs(ROOT, args));
      console.log(`Affiche enregistrée : ${displayPath(ROOT, resolve(dir, "affiche.jpg"))}, contrôle visuel requis`);
    } else {
      throw new Error("Usage : --list | --plan|--generate [--ref <image>] [--produit <image>] [--personnage <image>]…");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const key = process.env.CPA_CLIENT_API_KEY;
    console.error(APICallError.isInstance(error)
      ? `CPA HTTP ${error.statusCode} : échec de la requête de génération.`
      : (key ? message.replaceAll(key, "[secret]") : message).slice(0, 600));
    process.exitCode = 1;
  }
}
