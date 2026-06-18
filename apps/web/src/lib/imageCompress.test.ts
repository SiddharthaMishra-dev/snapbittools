import { describe, expect, it } from "vitest";

import { mimeTypeToExtension } from "./imageCompress";

describe("mimeTypeToExtension", () => {
  it("maps common image mime types", () => {
    expect(mimeTypeToExtension("image/png")).toBe("png");
    expect(mimeTypeToExtension("image/webp")).toBe("webp");
    expect(mimeTypeToExtension("image/jpeg")).toBe("jpg");
  });
});
