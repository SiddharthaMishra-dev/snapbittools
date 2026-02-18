export type DiffType = "added" | "removed" | "common";

export interface DiffLine {
    value: string;
    type: DiffType;
    oldLineNumber?: number;
    newLineNumber?: number;
}

// Myers diff algorithm (line-based)
export function computeDiff(oldText: string, newText: string): DiffLine[] {
    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");

    const n = oldLines.length;
    const m = newLines.length;

    if (n === 0 && m === 0) return [];

    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (oldLines[i - 1] === newLines[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    const result: DiffLine[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            result.unshift({
                value: oldLines[i - 1],
                type: "common",
                oldLineNumber: i,
                newLineNumber: j,
            });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            result.unshift({
                value: newLines[j - 1],
                type: "added",
                newLineNumber: j,
            });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            result.unshift({
                value: oldLines[i - 1],
                type: "removed",
                oldLineNumber: i,
            });
            i--;
        }
    }

    return result;
}
