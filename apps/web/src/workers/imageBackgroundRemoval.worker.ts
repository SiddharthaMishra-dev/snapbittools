import { removeBackground, type Config } from "@imgly/background-removal";

export type BackgroundRemovalRequest = {
  requestId: string;
  imageData: ArrayBuffer;
  mimeType: string;
  fileName: string;
};

export type BackgroundRemovalProgress = {
  type: "progress";
  requestId: string;
  key: string;
  current: number;
  total: number;
  percent: number;
};

export type BackgroundRemovalSuccess = {
  type: "success";
  requestId: string;
  blob: Blob;
  fileName: string;
  outputSize: number;
};

export type BackgroundRemovalError = {
  type: "error";
  requestId: string;
  error: string;
};

self.onmessage = async (event: MessageEvent<BackgroundRemovalRequest>) => {
  const { requestId, imageData, mimeType, fileName } = event.data;

  try {
    const inputBlob = new Blob([imageData], { type: mimeType || "image/png" });

    const config: Config = {
      debug: false,
      model: "isnet_fp16",
      output: {
        format: "image/png",
        quality: 0.9,
        type: "foreground",
      },
      progress: (key, current, total) => {
        const safeTotal = total > 0 ? total : 1;
        const percent = Math.min(100, Math.round((current / safeTotal) * 100));
        const message: BackgroundRemovalProgress = {
          type: "progress",
          requestId,
          key,
          current,
          total,
          percent,
        };
        self.postMessage(message);
      },
    };

    const resultBlob = await removeBackground(inputBlob, config);

    const success: BackgroundRemovalSuccess = {
      type: "success",
      requestId,
      blob: resultBlob,
      fileName,
      outputSize: resultBlob.size,
    };
    self.postMessage(success);
  } catch (error) {
    const message: BackgroundRemovalError = {
      type: "error",
      requestId,
      error: error instanceof Error ? error.message : "Background removal failed",
    };
    self.postMessage(message);
  }
};
