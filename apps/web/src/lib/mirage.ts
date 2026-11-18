/**
 * Mirage (Cactus Compute) vision model: result types, pinned assets, and pure helpers.
 *
 * Mirage runs in the browser through the Cactus engine's WebAssembly build
 * (vendored in src/vendor/cactus, see scripts/vendor-cactus.mjs). It returns JSON from
 * `cactus_describe`. All boxes and polygons are on a 0–1000 scale relative to the image,
 * as [x1, y1, x2, y2] and flat [x, y, x, y, …] lists.
 */

/** Engine release vendored by scripts/vendor-cactus.mjs. Keep both in sync. */
export const MIRAGE_ENGINE = { version: "4.1.2", revision: "569a10bb4f0e87331abcf874903c0e5139d38aae" } as const;

/** Mirage weights, pinned to the revision the cactus-compute 4.2.5 Python package uses. */
export const MIRAGE_WEIGHTS = {
  url: "https://huggingface.co/Cactus-Compute/mirage/resolve/76c1e9e53381aca8fc3843c636216c96ff220122/mirage.cact",
  size: 21_611_043,
  sha256: "4249a0f7515272ff76b9414bec17d7e7daf84b15b66c7fb4f17fce1e66f9f237",
} as const;

/** The engine accepts any size, but RGB input lives in WASM memory. Larger images are scaled down. */
export const MIRAGE_MAX_SIDE = 2560;

/** Bit set by `cactus_models()` when the loaded archive contains a vision model. */
export const CACTUS_VISION = 4;

export const MIRAGE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
] as const;

export type MirageLanguage = (typeof MIRAGE_LANGUAGES)[number]["code"];

export type MirageBox = [number, number, number, number];

export type MirageTextLine = {
  string: string;
  bbox?: MirageBox;
  score?: number;
};

export type MirageObject = {
  id: number;
  name: string;
  bbox?: MirageBox;
  score?: number;
  /** Flat polygon by default; list of flat polygons with `mask_format: "polygons"`. */
  mask?: number[] | number[][];
  position?: string;
  description?: Record<string, string>;
};

/** Areas without a box, such as "shadow" or "webpage". Relations can refer to their ids. */
export type MirageRegion = {
  id: number;
  name: string;
  position?: string;
  description?: Record<string, string>;
};

export type MirageRelation = {
  subject: number;
  predicate: string;
  object: number;
};

export type MirageFormValue = {
  value: string | number | null;
  probabilities?: Record<string, number>;
  probability?: number;
};

export type MirageResult = {
  scene?: Record<string, string>;
  objects?: MirageObject[];
  regions?: MirageRegion[];
  text?: MirageTextLine[];
  relations?: MirageRelation[];
  events?: unknown[];
  reasoning?: string;
  form?: Record<string, MirageFormValue>;
};

export type MirageSection = "scene" | "objects" | "regions" | "text" | "relations" | "events" | "reasoning";

/** Options passed to `cactus_describe` as JSON. Unset keys use the engine defaults. */
export type MirageOptions = {
  sections?: MirageSection[];
  fields?: Array<"bbox" | "score" | "mask">;
  mask_format?: "polygons" | "bitmap";
  conf?: number;
  text_conf?: number;
  max_objects?: number;
  max_text_lines?: number;
  max_tokens?: number;
  form?: Record<string, MirageFormFieldSchema>;
};

export type MirageFormFieldSchema = { enum: string[] } | { type: "integer"; minimum: number; maximum: number } | { type: "string" };

/** A question as edited in the UI, before it is turned into a form schema. */
export type FormQuestion = {
  key: string;
  kind: "choice" | "number" | "text";
  /** Comma-separated labels for `choice`. */
  choices: string;
  min: number;
  max: number;
};

/** Mirage spends one probability on "-" when none of the choices fits. */
export const MIRAGE_ABSTAIN = "-";

const KEY_PATTERN = /[^a-z0-9_]+/g;

/** Mirage form keys are short identifiers. "Document type?" becomes "document_type". */
export function toFormKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(KEY_PATTERN, "_")
    .replace(/^_+|_+$/g, "");
}

export function parseChoices(input: string): string[] {
  const seen = new Set<string>();
  for (const part of input.split(",")) {
    const choice = part.trim();
    if (choice) seen.add(choice);
  }
  return [...seen];
}

/**
 * Turns UI questions into Mirage's form schema.
 * Returns the problem with the first invalid question instead of a schema.
 */
export function buildFormSchema(
  questions: FormQuestion[],
): { schema: Record<string, MirageFormFieldSchema>; error?: undefined } | { schema?: undefined; error: string } {
  const schema: Record<string, MirageFormFieldSchema> = {};
  if (questions.length === 0) return { error: "Add at least one question." };

  for (const [index, question] of questions.entries()) {
    const key = toFormKey(question.key);
    const label = `Question ${index + 1}`;
    if (!key) return { error: `${label} needs a name.` };
    if (key in schema) return { error: `Two questions are both named "${key}".` };

    if (question.kind === "choice") {
      const choices = parseChoices(question.choices);
      if (choices.length < 2) return { error: `${label} ("${key}") needs at least two choices.` };
      schema[key] = { enum: choices };
    } else if (question.kind === "number") {
      const min = Math.trunc(question.min);
      const max = Math.trunc(question.max);
      if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) {
        return { error: `${label} ("${key}") needs a range where 0 ≤ min ≤ max.` };
      }
      if (max - min > 100) return { error: `${label} ("${key}") can span at most 100 values.` };
      schema[key] = { type: "integer", minimum: min, maximum: max };
    } else {
      schema[key] = { type: "string" };
    }
  }
  return { schema };
}

function verticalOverlap(a: MirageBox, b: MirageBox): number {
  const overlap = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  const shorter = Math.min(a[3] - a[1], b[3] - b[1]);
  return shorter > 0 ? overlap / shorter : 0;
}

/**
 * Orders OCR lines for reading: top to bottom, and left to right within a row.
 * Mirage reports text regions in detection order, and splits a row such as
 * "Total ... 5.75" into separate regions. Regions that share most of their height
 * are joined into one row with a space.
 */
export function linesToText(lines: MirageTextLine[]): string {
  const boxed = lines.filter((line): line is MirageTextLine & { bbox: MirageBox } => Boolean(line.bbox && line.string.trim()));
  const unboxed = lines.filter((line) => !line.bbox && line.string.trim()).map((line) => line.string.trim());

  const sorted = [...boxed].sort((a, b) => a.bbox[1] + a.bbox[3] - (b.bbox[1] + b.bbox[3]));
  const rows: Array<{ box: MirageBox; items: typeof boxed }> = [];

  for (const line of sorted) {
    const row = rows.find((candidate) => verticalOverlap(candidate.box, line.bbox) >= 0.5);
    if (row) {
      row.items.push(line);
      row.box = [
        Math.min(row.box[0], line.bbox[0]),
        Math.min(row.box[1], line.bbox[1]),
        Math.max(row.box[2], line.bbox[2]),
        Math.max(row.box[3], line.bbox[3]),
      ];
    } else {
      rows.push({ box: [...line.bbox], items: [line] });
    }
  }

  const text = rows
    .sort((a, b) => a.box[1] - b.box[1])
    .map((row) =>
      row.items
        .sort((a, b) => a.bbox[0] - b.bbox[0])
        .map((item) => item.string.trim())
        .join(" "),
    );
  return [...text, ...unboxed].join("\n");
}

/** Normalises the object mask to a list of flat polygons. */
export function maskPolygons(mask: MirageObject["mask"]): number[][] {
  if (!mask || mask.length === 0) return [];
  return typeof mask[0] === "number" ? [mask as number[]] : (mask as number[][]);
}

/** SVG `points` for a flat [x, y, x, y, …] polygon. */
export function polygonPoints(flat: number[]): string {
  const points: string[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) points.push(`${flat[i]},${flat[i + 1]}`);
  return points.join(" ");
}

/** Name for an object or region id, used to print relations such as "shadow on sand dune". */
export function entityName(result: MirageResult, id: number): string {
  const match = result.objects?.find((o) => o.id === id) ?? result.regions?.find((r) => r.id === id);
  return match ? match.name : `#${id}`;
}

/** Sorted [label, probability] pairs, highest first. */
export function rankedProbabilities(probabilities: Record<string, number> | undefined): Array<[string, number]> {
  if (!probabilities) return [];
  return Object.entries(probabilities).sort((a, b) => b[1] - a[1]);
}

/** Packs canvas RGBA pixels into the tightly packed RGB layout `cactus_describe` expects. */
export function rgbaToRgb(rgba: Uint8ClampedArray | Uint8Array, target?: Uint8Array): Uint8Array {
  const pixels = rgba.length / 4;
  const rgb = target ?? new Uint8Array(pixels * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i];
    rgb[j + 1] = rgba[i + 1];
    rgb[j + 2] = rgba[i + 2];
  }
  return rgb;
}

/** Scales width × height down so the longest side is at most `maxSide`. */
export function fitWithin(width: number, height: number, maxSide = MIRAGE_MAX_SIDE): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height };
  const scale = maxSide / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
