import { compressImageBuffer } from "@/lib/imageCompress";

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
  outputMimeType: string;
};

type ImageCompressorError = {
  requestId: string;
  error: string;
};

self.onmessage = async (event: MessageEvent<ImageCompressorRequest>) => {
  const {
    requestId,
    imageData,
    fileName,
    quality,
    maxWidth,
    maxHeight,
    originalSize,
    mimeType,
    preserveFormat,
  } = event.data;

  try {
    const { blob, mimeType: outputMimeType } = await compressImageBuffer({
      imageData,
      mimeType,
      quality,
      maxWidth,
      maxHeight,
      originalSize,
      preserveFormat,
    });

    const compressionRatio = ((originalSize - blob.size) / originalSize) * 100;

    const successPayload: ImageCompressorSuccess = {
      requestId,
      blob,
      fileName,
      compressedSize: blob.size,
      compressionRatio: Math.max(0, compressionRatio),
      outputMimeType,
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
