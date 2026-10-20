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

  test("les 16 scènes montrent une démonstration humaine au bureau avec le même bloc de prise de vue", () => {
    const commonBlocks = new Set<string>();
    for (const product of PRODUCTS) {
      const file = readFileSync(resolve(ROOT, "images/prompts", `${product.name}.md`), "utf8");
      const [scene, common] = file.split("## Sujet et composition\n")[1]!.split("## Prise de vue commune BureauBlasters\n");
      expect(scene).toContain("adulte");
      expect(scene!.toLowerCase()).toContain("visage");
      expect(scene!.toLowerCase()).toMatch(/sourire|rictus|rire|regard|clin d’œil|œil plissé|air faussement/);
      expect(scene!.toLowerCase()).toMatch(/bureau|open space|de travail/);
      expect(scene).toContain("premier plan");
      commonBlocks.add(common!.trim());
      const prompt = buildPrompt(ROOT, product);
      expect(prompt).toContain("personne adulte photoréaliste");
      expect(prompt).toContain("fonctions clairement dégagées");
      expect(prompt).toContain("petit air diabolique mais bienveillant");
      expect(prompt).toContain("Bureau d’entreprise créative reconnaissable");
      expect(prompt).toContain("pas une image de film d’animation");
      expect(prompt).toContain("Aucun humain dessiné");
      for (const obsolete of ["Plateau bleu pétrole mat, fond dégradé", "75 à 85 %", "Aucun personnage ni main", "sans porteur ni main artificielle", "Une main adulte sobrement cadrée"]) {
        expect(prompt).not.toContain(obsolete);
      }
    }
    expect(commonBlocks.size).toBe(1);
  });

  test("les gestes de démonstration préservent les fonctions et les conditionnements", () => {
    const prompt = (name: string) => buildPrompt(ROOT, selectProducts([name])[0]!);
    expect(prompt("sulfateuse-relances")).toContain("sans masquer le chargeur, la LED ni le barillet");
    expect(prompt("requin-aretes")).toContain("à deux mains par ses poignées inférieures");
    expect(prompt("gantelets-sprint")).toContain("sur ses avant-bras");
    expect(prompt("gantelets-sprint")).toContain("jamais un bouton posé à plat");
    expect(prompt("gantelets-sprint")).toContain("sans trou central");
    expect(prompt("coin-coin-crise")).toContain("stabilise l’arrière de l’affût");
    expect(prompt("catapulte-croissants")).toContain("hors de sa trajectoire");
    expect(prompt("orbe-decompression")).toContain("ouverture, la balle et les commandes entièrement visibles");
    expect(prompt("brume-bonne-humeur")).toContain("au moins quatre sorties visibles");
    expect(prompt("brume-bonne-humeur")).toContain("une petite LED rose immédiatement à côté de chacune");
    for (const [name, quantity] of Object.entries({
      "flechettes-rappel": "vingt fléchettes", "mini-requins": "quatre mini-requins",
      "disques-livraison": "douze disques", "canards-soutien": "six canards",
      "croissants-reserve": "huit croissants", "balles-decompression": "dix balles",
    })) {
      expect(prompt(name)).toContain(quantity);
      expect(prompt(name)).toContain("plateau");
    }
    for (const name of ["brume-neutre", "brume-girofle-agrumes"]) {
      expect(prompt(name)).toContain("100 ml");
      expect(prompt(name)).toContain("versant un mince filet de liquide");
      expect(prompt(name)).toContain("LED éteintes");
    }
    expect(prompt("brume-neutre")).toContain("clapet bleu pétrole est ouvert");
    expect(prompt("brume-neutre")).toContain("il n’est pas un bouchon et ne s’ouvre jamais");
    for (const product of PRODUCTS) {
      for (const ref of product.references) {
        expect(ref.role).toContain("personne");
        expect(ref.role).toContain("visage");
        expect(ref.role).not.toContain("plateau");
      }
    }
  });

  test("le fumigène tient en poche et ses recharges versent dans son clapet", () => {
    const prompt = (name: string) => buildPrompt(ROOT, selectProducts([name])[0]!);
    const device = prompt("brume-bonne-humeur");
    expect(device).toContain("4 × 4 × 6 cm");
    expect(device).toContain("Trois exemplaires pourraient tenir dans une seule main, mais un seul");
    expect(device).toContain("silicone mat épais et amortissant");
    expect(device).toContain("clapet de remplissage");
    expect(device).toContain("charnière souple intégrée");
    const refill = prompt("brume-neutre");
    expect(refill).toContain("4 × 4 × 6 cm");
    expect(refill).toContain("nettement plus petit que la bouteille de 100 ml");
    expect(refill).toContain("charnière souple toujours attachée");
    expect(refill).not.toContain("disque-bouchon");
    const shark = prompt("brume-girofle-agrumes");
    expect(shark).toContain("orifice de remplissage d’un mini-requin fumigène");
    expect(shark).toContain("le liquide ne se verse jamais dans le lanceur");
    expect(shark).toContain("jamais par les trous de brume");
    for (const text of [refill, shark]) {
      expect(text).toContain("franchit le rebord et disparaît à l’intérieur du trou");
      expect(text).toContain("plusieurs remplissages");
    }
    for (const name of ["brume-bonne-humeur", "brume-neutre", "brume-girofle-agrumes"]) {
      expect(prompt(name)).not.toContain("9 × 9 × 14");
      expect(prompt(name)).not.toContain("réservoir de 100 ml");
    }
  });

  test("les références sont antérieures et les deux lanceurs partagent leurs fléchettes", () => {
    const seen = new Set<string>();
    for (const product of PRODUCTS) {
      for (const ref of product.references) expect(seen.has(ref.name)).toBe(true);
      seen.add(product.name);
    }
    expect(selectProducts(["flechettes-rappel"])[0]!.references.map(ref => ref.name))
      .toEqual(["brume-bonne-humeur", "sulfateuse-relances", "arbalete-anti-reunionite"]);
    expect(selectProducts(["arbalete-anti-reunionite"])[0]!.references.map(ref => ref.name)).toContain("sulfateuse-relances");
    expect(selectProducts(["brume-neutre"])[0]!.references[0]!.name).toBe("brume-bonne-humeur");
    expect(selectProducts(["brume-girofle-agrumes"])[0]!.references[0]!.name).toBe("mini-requins");
  });

  test("le casting récurrent reprend quatre personnes ancrées sur des photos", () => {
    const anchors = new Map<string, string[]>();
    for (const product of PRODUCTS) {
      for (const ref of product.references.filter(ref => ref.role.includes("même personne") || ref.role.startsWith("personne"))) {
        anchors.set(ref.name, [...(anchors.get(ref.name) ?? []), product.name]);
      }
    }
    expect([...anchors.keys()].sort()).toEqual(["catapulte-croissants", "gantelets-sprint", "orbe-decompression", "coin-coin-crise", "requin-aretes", "sulfateuse-relances"].sort());
    for (const [name, users] of anchors) {
      for (const user of users) expect(buildPrompt(ROOT, selectProducts([user])[0]!)).toMatch(/(Camille|Hélène|Inès|Ravi), l[ae] même collègue/);
      expect(name).not.toBe("brume-bonne-humeur");
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

  test("une nouvelle direction commune invalide la référence de style et ses descendants", () => {
    const root = fixture();
    seed(root, "brume-bonne-humeur");
    approve(root, [PRODUCTS[0]!]);
    const path = resolve(root, "images/prompts/README.md");
    writeFileSync(path, readFileSync(path, "utf8").replace("Des démonstrations de jouets", "Des démonstrations expressives de jouets"));
    expect(() => approve(root, [PRODUCTS[0]!])).toThrow("périmée ou modifiée");
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
