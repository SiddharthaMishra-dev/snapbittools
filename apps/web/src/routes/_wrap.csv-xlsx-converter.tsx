import { createFileRoute } from "@tanstack/react-router";
import {
  IconCircleX,
  IconDownload,
  IconFileSpreadsheet,
  IconLock,
  IconArrowsExchange,
  IconFileText,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { FileDropzone } from "@/components/FileDropzone";
import ToolInfo from "../components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import { toolContent } from "@/data/toolContent";

import { reportProcessedFiles } from "@/lib/reportProcessed";
import { getSeoMetadata } from "@/lib/seo";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I convert XLSX to CSV?",
    answer:
      "Drag and drop your .xlsx file into the converter above (or click Select Files). The tool detects that it is an Excel XLSX file and converts it to CSV automatically. When the conversion finishes, click the download button to save your new .csv file. No sign-up, no uploads, and no software to install.",
  },
  {
    question: "How do I convert CSV to XLSX?",
    answer:
      "To change CSV to XLSX, drop one or more .csv files into the converter. Each file is converted into a clean Excel workbook instantly, and you can download the .xlsx file with one click. CSV to XLSX conversion runs entirely in your browser.",
  },
  {
    question: "How do you convert XLSX to CSV in Excel without this tool?",
    answer:
      "In Microsoft Excel, open the .xlsx file, go to File → Save As, choose 'CSV (Comma delimited) (*.csv)' as the file type, and save. That works for one file at a time. If you need to convert several XLSX files to CSV at once, or you don't have Excel installed, this online converter does it in seconds.",
  },
  {
    question: "What happens to multiple sheets when converting .xlsx to CSV?",
    answer:
      "CSV is a single-table, plain-text format, so it cannot store multiple sheets. When you convert an Excel XLSX file to CSV, the converter exports the first worksheet in the workbook. If you need other sheets, move them to the first position in Excel before converting.",
  },
  {
    question: "Is the Excel formatting preserved?",
    answer:
      "When you convert XLSX to CSV, only the cell values are kept, because CSV is plain text and has no fonts, colors, formulas, or cell styles. When you convert CSV to XLSX, you get a clean, modern Excel file containing all your rows and columns, ready for formatting, formulas, and charts.",
  },
  {
    question: "Can I convert multiple files at once?",
    answer:
      "Yes. Batch conversion is supported in both directions: select or drop several CSV and XLSX files together and each one is converted to the opposite format automatically. You can even mix CSV to XLSX and XLSX to CSV conversions in the same batch.",
  },
  {
    question: "Is it safe to convert my business spreadsheets here?",
    answer:
      "Yes. All CSV and XLSX conversion happens locally in your browser. Your spreadsheets are never uploaded to any server, so financial, customer, and business data stays completely private on your device.",
  },
  {
    question: "Are there any file size limits?",
    answer:
      "There is no fixed limit, but because the tool runs in your browser it depends on your device's memory. Most spreadsheets convert instantly; very large files (100MB+) may take longer.",
  },
];

export const Route = createFileRoute("/_wrap/csv-xlsx-converter")({
  head: () =>
    getSeoMetadata({
      title: "Convert XLSX to CSV & CSV to XLSX Online Free | SnapBit Tools",
      description:
        "Convert XLSX to CSV or CSV to XLSX in seconds. Free batch Excel XLSX to CSV converter that runs in your browser: no uploads, no sign-up, 100% private.",
      keywords: [
        "csv to xlsx",
        "xlsx to csv",
        "convert excel to csv",
        "excel xlsx to csv",
        "convert xlsx to csv",
        ".xlsx to csv",
        "how to convert xlsx to csv",
        "convert csv to xlsx",
        "csv to xlsx conversion",
        "change csv to xlsx",
        "how do you convert xlsx to csv",
        "batch converter",
        "offline office tools",
      ],
      url: "/csv-xlsx-converter",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

const getBaseName = (fileName: string) => fileName.replace(/\.[^.]+$/, "");

interface ConversionItem {
  id: string;
  file: File;
  name: string;
  originalFormat: string;
  targetFormat: "xlsx" | "csv";
  status: "pending" | "converting" | "completed" | "error";
  error?: string;
  downloadUrl?: string;
  blob?: Blob;
}

function RouteComponent() {
  const [conversions, setConversions] = useState<ConversionItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ext === "csv" || ext === "xlsx";
    });

    if (validFiles.length === 0) {
      alert("Please select valid CSV or XLSX files");
      return;
    }

    const newConversions: ConversionItem[] = validFiles.map((file, index) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const originalFormat = ext?.toUpperCase() || "Unknown";
      const targetFormat = ext === "csv" ? "xlsx" : "csv";

      return {
        id: `${Date.now()}-${index}`,
        file,
        name: file.name,
        originalFormat,
        targetFormat,
        status: "pending",
      };
    });

    setConversions((prev) => [...prev, ...newConversions]);
  }, []);

  const convertFile = async (item: ConversionItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error("Failed to read file"));
            return;
          }

          let outputBlob: Blob;
          let outputFileName: string;

          if (item.targetFormat === "xlsx") {
            const workbook = XLSX.read(data, { type: "binary" });
            const excelBuffer = XLSX.write(workbook, {
              bookType: "xlsx",
              type: "array",
            });
            outputBlob = new Blob([excelBuffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            outputFileName = item.name.replace(/\.csv$/i, ".xlsx");
          } else {
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const csvData = XLSX.utils.sheet_to_csv(worksheet);
            outputBlob = new Blob([csvData], { type: "text/csv" });
            outputFileName = item.name.replace(/\.xlsx$/i, ".csv");
          }

          const downloadUrl = URL.createObjectURL(outputBlob);
          setConversions((prev) =>
            prev.map((conv) =>
              conv.id === item.id
                ? {
                    ...conv,
                    status: "completed",
                    downloadUrl,
                    blob: outputBlob,
                    name: outputFileName,
                  }
                : conv,
            ),
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("File reader error"));
      };

      if (item.originalFormat === "CSV") {
        reader.readAsBinaryString(item.file);
      } else {
        reader.readAsArrayBuffer(item.file);
      }
    });
  };

  const handleConvertAll = async (itemsToConvert: ConversionItem[]) => {
    if (itemsToConvert.length === 0) return;

    setIsConverting(true);
    let completed = 0;
    for (const item of itemsToConvert) {
      try {
        setConversions((prev) =>
          prev.map((conv) => (conv.id === item.id ? { ...conv, status: "converting" } : conv)),
        );
        await convertFile(item);
        completed += 1;
      } catch (error) {
        setConversions((prev) =>
          prev.map((conv) =>
            conv.id === item.id
              ? { ...conv, status: "error", error: (error as Error).message }
              : conv,
          ),
        );
      }
    }
    reportProcessedFiles("csv-xlsx-converter", completed);
    setIsConverting(false);
  };

  const renameFile = (id: string, baseName: string) => {
    setConversions((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, name: `${baseName}.${conv.targetFormat}` } : conv,
      ),
    );
  };

  const downloadFile = (item: ConversionItem) => {
    if (!item.downloadUrl) return;
    const baseName = getBaseName(item.name)
      .trim()
      .replace(/[\\/:*?"<>|]/g, "_");
    const link = document.createElement("a");
    link.href = item.downloadUrl;
    link.download = `${baseName || "converted"}.${item.targetFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    conversions.forEach((item) => {
      if (item.downloadUrl) {
        URL.revokeObjectURL(item.downloadUrl);
      }
    });
    setConversions([]);
  };

  useEffect(() => {
    const pendingItems = conversions.filter((item) => item.status === "pending");
    if (pendingItems.length > 0 && !isConverting) {
      handleConvertAll(pendingItems);
    }
  }, [conversions, isConverting]);

  return (
    <div className="bg-theme-page theme-page-gradient py-2 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <div className="flex flex-col items-center justify-center">
          {/* <Breadcrumbs /> */}
          <div className="w-full max-w-5xl mt-6 mb-12 text-center mx-auto">
            <div className="text-center">
              <h1 className="text-2xl sm:text-5xl font-bold text-theme-heading mb-2 tracking-tight text-shadow-sm">
                XLSX to CSV &amp; CSV to XLSX Converter
              </h1>
              <p className="text-md text-theme-body">
                Convert Excel XLSX to CSV or change CSV to XLSX instantly. No uploads, 100% private.
              </p>
            </div>
          </div>

          <div className="w-full max-w-6xl flex-1 flex flex-col items-center  mx-auto">
            <div className="rounded-xl shadow-lg mb-6 w-full max-w-5xl border border-theme-border bg-theme-surface px-0 py-4 sm:p-8">
              {conversions.length === 0 ? (
                <FileDropzone
                  title="Upload files"
                  description="Drop .xlsx files to convert to CSV, or .csv files to convert to XLSX."
                  buttonLabel="Select Files"
                  accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  multiple
                  onFiles={processFiles}
                />
              ) : (
                <>
                  <div className="w-full flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-theme-heading mb-4">
                      Files ({conversions.length})
                    </h3>
                    <button
                      onClick={clearAll}
                      className={cn(tc.btnDanger, "px-4 py-2")}
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {conversions.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border border-theme-border rounded-lg bg-theme-surface-muted"
                      >
                        <div className="mr-4 shrink-0">
                          {item.originalFormat === "CSV" ? (
                            <IconFileText className="w-10 h-10 text-brand-primary" />
                          ) : (
                            <IconFileSpreadsheet className="w-10 h-10 text-brand-primary" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {item.status === "completed" ? (
                              <div className="flex items-center min-w-0 flex-1">
                                <input
                                  type="text"
                                  value={getBaseName(item.name)}
                                  onChange={(e) => renameFile(item.id, e.target.value)}
                                  aria-label="Download file name"
                                  title="Edit file name"
                                  className={cn(
                                    tc.input,
                                    "min-w-0 flex-1 max-w-sm font-medium border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary",
                                  )}
                                />
                                <span className="ml-1 text-sm text-theme-muted shrink-0">
                                  .{item.targetFormat}
                                </span>
                              </div>
                            ) : (
                              <p className="font-medium text-theme-heading truncate">{item.name}</p>
                            )}
                            <span className="text-xs px-2 py-1 bg-theme-icon-bg text-theme-body rounded">
                              {item.originalFormat} → {item.targetFormat.toUpperCase()}
                            </span>
                          </div>
                          {item.error && (
                            <p className="text-xs text-[var(--theme-alert-error-text)] mt-1">
                              {item.error}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 ml-4">
                          {item.status === "pending" && (
                            <span className="text-theme-muted text-sm">Pending</span>
                          )}
                          {item.status === "converting" && (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-brand-primary text-sm">Converting...</span>
                            </div>
                          )}
                          {item.status === "completed" && (
                            <button
                              onClick={() => downloadFile(item)}
                              aria-label="Download"
                              className={cn(tc.btnSuccess, "px-3 py-1 text-sm")}
                            >
                              <IconDownload className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === "error" && (
                            <IconCircleX className="w-4 h-4 text-[var(--theme-alert-error-icon)]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <ToolContentDisplay
          title={toolContent["csv-xlsx-converter"].title}
          intro={toolContent["csv-xlsx-converter"].intro}
          benefits={toolContent["csv-xlsx-converter"].benefits}
          useCases={toolContent["csv-xlsx-converter"].useCases}
        />

        <ToolInfo
          title="How to Convert XLSX to CSV (and CSV to XLSX)"
          description="Wondering how to convert XLSX to CSV without opening Excel? This free converter turns any .xlsx file into a CSV in seconds, and handles CSV to XLSX conversion just as easily. Drop in your files, and they convert automatically right in your browser: fast, reliable, and completely private."
          features={[
            {
              title: "Two-Way Conversion",
              description:
                "Convert Excel XLSX to CSV, or convert CSV to XLSX, with the same tool. The direction is detected from each file automatically.",
              icon: IconArrowsExchange,
            },
            {
              title: "Client-Side Only",
              description:
                "Every CSV to XLSX conversion happens in your browser. Your spreadsheet data never touches a server.",
              icon: IconLock,
            },
            {
              title: "Batch Processing",
              description:
                "Convert multiple .xlsx files to CSV, or change many CSV files to XLSX, in a single batch.",
              icon: IconFileSpreadsheet,
            },
          ]}
          steps={[
            {
              title: "Add Your Files",
              description:
                "Drag and drop .xlsx files to convert to CSV, or .csv files to convert to XLSX.",
            },
            {
              title: "Automatic Detection",
              description:
                "The tool reads each file's extension and picks the right conversion: XLSX to CSV or CSV to XLSX.",
            },
            {
              title: "Instant Conversion",
              description:
                "Conversion starts immediately in your browser. No uploads and no waiting on a server.",
            },
            {
              title: "Download",
              description:
                "Click the download button next to each file to save your converted CSV or XLSX.",
            },
          ]}
          faqs={faqs}
        />

        <RelatedTools
          currentToolSlug="csv-xlsx-converter"
          category="Data"
        />
      </div>
    </div>
  );
}
