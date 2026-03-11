type WorkerRequest = {
  input: string;
  hasHeader: boolean;
  sanitizeJson: boolean;
  requestId: number;
};

type WorkerSuccess = {
  requestId: number;
  jsonOutput: string;
  stats: { rows: number; columns: number };
};

type WorkerError = {
  requestId: number;
  error: string;
};

const sanitizeString = (value: string) => {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const parseCSV = (text: string) => {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cell.trim());
        cell = "";
      } else if (char === "\n" || char === "\r") {
        row.push(cell.trim());
        if (row.length > 0 && (row.length > 1 || row[0] !== "")) {
          result.push(row);
        }
        row = [];
        cell = "";
        if (char === "\r" && nextChar === "\n") i++;
      } else {
        cell += char;
      }
    }
  }

  if (cell || row.length > 0) {
    row.push(cell.trim());
    result.push(row);
  }

  return result;
};

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { input, hasHeader, sanitizeJson, requestId } = event.data;

  try {
    if (!input.trim()) {
      const emptyPayload: WorkerSuccess = {
        requestId,
        jsonOutput: "",
        stats: { rows: 0, columns: 0 },
      };
      self.postMessage(emptyPayload);
      return;
    }

    const rows = parseCSV(input);
    if (rows.length === 0) {
      const emptyPayload: WorkerSuccess = {
        requestId,
        jsonOutput: "",
        stats: { rows: 0, columns: 0 },
      };
      self.postMessage(emptyPayload);
      return;
    }

    let result: Array<Record<string, unknown>> | unknown[][];
    let headerCount = 0;

    if (hasHeader) {
      const headers = rows[0];
      headerCount = headers.length;
      const dataRows = rows.slice(1);

      result = dataRows.map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          let value: unknown = row[index] !== undefined ? row[index] : null;

          if (typeof value === "string") {
            if (value.toLowerCase() === "true") value = true;
            else if (value.toLowerCase() === "false") value = false;
            else if (!isNaN(Number(value)) && value !== "") value = Number(value);
            else if (sanitizeJson) value = sanitizeString(value);
          }

          obj[header || `column${index + 1}`] = value;
        });
        return obj;
      });
    } else {
      headerCount = rows[0].length;
      result = rows.map((row) => {
        return row.map((cell) => {
          if (cell.toLowerCase() === "true") return true;
          if (cell.toLowerCase() === "false") return false;
          if (!isNaN(Number(cell)) && cell !== "") return Number(cell);
          if (sanitizeJson) return sanitizeString(cell);
          return cell;
        });
      });
    }

    const payload: WorkerSuccess = {
      requestId,
      jsonOutput: JSON.stringify(result, null, 2),
      stats: { rows: result.length, columns: headerCount },
    };

    self.postMessage(payload);
  } catch (error) {
    const payload: WorkerError = {
      requestId,
      error: error instanceof Error ? error.message : "Unknown parsing error",
    };
    self.postMessage(payload);
  }
};
