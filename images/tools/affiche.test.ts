import { afterEach, describe, expect, test } from "bun:test";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import sharp from "sharp";
import {
  POSTER, type Plan, buildPosterPrompt, cropPoster, itemHeading, loadCatalogue, newRun, plannerInstructions, readPlan,
  storePoster, validatePlan, writePlan,
} from "./affiche.ts";
import { RECIPE, ROOT, sha256 } from "./generate.ts";

const fixtures: string[] = [];
afterEach(() => fixtures.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })));

const NAMES = ["lanceur", "gantelets", "canards", "orbe"];
const APPROVED = { approvedAt: "2026-10-20T00:00:00.000Z" };

function fixture(): string {
  const root = mkdtempSync(resolve(tmpdir(), "bb-affiche-test-"));
  fixtures.push(root);
  const draft = resolve(root, "images/tools/.generation");
  for (const path of [resolve(root, "images/prompts"), draft]) mkdirSync(path, { recursive: true });
  copyFileSync(resolve(ROOT, "images/tools/affiche.md"), resolve(root, "images/tools/affiche.md"));
  const published: Record<string, object> = {};
  for (const [i, name] of NAMES.entries()) {
    writeFileSync(resolve(root, "images", `${name}.jpg`), `publié ${name}`);
    writeFileSync(resolve(root, "images/prompts", `${name}.md`),
      `# XX-0${i} — Titre ${name}\n\n## Sujet et composition\n\nSujet source ${name}.\n\n## Prise de vue commune BureauBlasters\n\nBloc commun.\n`);
    published[name] = { imageSha256: sha256(`publié ${name}`), ...APPROVED };
  }
  for (const name of ["lanceur", "gantelets", "canards"]) {
    writeFileSync(resolve(draft, `${name}.jpg`), `série ${name}`);
    writeFileSync(resolve(draft, `${name}.prompt.txt`), `PRÉAMBULE\n\nSUJET ET PRISE DE VUE\nSujet généré ${name}.\n\n## Prise de vue commune BureauBlasters\n\nBloc commun.`);
  }
  writeFileSync(resolve(draft, "canards.jpg"), "retouche");
  writeFileSync(resolve(draft, "manifest.json"), JSON.stringify({ images: {
    lanceur: { imageSha256: sha256("série lanceur"), ...APPROVED },
    gantelets: { imageSha256: sha256("série gantelets") },
    canards: { imageSha256: sha256("série canards"), ...APPROVED },
    disparu: { imageSha256: sha256("absent"), ...APPROVED },
  } }));
  writeFileSync(resolve(root, "images/tools/generation.json"), JSON.stringify({ images: published }));
  return root;
}

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  concept: "Embuscade à la machine à café.",
  references: [
    { name: "lanceur", role: "tout", usage: "Tire depuis le premier plan." },
    { name: "gantelets", role: "personnage", usage: "Bondit entre deux îlots." },
    { name: "canards", role: "produit", usage: "Dans les mains de la personne de l’image 2." },
  ],
  scene: "L’Image jointe 1 riposte derrière un bureau.",
  ...overrides,
});

const png = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: "#123456" } }).png().toBuffer();

describe("recette", () => {
  test("reprend le modèle d’image du générateur, sans relance, avec un planificateur fixé", () => {
    expect(POSTER.model).toBe(RECIPE.model);
    expect(POSTER.size).toBe("1536x1024");
    expect(POSTER.maxRetries).toBe(0);
    expect(POSTER.planner.model).toBe("gpt-astra-latest");
  });
});

describe("catalogue", () => {
  test("prend pour chaque produit la dernière image validée et intacte, sans nom codé en dur", () => {
    const root = fixture();
    const { items, skipped } = loadCatalogue(root);
    expect(items.map(i => [i.name, i.origin, i.title, i.subject])).toEqual([
      ["lanceur", "série", "XX-00 — Titre lanceur", "Sujet généré lanceur."],
      ["gantelets", "catalogue", "XX-01 — Titre gantelets", "Sujet source gantelets."],
      ["canards", "catalogue", "XX-02 — Titre canards", "Sujet source canards."],
      ["orbe", "catalogue", "XX-03 — Titre orbe", "Sujet source orbe."],
    ]);
    expect(items[0]!.path).toBe(resolve(root, "images/tools/.generation/lanceur.jpg"));
    expect(items[1]!.path).toBe(resolve(root, "images/gantelets.jpg"));
    expect(skipped).toEqual(["disparu"]);
  });

  test("sans série en préparation, lit le catalogue publié", () => {
    const root = fixture();
    rmSync(resolve(root, "images/tools/.generation"), { recursive: true });
    expect(loadCatalogue(root).items.every(i => i.origin === "catalogue")).toBe(true);
  });

  test("refuse un catalogue sans aucune image exploitable", () => {
    const root = fixture();
    for (const name of NAMES) writeFileSync(resolve(root, "images", `${name}.jpg`), "retouche");
    rmSync(resolve(root, "images/tools/.generation"), { recursive: true });
    expect(() => loadCatalogue(root)).toThrow("Aucune image");
  });
});

describe("plan", () => {
  test("accepte un plan cohérent avec le catalogue", () => {
    const { items } = loadCatalogue(fixture());
    expect(validatePlan(plan(), items)).toEqual(plan());
  });

  test("refuse références inconnues, doublons, rôles invalides et compositions déséquilibrées", () => {
    const { items } = loadCatalogue(fixture());
    const [a, b, c] = plan().references;
    const cases: [Partial<Plan>, string][] = [
      [{ references: [a!, b!, { ...c!, name: "disparu" }] }, "inconnue"],
      [{ references: [a!, b!, { ...a! }] }, "double"],
      [{ references: [a!, b!, { ...c!, role: "décor" as never }] }, "rôle"],
      [{ references: [a!, b!] }, "3 à 6"],
      [{ scene: " " }, "3 à 6"],
      [{ references: [a!, { ...b!, role: "produit" }, c!] }, "deux références en rôle `tout` ou `personnage`"],
      [{ references: [{ ...a!, role: "personnage" }, b!, { ...c!, role: "personnage" }] }, "deux en rôle `tout` ou `produit`"],
    ];
    for (const [overrides, message] of cases) expect(() => validatePlan(plan(overrides), items)).toThrow(message);
  });

  test("le planificateur reçoit l’intention, les règles de choix et chaque fiche", () => {
    const root = fixture();
    const instructions = plannerInstructions(root);
    for (const heading of ["INTENTION", "CHOIX DES RÉFÉRENCES", "DIRECTION ARTISTIQUE", "EXCLUSIONS", "CATALOGUE"]) {
      expect(instructions).toContain(heading);
    }
    expect(instructions).toContain("3 à 6 photos");
    expect(itemHeading(loadCatalogue(root).items[0]!)).toBe("### lanceur : XX-00 — Titre lanceur\nSujet généré lanceur.");
  });

  test("un plan enregistré est relu contre le catalogue courant", () => {
    const root = fixture();
    const catalogue = loadCatalogue(root);
    const dir = newRun(root, new Date("2026-10-21T10:00:00.000Z"));
    writePlan(dir, plan(), catalogue);
    expect(readPlan(root, dir, catalogue.items).record).toMatchObject({ reusedFrom: "images/tools/.affiche/2026-10-21T10-00-00-000Z" });
    writeFileSync(resolve(root, "images/canards.jpg"), "retouche");
    expect(() => readPlan(root, dir, loadCatalogue(root).items)).toThrow("inconnue ou périmée");
  });
});

describe("prompt d’image", () => {
  test("numérote les références dans l’ordre du plan avec leur rôle et leur usage", () => {
    const root = fixture();
    const prompt = buildPosterPrompt(root, plan(), loadCatalogue(root).items);
    expect(prompt).toContain("Image jointe 1 (XX-00 — Titre lanceur) : reprendre la personne");
    expect(prompt).toContain("Image jointe 2 (XX-01 — Titre gantelets) : reprendre uniquement la personne");
    expect(prompt).toContain("Image jointe 3 (XX-02 — Titre canards) : reprendre uniquement le jouet");
    expect(prompt).toContain("Dans l’affiche : Bondit entre deux îlots.");
    expect(prompt).toContain("SCÈNE\nL’Image jointe 1 riposte");
    expect(prompt).toContain("collègue distinct");
    expect(prompt).toContain("16:9");
    expect(prompt).toContain("EXCLUSIONS\nAucun projectile visant un visage");
  });

  test("refuse un brief malformé", () => {
    const root = fixture();
    writeFileSync(resolve(root, "images/tools/affiche.md"), "incomplet");
    expect(() => plannerInstructions(root)).toThrow("Section absente");
  });
});

describe("sortie", () => {
  test("recadre au centre en 16:9 sans réduire la largeur", async () => {
    const { jpeg, width, height } = await cropPoster(await png(1881, 1254));
    const metadata = await sharp(jpeg).metadata();
    expect([metadata.format, metadata.width, metadata.height, width, height]).toEqual(["jpeg", 1881, 1058, 1881, 1058]);
  });

  test("refuse les sorties carrées, portrait, trop petites ou trop larges", async () => {
    for (const [w, h] of [[1254, 1254], [1024, 1536], [1024, 683], [2048, 1000]]) {
      await expect(cropPoster(await png(w!, h!))).rejects.toThrow("Sortie refusée");
    }
  });

  test("enregistre un essai indépendant avec sa provenance, sans toucher au catalogue", async () => {
    const root = fixture();
    const { items } = loadCatalogue(root);
    const dir = newRun(root, new Date("2026-10-21T10:00:00.000Z"));
    const prompt = buildPosterPrompt(root, plan(), items);
    const bytes = await png(1536, 1024);
    await storePoster(root, dir, plan(), items, prompt, bytes);
    for (const file of ["affiche.jpg", "affiche.native.png", "prompt.txt"]) expect(existsSync(resolve(dir, file))).toBe(true);
    const manifest = JSON.parse(readFileSync(resolve(dir, "manifest.json"), "utf8"));
    expect(manifest.recipe).toEqual(POSTER);
    expect(manifest.promptSha256).toBe(sha256(prompt));
    expect(manifest.references[0]).toEqual({
      name: "lanceur", role: "tout", path: "images/tools/.generation/lanceur.jpg", origin: "série", sha256: sha256("série lanceur"),
    });
    expect(manifest.delivery).toMatchObject({ width: 1536, height: 864 });
    expect(readFileSync(resolve(root, "images/lanceur.jpg"), "utf8")).toBe("publié lanceur");
  });
});
