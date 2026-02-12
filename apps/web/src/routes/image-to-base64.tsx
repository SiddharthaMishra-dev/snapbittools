import {
  IconBolt,
  IconCheck,
  IconCloudUpload,
  IconCopy,
  IconFileCode,
  IconLock,
} from "@tabler/icons-react";
import { useCallback, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, easeInOut } from "motion/react";
import ToolInfo from "@/components/ToolInfo";
import RelatedTools from "@/components/RelatedTools";

import { getSeoMetadata } from "@/lib/seo";

const faqs = [
  {
    question: "Is it safe to convert my images to Base64 here?",
    answer:
      "Yes, absolutely! The conversion happens entirely in your browser using JavaScript. Your images are never uploaded to our servers, ensuring 100% privacy and security.",
  },
  {
    question: "What is a Base64 string used for?",
    answer:
      "Base64 strings (Data URIs) are used to embed images directly into HTML, CSS, or JSON. This can reduce the number of HTTP requests a browser needs to make, which is great for small icons or critical UI elements.",
  },
  {
    question: "Are there any size limits for the images?",
    answer:
      "Technically, no. However, since the string is stored in memory, extremely large images might slow down your browser. We recommend using this tool for images under 1MB for the best experience.",
  },
  {
    question: "Which image formats are supported?",
    answer: "The tool supports all common web formats including PNG, JPG, WebP, SVG, and GIF.",
  },
];

export const Route = createFileRoute("/image-to-base64")({
  head: () =>
    getSeoMetadata({
      title: "Image to Base64 Converter | SnapBit Tools",
      description:
        "Convert any image file to a Base64 encoded string instantly and securely in your browser. No uploads, 100% private.",
      keywords: ["image to base64", "base64 encoder", "data uri converter", "privacy-first tools"],
      url: "/image-to-base64",
      type: "software",
      faqs,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const imageRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [base64Result, setBase64Result] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setBase64Result(result);
      setCopySuccess(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
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
    if (files[0]) {
      processFile(files[0]);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(base64Result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        duration: 0.6,
        ease: easeInOut,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeInOut,
      },
    },
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: easeInOut,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-slate-900 pt-24 pb-8 px-4 flex flex-col items-center justify-between">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Image to <span className="text-blue-400">Base64</span> Converter
          </h1>
          <p className="text-md text-gray-200">
            Convert images to Base64 instantly. 100% private—no uploads, ever.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gray-800 rounded-xl shadow-lg p-8 mb-6"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
              isDragging
                ? "border-blue-500 bg-blue-900/20"
                : "border-gray-600 hover:border-blue-400 hover:bg-gray-700"
            }`}
          >
            <div className="flex flex-col items-center space-y-4">
              <IconCloudUpload
                className={`w-16 h-16 ${isDragging ? "text-blue-500" : "text-gray-400"} transition-colors`}
              />
              <div>
                <p className="text-xl font-medium text-gray-100 mb-2">
                  {isDragging ? "Drop your image here" : "Drag & drop your image here"}
                </p>
                <p className="text-gray-400 mb-4">or</p>
                <button
                  onClick={() => imageRef.current?.click()}
                  className="text-sm px-3 py-2 bg-blue-700 text-blue-100 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Select Image
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
            ref={imageRef}
            className="hidden"
            onChange={handleFileChange}
          />
        </motion.div>

        {base64Result && (
          <motion.div
            variants={resultVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-gray-800 w-full max-w-4xl rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-100">Base64 Data URI</h3>
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  copySuccess
                    ? "bg-green-800 text-green-200"
                    : "bg-blue-700 text-blue-100 hover:bg-blue-600 shadow-md hover:shadow-lg"
                }`}
              >
                {copySuccess ? (
                  <span className="flex items-center space-x-2">
                    <IconCheck className="h-4 w-4" />
                    <span>Copied!</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <IconCopy className="h-4 w-4" />
                    <span>Copy</span>
                  </span>
                )}
              </button>
            </div>
            <textarea
              value={base64Result}
              readOnly
              rows={8}
              className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Base64 data will appear here..."
            />
            <p className="text-sm text-gray-400 mt-2">
              Data size: {new Blob([base64Result]).size.toLocaleString()} bytes
            </p>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="text-center mt-2"
        >
          <p className="text-gray-400 text-xs">
            <sup>*</sup>All major formats supported: JPG, PNG, GIF, SVG, WebP & more.
          </p>
        </motion.div>
      </motion.div>

      <ToolInfo
        title="Image to Base64"
        description="Convert any image file into a Base64 encoded string effortlessly. Base64 encoding is widely used for embedding images directly into HTML, CSS, or JSON, reducing the number of HTTP requests and improving load times for small assets."
        features={[
          {
            title: "100% Private",
            description:
              "All conversions happen locally in your browser. Your images are never uploaded to any server.",
            icon: IconLock,
          },
          {
            title: "Instant Results",
            description:
              "Get your Base64 string immediately after dropping your image. No waiting for server processing.",
            icon: IconBolt,
          },
          {
            title: "Format Agnostic",
            description:
              "Supports JPG, PNG, WebP, SVG, and GIF. Generates standard Data URIs compatible with all modern browsers.",
            icon: IconFileCode,
          },
        ]}
        steps={[
          {
            title: "Select Image",
            description:
              "Drag and drop your image or click the select button to choose a file from your device.",
          },
          {
            title: "Auto-Conversion",
            description:
              "The tool automatically processes your image and generates the Base64 Data URI.",
          },
          {
            title: "Copy Result",
            description:
              "Click the copy button to save the Base64 string to your clipboard for use in your code.",
          },
          {
            title: "Use in Code",
            description: "Paste the string into your HTML src, CSS url(), or JSON data as needed.",
          },
        ]}
        faqs={faqs}
      />

      <RelatedTools
        currentToolSlug="image-to-base64"
        category="Images"
      />

      <div className="mt-8 text-center">
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
