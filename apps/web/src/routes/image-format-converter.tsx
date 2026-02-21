import { createFileRoute } from "@tanstack/react-router";

import {
  IconCircleX,
  IconCloudUpload,
  IconDownload,
  IconBox,
  IconLock,
  IconArrowsExchange,
} from "@tabler/icons-react";
import JSZip from "jszip";
import { useCallback, useEffect, useRef, useState } from "react";
import ToolInfo from "../components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";
import { ConversionItem } from "@/types/ImageTypes";

import { getSeoMetadata } from "@/lib/seo";
import ImageConverterWorker from "../workers/imageConverter.worker.ts?worker";

const faqs = [
  {
    question: "Which image formats are supported?",
    answer:
      "You can convert between all major web formats including PNG, JPEG, WebP, and AVIF. The tool also supports common image types like BMP and ICO.",
  },
  {
    question: "Does converting to WebP or AVIF save space?",
    answer:
      "Yes, significantly! WebP and AVIF are modern formats designed for the web. Converting standard JPEGs or PNGs to these formats can often reduce file size by 30% to 50% without quality loss.",
  },
  {
    question: "Can I convert images back to standard formats?",
    answer:
      "Absolutely. You can convert modern formats like WebP or AVIF back to widely compatible formats like JPEG or PNG for use in older applications.",
  },
  {
    question: "Is there a limit on the number of conversions?",
    answer:
      "No, you can convert as many images as you want. There are no daily limits, and you don't even need to create an account.",
  },
];

export const Route = createFileRoute("/image-format-converter")({
  head: () =>
    getSeoMetadata({
      title: "Image Format Converter | PNG, JPG, WebP, AVIF | SnapBit Tools",
      description:
        "Convert images between PNG, JPEG, WebP, and AVIF formats instantly. Supports batch processing and ZIP downloads. 100% private and client-side.",
      keywords: [
        "image converter",
        "png to webp",
        "jpg to png",
        "avif converter",
        "batch image conversion",
      ],
      url: "/image-format-converter",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

interface ExtendedConversionItem extends ConversionItem {
  blob?: Blob;
  preview?: string;
  ext?: string;
}

function RouteComponent() {
  const uploadRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("png");
  const [conversions, setConversions] = useState<ExtendedConversionItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const supportedFormats = [
    { value: "png", label: "PNG", mime: "image/png" },
    { value: "jpeg", label: "JPEG", mime: "image/jpeg" },
    { value: "webp", label: "WebP", mime: "image/webp" },
    { value: "avif", label: "AVIF", mime: "image/avif" },
  ];

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length === 0) {
      alert("Please select valid image files");
      return;
    }

    const newConversions: ExtendedConversionItem[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      originalFormat: file.type.split("/")[1]?.toUpperCase() || "Unknown",
      status: "pending",
      preview: URL.createObjectURL(file),
      ext: file.name.split(".").pop()?.toLowerCase() || "jpg",
    }));

    setConversions(newConversions);
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

  const convertImage = async (item: ExtendedConversionItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Worker not initialized"));
        return;
      }

      const targetFormat = supportedFormats.find((f) => f.value === selectedFormat);
      if (!targetFormat) {
        reject(new Error("Unsupported format"));
        return;
      }

      const handleMessage = (event: MessageEvent) => {
        const data = event.data;
        if (data.requestId === item.id) {
          if (data.error) {
            workerRef.current?.removeEventListener("message", handleMessage);
            reject(new Error(data.error));
          } else {
            const downloadUrl = URL.createObjectURL(data.blob);
            setConversions((prev) =>
              prev.map((conv) =>
                conv.id === item.id
                  ? { ...conv, status: "completed", downloadUrl, blob: data.blob }
                  : conv,
              ),
            );
            workerRef.current?.removeEventListener("message", handleMessage);
            resolve();
          }
        }
      };

      workerRef.current.addEventListener("message", handleMessage);

      // Read file as ArrayBuffer and send to worker
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer && workerRef.current) {
          workerRef.current.postMessage({
            requestId: item.id,
            imageData: reader.result,
            fileName: item.name,
            targetFormat: selectedFormat,
            targetMime: targetFormat.mime,
          });
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsArrayBuffer(item.file);
    });
  };

  const handleConvertAll = async (itemsToConvert: ExtendedConversionItem[]) => {
    if (itemsToConvert.length === 0) return;

    setIsConverting(true);
    for (const item of itemsToConvert) {
      try {
        setConversions((prev) =>
          prev.map((conv) =>
            conv.id === item.id ? { ...conv, status: "converting" as const } : conv,
          ),
        );
        await convertImage(item);
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

    setIsConverting(false);
  };

  const downloadFile = (item: ExtendedConversionItem) => {
    if (!item.downloadUrl) return;

    const link = document.createElement("a");
    link.href = item.downloadUrl;
    link.download = `${item.name.split(".")[0]}.${selectedFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    const completedFiles = conversions.filter((item) => item.status === "completed" && item.blob);

    if (completedFiles.length === 0) {
      alert("No converted files available for download");
      return;
    }

    setIsDownloadingZip(true);

    try {
      const zip = new JSZip();

      // Add each converted file to the ZIP
      for (const item of completedFiles) {
        if (item.blob) {
          const fileName = `${item.name.split(".")[0]}.${selectedFormat}`;
          zip.file(fileName, item.blob);
        }
      }

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `converted_images_${selectedFormat.toUpperCase()}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("Failed to create ZIP file");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const clearAll = () => {
    conversions.forEach((item) => {
      if (item.downloadUrl) {
        URL.revokeObjectURL(item.downloadUrl);
      }
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setConversions([]);
    if (uploadRef.current) {
      uploadRef.current.value = "";
    }
  };
  useEffect(() => {
    // Initialize worker
    workerRef.current = new ImageConverterWorker();

    return () => {
      // Cleanup worker on unmount
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    const pendingItems = conversions.filter((item) => item.status === "pending");
    if (pendingItems.length > 0 && !isConverting) {
      handleConvertAll(pendingItems);
    }
  }, [conversions, isConverting]);

  useEffect(() => {
    if (conversions.length > 0) {
      setConversions((prev) =>
        prev.map((item) => {
          if (item.downloadUrl) URL.revokeObjectURL(item.downloadUrl);
          return { ...item, status: "pending", downloadUrl: undefined, blob: undefined };
        }),
      );
    }
  }, [selectedFormat]);

  const completedCount = conversions.filter((item) => item.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col items-center justify-between">
      <div className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Image <span className="text-brand-primary">Format</span> Converter
          </h1>
          <p className="text-md text-gray-200">
            Convert images between formats instantly. Batch support. No uploads—100% private.
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-6 w-full max-w-5xl">
          {conversions.length === 0 ? (
            <>
              {/* Upload Area */}
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
                accept="image/*"
                ref={uploadRef}
                className="hidden"
                multiple
                onChange={handleFileUpload}
              />
            </>
          ) : (
            <>
              {/* Conversion Settings */}
              <div className="">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Conversion Settings</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Convert to:
                  </label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    {supportedFormats.map((format) => (
                      <option
                        key={format.value}
                        value={format.value}
                        className="bg-gray-700"
                      >
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Files Header */}
              <div className="w-full flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  Files ({conversions.length})
                </h3>
                {conversions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={clearAll}
                        className="px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Files List */}
              <div className="space-y-3">
                {conversions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-600 rounded-lg bg-gray-700"
                  >
                    {/* Preview Image */}
                    <div className="mr-4 flex-shrink-0">
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="w-16 h-16 object-contain rounded-md"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-100 truncate">{item.name}</p>
                        <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded">
                          {item.originalFormat} → {selectedFormat.toUpperCase()}
                        </span>
                      </div>
                      {item.error && <p className="text-xs text-red-400 mt-1">{item.error}</p>}
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-3 ml-4">
                      {item.status === "pending" && (
                        <span className="text-gray-400 text-sm">Pending</span>
                      )}
                      {item.status === "converting" && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-brand-primary text-sm">Converting...</span>
                        </div>
                      )}
                      {item.status === "completed" && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => downloadFile(item)}
                            className="px-3 py-1 bg-green-700 text-green-100 text-sm rounded hover:bg-green-600 transition-colors"
                          >
                            <IconDownload className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {item.status === "error" && (
                        <div className="flex items-center space-x-2">
                          <IconCircleX className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">Failed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Download ZIP Button */}
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

        {/* Help Text */}
        <div className="text-center mt-4">
          <p className="text-gray-400 text-xs">
            <sup>*</sup>All major formats supported: JPG, PNG, GIF, SVG, WebP & AVIF.
          </p>
        </div>
      </div>

      <ToolInfo
        title="Image Format Converter"
        description="Our Image Format Converter allows you to seamlessly switch between popular image formats like JPEG, PNG, WebP, and AVIF. Whether you need to optimize for web performance with WebP/AVIF or maintain maximum compatibility with JPEG, this tool provides a fast and private solution directly in your browser."
        features={[
          {
            title: "Batch Processing",
            description:
              "Convert multiple images at once and download them all as a single ZIP file, saving you valuable time.",
            icon: IconBox,
          },
          {
            title: "Client-Side Only",
            description:
              "Conversions are performed entirely on your machine. Your private images never touch our servers.",
            icon: IconLock,
          },
          {
            title: "High Compatibility",
            description:
              "Convert between all modern web formats including PNG, JPG, WebP, and the next-gen AVIF format.",
            icon: IconArrowsExchange,
          },
        ]}
        steps={[
          {
            title: "Upload Images",
            description: "Drag and drop one or more images into the upload area or click select.",
          },
          {
            title: "Select Target Format",
            description:
              "Choose your desired output format (PNG, JPEG, WebP, or AVIF) from the dropdown.",
          },
          {
            title: "Automatic Conversion",
            description:
              "The tool will instantly begin converting each image to your chosen format.",
          },
          {
            title: "Download Results",
            description:
              "Download individual converted images or grab everything at once as a ZIP archive.",
          },
        ]}
        faqs={faqs}
      />

      <RelatedTools
        currentToolSlug="image-format-converter"
        category="Images"
      />

      {/* Footer */}
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
