export const CPA_SECRET_ENTRY = "bg/cpa.tn.nwo.pm/client-api-key";

type Credential = { apiKey: string; source: "environment" | "gopass" };
type Options = { env?: Record<string, string | undefined>; readStore?: () => Promise<string> };

async function readStoredKey(): Promise<string> {
  const child = Bun.spawn(["gopass", "show", "-o", CPA_SECRET_ENTRY], {
    stdin: "ignore", stdout: "pipe", stderr: "ignore", timeout: 20_000,
  });
  const [value, exitCode] = await Promise.all([new Response(child.stdout).text(), child.exited]);
  if (exitCode !== 0) throw new Error("gopass unavailable");
  return value;
}

export async function resolveCpaCredential({ env = process.env, readStore = readStoredKey }: Options = {}): Promise<Credential> {
  const inherited = env.CPA_CLIENT_API_KEY?.trim();
  if (inherited) return { apiKey: inherited, source: "environment" };
  let stored: string;
  try {
    stored = (await readStore()).trim();
  } catch {
    throw new Error("Clé CPA inaccessible : vérifier gopass et déverrouiller le trousseau, puis réessayer.");
  }
  if (!stored) throw new Error("Clé CPA absente du trousseau gopass.");
  return { apiKey: stored, source: "gopass" };
}
