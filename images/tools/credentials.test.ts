import { describe, expect, test } from "bun:test";
import { resolveCpaCredential } from "./credentials.ts";

describe("identifiants CPA", () => {
  test("utilise l’environnement sans consulter le trousseau", async () => {
    const credential = await resolveCpaCredential({
      env: { CPA_CLIENT_API_KEY: "test-environment-key" },
      readStore: async () => { throw new Error("ne doit pas être appelé"); },
    });
    expect(credential).toEqual({ apiKey: "test-environment-key", source: "environment" });
  });

  test("charge automatiquement le trousseau sans variable d’environnement", async () => {
    let calls = 0;
    const credential = await resolveCpaCredential({
      env: {}, readStore: async () => { calls++; return "test-store-key\n"; },
    });
    expect(calls).toBe(1);
    expect(credential).toEqual({ apiKey: "test-store-key", source: "gopass" });
  });

  test("une variable vide ne masque pas le trousseau", async () => {
    const credential = await resolveCpaCredential({
      env: { CPA_CLIENT_API_KEY: " \n" }, readStore: async () => "test-store-key",
    });
    expect(credential.source).toBe("gopass");
  });

  test("ne transmet pas les détails des erreurs du gestionnaire de secrets", async () => {
    await expect(resolveCpaCredential({
      env: {}, readStore: async () => { throw new Error("sortie privée du trousseau"); },
    })).rejects.toThrow("Clé CPA inaccessible : vérifier gopass et déverrouiller le trousseau, puis réessayer.");
  });

  test("refuse un trousseau vide sans autre fournisseur de secours", async () => {
    await expect(resolveCpaCredential({ env: {}, readStore: async () => " \n" }))
      .rejects.toThrow("Clé CPA absente du trousseau gopass.");
  });
});
