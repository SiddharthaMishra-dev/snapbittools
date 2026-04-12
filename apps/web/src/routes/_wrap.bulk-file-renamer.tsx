import {
  IconCloudUpload,
  IconDownload,
  IconCheck,
  IconX,
  IconCopy,
  IconLock,
  IconRefresh,
  IconNumbers,
  IconListNumbers,
  IconSearch as IconSearchIcon,
} from "@tabler/icons-react";
import JSZip from "jszip";
import { useCallback, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, easeInOut } from "motion/react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import { toolContent } from "@/data/toolContent";

import { getSeoMetadata } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";

const faqs = [
  {
    question: "Is it safe to rename files using this tool?",
    answer:
      "Absolutely! Nothing is actually renamed on your device. This tool shows you a preview of how your files would be renamed, and generates a batch script you can use to apply the changes. All processing happens entirely in your browser.",
  },
  {
    question: "Can I handle naming patterns like file-[1,2,4,...]?",
    answer:
      "Yes! The tool supports custom sequences like file-[1,2,4,10,...] where you specify exactly which numbers you want. It also supports sequential numbering (1,2,3,...) and padded numbers (001,002,003).",
  },
  {
    question: "What if there are duplicate filenames?",
    answer:
      "The tool automatically detects naming conflicts and prevents duplicates. It will notify you of conflicts and suggest alternative naming patterns.",
  },
  {
    question: "Which file types can I rename?",
    answer:
      "You can rename any file type—documents, images, videos, archives, or any other file extension. The tool works with all file types.",
  },
  {
    question: "How do I actually apply the renaming?",
    answer:
      "You can download a batch script (for Windows/macOS/Linux) or use the rename commands in your file manager. The tool never touches your actual files—it just shows you what would happen.",
  },
];

export const Route = createFileRoute("/_wrap/bulk-file-renamer")({
  head: () =>
    getSeoMetadata({
      title: "Bulk File Renamer | Rename Multiple Files Online | SnapBit Tools",
      description:
        "Rename multiple files at once with pattern matching and sequential numbering. Pattern like file-[1,2,3...]. 100% private, browser-based.",
      keywords: ["bulk rename files", "batch file renamer", "rename multiple files", "file naming pattern", "bulk file management"],
      url: "/bulk-file-renamer",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

interface FileRenameMapping {
  originalName: string;
  newName: string;
  isConflict: boolean;
}

function RouteComponent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [renamePattern, setRenamePattern] = useState("file-[1]");
  const [patternType, setPatternType] = useState<"sequential" | "custom" | "findreplace" | "prefix-suffix">("sequential");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [preview, setPreview] = useState<FileRenameMapping[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateRenamedFilename = useCallback(
    (
      originalName: string,
      index: number,
      currentPattern?: string,
      currentFindText?: string,
      currentReplaceText?: string,
      currentPrefix?: string,
      currentSuffix?: string,
    ): string => {
      const extension = originalName.includes(".") ? "." + originalName.split(".").pop() : "";
      const baseName = originalName.substring(0, originalName.length - extension.length);
      const pattern = currentPattern !== undefined ? currentPattern : renamePattern;

      switch (patternType) {
        case "sequential": {
          const match = pattern.match(/^(.*?)\[(\d+)\](.*)$/);
          if (match) {
            const [, pre, start, suf] = match;
            const startNum = parseInt(start) || 1;
            const paddedLength = String(start).length;
            const paddedIndex = String(startNum + index).padStart(paddedLength, "0");
            return `${pre}${paddedIndex}${suf}${extension}`;
          }
          return `${pattern}${index + 1}${extension}`;
        }

        case "custom": {
          const match = pattern.match(/^(.*?)\[(.*)?\](.*)$/);
          if (match) {
            const [, pre, customNumbers, suf] = match;
            const numbers = customNumbers?.split(",").map((n) => n.trim()) || [];
            if (index < numbers.length) {
              return `${pre}${numbers[index]}${suf}${extension}`;
            }
            return originalName;
          }
          return originalName;
        }

        case "findreplace":
          return baseName.replace(new RegExp(currentFindText ?? findText, "g"), currentReplaceText ?? replaceText) + extension;

        case "prefix-suffix":
          return `${currentPrefix ?? prefix}${baseName}${currentSuffix ?? suffix}${extension}`;

        default:
          return originalName;
      }
    },
    [renamePattern, patternType, findText, replaceText, prefix, suffix],
  );

  const updatePreview = useCallback(
    (
      fileList: File[],
      currentPattern?: string,
      currentFindText?: string,
      currentReplaceText?: string,
      currentPrefix?: string,
      currentSuffix?: string,
    ) => {
      const mappings: FileRenameMapping[] = [];
      const newNames = new Set<string>();

      fileList.forEach((file, index) => {
        const newName = generateRenamedFilename(
          file.name,
          index,
          currentPattern,
          currentFindText,
          currentReplaceText,
          currentPrefix,
          currentSuffix,
        );
        const isConflict = newNames.has(newName);

        mappings.push({
          originalName: file.name,
          newName,
          isConflict,
        });

        if (!isConflict) {
          newNames.add(newName);
        }
      });

      setPreview(mappings);
    },
    [generateRenamedFilename],
  );

  const handleFileChange = (fileList: FileList | null) => {
    if (fileList) {
      const filesArray = Array.from(fileList);
      setFiles(filesArray);
      updatePreview(filesArray);
      setCopySuccess(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handlePatternChange = useCallback(
    (newPattern: string) => {
      setRenamePattern(newPattern);
      updatePreview(files, newPattern);
    },
    [files, updatePreview],
  );

  const handlePatternTypeChange = useCallback((type: "sequential" | "custom" | "findreplace" | "prefix-suffix") => {
    setPatternType(type);
    setCopySuccess(false);
  }, []);

  const downloadFilesAsZip = async () => {
    try {
      const zip = new JSZip();
      const validMappings = preview.filter((m) => !m.isConflict);

      if (validMappings.length === 0) {
        alert("No valid files to download (some have naming conflicts)");
        return;
      }

      // Create file mappings for reference
      let renameSummary = "File Renaming Summary\n";
      renameSummary += "===================\n\n";
      validMappings.forEach((mapping) => {
        renameSummary += `${mapping.originalName} → ${mapping.newName}\n`;
      });

      zip.file("RENAME_SUMMARY.txt", renameSummary);

      // Add renamed files with their new names
      validMappings.forEach((mapping) => {
        const originalFile = files.find((f) => f.name === mapping.originalName);
        if (originalFile) {
          zip.file(mapping.newName, originalFile);
        }
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "renamed-files.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to create ZIP:", error);
      alert("Failed to create ZIP file. Please try again.");
    }
  };

  const copyPreviewToClipboard = async () => {
    const text = preview.map((m) => `${m.originalName} → ${m.newName}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      alert("Failed to copy to clipboard");
    }
  };

  const resetForm = () => {
    setFiles([]);
    setPreview([]);
    setRenamePattern("file-[1,2,3]");
    setPatternType("sequential");
    setFindText("");
    setReplaceText("");
    setPrefix("");
    setSuffix("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen py-2 px-4 flex flex-col">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        {/* <Breadcrumbs /> */}
        <div className="text-center mt-6 mb-8 max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-100 mb-2">
            Bulk File <span className="text-brand-primary">Renamer</span>
          </h1>
          <p className="text-md text-gray-300">Rename bulk files securely in your browser.</p>
        </div>

        <main className="flex-1 px-4 relative z-10">
          <section className="max-w-7xl mx-auto mb-12 rounded-2xl border border-gray-700/50 bg-gray-800/20 p-8 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeInOut }}
              className="space-y-8"
            >
              {/* File Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <IconCloudUpload className="w-5 h-5 text-brand-primary" />
                  <label className="text-lg font-semibold text-gray-100">Upload Files to Rename</label>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-brand-primary bg-brand-primary/10"
                      : "border-gray-600 hover:border-brand-primary/50 hover:bg-gray-700/30"
                  }`}
                >
                  <input ref={fileInputRef} type="file" multiple onChange={(e) => handleFileChange(e.target.files)} className="hidden" />
                  <div className="space-y-2">
                    <p className="text-gray-300 font-medium">Drag files here or click to select</p>
                    <p className="text-sm text-gray-400">
                      {files.length > 0 ? `${files.length} file(s) selected` : "Select multiple files to rename"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pattern Type Selection */}
              <div className="space-y-4">
                <label className="text-lg font-semibold text-gray-100">Rename Pattern Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: "sequential", label: "Sequential (1, 2, 3...)" },
                    { id: "custom", label: "Custom Range (1, 2, 4...)" },
                    { id: "findreplace", label: "Find & Replace" },
                    { id: "prefix-suffix", label: "Prefix & Suffix" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handlePatternTypeChange(type.id as any)}
                      className={`p-3 rounded-lg font-medium transition-colors  border border-gray-600/50 ${
                        patternType === type.id ? "bg-brand-primary text-white" : "bg-gray-700/20 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {patternType === "sequential" && (
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-gray-100">Pattern Template</label>
                  <p className="text-sm text-gray-400">Use [1] for starting number, e.g., "photo-[1]" becomes "photo-1", "photo-2", etc.</p>
                  <input
                    type="text"
                    value={renamePattern}
                    onChange={(e) => handlePatternChange(e.target.value)}
                    placeholder="e.g., file-[1] or photo_[1]"
                    className="w-full px-4 py-3  border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
                  />
                </div>
              )}

              {patternType === "custom" && (
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-gray-100">Custom Sequence Pattern</label>
                  <p className="text-sm text-gray-400">e.g., "file-[1,2,4,10,15]" renames files with your custom sequence</p>
                  <input
                    type="text"
                    value={renamePattern}
                    onChange={(e) => handlePatternChange(e.target.value)}
                    placeholder="e.g., photo-[1,2,4,5,10]"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
                  />
                </div>
              )}

              {patternType === "findreplace" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-100 mb-2">Find</label>
                      <input
                        type="text"
                        value={findText}
                        onChange={(e) => {
                          const newFindText = e.target.value;
                          setFindText(newFindText);
                          updatePreview(files, undefined, newFindText, replaceText);
                        }}
                        placeholder="Text to find"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-100 mb-2">Replace With</label>
                      <input
                        type="text"
                        value={replaceText}
                        onChange={(e) => {
                          const newReplaceText = e.target.value;
                          setReplaceText(newReplaceText);
                          updatePreview(files, undefined, findText, newReplaceText);
                        }}
                        placeholder="Replace with text"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {patternType === "prefix-suffix" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-100 mb-2">Prefix</label>
                      <input
                        type="text"
                        value={prefix}
                        onChange={(e) => {
                          const newPrefix = e.target.value;
                          setPrefix(newPrefix);
                          updatePreview(files, undefined, undefined, undefined, newPrefix, suffix);
                        }}
                        placeholder="Add to beginning"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-100 mb-2">Suffix</label>
                      <input
                        type="text"
                        value={suffix}
                        onChange={(e) => {
                          const newSuffix = e.target.value;
                          setSuffix(newSuffix);
                          updatePreview(files, undefined, undefined, undefined, prefix, newSuffix);
                        }}
                        placeholder="Add to end"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-brand-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              {preview.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconCheck className="w-5 h-5 text-brand-primary" />
                      <label className="text-lg font-semibold text-gray-100">Preview</label>
                    </div>
                    <span className="text-sm text-gray-400">{preview.length} file(s)</span>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg border border-gray-600 max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-800">
                        <tr className="border-b border-gray-600">
                          <th className="px-4 py-3 text-left text-gray-300 font-medium">Original Name</th>
                          <th className="px-4 py-3 text-left text-gray-300 font-medium">New Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {preview.map((mapping, index) => (
                          <tr key={index} className="hover:bg-gray-700/30">
                            <td className="px-4 py-3 text-gray-300">{mapping.originalName}</td>
                            <td className="px-4 py-3">
                              {mapping.isConflict ? (
                                <span className="flex items-center gap-2 text-red-400">
                                  <IconX className="w-4 h-4" />
                                  {mapping.newName} (conflict)
                                </span>
                              ) : (
                                <span className="text-brand-primary font-medium flex items-center gap-2">
                                  <IconCheck className="w-4 h-4" />
                                  {mapping.newName}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Conflict Warning */}
                  {preview.some((m) => m.isConflict) && (
                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                      <p className="text-yellow-500 text-sm font-medium">
                        ⚠️ Warning: Some files have naming conflicts. They are marked above and won't be included in the ZIP download.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {preview.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={copyPreviewToClipboard}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-hover transition-colors active:scale-[0.97]"
                  >
                    <IconCopy className="w-4 h-4" />
                    {copySuccess ? "Copied!" : "Copy Preview"}
                  </button>
                  <button
                    onClick={downloadFilesAsZip}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors active:scale-[0.97]"
                  >
                    <IconDownload className="w-4 h-4" />
                    Download ZIP
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-100 rounded-lg font-medium hover:bg-gray-600 transition-colors active:scale-[0.97]"
                  >
                    <IconRefresh className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              )}

              <div className="bg-gray-700/20 border border-gray-600/50 rounded-lg p-4 flex items-start gap-3">
                <IconLock className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium">100% Private & Secure</p>
                  <p className="mt-1">
                    All file renaming happens locally in your browser. Your files never leave your device, and the tool never uploads any
                    data to servers.
                  </p>
                </div>
              </div>
            </motion.div>
          </section>

          <ToolContentDisplay
            title={toolContent["bulk-file-renamer"].title}
            intro={toolContent["bulk-file-renamer"].intro}
            benefits={toolContent["bulk-file-renamer"].benefits}
            useCases={toolContent["bulk-file-renamer"].useCases}
          />

          <ToolInfo
            title="Bulk File Renaming Made Simple"
            description="Professional file renaming capabilities without complex software"
            features={[
              {
                title: "Sequential Numbering",
                description: "Automatically number files in sequence (file-1, file-2, file-3...)",
                icon: IconNumbers,
              },
              {
                title: "Custom Ranges",
                description: "Use custom number sequences like [1,2,4,10,15,...]",
                icon: IconListNumbers,
              },
              {
                title: "Find & Replace",
                description: "Replace text patterns throughout filenames",
                icon: IconSearchIcon,
              },
            ]}
            steps={[
              {
                title: "Upload Files",
                description: "Drag and drop files or click to select from your computer",
              },
              {
                title: "Choose Pattern",
                description: "Select a naming pattern type (sequential, custom, find-replace, prefix-suffix)",
              },
              {
                title: "Preview Changes",
                description: "Review all renamed filenames before applying the changes",
              },
              {
                title: "Download ZIP",
                description: "Download your files in a ZIP archive with their new names applied",
              },
            ]}
            privacyInfo="This tool processes all files entirely in your browser. No files are uploaded to any server, and your data never leaves your device."
            faqs={faqs}
          />

          <RelatedTools currentToolSlug="bulk-file-renamer" />
          <footer className="mt-8 text-center">
            <p className="text-gray-400 text-xs">
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
          </footer>
        </main>
      </div>
    </div>
  );
}
