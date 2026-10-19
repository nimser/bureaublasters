import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, generateImage } from "ai";
import sharp from "sharp";
import { resolveCpaCredential } from "./credentials.ts";

export const ROOT = resolve(import.meta.dir, "../..");
export const RECIPE = {
  version: 1,
  model: "gpt-image-2.5-sunburst",
  size: "1024x1024" as const,
  n: 1,
  quality: "high" as const,
  outputFormat: "jpeg" as const,
  outputCompression: 95,
  maxRetries: 0,
  delivery: { width: 1024, height: 1024, format: "jpeg", quality: 95, kernel: "lanczos3" },
};

const STYLE = "palette, matériaux, plateau, fond, cadrage et lumière uniquement ; ne pas ajouter cet objet au produit photographié";
const OBJECT = "identité physique de l’objet ou des projectiles compatibles ; respecter exactement leurs formes, proportions, couleurs et détails";
export type Reference = { name: string; role: string };
export type Product = { name: string; references: Reference[] };
const style = { name: "brume-bonne-humeur", role: STYLE };
const object = (name: string): Reference => ({ name, role: OBJECT });
export const PRODUCTS: Product[] = [
  { name: "brume-bonne-humeur", references: [] },
  { name: "rafale-post-it", references: [style] },
  { name: "requin-aretes", references: [style] },
  { name: "gantelets-sprint", references: [style] },
  { name: "coin-coin-crise", references: [style] },
  { name: "arbalete-anti-reunionite", references: [style, object("rafale-post-it")] },
  { name: "catapulte-croissants", references: [style] },
  { name: "orbe-decompression", references: [style] },
  { name: "flechettes-rappel", references: [style, object("rafale-post-it"), object("arbalete-anti-reunionite")] },
  { name: "mini-requins", references: [style, object("requin-aretes")] },
  { name: "disques-livraison", references: [style, object("gantelets-sprint")] },
  { name: "canards-soutien", references: [style, object("coin-coin-crise")] },
  { name: "croissants-reserve", references: [style, object("catapulte-croissants")] },
  { name: "balles-decompression", references: [style, object("orbe-decompression")] },
  { name: "brume-neutre", references: [object("brume-bonne-humeur")] },
  { name: "brume-girofle-agrumes", references: [object("brume-bonne-humeur"), object("brume-neutre")] },
];

export const sha256 = (data: string | Uint8Array): string => createHash("sha256").update(data).digest("hex");
const source = (root: string, name: string) => readFileSync(resolve(root, "images/prompts", `${name}.md`), "utf8");
const stage = (root: string, name: string) => resolve(root, "images/tools/.generation", name);

export function buildPrompt(root: string, product: Product): string {
  const charter = source(root, "README");
  const art = charter.split("## Une identité originale : l’atelier des pauses déraisonnables\n")[1]?.split("\n## Distance avec les accessoires d’Arcane")[0];
  const subject = source(root, product.name).split("## Sujet et composition\n")[1];
  if (!art?.trim() || !subject?.includes("## Prise de vue commune BureauBlasters")) {
    throw new Error(`Structure de prompt invalide : ${product.name}`);
  }
  const references = product.references.map((ref, i) => `Image jointe ${i + 1} (${ref.name}) : ${ref.role}.`).join("\n");
  return [
    "Produis exactement une photographie produit, sans texte ni planche de variantes. Le sujet demandé prime sur les objets des références de style. Les références d’objet ne doivent apparaître que si le sujet les demande.",
    `DIRECTION ARTISTIQUE COMMUNE\n${art.trim()}`,
    `IMAGES DE RÉFÉRENCE\n${references || "Aucune. Cette photographie établit la référence de style de la collection."}`,
    `SUJET ET PRISE DE VUE\n${subject.trim()}`,
  ].join("\n\n");
}

type RecordImage = {
  key: string;
  promptSha256: string;
  references: (Reference & { sha256: string })[];
  imageSha256: string;
  generatedAt: string;
  native?: { width: number; height: number; format: string; sha256: string };
  approvedAt?: string;
};
type Manifest = { recipe: typeof RECIPE; lockSha256: string; images: Record<string, RecordImage> };

function lockHash(root: string): string {
  return sha256(readFileSync(resolve(root, "images/tools/bun.lock")));
}

export function loadManifest(root: string): Manifest {
  const path = stage(root, "manifest.json");
  const manifest: Manifest = existsSync(path)
    ? JSON.parse(readFileSync(path, "utf8"))
    : { recipe: RECIPE, lockSha256: lockHash(root), images: {} };
  if (JSON.stringify(manifest.recipe) !== JSON.stringify(RECIPE) || manifest.lockSha256 !== lockHash(root)) {
    throw new Error("Recette ou dépendances différentes : utiliser une nouvelle série, sans mélanger les générations.");
  }
  return manifest;
}

function atomicWrite(path: string, data: string | Uint8Array): void {
  writeFileSync(`${path}.tmp`, data);
  renameSync(`${path}.tmp`, path);
}

function saveManifest(root: string, manifest: Manifest): void {
  atomicWrite(stage(root, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

export function prepare(root: string, product: Product, manifest: Manifest) {
  const references = product.references.map(ref => {
    const dependency = PRODUCTS.find(p => p.name === ref.name)!;
    const entry = manifest.images[ref.name];
    if (!entry?.approvedAt) throw new Error(`Référence non validée : ${ref.name}`);
    const expected = prepare(root, dependency, manifest);
    const bytes = readFileSync(stage(root, `${ref.name}.jpg`));
    if (entry.key !== expected.key || sha256(bytes) !== entry.imageSha256) {
      throw new Error(`Référence périmée ou modifiée : ${ref.name}`);
    }
    return { ...ref, sha256: entry.imageSha256, bytes };
  });
  const prompt = buildPrompt(root, product);
  const promptSha256 = sha256(prompt);
  const metadata = references.map(({ bytes: _, ...ref }) => ref);
  const key = sha256(JSON.stringify({ recipe: RECIPE, promptSha256, references: metadata }));
  return { prompt, promptSha256, key, references, metadata };
}

export function selectProducts(names: string[]): Product[] {
  if (!names.length) throw new Error("Indiquer au moins un produit ; utiliser --plan pour afficher la liste.");
  for (const name of names) {
    if (!PRODUCTS.some(p => p.name === name)) throw new Error(`Produit inconnu : ${name}`);
  }
  return PRODUCTS.filter(p => names.includes(p.name));
}

export const cpaFetch: typeof fetch = Object.assign(async (input: Parameters<typeof fetch>[0], init?: RequestInit): Promise<Response> => {
  if (!(init?.body instanceof FormData)) return fetch(input, init);
  const body = new FormData();
  for (const [name, value] of init.body) {
    // Bun leaves anonymous Blob filenames empty; Go then parses them as form values.
    if (value instanceof Blob) body.append(name, value, value instanceof File && value.name ? value.name : "reference.jpg");
    else body.append(name, value);
  }
  return fetch(input, { ...init, body });
}, { preconnect: fetch.preconnect });

async function connectCpa() {
  const { apiKey, source } = await resolveCpaCredential();
  const baseURL = process.env.CPA_BASE_URL || "https://cpa.tn.nwo.pm/v1";
  const catalog = await fetch(`${baseURL.replace(/\/$/, "")}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` }, signal: AbortSignal.timeout(20_000),
  });
  if (!catalog.ok) throw new Error(`Catalogue CPA : HTTP ${catalog.status}`);
  const models = await catalog.json() as { data: { id: string }[] };
  if (!models.data.some(m => m.id === RECIPE.model)) throw new Error(`Modèle absent de CPA : ${RECIPE.model}`);
  return { provider: createOpenAI({ apiKey, baseURL, fetch: cpaFetch }), source };
}

export async function generate(root: string, products: Product[], retry = false): Promise<void> {
  const { provider } = await connectCpa();
  const manifest = loadManifest(root);
  mkdirSync(stage(root, ""), { recursive: true });
  for (const product of products) {
    const prepared = prepare(root, product, manifest);
    const output = stage(root, `${product.name}.jpg`);
    const previous = manifest.images[product.name];
    if (retry && previous?.approvedAt) throw new Error(`Reprise refusée : ${product.name} déjà validé.`);
    if (!retry && previous?.key === prepared.key && existsSync(output) && sha256(readFileSync(output)) === previous.imageSha256) {
      console.log(`${product.name} : déjà généré${previous.approvedAt ? " et validé" : ", à contrôler"}`);
      continue;
    }
    console.log(`${product.name} : ${RECIPE.model}, ${prepared.references.length} référence(s)`);
    const result = await generateImage({
      model: provider.image(RECIPE.model),
      prompt: prepared.references.length
        ? { text: prepared.prompt, images: prepared.references.map(ref => ref.bytes) }
        : prepared.prompt,
      size: RECIPE.size,
      n: RECIPE.n,
      maxRetries: RECIPE.maxRetries,
      abortSignal: AbortSignal.timeout(240_000),
      providerOptions: { openai: {
        quality: RECIPE.quality,
        outputFormat: RECIPE.outputFormat,
        outputCompression: RECIPE.outputCompression,
      } },
    });
    if (result.warnings.length) throw new Error(`Paramètres non respectés : ${JSON.stringify(result.warnings)}`);
    await storeGenerated(root, product, manifest, result.image.uint8Array, prepared);
  }
}

export async function normalizeImage(bytes: Uint8Array): Promise<Buffer> {
  const { width, height } = await sharp(bytes).metadata();
  if (!width || width !== height || width < RECIPE.delivery.width) {
    throw new Error(`Sortie refusée : ${width} × ${height}, carré d’au moins 1024 × 1024 requis.`);
  }
  return sharp(bytes).resize(RECIPE.delivery.width, RECIPE.delivery.height, { kernel: "lanczos3" })
    .jpeg({ quality: RECIPE.delivery.quality }).toBuffer();
}

export async function storeGenerated(
  root: string, product: Product, manifest: Manifest, bytes: Uint8Array,
  prepared = prepare(root, product, manifest),
): Promise<void> {
  const metadata = await sharp(bytes).metadata();
  atomicWrite(stage(root, `${product.name}.native.${metadata.format}`), bytes);
  const jpeg = await normalizeImage(bytes);
  atomicWrite(stage(root, `${product.name}.jpg`), jpeg);
  atomicWrite(stage(root, `${product.name}.prompt.txt`), prepared.prompt);
  manifest.images[product.name] = {
    key: prepared.key, promptSha256: prepared.promptSha256, references: prepared.metadata,
    imageSha256: sha256(jpeg), generatedAt: new Date().toISOString(),
    native: { width: metadata.width!, height: metadata.height!, format: metadata.format!, sha256: sha256(bytes) },
  };
  saveManifest(root, manifest);
  console.log(`${product.name} : JPEG enregistré dans images/tools/.generation/, contrôle visuel requis`);
}

export function approve(root: string, products: Product[]): void {
  const manifest = loadManifest(root);
  for (const product of products) {
    const entry = manifest.images[product.name];
    const expected = prepare(root, product, manifest);
    if (!entry || entry.key !== expected.key || sha256(readFileSync(stage(root, `${product.name}.jpg`))) !== entry.imageSha256) {
      throw new Error(`Génération absente, périmée ou modifiée : ${product.name}`);
    }
    entry.approvedAt = new Date().toISOString();
  }
  saveManifest(root, manifest);
}

export function publish(root: string): void {
  const manifest = loadManifest(root);
  for (const product of PRODUCTS) {
    const entry = manifest.images[product.name];
    const expected = prepare(root, product, manifest);
    if (!entry?.approvedAt || entry.key !== expected.key || sha256(readFileSync(stage(root, `${product.name}.jpg`))) !== entry.imageSha256) {
      throw new Error(`Publication refusée : ${product.name} non validé ou périmé.`);
    }
  }
  for (const product of PRODUCTS) copyFileSync(stage(root, `${product.name}.jpg`), resolve(root, "images", `${product.name}.jpg`));
  atomicWrite(resolve(root, "images/tools/generation.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("16 JPEG publiés ; provenance dans images/tools/generation.json.");
}

if (import.meta.main) {
  try {
    const [command, ...names] = process.argv.slice(2);
    if (command === "--plan" && !names.length) {
      console.log(JSON.stringify({ recipe: RECIPE, products: PRODUCTS }, null, 2));
    } else if (command === "--check" && !names.length) {
      const { source } = await connectCpa();
      console.log(`CPA HTTP 200 ; clé : ${source} ; modèle disponible : ${RECIPE.model}. Aucune image générée.`);
    } else if (command === "--generate" || command === "--retry") {
      await generate(ROOT, selectProducts(names), command === "--retry");
    } else if (command === "--approve") {
      approve(ROOT, selectProducts(names));
    } else if (command === "--publish" && !names.length) {
      publish(ROOT);
    } else {
      throw new Error("Usage : --plan | --check | --generate <produits> | --retry <produits non validés> | --approve <produits> | --publish");
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
