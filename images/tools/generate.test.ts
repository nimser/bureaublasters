import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import sharp from "sharp";
import { PRODUCTS, RECIPE, ROOT, approve, buildPrompt, cpaFetch, loadManifest, normalizeImage, prepare, publish, selectProducts, sha256, storeGenerated } from "./generate.ts";

const fixtures: string[] = [];
afterEach(() => fixtures.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })));

function fixture(): string {
  const root = mkdtempSync(resolve(tmpdir(), "bb-images-test-"));
  fixtures.push(root);
  for (const dir of ["images/prompts", "images/tools/.generation", "images/tools"]) mkdirSync(resolve(root, dir), { recursive: true });
  for (const file of readdirSync(resolve(ROOT, "images/prompts"))) {
    copyFileSync(resolve(ROOT, "images/prompts", file), resolve(root, "images/prompts", file));
  }
  copyFileSync(resolve(ROOT, "images/tools/bun.lock"), resolve(root, "images/tools/bun.lock"));
  return root;
}

function seed(root: string, name: string): void {
  const manifest = loadManifest(root);
  const product = selectProducts([name])[0]!;
  const expected = prepare(root, product, manifest);
  const bytes = Buffer.from(`test image: ${name}`);
  writeFileSync(resolve(root, "images/tools/.generation", `${name}.jpg`), bytes);
  manifest.images[name] = {
    key: expected.key, promptSha256: expected.promptSha256, references: expected.metadata,
    imageSha256: sha256(bytes), generatedAt: "2026-01-01T00:00:00.000Z",
  };
  writeFileSync(resolve(root, "images/tools/.generation/manifest.json"), JSON.stringify(manifest));
}

describe("recette et prompts", () => {
  test("un seul modèle, paramètres fixes et 16 prompts produit sans README", () => {
    expect(RECIPE.model).toBe("gpt-image-2.5-sunburst");
    expect(RECIPE.maxRetries).toBe(0);
    expect(PRODUCTS).toHaveLength(16);
    expect(new Set(PRODUCTS.map(p => p.name)).size).toBe(16);
    expect(PRODUCTS.map(p => p.name).sort()).toEqual(readdirSync(resolve(ROOT, "images/prompts"))
      .filter(f => f !== "README.md").map(f => f.replace(/\.md$/, "")).sort());
    for (const product of PRODUCTS) {
      const prompt = buildPrompt(ROOT, product);
      expect(prompt).toBe(buildPrompt(ROOT, product));
      expect(prompt).toContain("## Prise de vue commune BureauBlasters");
      expect(prompt).toContain("DIRECTION ARTISTIQUE COMMUNE");
      expect(prompt).not.toContain("https://");
      expect(prompt).not.toContain("Référence d’objet obligatoire");
      for (const [index, ref] of product.references.entries()) {
        expect(prompt).toContain(`Image jointe ${index + 1} (${ref.name})`);
      }
    }
  });

  test("les références sont antérieures et les deux lanceurs partagent leurs fléchettes", () => {
    const seen = new Set<string>();
    for (const product of PRODUCTS) {
      for (const ref of product.references) expect(seen.has(ref.name)).toBe(true);
      seen.add(product.name);
    }
    expect(selectProducts(["flechettes-rappel"])[0]!.references.map(ref => ref.name))
      .toEqual(["brume-bonne-humeur", "rafale-post-it", "arbalete-anti-reunionite"]);
    expect(selectProducts(["arbalete-anti-reunionite"])[0]!.references.map(ref => ref.name)).toContain("rafale-post-it");
    for (const name of ["brume-neutre", "brume-girofle-agrumes"]) {
      expect(selectProducts([name])[0]!.references[0]!.name).toBe("brume-bonne-humeur");
    }
  });

  test("produits inconnus, listes vides et prompts malformés refusés", () => {
    expect(() => selectProducts([])).toThrow("au moins un produit");
    expect(() => selectProducts(["README"])).toThrow("inconnu");
    const root = fixture();
    writeFileSync(resolve(root, "images/prompts/brume-bonne-humeur.md"), "prompt incomplet");
    expect(() => buildPrompt(root, PRODUCTS[0]!)).toThrow("Structure de prompt invalide");
  });
});

describe("transport et format de sortie", () => {
  test("donne un nom de fichier à chaque référence multipart sous Bun", async () => {
    const form = new FormData();
    form.append("prompt", "Même photographie");
    form.append("image[]", new Blob(["référence 1"], { type: "image/jpeg" }));
    form.append("image[]", new Blob(["référence 2"], { type: "image/jpeg" }));
    let serialized = "";
    const preconnect = fetch.preconnect;
    const mock = spyOn(globalThis, "fetch").mockImplementation(Object.assign(async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
      serialized = await new Request(input, init).text();
      return new Response("{}");
    }, { preconnect }));
    try {
      await cpaFetch("https://example.invalid/v1/images/edits", { method: "POST", body: form });
      expect(serialized.match(/filename="reference.jpg"/g)).toHaveLength(2);
      expect(serialized).not.toContain('filename=""');
      expect(serialized).toContain("Même photographie");
      expect(serialized).toContain("référence 1");
      expect(serialized).toContain("référence 2");
    } finally {
      mock.mockRestore();
    }
  });

  test("normalise un PNG carré natif en JPEG 1024 sans recadrer", async () => {
    const input = await sharp({ create: { width: 1254, height: 1254, channels: 3, background: "#123456" } }).png().toBuffer();
    const result = await normalizeImage(input);
    const metadata = await sharp(result).metadata();
    expect(metadata.format).toBe("jpeg");
    expect(metadata.width).toBe(1024);
    expect(metadata.height).toBe(1024);
  });

  test("refuse les images non carrées ou trop petites", async () => {
    for (const [width, height] of [[1536, 1024], [512, 512]]) {
      const input = await sharp({ create: { width: width!, height: height!, channels: 3, background: "#123456" } }).png().toBuffer();
      await expect(normalizeImage(input)).rejects.toThrow("Sortie refusée");
    }
  });
});

describe("continuité et publication", () => {
  test("ne prend jamais les anciens JPEG comme références", () => {
    const root = fixture();
    writeFileSync(resolve(root, "images/brume-bonne-humeur.jpg"), "ancien JPEG");
    expect(() => prepare(root, PRODUCTS[1]!, loadManifest(root))).toThrow("Référence non validée");
    seed(root, "brume-bonne-humeur");
    expect(() => prepare(root, PRODUCTS[1]!, loadManifest(root))).toThrow("Référence non validée");
    approve(root, [PRODUCTS[0]!]);
    const result = prepare(root, PRODUCTS[1]!, loadManifest(root));
    expect(result.references[0]!.bytes.toString()).toBe("test image: brume-bonne-humeur");
  });

  test("un prompt de référence modifié invalide les descendants", () => {
    const root = fixture();
    seed(root, "brume-bonne-humeur");
    approve(root, [PRODUCTS[0]!]);
    const path = resolve(root, "images/prompts/brume-bonne-humeur.md");
    writeFileSync(path, `${readFileSync(path, "utf8")}\nConsigne supplémentaire.\n`);
    expect(() => prepare(root, PRODUCTS[1]!, loadManifest(root))).toThrow("Référence périmée");
  });

  test("un JPEG altéré ou des dépendances différentes sont refusés", () => {
    const root = fixture();
    seed(root, "brume-bonne-humeur");
    writeFileSync(resolve(root, "images/tools/.generation/brume-bonne-humeur.jpg"), "altéré");
    expect(() => approve(root, [PRODUCTS[0]!])).toThrow("périmée ou modifiée");
    writeFileSync(resolve(root, "images/tools/bun.lock"), "autres dépendances");
    expect(() => loadManifest(root)).toThrow("Recette ou dépendances différentes");
  });

  test("conserve le prompt envoyé si la source change pendant une génération", async () => {
    const root = fixture();
    const manifest = loadManifest(root);
    const product = PRODUCTS[0]!;
    const sent = prepare(root, product, manifest);
    const path = resolve(root, "images/prompts/brume-bonne-humeur.md");
    writeFileSync(path, `${readFileSync(path, "utf8")}\nConsigne supplémentaire.\n`);
    const image = await sharp({ create: { width: 1024, height: 1024, channels: 3, background: "#123456" } }).png().toBuffer();
    await storeGenerated(root, product, manifest, image, sent);
    expect(loadManifest(root).images[product.name]!.promptSha256).toBe(sent.promptSha256);
    expect(() => approve(root, [product])).toThrow("périmée ou modifiée");
  });

  test("publication refusée sans les 16 validations, anciens JPEG intacts", () => {
    const root = fixture();
    const path = resolve(root, "images/brume-bonne-humeur.jpg");
    writeFileSync(path, "ancien JPEG");
    seed(root, "brume-bonne-humeur");
    expect(() => publish(root)).toThrow("Publication refusée");
    expect(readFileSync(path, "utf8")).toBe("ancien JPEG");
    expect(existsSync(resolve(root, "images/tools/generation.json"))).toBe(false);
  });

  test("publie les 16 sorties contrôlées avec leur provenance", () => {
    const root = fixture();
    for (const product of PRODUCTS) {
      seed(root, product.name);
      approve(root, [product]);
    }
    publish(root);
    const manifest = JSON.parse(readFileSync(resolve(root, "images/tools/generation.json"), "utf8"));
    expect(Object.keys(manifest.images)).toHaveLength(16);
    for (const product of PRODUCTS) {
      expect(sha256(readFileSync(resolve(root, "images", `${product.name}.jpg`))))
        .toBe(manifest.images[product.name].imageSha256);
    }
  });
});
