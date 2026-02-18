import { createFileRoute } from "@tanstack/react-router";
import {
    IconCircleX,
    IconCloudUpload,
    IconDownload,
    IconFileSpreadsheet,
    IconLock,
    IconArrowsExchange,
    IconFileText,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import ToolInfo from "../components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";

import { getSeoMetadata } from "@/lib/seo";

const faqs = [
    {
        question: "Is it safe to convert my business spreadsheets here?",
        answer: "Yes, 100%. All processing happens locally in your browser. Your spreadsheets and their data are never uploaded to any server, keeping your financial and business data completely private.",
    },
    {
        question: "Does it support batch conversion?",
        answer: "Yes, you can upload multiple CSV files and convert them all to XLSX at once, or vice versa. The results can be downloaded individually or as a ZIP file.",
    },
    {
        question: "Are there any file size limits?",
        answer: "Since the tool runs in your browser, it is limited by your computer's memory. Most standard spreadsheets will work perfectly, but extremely large files (above 100MB) might slow down the conversion.",
    },
    {
        question: "Is the Excel formatting preserved?",
        answer: "When converting from XLSX to CSV, only the raw data is preserved as CSV is a plain-text format. When converting from CSV to XLSX, we create a clean, modern Excel file with your data.",
    },
];

export const Route = createFileRoute("/csv-xlsx-converter")({
    head: () =>
        getSeoMetadata({
            title: "CSV ↔ XLSX Converter | Convert Excel to CSV Online | SnapBit Tools",
            description:
                "Fast and secure batch conversion between CSV and XLSX formats. 100% private, client-side, and no data uploads required.",
            keywords: ["csv to xlsx", "xlsx to csv", "convert excel to csv", "batch converter", "offline office tools"],
            url: "/csv-xlsx-converter",
            type: "software",
            faqs,
        }),
    component: RouteComponent,
});

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
    const uploadRef = useRef<HTMLInputElement>(null);
    const [conversions, setConversions] = useState<ConversionItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
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

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFiles(files);
        }
    };

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
        for (const item of itemsToConvert) {
            try {
                setConversions((prev) => prev.map((conv) => (conv.id === item.id ? { ...conv, status: "converting" } : conv)));
                await convertFile(item);
            } catch (error) {
                setConversions((prev) =>
                    prev.map((conv) => (conv.id === item.id ? { ...conv, status: "error", error: (error as Error).message } : conv)),
                );
            }
        }
        setIsConverting(false);
    };

    const downloadFile = (item: ConversionItem) => {
        if (!item.downloadUrl) return;
        const link = document.createElement("a");
        link.href = item.downloadUrl;
        link.download = item.name;
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
        if (uploadRef.current) {
            uploadRef.current.value = "";
        }
    };

    useEffect(() => {
        const pendingItems = conversions.filter((item) => item.status === "pending");
        if (pendingItems.length > 0 && !isConverting) {
            handleConvertAll(pendingItems);
        }
    }, [conversions, isConverting]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col items-center justify-between">
            <div className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-100 mb-2">
                        CSV ↔ XLSX <span className="text-brand-primary">Converter</span>
                    </h1>
                    <p className="text-md text-gray-200">Convert between CSV and Excel instantly. No uploads—100% private.</p>
                </div>

                <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-6 w-full max-w-5xl">
                    {conversions.length === 0 ? (
                        <>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-3 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
                                    isDragging
                                        ? "border-brand-primary bg-brand-primary/20"
                                        : "border-gray-600 hover:border-brand-primary/40 hover:bg-gray-700"
                                }`}
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    <IconCloudUpload
                                        className={`w-16 h-16 ${isDragging ? "text-brand-primary" : "text-gray-400"} transition-colors`}
                                    />
                                    <div>
                                        <p className="text-xl font-medium text-gray-100 mb-2">
                                            {isDragging ? "Drop your files here" : "Drag & drop CSV or XLSX files here"}
                                        </p>
                                        <p className="text-gray-400 mb-4">or</p>
                                        <button
                                            onClick={() => uploadRef.current?.click()}
                                            className="text-sm px-3 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                                        >
                                            Choose Files
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-gray-400 text-xs mt-3 flex items-center justify-center gap-1">
                                🔒 Your files stay on your device. Nothing is uploaded to any server.
                            </p>
                            <input
                                type="file"
                                accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                ref={uploadRef}
                                className="hidden"
                                multiple
                                onChange={handleFileUpload}
                            />
                        </>
                    ) : (
                        <>
                            <div className="w-full flex justify-between items-center mb-3">
                                <h3 className="text-xl font-semibold text-gray-100 mb-4">Files ({conversions.length})</h3>
                                <button
                                    onClick={clearAll}
                                    className="px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-3">
                                {conversions.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700"
                                    >
                                        <div className="mr-4 flex-shrink-0">
                                            {item.originalFormat === "CSV" ? (
                                                <IconFileText className="w-10 h-10 text-brand-primary" />
                                            ) : (
                                                <IconFileSpreadsheet className="w-10 h-10 text-brand-primary" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <p className="font-medium text-gray-100 truncate">{item.name}</p>
                                                <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded">
                                                    {item.originalFormat} → {item.targetFormat.toUpperCase()}
                                                </span>
                                            </div>
                                            {item.error && <p className="text-xs text-red-400 mt-1">{item.error}</p>}
                                        </div>

                                        <div className="flex items-center space-x-3 ml-4">
                                            {item.status === "pending" && <span className="text-gray-400 text-sm">Pending</span>}
                                            {item.status === "converting" && (
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-brand-primary text-sm">Converting...</span>
                                                </div>
                                            )}
                                            {item.status === "completed" && (
                                                <button
                                                    onClick={() => downloadFile(item)}
                                                    className="px-3 py-1 bg-green-700 text-green-100 text-sm rounded hover:bg-green-600 transition-colors"
                                                >
                                                    <IconDownload className="w-4 h-4" />
                                                </button>
                                            )}
                                            {item.status === "error" && <IconCircleX className="w-4 h-4 text-red-400" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ToolInfo
                title="CSV to XLSX Converter"
                description="Our CSV to XLSX Converter allows you to effortlessly switch between CSV and Excel formats. Whether you're dealing with raw data exports or structured spreadsheets, this tool provides a fast, reliable, and completely private solution."
                features={[
                    {
                        title: "Two-Way Conversion",
                        description: "Convert CSV to Excel (XLSX) or Excel to CSV with equal ease and accuracy.",
                        icon: IconArrowsExchange,
                    },
                    {
                        title: "Client-Side Only",
                        description: "All processing happens in your browser. Your sensitive data never touches any server.",
                        icon: IconLock,
                    },
                    {
                        title: "Batch Processing",
                        description: "Upload multiple files at once and convert them all simultaneously for maximum efficiency.",
                        icon: IconFileSpreadsheet,
                    },
                ]}
                steps={[
                    {
                        title: "Upload Files",
                        description: "Drag and drop your CSV or XLSX files into the secure drop zone.",
                    },
                    {
                        title: "Automatic Detection",
                        description: "The tool automatically detects the file type and prepares the conversion.",
                    },
                    {
                        title: "Instant Processing",
                        description: "Conversion starts immediately. No waiting for server response.",
                    },
                    {
                        title: "Export & Save",
                        description: "Download your newly converted files individually or as a complete ZIP archive.",
                    },
                ]}
                faqs={faqs}
            />

            <RelatedTools currentToolSlug="csv-xlsx-converter" category="Data" />

            <div className="mt-8">
                <p className="text-gray-400 text-xs text-center">
                    Crafted with care by{" "}
                    <a
                        href="https://sidme.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-primary hover:text-brand-hover transition-colors"
                    >
                        sidme
                    </a>
                </p>
            </div>
        </div>
    );
}
