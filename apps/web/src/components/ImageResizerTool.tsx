import { IconCircleX, IconCloudUpload, IconDownload, IconRefresh } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

export function ImageResizerTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetResult = () => {
    if (resizedUrl) {
      URL.revokeObjectURL(resizedUrl);
    }
    setResizedBlob(null);
    setResizedUrl(null);
  };

  const loadImageMeta = (file: File) => {
    setError(null);
    resetResult();

    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    const nextSourceUrl = URL.createObjectURL(file);
    setSourceFile(file);
    setSourceUrl(nextSourceUrl);

    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      setOriginalWidth(width);
      setOriginalHeight(height);
      setTargetWidth(width);
      setTargetHeight(height);
    };
    img.onerror = () => {
      setError("Failed to read image. Please try another file.");
    };
    img.src = nextSourceUrl;
  };

  const processFiles = (files: FileList | File[]) => {
    const first = Array.from(files)[0];
    if (!first || !first.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    loadImageMeta(first);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleWidthChange = (value: number) => {
    if (value <= 0 || !originalWidth || !originalHeight) return;

    resetResult();
    const ratio = originalHeight / originalWidth;
    const computedHeight = Math.max(1, Math.round(value * ratio));

    setTargetWidth(value);
    setTargetHeight(computedHeight);
  };

  const resizeImage = async () => {
    if (!sourceUrl || !sourceFile || !targetWidth || !targetHeight) {
      return;
    }

    setIsResizing(true);
    setError(null);
    resetResult();

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to load image for resizing"));
        image.src = sourceUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas context is not available");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const outputBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create resized image"));
              return;
            }
            resolve(blob);
          },
          sourceFile.type || "image/png",
          0.95,
        );
      });

      const outputUrl = URL.createObjectURL(outputBlob);
      setResizedBlob(outputBlob);
      setResizedUrl(outputUrl);
    } catch (err) {
      setError((err as Error).message || "Resize failed");
    } finally {
      setIsResizing(false);
    }
  };

  const downloadResized = () => {
    if (!resizedUrl || !sourceFile) return;

    const link = document.createElement("a");
    const ext = sourceFile.name.includes(".") ? sourceFile.name.split(".").pop() : "png";
    const basename = sourceFile.name.replace(/\.[^/.]+$/, "");

    link.href = resizedUrl;
    link.download = `${basename}-${targetWidth}x${targetHeight}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);

    setSourceFile(null);
    setSourceUrl(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setTargetWidth(0);
    setTargetHeight(0);
    setResizedBlob(null);
    setResizedUrl(null);
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    };
  }, [sourceUrl, resizedUrl]);

  const scalePercent =
    originalWidth > 0
      ? Math.max(1, Math.min(1000, Math.round((targetWidth / originalWidth) * 100)))
      : 100;

  return (
    <div className="w-full max-w-7xl flex-1 flex flex-col items-center justify-center mx-auto">
      <div className="rounded-xl shadow-lg px-0 py-4 sm:p-8 w-full max-w-5xl">
        {!sourceFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
              isDragging ? "border-brand-primary bg-brand-primary/20" : "border-gray-600 hover:border-brand-primary/40"
            }`}
          >
            <IconCloudUpload className="h-14 w-14 mx-auto text-brand-primary mb-4" />
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Upload image to resize</h2>
            <p className="text-gray-300 mb-5">Drag and drop your image here, or click below to choose a file.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium transition-all duration-200"
            >
              Select Image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files);
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-700 bg-gray-800/30 p-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{sourceFile.name}</h3>
                <p className="text-sm text-gray-300">
                  Original size: {originalWidth} x {originalHeight}px
                </p>
              </div>
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md transition-colors"
              >
                <IconCircleX className="w-4 h-4" />
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-4">
                <img src={sourceUrl || ""} alt="Original preview" className="w-full h-auto max-h-96 object-contain rounded-lg" />
              </div>

              <div className="rounded-lg border border-gray-700 bg-gray-800/30 p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Width (px)</label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={targetWidth || ""}
                    onChange={(e) => handleWidthChange(Number(e.target.value || 0))}
                    className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Scale (%)</label>
                  <input
                    type="range"
                    min={1}
                    max={300}
                    value={Math.min(300, scalePercent)}
                    onChange={(e) => {
                      const pct = Number(e.target.value);
                      const nextWidth = Math.max(1, Math.round((originalWidth * pct) / 100));
                      handleWidthChange(nextWidth);
                    }}
                    className="w-full slider"
                  />
                  <p className="mt-2 text-sm text-gray-300">{Math.min(300, scalePercent)}%</p>
                </div>

                <div className="rounded-md bg-black/20 border border-gray-700 p-3 text-sm text-gray-200 space-y-1">
                  <p>
                    Target size: {targetWidth} x {targetHeight}px
                  </p>
                  <p>Aspect ratio is locked automatically.</p>
                </div>

                <button
                  onClick={resizeImage}
                  disabled={isResizing || !targetWidth || !targetHeight}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-primary hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                >
                  <IconRefresh className={`w-5 h-5 ${isResizing ? "animate-spin" : ""}`} />
                  {isResizing ? "Resizing..." : "Resize Image"}
                </button>
              </div>
            </div>

            {error ? <p className="text-red-300 text-sm">{error}</p> : null}

            {resizedUrl ? (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-green-200 font-semibold">Resized image ready</h4>
                  <button
                    onClick={downloadResized}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-500/20 hover:bg-green-500/30 text-green-100 transition-colors"
                  >
                    <IconDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>

                <img src={resizedUrl} alt="Resized preview" className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-700" />

                <p className="text-sm text-green-100">
                  Output dimensions: {targetWidth} x {targetHeight}px
                  {resizedBlob ? ` | Approx. ${Math.round(resizedBlob.size / 1024)} KB` : ""}
                </p>
              </div>
            ) : null}
          </div>
        )}
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
