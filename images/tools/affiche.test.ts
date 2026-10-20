import { afterEach, describe, expect, test } from "bun:test";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import sharp from "sharp";
import { POSTER, buildPosterPrompt, cropPoster, listReferences, parseArgs, storePoster } from "./affiche.ts";
import { RECIPE, ROOT, sha256 } from "./generate.ts";

const fixtures: string[] = [];
afterEach(() => fixtures.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })));

function fixture(): string {
  const root = mkdtempSync(resolve(tmpdir(), "bb-affiche-test-"));
  fixtures.push(root);
  mkdirSync(resolve(root, "images/tools/.generation"), { recursive: true });
  copyFileSync(resolve(ROOT, "images/tools/affiche.md"), resolve(root, "images/tools/affiche.md"));
  writeFileSync(resolve(root, "images/requin-aretes.jpg"), "catalogue");
  writeFileSync(resolve(root, "images/tools/.generation/requin-aretes.jpg"), "brouillon");
  writeFileSync(resolve(root, "images/tools/.generation/requin-aretes.native.png"), "natif");
  writeFileSync(resolve(root, "images/tools/collegue.png"), "personne");
  return root;
}

const png = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: "#123456" } }).png().toBuffer();

describe("recette de l’affiche", () => {
  test("reprend le modèle du générateur et demande un paysage sans relance", () => {
    expect(POSTER.model).toBe(RECIPE.model);
    expect(POSTER.size).toBe("1536x1024");
    expect(POSTER.maxRetries).toBe(0);
  });
});

describe("références", () => {
  test("résout le catalogue, la série en préparation et un fichier, dans l’ordre donné", () => {
    const root = fixture();
    const refs = parseArgs(root, ["--produit", "requin-aretes", "--ref", "generation:requin-aretes", "--personnage", "images/tools/collegue.png"]);
    expect(refs.map(r => [r.role, r.path])).toEqual([
      ["produit", resolve(root, "images/requin-aretes.jpg")],
      ["tout", resolve(root, "images/tools/.generation/requin-aretes.jpg")],
      ["personnage", resolve(root, "images/tools/collegue.png")],
    ]);
  });

  test("refuse les références absentes, en double ou mal introduites", () => {
    const root = fixture();
    expect(() => parseArgs(root, ["--ref", "inconnu"])).toThrow("introuvable");
    expect(() => parseArgs(root, ["--ref", "requin-aretes", "--produit", "requin-aretes"])).toThrow("double");
    expect(() => parseArgs(root, ["--style", "requin-aretes"])).toThrow("Argument invalide");
    expect(() => parseArgs(root, ["--ref"])).toThrow("Argument invalide");
  });

  test("liste les JPEG du catalogue et de la série, sans les sorties natives", () => {
    expect(listReferences(fixture())).toEqual(["requin-aretes", "generation:requin-aretes"]);
  });
});

describe("prompt", () => {
  test("numérote les références avec leur rôle et garde la scène de bataille", () => {
    const root = fixture();
    const prompt = buildPosterPrompt(root, parseArgs(root, ["--produit", "requin-aretes", "--personnage", "images/tools/collegue.png"]));
    expect(prompt).toContain("Image jointe 1 (requin-aretes.jpg) : reprendre uniquement le jouet");
    expect(prompt).toContain("Image jointe 2 (collegue.png) : reprendre uniquement la personne");
    expect(prompt).toContain("collègue distinct");
    expect(prompt).toContain("bataille de jouets");
    expect(prompt).toContain("16:9");
  });

  test("sans référence, invente collègues et jouets", () => {
    const prompt = buildPosterPrompt(fixture(), []);
    expect(prompt).toContain("Aucune. Inventer");
    expect(prompt).not.toContain("collègue distinct");
  });

  test("refuse un prompt malformé", () => {
    const root = fixture();
    writeFileSync(resolve(root, "images/tools/affiche.md"), "incomplet");
    expect(() => buildPosterPrompt(root, [])).toThrow("Structure de prompt invalide");
  });
});

describe("sortie", () => {
  test("recadre au centre en 16:9 sans réduire la largeur", async () => {
    const { jpeg, width, height } = await cropPoster(await png(1881, 1254));
    const metadata = await sharp(jpeg).metadata();
    expect([metadata.format, metadata.width, metadata.height]).toEqual(["jpeg", 1881, 1058]);
    expect([width, height]).toEqual([1881, 1058]);
  });

  test("refuse les sorties carrées, portrait ou trop petites", async () => {
    for (const [w, h] of [[1254, 1254], [1024, 1536], [1024, 683], [2048, 1000]]) {
      await expect(cropPoster(await png(w!, h!))).rejects.toThrow("Sortie refusée");
    }
  });

  test("enregistre une série indépendante avec sa provenance, sans toucher au catalogue", async () => {
    const root = fixture();
    const refs = parseArgs(root, ["--ref", "requin-aretes"]);
    const prompt = buildPosterPrompt(root, refs);
    const bytes = await png(1536, 1024);
    const dir = await storePoster(root, refs, prompt, bytes, new Date("2026-10-21T10:00:00.000Z"));
    expect(dir).toBe(resolve(root, "images/tools/.affiche/2026-10-21T10-00-00-000Z"));
    for (const file of ["affiche.jpg", "affiche.native.png", "prompt.txt"]) expect(existsSync(resolve(dir, file))).toBe(true);
    const manifest = JSON.parse(readFileSync(resolve(dir, "manifest.json"), "utf8"));
    expect(manifest.recipe).toEqual(POSTER);
    expect(manifest.promptSha256).toBe(sha256(prompt));
    expect(manifest.references).toEqual([{ role: "tout", spec: "requin-aretes", path: "images/requin-aretes.jpg", sha256: sha256("catalogue") }]);
    expect(manifest.native).toMatchObject({ width: 1536, height: 1024, format: "png", sha256: sha256(bytes) });
    expect(manifest.delivery).toMatchObject({ width: 1536, height: 864 });
    expect(readFileSync(resolve(root, "images/requin-aretes.jpg"), "utf8")).toBe("catalogue");
  });
});
