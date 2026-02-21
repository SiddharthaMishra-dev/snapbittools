type ImageConverterRequest = {
  requestId: string;
  imageData: ArrayBuffer;
  fileName: string;
  targetFormat: string;
  targetMime: string;
};

type ImageConverterSuccess = {
  requestId: string;
  blob: Blob;
  fileName: string;
};

type ImageConverterError = {
  requestId: string;
  error: string;
};

self.onmessage = async (event: MessageEvent<ImageConverterRequest>) => {
  const { requestId, imageData, fileName, targetMime } = event.data;

  try {
    // Create a blob from the array buffer
    const blob = new Blob([imageData]);
    const imageBitmap = await createImageBitmap(blob);

    // Create an OffscreenCanvas
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      const errorPayload: ImageConverterError = {
        requestId,
        error: "Failed to get canvas context",
      };
      self.postMessage(errorPayload);
      return;
    }

    // Draw the image onto the canvas
    ctx.drawImage(imageBitmap, 0, 0);

    // Convert to target format
    const convertedBlob = await canvas.convertToBlob({
      type: targetMime,
      quality: 0.9,
    });

    const successPayload: ImageConverterSuccess = {
      requestId,
      blob: convertedBlob,
      fileName,
    };

    self.postMessage(successPayload);
  } catch (error) {
    const errorPayload: ImageConverterError = {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error during conversion",
    };
    self.postMessage(errorPayload);
  }
};
