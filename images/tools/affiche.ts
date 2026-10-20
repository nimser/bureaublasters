import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import type { OpenAIProvider } from "@ai-sdk/openai";
import { APICallError, type ModelMessage, Output, generateImage, generateText, jsonSchema } from "ai";
import sharp from "sharp";
import { RECIPE, ROOT, connectCpa, sha256 } from "./generate.ts";

export const POSTER = {
  version: 2,
  model: RECIPE.model,
  size: "1536x1024" as const,
  quality: "high" as const,
  outputFormat: "jpeg" as const,
  outputCompression: 95,
  maxRetries: 0,
  delivery: { ratio: [16, 9] as const, format: "jpeg", quality: 95 },
  planner: { model: "gpt-astra-latest", previewWidth: 512, minReferences: 3, maxReferences: 6, attempts: 2 },
};

const ROLE_NAMES = ["tout", "produit", "personnage"] as const;
export type Role = typeof ROLE_NAMES[number];
export type Origin = "série" | "catalogue";
export type Item = { name: string; title: string; path: string; subject: string; origin: Origin; sha256: string };
export type Catalogue = { items: Item[]; skipped: string[] };
type Entries = Record<string, { imageSha256: string; approvedAt?: string }>;
export type Plan = { concept: string; references: { name: string; role: Role; usage: string }[]; scene: string };

const ROLES: Record<Role, string> = {
  tout: "reprendre la personne (visage, coiffure, carnation, silhouette, tenue) et le jouet qu’elle tient (formes, proportions, couleurs, détails, projectiles), dans une nouvelle pose",
  produit: "reprendre uniquement le jouet et ses projectiles (formes, proportions, couleurs, détails), confiés à un autre collègue ; ne reprendre ni la personne ni le décor",
  personnage: "reprendre uniquement la personne (visage, coiffure, carnation, silhouette, tenue), dans une nouvelle pose ; ne reprendre ni son jouet ni le décor",
};
const FRAME = "Produis exactement une affiche photographique en format paysage, livrée en 16:9 : une sortie plus haute est recadrée au centre, donc garder visages, jouets et projectiles importants à distance des bords haut et bas.";
const runs = (root: string, name = "") => resolve(root, "images/tools/.affiche", name);

export function section(markdown: string, heading: string): string {
  const body = markdown.split(`\n## ${heading}\n`)[1]?.split("\n## ")[0]?.trim();
  if (!body) throw new Error(`Section absente : ${heading}`);
  return body;
}

const brief = (root: string) => readFileSync(resolve(root, "images/tools/affiche.md"), "utf8");

function describe(root: string, name: string, origin: Origin): Pick<Item, "title" | "subject"> {
  const source = resolve(root, "images/prompts", `${name}.md`);
  const markdown = existsSync(source) ? readFileSync(source, "utf8") : "";
  const title = markdown.match(/^# (.+)$/m)?.[1]?.trim() ?? name;
  const assembled = resolve(root, "images/tools/.generation", `${name}.prompt.txt`);
  const subject = origin === "série" && existsSync(assembled)
    ? readFileSync(assembled, "utf8").split("SUJET ET PRISE DE VUE\n")[1]
    : markdown.split("\n## Sujet et composition\n")[1];
  return { title, subject: subject?.split("## Prise de vue commune")[0]?.trim() ?? "" };
}

function entries(root: string, manifest: string): Entries {
  const path = resolve(root, manifest);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")).images : {};
}

// Per product, the latest validated image: the series in progress, else the published catalogue.
export function loadCatalogue(root: string): Catalogue {
  const sources: [Origin, string, Entries][] = [
    ["série", "images/tools/.generation", entries(root, "images/tools/.generation/manifest.json")],
    ["catalogue", "images", entries(root, "images/tools/generation.json")],
  ];
  const names = [...new Set(sources.flatMap(([, , images]) => Object.keys(images)))];
  const items: Item[] = [];
  const skipped: string[] = [];
  for (const name of names) {
    const found = sources.map(([origin, dir, images]) => ({ origin, entry: images[name], path: resolve(root, dir, `${name}.jpg`) }))
      .find(({ entry, path }) => entry?.approvedAt && existsSync(path) && sha256(readFileSync(path)) === entry.imageSha256);
    if (!found) skipped.push(name);
    else items.push({ name, path: found.path, origin: found.origin, sha256: found.entry!.imageSha256, ...describe(root, name, found.origin) });
  }
  if (!items.length) throw new Error("Aucune image validée et intacte dans la série en préparation ni dans le catalogue publié.");
  return { items, skipped };
}

export function validatePlan(value: unknown, items: Item[]): Plan {
  const plan = value as Plan;
  const { minReferences, maxReferences } = POSTER.planner;
  const text = (v: unknown) => typeof v === "string" && v.trim().length > 0;
  const refs = Array.isArray(plan?.references) ? plan.references : [];
  if (!text(plan?.concept) || !text(plan?.scene) || refs.length < minReferences || refs.length > maxReferences) {
    throw new Error(`Plan refusé : concept, scène et ${minReferences} à ${maxReferences} références requis.`);
  }
  const names = new Set<string>();
  for (const ref of refs) {
    if (!items.some(item => item.name === ref?.name)) throw new Error(`Plan refusé : référence inconnue ou périmée : ${ref?.name}`);
    if (names.has(ref.name)) throw new Error(`Plan refusé : référence en double : ${ref.name}`);
    if (!ROLE_NAMES.includes(ref.role) || !text(ref.usage)) throw new Error(`Plan refusé : rôle ou usage invalide : ${ref.name}`);
    names.add(ref.name);
  }
  if (refs.filter(r => r.role !== "produit").length < 2 || refs.filter(r => r.role !== "personnage").length < 2) {
    throw new Error("Plan refusé : au moins deux références en rôle `tout` ou `personnage` et deux en rôle `tout` ou `produit` requises.");
  }
  return plan;
}

const planSchema = (items: Item[]) => jsonSchema<Plan>({
  type: "object",
  additionalProperties: false,
  required: ["concept", "references", "scene"],
  properties: {
    concept: { type: "string" },
    references: {
      type: "array",
      minItems: POSTER.planner.minReferences,
      maxItems: POSTER.planner.maxReferences,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "role", "usage"],
        properties: {
          name: { type: "string", enum: items.map(item => item.name) },
          role: { type: "string", enum: [...ROLE_NAMES] },
          usage: { type: "string" },
        },
      },
    },
    scene: { type: "string" },
  },
});

export function plannerInstructions(root: string): string {
  const markdown = brief(root);
  const { minReferences, maxReferences } = POSTER.planner;
  return [
    `Tu es directeur artistique de BureauBlasters. Conçois l’affiche décrite ci-dessous à partir du catalogue qui suit : chaque produit est présenté par son identifiant, son nom, la description qui a servi à générer sa photo, puis la photo. Choisis ${minReferences} à ${maxReferences} photos de référence. L’affiche réunit des collègues du catalogue : au moins deux références en rôle \`tout\` ou \`personnage\`, et au moins deux en rôle \`tout\` ou \`produit\`.`,
    "Pour chaque référence, donne `name` (identifiant), `role` et `usage` : une à trois phrases sur sa place et son action dans l’affiche, puis les traits indispensables à la fidélité. Rédige ensuite `scene` : la description photographique complète de l’affiche pour un modèle d’image, en français, 150 à 300 mots. Désigne les références par « Image jointe 1 », « Image jointe 2 »… dans l’ordre de ta liste et place aussi les collègues inventés. `concept` résume l’idée en une phrase.",
    `INTENTION\n${section(markdown, "Intention")}`,
    `CHOIX DES RÉFÉRENCES\n${section(markdown, "Choix des références")}`,
    `DIRECTION ARTISTIQUE\n${section(markdown, "Direction artistique")}`,
    `EXCLUSIONS\n${section(markdown, "Exclusions")}`,
    "CATALOGUE",
  ].join("\n\n");
}

export function itemHeading(item: Item): string {
  return `### ${item.name} : ${item.title}\n${item.subject || "Description indisponible."}`;
}

async function planPoster(provider: OpenAIProvider, root: string, items: Item[]): Promise<Plan> {
  const content: ({ type: "text"; text: string } | { type: "file"; data: Uint8Array; mediaType: string })[] = [
    { type: "text", text: plannerInstructions(root) },
  ];
  for (const item of items) {
    const preview = await sharp(readFileSync(item.path)).resize(POSTER.planner.previewWidth).jpeg({ quality: 85 }).toBuffer();
    content.push({ type: "text", text: itemHeading(item) }, { type: "file", data: preview, mediaType: "image/jpeg" });
  }
  const messages: ModelMessage[] = [{ role: "user", content }];
  for (let attempt = 1; ; attempt++) {
    const result = await generateText({
      model: provider(POSTER.planner.model),
      output: Output.object({ schema: planSchema(items) }),
      messages,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(300_000),
    });
    try {
      return validatePlan(result.output, items);
    } catch (error) {
      if (attempt >= POSTER.planner.attempts) throw error;
      // One correction round: the planner sees its rejected plan and the reason.
      messages.push(
        { role: "assistant", content: JSON.stringify(result.output) },
        { role: "user", content: `${(error as Error).message} Corrige le plan en respectant toutes les règles.` },
      );
    }
  }
}

export function buildPosterPrompt(root: string, plan: Plan, items: Item[]): string {
  const markdown = brief(root);
  const list = plan.references.map((ref, i) => {
    const item = items.find(it => it.name === ref.name)!;
    return `Image jointe ${i + 1} (${item.title}) : ${ROLES[ref.role]}. Dans l’affiche : ${ref.usage.trim()}`;
  });
  return [
    FRAME,
    `IMAGES DE RÉFÉRENCE\n${list.join("\n")}\nChaque personne reprise d’une image jointe est un collègue distinct : ne pas fusionner les visages ni dupliquer une personne. Ne recopier ni les poses, ni le mobilier exact, ni le cadrage des images jointes.`,
    `SCÈNE\n${plan.scene.trim()}`,
    `DIRECTION ARTISTIQUE\n${section(markdown, "Direction artistique")}`,
    `EXCLUSIONS\n${section(markdown, "Exclusions")}`,
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

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

export function newRun(root: string, at = new Date()): string {
  const dir = runs(root, at.toISOString().replace(/[:.]/g, "-"));
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function writePlan(dir: string, plan: Plan, catalogue: Catalogue, at = new Date()): void {
  const images = Object.fromEntries(plan.references.map(ref => {
    const item = catalogue.items.find(it => it.name === ref.name)!;
    return [ref.name, { origin: item.origin, sha256: item.sha256 }];
  }));
  writeRecord(dir, { planner: POSTER.planner.model, plannedAt: at.toISOString(), plan, images });
}

export function readPlan(root: string, source: string, items: Item[]): { plan: Plan; record: object } {
  const path = resolve(source, "plan.json");
  if (!existsSync(path)) throw new Error(`Plan introuvable : ${path}`);
  const saved = JSON.parse(readFileSync(path, "utf8"));
  return { plan: validatePlan(saved.plan, items), record: { ...saved, reusedFrom: relative(root, source) } };
}

export function writeRecord(dir: string, record: object): void {
  atomicWrite(resolve(dir, "plan.json"), json(record));
}

export async function storePoster(
  root: string, dir: string, plan: Plan, items: Item[], prompt: string, bytes: Uint8Array, at = new Date(),
): Promise<void> {
  const native = await sharp(bytes).metadata();
  const { jpeg, width, height } = await cropPoster(bytes);
  atomicWrite(resolve(dir, `affiche.native.${native.format}`), bytes);
  atomicWrite(resolve(dir, "affiche.jpg"), jpeg);
  atomicWrite(resolve(dir, "prompt.txt"), prompt);
  atomicWrite(resolve(dir, "manifest.json"), json({
    recipe: POSTER, promptSha256: sha256(prompt), generatedAt: at.toISOString(),
    references: plan.references.map(ref => {
      const item = items.find(it => it.name === ref.name)!;
      return { name: ref.name, role: ref.role, path: relative(root, item.path), origin: item.origin, sha256: item.sha256 };
    }),
    native: { width: native.width, height: native.height, format: native.format, sha256: sha256(bytes) },
    delivery: { width, height, sha256: sha256(jpeg) },
  }));
}

async function renderPoster(provider: OpenAIProvider, root: string, dir: string, plan: Plan, items: Item[]): Promise<void> {
  const prompt = buildPosterPrompt(root, plan, items);
  const images = plan.references.map(ref => readFileSync(items.find(it => it.name === ref.name)!.path));
  console.log(`Affiche : ${POSTER.model}, ${images.length} référence(s)`);
  const result = await generateImage({
    model: provider.image(POSTER.model),
    prompt: { text: prompt, images },
    size: POSTER.size,
    n: 1,
    maxRetries: POSTER.maxRetries,
    abortSignal: AbortSignal.timeout(300_000),
    providerOptions: { openai: {
      quality: POSTER.quality, outputFormat: POSTER.outputFormat, outputCompression: POSTER.outputCompression,
    } },
  });
  if (result.warnings.length) throw new Error(`Paramètres non respectés : ${JSON.stringify(result.warnings)}`);
  await storePoster(root, dir, plan, items, prompt, result.image.uint8Array);
}

function report(dir: string, plan: Plan): void {
  console.log(`${relative(ROOT, dir)}\nConcept : ${plan.concept}`);
  for (const ref of plan.references) console.log(`- ${ref.name} (${ref.role}) : ${ref.usage}`);
}

if (import.meta.main) {
  try {
    const [command, ...args] = process.argv.slice(2);
    if (command === "--catalogue" && !args.length) {
      const { items, skipped } = loadCatalogue(ROOT);
      for (const item of items) console.log(`- ${item.name} : ${item.title} (${item.origin}, ${relative(ROOT, item.path)})`);
      if (skipped.length) console.log(`Ignorés (aucune image validée et intacte) : ${skipped.join(", ")}`);
    } else if (command === "--plan" && !args.length) {
      const catalogue = loadCatalogue(ROOT);
      const { provider } = await connectCpa([POSTER.planner.model]);
      const plan = await planPoster(provider, ROOT, catalogue.items);
      const dir = newRun(ROOT);
      writePlan(dir, plan, catalogue);
      atomicWrite(resolve(dir, "prompt.txt"), buildPosterPrompt(ROOT, plan, catalogue.items));
      report(dir, plan);
    } else if (command === "--generate" && args.length <= 1) {
      const catalogue = loadCatalogue(ROOT);
      const { provider } = await connectCpa(args.length ? [POSTER.model] : [POSTER.model, POSTER.planner.model]);
      const saved = args.length ? readPlan(ROOT, resolve(args[0]!), catalogue.items) : undefined;
      const used = saved?.plan ?? await planPoster(provider, ROOT, catalogue.items);
      const dir = newRun(ROOT);
      if (saved) writeRecord(dir, saved.record);
      else writePlan(dir, used, catalogue);
      report(dir, used);
      await renderPoster(provider, ROOT, dir, used, catalogue.items);
      console.log(`Affiche enregistrée : ${relative(ROOT, resolve(dir, "affiche.jpg"))}, contrôle visuel requis`);
    } else {
      throw new Error("Usage : --catalogue | --plan | --generate [répertoire d’un plan]");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const key = process.env.CPA_CLIENT_API_KEY;
    console.error(APICallError.isInstance(error)
      ? `CPA HTTP ${error.statusCode} : échec de la requête.`
      : (key ? message.replaceAll(key, "[secret]") : message).slice(0, 600));
    process.exitCode = 1;
  }
}
