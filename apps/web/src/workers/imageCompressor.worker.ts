type ImageCompressorRequest = {
  requestId: string;
  imageData: ArrayBuffer;
  fileName: string;
  quality: number;
  maxWidth: number;
  maxHeight: number;
  originalSize: number;
  mimeType: string;
  preserveFormat: boolean;
};

type ImageCompressorSuccess = {
  requestId: string;
  blob: Blob;
  fileName: string;
  compressedSize: number;
  compressionRatio: number;
};

type ImageCompressorError = {
  requestId: string;
  error: string;
};

self.onmessage = async (event: MessageEvent<ImageCompressorRequest>) => {
  const { requestId, imageData, fileName, quality, maxWidth, maxHeight, originalSize, mimeType, preserveFormat } = event.data;

  try {
    // Create a blob from the array buffer
    const blob = new Blob([imageData]);
    const imageBitmap = await createImageBitmap(blob);

    let { width, height } = imageBitmap;

    // Calculate new dimensions if resizing is needed
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Create an OffscreenCanvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      const errorPayload: ImageCompressorError = {
        requestId,
        error: "Failed to get canvas context",
      };
      self.postMessage(errorPayload);
      return;
    }

    // Handle transparency for PNG
    if (mimeType === "image/png" && preserveFormat) {
      ctx.clearRect(0, 0, width, height);
    } else {
      // For JPEG or when converting to JPEG, use white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
    }

    // Draw the image onto the canvas
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // Determine output format and quality
    const outputMimeType = preserveFormat ? mimeType : "image/jpeg";
    const outputQuality = outputMimeType === "image/jpeg" ? quality : undefined;

    // Convert to blob
    const compressedBlob = await canvas.convertToBlob({
      type: outputMimeType,
      quality: outputQuality,
    });

    // Use compressed version only if it's smaller
    const useCompressed = compressedBlob.size < originalSize;
    const finalBlob = useCompressed ? compressedBlob : new Blob([imageData]);
    const compressionRatio = ((originalSize - finalBlob.size) / originalSize) * 100;

    const successPayload: ImageCompressorSuccess = {
      requestId,
      blob: finalBlob,
      fileName,
      compressedSize: finalBlob.size,
      compressionRatio: Math.max(0, compressionRatio),
    };

    self.postMessage(successPayload);
  } catch (error) {
    const errorPayload: ImageCompressorError = {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error during compression",
    };
    self.postMessage(errorPayload);
  }
};
