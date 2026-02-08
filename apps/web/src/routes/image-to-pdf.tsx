import { createFileRoute } from "@tanstack/react-router";
import {
  IconArrowsSort,
  IconCloudUpload,
  IconFileTypePdf,
  IconLock,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { jsPDF } from "jspdf";
import { Reorder } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ToolInfo from "../components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  name: string;
}

import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "Can I choose the order of images in the PDF?",
    answer:
      "Yes! After adding your images, you can drag and drop them to reorder exactly how you want them to appear in the final PDF document.",
  },
  {
    question: "Is there a limit to how many images I can merge?",
    answer:
      "There's no hard limit, but the performance depends on your browser's memory. For the best experience, we recommend merging up to 50 images at a time.",
  },
  {
    question: "Are my images compressed when converted to PDF?",
    answer:
      "The tool attempts to maintain high quality, but creating a PDF inherently involves some compression to keep the file size manageable. You can expect a good balance between quality and file size.",
  },
  {
    question: "Is it safe to merge sensitive documents here?",
    answer:
      "Absolutely. Since the tool runs entirely in your browser, your documents never leave your computer. This makes it safer than using online PDF services that require file uploads.",
  },
];

export const Route = createFileRoute("/image-to-pdf")({
  head: () =>
    getSeoMetadata({
      title: "Image to PDF Converter | Merge Images into PDF | SnapBit Tools",
      description:
        "Combine multiple JPG, PNG, and WebP images into a single PDF document. Rearrange pages, 100% private and works in your browser.",
      keywords: [
        "image to pdf",
        "merge images",
        "convert png to pdf",
        "jpg to pdf converter",
        "offline pdf tools",
      ],
      url: "/image-to-pdf",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

const processImageForPdf = async (
  file: ImageItem,
): Promise<{ dataUrl: string; width: number; height: number; format: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const maxDim = 2000;

      // Resize if larger than maxDim
      if (width > maxDim || height > maxDim) {
        const aspect = width / height;
        if (width > height) {
          width = maxDim;
          height = width / aspect;
        } else {
          height = maxDim;
          width = height * aspect;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      let format = "JPEG";
      let mimeType = "image/jpeg";

      // Check for specific types that support transparency
      if (file.file.type === "image/png" || file.file.type === "image/webp") {
        format = "PNG";
        mimeType = "image/png";
      }

      const dataUrl = canvas.toDataURL(mimeType, format === "JPEG" ? 0.8 : undefined);
      resolve({ dataUrl, width, height, format });
    };
    img.onerror = reject;
    img.src = file.preview;
  });
};

function RouteComponent() {
  const [files, setFiles] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
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
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const newFiles = prev.filter((file) => file.id !== id);
      const removedFile = prev.find((file) => file.id === id);
      if (removedFile) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return newFiles;
    });
  };

  const handleClearAll = () => {
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
    if (uploadRef.current) {
      uploadRef.current.value = "";
    }
  };

  const handleConvertToPdf = async () => {
    if (files.length === 0) return;

    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (i > 0) {
          doc.addPage();
        }

        const { dataUrl, width, height, format } = await processImageForPdf(file);

        // Calculate dimensions to fit the page while maintaining aspect ratio
        const ratio = Math.min(pageWidth / width, pageHeight / height);
        const finalWidth = width * ratio;
        const finalHeight = height * ratio;

        // Center the image
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        doc.addImage(dataUrl, format, x, y, finalWidth, finalHeight);
      }

      doc.save("converted-images.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col items-center justify-between">
      <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Image to <span className="text-blue-400">PDF</span> Converter
          </h1>
          <p className="text-md text-gray-200">
            Convert multiple images into a single PDF. Drag and drop to reorder pages. 100% private.
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 w-full p-6 shadow-xl">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-xl p-8 text-center transition-all duration-300 mb-6 ${
              isDragging
                ? "border-blue-500 bg-blue-900/20"
                : "border-gray-600 hover:border-blue-400 hover:bg-gray-700/50"
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <IconCloudUpload
                className={`w-16 h-16 ${isDragging ? "text-blue-500" : "text-gray-400"} transition-colors`}
              />
              <div>
                <p className="text-xl font-medium text-gray-100 mb-2">
                  {isDragging ? "Drop images here" : "Drag & drop images here"}
                </p>
                <p className="text-gray-400 mb-4 text-sm">Supports JPG, PNG, WebP, etc.</p>
                <button
                  onClick={() => uploadRef.current?.click()}
                  className="px-6 py-2.5 bg-blue-700 text-blue-100 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Select Images
                </button>
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={uploadRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Controls & List */}
          {files.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <span className="text-gray-300 font-medium">{files.length} pages ready</span>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <IconTrash className="w-4 h-4" />
                    Clear All
                  </button>
                  <button
                    onClick={handleConvertToPdf}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <IconFileTypePdf className="w-5 h-5" />
                        Convert to PDF
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/50">
                <p className="text-gray-400 text-xs mb-3 text-center uppercase tracking-wider font-semibold">
                  Drag to Reorder Pages
                </p>
                <Reorder.Group
                  axis="y"
                  values={files}
                  onReorder={setFiles}
                  className="space-y-2"
                >
                  {files.map((file) => (
                    <Reorder.Item
                      key={file.id}
                      value={file}
                      className="bg-gray-800 rounded-lg border border-gray-700 p-3 flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-6 flex flex-col items-center justify-center gap-1 text-gray-500">
                        <div className="w-1 h-1 rounded-full bg-current"></div>
                        <div className="w-1 h-1 rounded-full bg-current"></div>
                        <div className="w-1 h-1 rounded-full bg-current"></div>
                      </div>

                      <div className="w-12 h-12 bg-gray-900 rounded overflow-hidden flex-shrink-0 border border-gray-700">
                        <img
                          src={file.preview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 text-sm font-medium truncate">{file.name}</p>
                        <p className="text-gray-500 text-xs text-nowrap mt-0.5">
                          {(file.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                      >
                        <IconX className="w-5 h-5" />
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToolInfo
        title="Image to PDF Converter"
        description="Our Image to PDF Converter allows you to merge multiple images into a professional PDF document. Perfect for creating portfolios, combining receipts, or preparing documents for upload, all while maintaining complete privacy for your sensitive files."
        features={[
          {
            title: "Custom Page Order",
            description:
              "Intuitive drag-and-drop interface lets you rearrange pages to your exact specifications.",
            icon: IconArrowsSort,
          },
          {
            title: "Universal Format",
            description:
              "Generates standard PDF files compatible with all devices and operating systems.",
            icon: IconFileTypePdf,
          },
          {
            title: "Secure & Private",
            description:
              "The entire PDF generation process happens in your browser. No files are uploaded to any server.",
            icon: IconLock,
          },
        ]}
        steps={[
          {
            title: "Add Images",
            description: "Upload all the images you want to include in your PDF document.",
          },
          {
            title: "Arrange Order",
            description:
              "Drag the thumbnails to change the order in which they appear in the final PDF.",
          },
          {
            title: "Convert Process",
            description:
              'Click "Convert to PDF" to start the local generation process. It takes only seconds.',
          },
          {
            title: "Save PDF",
            description:
              "Your browser will automatically prompt you to save the newly created PDF document.",
          },
        ]}
        faqs={faqs}
      />

      <RelatedTools
        currentToolSlug="image-to-pdf"
        category="Images"
      />

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-xs">
          Crafted with care by{" "}
          <a
            href="https://sidme.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            sidme
          </a>
        </p>
      </div>
    </div>
  );
}
