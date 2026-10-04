import { REPORT_MAX_COUNT } from "@/lib/processedCount";
import { reportProcessed } from "@/server/processedCount";

export function reportProcessedFiles(tool: string, count: number) {
  const whole = Math.floor(count);
  if (whole < 1) return;

  const batch = Math.min(whole, REPORT_MAX_COUNT);
  void reportProcessed({ data: { tool, count: batch } }).catch(() => {});

  if (whole > REPORT_MAX_COUNT) {
    reportProcessedFiles(tool, whole - REPORT_MAX_COUNT);
  }
}
