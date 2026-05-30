import { env } from "node:process";
import { parseArgs } from "node:util";

const BASE = "https://ekilex.ee/api";
const headers = { "ekilex-api-key": env.EKILEX_API_KEY ?? "" };

// Morph codes (https://github.com/keeleinstituut/ekilex/wiki/Ekilex-API#request-1):
const MorphCodes = {
  Nimetav: "SgN",
  Omastav: "SgG",
  Osastav: "SgP",
  // ...
  MaInfinitiv: "Sup",
  DaInfinitiv: "Inf",
  OlevikMa: "IndPrSg1",
  // ...
} as const;

type ParadigmForm = {
  formId: number;
  value: string;
  valuePrese: string;
  morphCode: string;
  morphGroup1: string;
  morphGroup2?: string;
  morphGroup3?: string;
  displayLevel: number;
  displayForm: string;
  audioFile?: string;
  morphExists: boolean;
  orderBy: number;
  questionable: boolean;
};

async function fetchApi<T>(path: string, query: string): Promise<T> {
  const res = await fetch(`${BASE}${path}${encodeURIComponent(query)}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

async function getWord(query: string) {
  return fetchApi<{ words: { wordId: number }[] }>("/word/search/", query);
}

async function getParadigm(wordId: number) {
  return fetchApi<{ paradigmForms: ParadigmForm[] }[]>("/paradigm/details/", wordId.toString());
}

function extractNounThreeForms(forms: ParadigmForm[]): string {
  let nimetav;
  let omastav;
  let osastav;

  for (const form of forms) {
    if (form.morphCode === MorphCodes.Nimetav) {
      nimetav = form.value;
    } else if (form.morphCode === MorphCodes.Omastav) {
      omastav = form.value;
    } else if (form.morphCode === MorphCodes.Osastav) {
      osastav = form.value;
    }
  }

  return `${nimetav} / ${omastav} / ${osastav}`;
}

function extractVerbThreeForms(forms: ParadigmForm[]): string {
  let maInf;
  let daInf;
  let maOlevik;

  for (const form of forms) {
    if (form.morphCode === MorphCodes.MaInfinitiv) {
      maInf = form.value;
    } else if (form.morphCode === MorphCodes.DaInfinitiv) {
      daInf = form.value;
    } else if (form.morphCode === MorphCodes.OlevikMa) {
      maOlevik = form.value;
    }
  }

  return `${maInf} / ${daInf} / ${maOlevik}`;
}

async function getThreeForms(word: string, verb: boolean): Promise<string> {
  const wordResponse = await getWord(word);
  const paradigmsResponse = await getParadigm(wordResponse.words[0].wordId);
  const forms = paradigmsResponse[0].paradigmForms as ParadigmForm[];
  if (verb) return extractVerbThreeForms(forms);
  return extractNounThreeForms(forms);
}

// CLI

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    word: { type: "string", short: "w" },
    verb: { type: "boolean", short: "v", default: false },
  },
  allowPositionals: true,
});

const word = values.word ?? positionals[0];
if (!word) {
  console.error("Usage: node src/index.ts <word> [--verb]");
  process.exit(1);
}

const result = await getThreeForms(word, values.verb);
console.log(result);
