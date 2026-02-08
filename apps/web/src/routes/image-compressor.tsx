import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import {
  IconArrowsMinimize,
  IconBolt,
  IconCircleX,
  IconCloudUpload,
  IconDownload,
  IconLock,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";

import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "How does the image compressor work?",
    answer:
      "The compressor uses advanced browser-based algorithms to optimize your images. It reduces the file size by adjusting the quality level and dimensions while maintaining visual clarity, all right in your browser.",
  },
  {
    question: "Is my privacy protected when compressing images?",
    answer:
      "Yes! Unlike other online tools, our compressor is 100% client-side. Your images are never uploaded to a server—they remain on your device throughout the entire process.",
  },
  {
    question: "Can I compress multiple images at once?",
    answer:
      "Absolutely. You can drop multiple images into the tool, adjust the settings globally, and download the entire batch as a ZIP file.",
  },
  {
    question: "What is the best format for compression?",
    answer:
      "JPEG typically offers the best compression for photographs, while PNG is better for images with text or transparency. Our tool can also convert images to JPEG to maximize space savings.",
  },
];

export const Route = createFileRoute("/image-compressor")({
  head: () =>
    getSeoMetadata({
      title: "Compress Images Online - Free Online Tool",
      description:
        "Compress JPG, PNG, WebP and AVIF images for free. Shrink image file sizes by up to 80% without losing quality. 100% private, client-side, and free.",
      keywords: [
        "compress png",
        "compress jpeg",
        "compress webp",
        "compress avif",
        "image compressor",
        "reduce image size",
        "online image optimizer",
      ],
      url: "/image-compressor",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

interface CompressedFile {
  id: string;
  name: string;
  originalSize: number;
  compressedSize?: number;
  originalFile: File;
  compressedBlob?: Blob;
  status: "ready" | "compressing" | "completed" | "error";
  downloadUrl?: string;
  compressionRatio?: number;
  error?: string;
  ext: string;
  mimeType: string;
  preview: string;
}

function RouteComponent() {
  const [files, setFiles] = useState<CompressedFile[]>([]);
  const [quality, setQuality] = useState(0.3);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [preserveFormat, setPreserveFormat] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
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
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      alert("Please select valid image files");
      return;
    }

    const filesObj: CompressedFile[] = imageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      originalSize: file.size,
      originalFile: file,
      status: "ready",
      ext: file.name.split(".").pop()?.toLowerCase() || "jpg",
      mimeType: file.type,
      preview: URL.createObjectURL(file),
    }));

    setFiles(filesObj);
  };

  const compressImage = async (fileObj: CompressedFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          let { width, height } = img;

          // Calculate new dimensions if resizing is needed
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          if (fileObj.mimeType === "image/png" && preserveFormat) {
            // For PNG, preserve transparency
            ctx.clearRect(0, 0, width, height);
          } else {
            // For JPEG or when converting to JPEG, use white background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Determine output format and quality
          const outputMimeType = preserveFormat ? fileObj.mimeType : "image/jpeg";
          const outputQuality = outputMimeType === "image/jpeg" ? quality : undefined;

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const useCompressed = blob.size < fileObj.originalSize;
                const finalBlob = useCompressed ? blob : fileObj.originalFile;
                const compressionRatio =
                  ((fileObj.originalSize - finalBlob.size) / fileObj.originalSize) * 100;

                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileObj.id
                      ? {
                          ...f,
                          status: "completed",
                          compressedSize: finalBlob.size,
                          compressedBlob: finalBlob,
                          downloadUrl: URL.createObjectURL(finalBlob),
                          compressionRatio: Math.max(0, compressionRatio),
                        }
                      : f,
                  ),
                );
                resolve();
              } else {
                reject(new Error("Compression failed"));
              }
            },
            outputMimeType,
            outputQuality,
          );
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
        URL.revokeObjectURL(img.src);
      };

      img.src = URL.createObjectURL(fileObj.originalFile);
    });
  };

  const compressAll = async (filesToCompress: CompressedFile[]) => {
    if (filesToCompress.length === 0) return;

    setIsCompressing(true);

    for (const fileObj of filesToCompress) {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileObj.id ? { ...f, status: "compressing" } : f)),
        );
        await compressImage(fileObj);
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, status: "error", error: (error as Error).message } : f,
          ),
        );
      }
    }

    setIsCompressing(false);
  };

  const downloadFile = (fileObj: CompressedFile) => {
    if (!fileObj.downloadUrl) return;

    const link = document.createElement("a");
    link.href = fileObj.downloadUrl;

    // Preserve original extension or use jpg if converting
    const originalName = fileObj.name.replace(/\.[^/.]+$/, "");
    const extension = preserveFormat ? fileObj.ext : "jpg";
    link.download = `compressed_${originalName}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    const completedFiles = files.filter((f) => f.status === "completed" && f.compressedBlob);

    if (completedFiles.length === 0) {
      alert("No compressed files available for download.");
      return;
    }

    try {
      const zip = new JSZip();
      for (const item of completedFiles) {
        if (item.compressedBlob) {
          const filName = `${item.name.split(".")[0]}.${preserveFormat ? item.ext : "jpg"}`;
          zip.file(filName, item.compressedBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `compressed_images_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("Failed to create ZIP file");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const clearAll = () => {
    files.forEach((file) => {
      if (file.downloadUrl) {
        URL.revokeObjectURL(file.downloadUrl);
      }
    });
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const readyFiles = files.filter((f) => f.status === "ready");
    if (readyFiles.length > 0 && !isCompressing) {
      compressAll(readyFiles);
    }
  }, [files, isCompressing]);

  useEffect(() => {
    if (files.length > 0) {
      setFiles((prev) => prev.map((f) => ({ ...f, status: "ready" })));
    }
  }, [quality, maxWidth, maxHeight, preserveFormat]);

  const completedCount = files.filter((f) => f.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col items-center justify-between">
      <div className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Compress <span className="text-brand-primary">Images</span>
          </h1>
          <p className="text-lg text-gray-200">
            Compress JPG, PNG, WebP and AVIF images for free. Reduce file size up to 80% while
            preserving quality. 100% client-side—your files never leave.
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-6 w-full max-w-5xl">
          {files.length === 0 ? (
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
                      {isDragging ? "Drop your images here" : "Drag & drop your images here"}
                    </p>
                    <p className="text-gray-400 mb-4">or</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm px-3 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                      Choose Files
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-400 text-xs mt-3 flex items-center justify-center gap-1">
                <IconLock className="w-4 h-4" /> Your files stay on your device. Nothing is uploaded
                to any server.
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          ) : (
            <>
              <div className="">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Compression Settings</h3>
                <div className="mb-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preserveFormat}
                      onChange={(e) => setPreserveFormat(e.target.checked)}
                      className="w-4 h-4 text-brand-primary bg-gray-700 border-gray-600 rounded focus:ring-brand-primary"
                    />
                    <span className="text-sm font-medium text-gray-200">
                      Preserve original format
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    {preserveFormat
                      ? "Keep original file formats (PNG, JPEG, etc.)"
                      : "Convert all images to JPEG for better compression"}
                  </p>
                </div>

                {(!preserveFormat || files.some((f) => f.mimeType === "image/jpeg")) && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-200">
                        Quality {!preserveFormat ? "" : "(JPEG only)"}
                      </label>
                      <span className="text-sm text-brand-primary font-medium">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Lower quality</span>
                      <span>Higher quality</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Max Width (px)
                    </label>
                    <input
                      type="number"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(parseInt(e.target.value) || 1920)}
                      min="100"
                      max="4000"
                      className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Max Height (px)
                    </label>
                    <input
                      type="number"
                      value={maxHeight}
                      onChange={(e) => setMaxHeight(parseInt(e.target.value) || 1080)}
                      min="100"
                      max="4000"
                      className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Files ({files.length})</h3>
                {files.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearAll}
                      className="px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700"
                  >
                    <div className="mr-4 flex-shrink-0">
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-16 h-16 object-contain rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-100 truncate">{file.name}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400">
                          {formatFileSize(file.originalSize)} &rarr;
                          {file.compressedSize && (
                            <>
                              <span className="text-xs bg-green-900 text-green-300">
                                {formatFileSize(file.compressedSize)}
                              </span>
                            </>
                          )}
                        </span>

                        {file.error && <span className="text-xs text-red-400">{file.error}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-4">
                      {file.status === "ready" && (
                        <span className="text-gray-400 text-sm">Ready</span>
                      )}
                      {file.status === "compressing" && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-brand-primary text-sm">Compressing...</span>
                        </div>
                      )}
                      {file.status === "completed" && (
                        <div className="flex items-center space-x-2">
                          {/* <IconCheck className="w-4 h-4 text-green-400" /> */}
                          <button
                            onClick={() => downloadFile(file)}
                            className="px-3 py-1 bg-green-700 text-green-100 text-sm rounded hover:bg-green-600 transition-colors"
                          >
                            <IconDownload className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {file.status === "error" && (
                        <div className="flex items-center space-x-2">
                          <IconCircleX className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">Failed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {completedCount > 0 && (
                <div className="mt-6 w-full flex justify-end">
                  <button
                    onClick={downloadAllAsZip}
                    disabled={isDownloadingZip}
                    className="px-4 py-2 bg-green-700 text-green-100 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex items-center space-x-2"
                  >
                    {isDownloadingZip ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-300 border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating ZIP...</span>
                      </>
                    ) : (
                      <>
                        <IconDownload className="w-4 h-4" />
                        <span>Download ZIP ({completedCount})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <ToolInfo
          title="Image Compressor"
          description="Our Image Compressor helps you significantly reduce the file size of your images without sacrificing visible quality. By utilizing advanced browser-based compression algorithms, you can optimize your PNG, JPEG, and WebP files for faster web loading and reduced storage usage."
          features={[
            {
              title: "Quality Control",
              description:
                "Fine-tune the compression level to find the perfect balance between file size and image clarity.",
              icon: IconBolt,
            },
            {
              title: "Privacy Guaranteed",
              description:
                "Processing happens entirely in your browser. No images are ever uploaded to a server.",
              icon: IconLock,
            },
            {
              title: "Bulk Compression",
              description:
                "Compress dozens of images simultaneously and download them all at once in a ZIP file.",
              icon: IconArrowsMinimize,
            },
          ]}
          steps={[
            {
              title: "Add Images",
              description:
                "Drop your images into the compression zone or use the file picker to select them.",
            },
            {
              title: "Adjust Settings",
              description:
                "Set your desired quality and maximum dimensions to optimize your images further.",
            },
            {
              title: "Review Savings",
              description:
                "Instantly see how much space you have saved for each image after compression.",
            },
            {
              title: "Download All",
              description:
                "Download individual optimized images or grab the entire batch as a ZIP archive.",
            },
          ]}
          faqs={faqs}
        />
      </div>

      <RelatedTools
        currentToolSlug="image-compressor"
        category="Images"
      />

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

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--brand-primary);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
