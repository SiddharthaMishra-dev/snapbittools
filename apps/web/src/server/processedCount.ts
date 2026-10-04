import { createServerFn } from "@tanstack/react-start";

import { parseProcessedReport, toSnapshot, type ProcessedCountSnapshot } from "@/lib/processedCount";

export const getProcessedCount = createServerFn({ method: "GET" }).handler(async (): Promise<ProcessedCountSnapshot> => {
  const { readProcessedCountState } = await import("./processedCountStore");
  const state = await readProcessedCountState(Date.now());
  return toSnapshot(state, Date.now());
});

export const reportProcessed = createServerFn({ method: "POST" })
  .inputValidator(parseProcessedReport)
  .handler(async ({ data }): Promise<ProcessedCountSnapshot> => {
    const { recordProcessedCount } = await import("./processedCountStore");
    const now = Date.now();
    const state = await recordProcessedCount(data.count, now);
    return toSnapshot(state, now);
  });
