import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

type SkillFile = {
  name: string;
  bytes: number;
  date?: string;
};

type SkillList = {
  source: string;
  count: number;
  skills: Array<{
    name: string;
    bytes: number;
    sizeLabel: string;
    date: string | null;
    downloadPath: string;
  }>;
};

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

async function readCatalog(path: string): Promise<SkillFile[]> {
  const raw = await readFile(path, "utf8");
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`Skill catalog at ${path} is not an array.`);
  }
  return data.filter(
    (item): item is SkillFile =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as SkillFile).name === "string" &&
      typeof (item as SkillFile).bytes === "number",
  );
}

async function loadCatalog(): Promise<{ source: string; files: SkillFile[] }> {
  const candidates = [
    process.env.BEVIS_HUB_FILES_JSON,
    resolve(projectRoot, "../files.json"),
    join(projectRoot, "bot/lib/files.json"),
  ].filter((path): path is string => Boolean(path));

  const errors: string[] = [];
  for (const path of candidates) {
    try {
      return { source: path, files: await readCatalog(path) };
    } catch (error) {
      errors.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`Could not load skill catalog.\n${errors.join("\n")}`);
}

export default defineTool({
  description: prompt`
    List skill zip packages published on the Bevis Skills portal.
    Use when the user asks what skills exist, whether a name is available,
    or wants sizes/dates. Optional query filters by filename substring.
  `,
  effect: "read",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Optional case-insensitive substring to filter skill filenames."),
  }),
  async execute({ query }): Promise<SkillList> {
    const { source, files } = await loadCatalog();
    const needle = query?.trim().toLowerCase() ?? "";
    const matched = needle
      ? files.filter((file) => file.name.toLowerCase().includes(needle))
      : files;

    return {
      source: source.includes("bot/lib/files.json") ? "bundled-snapshot" : "portal-files.json",
      count: matched.length,
      skills: matched.map((file) => ({
        name: file.name,
        bytes: file.bytes,
        sizeLabel: formatSize(file.bytes),
        date: file.date ?? null,
        downloadPath: `files/${file.name}`,
      })),
    };
  },
});
