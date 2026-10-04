/** How far back a completion still affects the homepage pace. */
export const SAMPLE_WINDOW_MS = 15 * 60 * 1000;

/** Avoids a single instant completion looking infinitely fast. */
export const MIN_RATE_SPAN_MS = 30_000;

/** One request may report a batch, not an unbounded number. */
export const REPORT_MAX_COUNT = 200;

const MAX_SAMPLES = 1000;
const TOOL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ProcessedSample = {
  at: number;
  count: number;
};

export type ProcessedCountState = {
  total: number;
  samples: ProcessedSample[];
};

export type ProcessedCountSnapshot = {
  total: number;
  perSecond: number;
  updatedAt: number;
};

export type ProcessedReport = {
  tool: string;
  count: number;
};

export const emptyProcessedCountState = (): ProcessedCountState => ({
  total: 0,
  samples: [],
});

export function parseProcessedReport(input: unknown): ProcessedReport {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid report");
  }

  const { tool, count } = input as { tool?: unknown; count?: unknown };

  if (typeof tool !== "string" || tool.length > 64 || !TOOL_SLUG.test(tool)) {
    throw new Error("Invalid tool");
  }

  if (typeof count !== "number" || !Number.isInteger(count) || count < 1 || count > REPORT_MAX_COUNT) {
    throw new Error("Invalid count");
  }

  return { tool, count };
}

export function pruneSamples(samples: ProcessedSample[], now: number): ProcessedSample[] {
  const cutoff = now - SAMPLE_WINDOW_MS;
  return samples
    .filter((sample) => sample.at >= cutoff && sample.at <= now + 5_000 && Number.isInteger(sample.count) && sample.count > 0)
    .sort((a, b) => a.at - b.at)
    .slice(-MAX_SAMPLES);
}

export function applyReport(state: ProcessedCountState, count: number, now: number): ProcessedCountState {
  return {
    total: state.total + count,
    samples: pruneSamples([...state.samples, { at: now, count }], now),
  };
}

export function toSnapshot(state: ProcessedCountState, now: number): ProcessedCountSnapshot {
  const samples = pruneSamples(state.samples, now);
  const counted = samples.reduce((sum, sample) => sum + sample.count, 0);

  if (counted === 0) {
    return { total: state.total, perSecond: 0, updatedAt: now };
  }

  const oldest = Math.min(...samples.map((sample) => sample.at));
  const spanMs = Math.max(now - oldest, MIN_RATE_SPAN_MS);
  const perSecond = Math.round((counted / (spanMs / 1000)) * 10_000) / 10_000;

  return { total: state.total, perSecond, updatedAt: now };
}
