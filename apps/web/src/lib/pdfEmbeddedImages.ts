import {
  decodePDFRawStream,
  PDFArray,
  PDFBool,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
  PDFStream,
  PDFString,
  type PDFObject,
} from "pdf-lib";
import UPNG from "upng-js";

/** Images smaller than this on either edge are spacers, not photos. */
export const MIN_EXTRACT_EDGE = 2;

const PDF_LIB_FILTERS = new Set(["ASCIIHexDecode", "ASCII85Decode", "LZWDecode", "FlateDecode", "RunLengthDecode"]);
const IMAGE_CODECS = new Set(["DCTDecode", "JPXDecode", "CCITTFaxDecode", "JBIG2Decode"]);

const FILTER_ALIAS: Record<string, string> = {
  AHx: "ASCIIHexDecode",
  A85: "ASCII85Decode",
  LZW: "LZWDecode",
  Fl: "FlateDecode",
  RL: "RunLengthDecode",
  CCF: "CCITTFaxDecode",
  DCT: "DCTDecode",
  JPX: "JPXDecode",
};

export type EmbeddedPdfImage = {
  id: string;
  pageNumber: number;
  blob: Blob;
  width: number;
  height: number;
  ext: "jpg" | "png" | "jp2";
};

export type EmbeddedPdfImageScan = {
  images: EmbeddedPdfImage[];
  /** Image object ids we found but could not decode. PDF.js can try these. */
  undecodedRefs: Set<string>;
  /** Pages whose resources already contain an embedded image, including repeats. */
  pagesWithImages: Set<number>;
};

type ColorModel =
  | { kind: "gray" }
  | { kind: "rgb" }
  | { kind: "cmyk" }
  | { kind: "indexed"; base: "gray" | "rgb" | "cmyk"; table: Uint8Array; hival: number };

type ScanState = {
  images: EmbeddedPdfImage[];
  undecodedRefs: Set<string>;
  pagesWithImages: Set<number>;
  seen: Set<string>;
  depth: number;
};

function refKey(ref: PDFRef): string {
  return ref.generationNumber ? `${ref.objectNumber}R${ref.generationNumber}` : `${ref.objectNumber}R`;
}

function dictName(dict: PDFDict, key: string): string | undefined {
  try {
    return dict.lookupMaybe(PDFName.of(key), PDFName)?.decodeText();
  } catch {
    return undefined;
  }
}

function dictNumber(dict: PDFDict, key: string): number | undefined {
  try {
    const value = dict.lookupMaybe(PDFName.of(key), PDFNumber);
    return value ? value.asNumber() : undefined;
  } catch {
    return undefined;
  }
}

function normalizeFilter(name: string): string {
  return FILTER_ALIAS[name] ?? name;
}

function filterNames(dict: PDFDict): string[] {
  const filter = dict.lookup(PDFName.of("Filter"));
  if (!filter) return [];
  if (filter instanceof PDFName) return [normalizeFilter(filter.decodeText())];
  if (filter instanceof PDFArray) {
    const names: string[] = [];
    for (let i = 0; i < filter.size(); i++) {
      const entry = filter.lookup(i);
      if (entry instanceof PDFName) names.push(normalizeFilter(entry.decodeText()));
    }
    return names;
  }
  return [];
}

function decodeParmsList(dict: PDFDict): Array<PDFDict | undefined> {
  const parms = dict.lookup(PDFName.of("DecodeParms")) ?? dict.lookup(PDFName.of("DP"));
  if (!parms) return [];
  if (parms instanceof PDFDict) return [parms];
  if (parms instanceof PDFArray) {
    const list: Array<PDFDict | undefined> = [];
    for (let i = 0; i < parms.size(); i++) {
      const entry = parms.lookup(i);
      list.push(entry instanceof PDFDict ? entry : undefined);
    }
    return list;
  }
  return [];
}

function decodeWithPdfLib(dict: PDFDict, contents: Uint8Array, filters: string[], parms: Array<PDFDict | undefined>): Uint8Array {
  const tmp = PDFDict.withContext(dict.context);
  if (filters.length === 1) {
    tmp.set(PDFName.of("Filter"), PDFName.of(filters[0]));
    if (parms[0]) tmp.set(PDFName.of("DecodeParms"), parms[0]);
  } else if (filters.length > 1) {
    const filterArray = PDFArray.withContext(dict.context);
    filters.forEach((filter) => filterArray.push(PDFName.of(filter)));
    tmp.set(PDFName.of("Filter"), filterArray);
    const prefixParms = parms.slice(0, filters.length);
    if (prefixParms.length === filters.length && prefixParms.every((parm): parm is PDFDict => parm instanceof PDFDict)) {
      const parmArray = PDFArray.withContext(dict.context);
      prefixParms.forEach((parm) => parmArray.push(parm));
      tmp.set(PDFName.of("DecodeParms"), parmArray);
    }
  }
  return decodePDFRawStream(PDFRawStream.of(tmp, contents)).decode();
}

function streamContents(stream: PDFStream): Uint8Array | null {
  if (stream instanceof PDFRawStream) return stream.contents;
  try {
    return stream.getContents();
  } catch {
    return null;
  }
}

function objectBytes(obj: PDFObject | undefined): Uint8Array | null {
  if (!obj) return null;
  if (obj instanceof PDFHexString) return obj.asBytes();
  if (obj instanceof PDFString && "asBytes" in obj && typeof obj.asBytes === "function") {
    return obj.asBytes();
  }
  if (obj instanceof PDFStream) {
    const contents = streamContents(obj);
    if (!contents) return null;
    try {
      const filters = filterNames(obj.dict).filter((name) => PDF_LIB_FILTERS.has(name));
      if (filters.length === 0) return contents;
      return decodeWithPdfLib(obj.dict, contents, filters, decodeParmsList(obj.dict));
    } catch {
      return contents;
    }
  }
  return null;
}

function colorModelFrom(obj: PDFObject | undefined, depth = 0): ColorModel | null {
  if (!obj || depth > 6) return null;
  if (obj instanceof PDFName) {
    const name = obj.decodeText();
    if (name === "DeviceRGB" || name === "RGB" || name === "CalRGB") return { kind: "rgb" };
    if (name === "DeviceGray" || name === "G" || name === "CalGray") return { kind: "gray" };
    if (name === "DeviceCMYK" || name === "CMYK") return { kind: "cmyk" };
    return null;
  }
  if (!(obj instanceof PDFArray) || obj.size() < 1) return null;

  const first = obj.lookup(0);
  if (!(first instanceof PDFName)) return null;
  const name = first.decodeText();

  if (name === "ICCBased" && obj.size() > 1) {
    const profile = obj.lookup(1);
    if (profile instanceof PDFStream) {
      const channels = dictNumber(profile.dict, "N");
      if (channels === 1) return { kind: "gray" };
      if (channels === 3) return { kind: "rgb" };
      if (channels === 4) return { kind: "cmyk" };
      const alternate = profile.dict.lookup(PDFName.of("Alternate"));
      if (alternate) return colorModelFrom(profile.dict.context.lookup(alternate) ?? alternate, depth + 1);
    }
    return null;
  }
  if (name === "CalRGB") return { kind: "rgb" };
  if (name === "CalGray") return { kind: "gray" };
  if ((name === "Separation" || name === "DeviceN") && obj.size() > 2) {
    return colorModelFrom(obj.lookup(2), depth + 1);
  }
  if ((name === "Indexed" || name === "I") && obj.size() > 3) {
    const base = colorModelFrom(obj.lookup(1), depth + 1);
    if (!base || base.kind === "indexed") return null;
    const hivalObj = obj.lookup(2);
    if (!(hivalObj instanceof PDFNumber)) return null;
    const table = objectBytes(obj.lookup(3));
    if (!table) return null;
    return { kind: "indexed", base: base.kind, table, hival: hivalObj.asNumber() };
  }
  return null;
}

function componentCount(model: ColorModel): number {
  if (model.kind === "rgb") return 3;
  if (model.kind === "cmyk") return 4;
  return 1;
}

function jpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      i += 2;
      continue;
    }
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (length < 2) return null;
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: (bytes[i + 5] << 8) | bytes[i + 6],
        width: (bytes[i + 7] << 8) | bytes[i + 8],
      };
    }
    i += 2 + length;
  }
  return null;
}

function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type });
}

function pngBlob(rgba: Uint8ClampedArray, width: number, height: number): Blob {
  const buffer = new ArrayBuffer(rgba.byteLength);
  new Uint8Array(buffer).set(rgba);
  const encoded = UPNG.encode([buffer], width, height, 0);
  return new Blob([encoded], { type: "image/png" });
}

export function applyPdfImagePredictor(
  data: Uint8Array,
  predictor: number,
  columns: number,
  colors: number,
  bits: number,
): Uint8Array | null {
  if (predictor <= 1) return data;
  if (columns < 1 || colors < 1 || bits < 1) return null;

  const pixBytes = (colors * bits + 7) >> 3;
  const rowBytes = (columns * colors * bits + 7) >> 3;
  if (rowBytes < 1) return null;

  if (predictor === 2) return applyTiffPredictor(data, rowBytes, colors, bits);
  if (predictor >= 10 && predictor <= 15) return applyPngPredictor(data, rowBytes, pixBytes);
  return null;
}

function applyTiffPredictor(data: Uint8Array, rowBytes: number, colors: number, bits: number): Uint8Array | null {
  if (data.length < rowBytes || data.length % rowBytes !== 0) return null;
  const out = new Uint8Array(data.length);
  if (bits === 8) {
    for (let row = 0; row < data.length; row += rowBytes) {
      for (let i = 0; i < colors; i++) out[row + i] = data[row + i];
      for (let i = colors; i < rowBytes; i++) {
        out[row + i] = (out[row + i - colors] + data[row + i]) & 0xff;
      }
    }
    return out;
  }
  if (bits === 1 && colors === 1) {
    for (let row = 0; row < data.length; row += rowBytes) {
      let inbuf = 0;
      for (let i = 0; i < rowBytes; i++) {
        let c = data[row + i] ^ inbuf;
        c ^= c >> 1;
        c ^= c >> 2;
        c ^= c >> 4;
        inbuf = (c & 1) << 7;
        out[row + i] = c;
      }
    }
    return out;
  }
  return null;
}

function applyPngPredictor(data: Uint8Array, rowBytes: number, pixBytes: number): Uint8Array | null {
  const stride = rowBytes + 1;
  if (data.length < stride || data.length % stride !== 0) return null;
  const rows = data.length / stride;
  const out = new Uint8Array(rows * rowBytes);
  let prev = new Uint8Array(rowBytes);

  for (let row = 0; row < rows; row++) {
    const filter = data[row * stride];
    const raw = data.subarray(row * stride + 1, row * stride + 1 + rowBytes);
    const dest = out.subarray(row * rowBytes, row * rowBytes + rowBytes);
    if (!unfilterPngRow(filter, raw, dest, prev, pixBytes)) return null;
    prev = dest;
  }
  return out;
}

function unfilterPngRow(filter: number, raw: Uint8Array, dest: Uint8Array, prev: Uint8Array, pixBytes: number): boolean {
  const rowBytes = raw.length;
  switch (filter) {
    case 0:
      dest.set(raw);
      return true;
    case 1:
      for (let i = 0; i < pixBytes; i++) dest[i] = raw[i];
      for (let i = pixBytes; i < rowBytes; i++) dest[i] = (dest[i - pixBytes] + raw[i]) & 0xff;
      return true;
    case 2:
      for (let i = 0; i < rowBytes; i++) dest[i] = (prev[i] + raw[i]) & 0xff;
      return true;
    case 3:
      for (let i = 0; i < pixBytes; i++) dest[i] = ((prev[i] >> 1) + raw[i]) & 0xff;
      for (let i = pixBytes; i < rowBytes; i++) dest[i] = (((prev[i] + dest[i - pixBytes]) >> 1) + raw[i]) & 0xff;
      return true;
    case 4:
      for (let i = 0; i < pixBytes; i++) dest[i] = (prev[i] + raw[i]) & 0xff;
      for (let i = pixBytes; i < rowBytes; i++) {
        const left = dest[i - pixBytes];
        const up = prev[i];
        const upLeft = prev[i - pixBytes];
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const base = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        dest[i] = (base + raw[i]) & 0xff;
      }
      return true;
    default:
      return false;
  }
}

function unpackSamples(data: Uint8Array, width: number, height: number, components: number, bits: number): Uint16Array | null {
  const samples = width * height * components;
  if (samples < 1) return null;
  const out = new Uint16Array(samples);
  const rowBytes = (width * components * bits + 7) >> 3;
  if (data.length < rowBytes * height) return null;

  if (bits === 8) {
    let offset = 0;
    for (let y = 0; y < height; y++) {
      const row = data.subarray(y * rowBytes, y * rowBytes + width * components);
      for (let i = 0; i < row.length; i++) out[offset++] = row[i];
    }
    return out;
  }

  if (bits === 16) {
    let offset = 0;
    for (let y = 0; y < height; y++) {
      const row = y * rowBytes;
      for (let x = 0; x < width * components; x++) {
        out[offset++] = data[row + x * 2] ?? 0;
      }
    }
    return out;
  }

  if (bits !== 1 && bits !== 2 && bits !== 4) return null;
  let offset = 0;
  for (let y = 0; y < height; y++) {
    let bitPos = y * rowBytes * 8;
    for (let x = 0; x < width * components; x++) {
      let value = 0;
      for (let bit = 0; bit < bits; bit++) {
        const pos = bitPos + bit;
        const byte = data[pos >> 3] ?? 0;
        value = (value << 1) | ((byte >> (7 - (pos & 7))) & 1);
      }
      out[offset++] = value;
      bitPos += bits;
    }
  }
  return out;
}

function readDecode(dict: PDFDict, model: ColorModel, bits: number): number[] {
  const fallbackMax = model.kind === "indexed" ? (1 << Math.min(bits, 16)) - 1 : 1;
  const count = model.kind === "indexed" ? 1 : componentCount(model);
  const fallback: number[] = [];
  for (let i = 0; i < count; i++) {
    fallback.push(0, model.kind === "indexed" ? fallbackMax : 1);
  }

  const decode = dict.lookup(PDFName.of("Decode"));
  if (!(decode instanceof PDFArray) || decode.size() < count * 2) return fallback;
  const values: number[] = [];
  for (let i = 0; i < count * 2; i++) {
    const entry = decode.lookup(i);
    if (!(entry instanceof PDFNumber)) return fallback;
    values.push(entry.asNumber());
  }
  return values;
}

function sampleMax(bits: number): number {
  if (bits >= 16) return 255;
  return (1 << bits) - 1;
}

export function pdfSamplesToRgba(
  samples: Uint16Array,
  width: number,
  height: number,
  model: ColorModel,
  bits: number,
  decode: number[],
): Uint8ClampedArray | null {
  const pixels = width * height;
  const components = model.kind === "indexed" ? 1 : componentCount(model);
  if (samples.length < pixels * components) return null;
  const rgba = new Uint8ClampedArray(pixels * 4);
  const max = sampleMax(bits === 16 ? 8 : bits);

  const channel = (sample: number, index: number) => {
    const dMin = decode[index * 2] ?? 0;
    const dMax = decode[index * 2 + 1] ?? 1;
    const t = max === 0 ? 0 : sample / max;
    return Math.max(0, Math.min(255, Math.round((dMin + t * (dMax - dMin)) * 255)));
  };

  for (let p = 0; p < pixels; p++) {
    const src = p * components;
    let r = 0;
    let g = 0;
    let b = 0;
    if (model.kind === "indexed") {
      const dMin = decode[0] ?? 0;
      const dMax = decode[1] ?? max;
      const t = max === 0 ? 0 : samples[src] / max;
      const index = Math.max(0, Math.min(model.hival, Math.round(dMin + t * (dMax - dMin))));
      const baseComponents = model.base === "rgb" ? 3 : model.base === "cmyk" ? 4 : 1;
      const tableAt = index * baseComponents;
      if (model.base === "gray") {
        r = g = b = model.table[tableAt] ?? 0;
      } else if (model.base === "rgb") {
        r = model.table[tableAt] ?? 0;
        g = model.table[tableAt + 1] ?? 0;
        b = model.table[tableAt + 2] ?? 0;
      } else {
        const cmyk = cmykToRgb(
          model.table[tableAt] ?? 0,
          model.table[tableAt + 1] ?? 0,
          model.table[tableAt + 2] ?? 0,
          model.table[tableAt + 3] ?? 0,
        );
        r = cmyk[0];
        g = cmyk[1];
        b = cmyk[2];
      }
    } else if (model.kind === "gray") {
      r = g = b = channel(samples[src], 0);
    } else if (model.kind === "rgb") {
      r = channel(samples[src], 0);
      g = channel(samples[src + 1], 1);
      b = channel(samples[src + 2], 2);
    } else {
      const cmyk = cmykToRgb(
        channel(samples[src], 0),
        channel(samples[src + 1], 1),
        channel(samples[src + 2], 2),
        channel(samples[src + 3], 3),
      );
      r = cmyk[0];
      g = cmyk[1];
      b = cmyk[2];
    }
    const dest = p * 4;
    rgba[dest] = r;
    rgba[dest + 1] = g;
    rgba[dest + 2] = b;
    rgba[dest + 3] = 255;
  }
  return rgba;
}

function cmykToRgb(c: number, m: number, y: number, k: number): [number, number, number] {
  return [
    Math.round(255 * (1 - c / 255) * (1 - k / 255)),
    Math.round(255 * (1 - m / 255) * (1 - k / 255)),
    Math.round(255 * (1 - y / 255) * (1 - k / 255)),
  ];
}

function looksLikeImage(dict: PDFDict): boolean {
  const width = dictNumber(dict, "Width") ?? dictNumber(dict, "W");
  const height = dictNumber(dict, "Height") ?? dictNumber(dict, "H");
  if (!width || !height) return false;
  return Boolean(
    dictNumber(dict, "BitsPerComponent") || dictNumber(dict, "BPC") || dict.has(PDFName.of("ColorSpace")) || dict.has(PDFName.of("Filter")),
  );
}

function decodeImageStream(stream: PDFStream): { blob: Blob; width: number; height: number; ext: "jpg" | "png" | "jp2" } | null {
  const contents = streamContents(stream);
  if (!contents) return null;

  const filters = filterNames(stream.dict);
  const codecAt = filters.findIndex((name) => IMAGE_CODECS.has(name));
  const codec = codecAt === -1 ? null : filters[codecAt];
  const prefix = codecAt === -1 ? filters : filters.slice(0, codecAt);
  if (prefix.some((name) => !PDF_LIB_FILTERS.has(name))) return null;

  let bytes = contents;
  if (prefix.length > 0) {
    try {
      bytes = decodeWithPdfLib(stream.dict, contents, prefix, decodeParmsList(stream.dict));
    } catch {
      return null;
    }
  }

  if (codec === "DCTDecode" || (codec === null && bytes[0] === 0xff && bytes[1] === 0xd8)) {
    const size = jpegSize(bytes);
    const width = dictNumber(stream.dict, "Width") ?? dictNumber(stream.dict, "W") ?? size?.width ?? 0;
    const height = dictNumber(stream.dict, "Height") ?? dictNumber(stream.dict, "H") ?? size?.height ?? 0;
    if (width < 1 || height < 1) return null;
    return { blob: bytesToBlob(bytes, "image/jpeg"), width, height, ext: "jpg" };
  }

  if (codec === "JPXDecode") {
    const width = dictNumber(stream.dict, "Width") ?? dictNumber(stream.dict, "W") ?? 0;
    const height = dictNumber(stream.dict, "Height") ?? dictNumber(stream.dict, "H") ?? 0;
    if (width < 1 || height < 1) return null;
    return { blob: bytesToBlob(bytes, "image/jp2"), width, height, ext: "jp2" };
  }

  if (codec) return null;

  const imageMask = stream.dict.lookup(PDFName.of("ImageMask"));
  const isMask = imageMask instanceof PDFBool && imageMask.asBoolean();
  const model = isMask
    ? { kind: "gray" as const }
    : colorModelFrom(stream.dict.lookup(PDFName.of("ColorSpace")) ?? stream.dict.lookup(PDFName.of("CS")));
  if (!model) return null;

  const bits = isMask ? 1 : (dictNumber(stream.dict, "BitsPerComponent") ?? dictNumber(stream.dict, "BPC") ?? 8);
  const width = dictNumber(stream.dict, "Width") ?? dictNumber(stream.dict, "W") ?? 0;
  const height = dictNumber(stream.dict, "Height") ?? dictNumber(stream.dict, "H") ?? 0;
  if (width < 1 || height < 1) return null;
  if (width * height > 40_000_000) return null;

  const parms = decodeParmsList(stream.dict)[0];
  const predictor = parms ? (dictNumber(parms, "Predictor") ?? 1) : 1;
  const columns = parms ? (dictNumber(parms, "Columns") ?? width) : width;
  const colors = parms ? (dictNumber(parms, "Colors") ?? componentCount(model)) : componentCount(model);
  const predictedBits = parms ? (dictNumber(parms, "BitsPerComponent") ?? bits) : bits;
  const predicted = applyPdfImagePredictor(bytes, predictor, columns, colors, predictedBits);
  if (!predicted) return null;

  const samples = unpackSamples(predicted, width, height, componentCount(model), bits === 16 ? 8 : bits);
  if (!samples) return null;
  const rgba = pdfSamplesToRgba(
    samples,
    width,
    height,
    model,
    bits === 16 ? 8 : bits,
    readDecode(stream.dict, model, bits === 16 ? 8 : bits),
  );
  if (!rgba) return null;
  return { blob: pngBlob(rgba, width, height), width, height, ext: "png" };
}

function remember(stream: PDFStream, ref: PDFRef | undefined, pageNumber: number, label: string, state: ScanState) {
  const id = ref ? refKey(ref) : `${label}-p${pageNumber}`;
  if (state.seen.has(id)) {
    state.pagesWithImages.add(pageNumber);
    return;
  }
  state.seen.add(id);

  let decoded: ReturnType<typeof decodeImageStream> = null;
  try {
    decoded = decodeImageStream(stream);
  } catch {
    decoded = null;
  }

  if (!decoded) {
    if (ref) state.undecodedRefs.add(id);
    visitLinkedMasks(stream.dict, pageNumber, state);
    return;
  }

  if (decoded.width >= MIN_EXTRACT_EDGE && decoded.height >= MIN_EXTRACT_EDGE) {
    state.pagesWithImages.add(pageNumber);
    state.images.push({
      id,
      pageNumber,
      blob: decoded.blob,
      width: decoded.width,
      height: decoded.height,
      ext: decoded.ext,
    });
  }
  visitLinkedMasks(stream.dict, pageNumber, state);
}

function visitLinkedMasks(dict: PDFDict, pageNumber: number, state: ScanState) {
  visitMaybeStream(dict, "SMask", pageNumber, state);
  const mask = dict.get(PDFName.of("Mask"));
  if (mask instanceof PDFRef || mask instanceof PDFStream) {
    visitMaybeStream(dict, "Mask", pageNumber, state);
  }
}

function visitMaybeStream(dict: PDFDict, key: string, pageNumber: number, state: ScanState) {
  const raw = dict.get(PDFName.of(key));
  if (!raw) return;
  const ref = raw instanceof PDFRef ? raw : undefined;
  try {
    const resolved = dict.context.lookup(raw);
    if (resolved instanceof PDFStream) visitStream(resolved, ref, pageNumber, state, key);
  } catch {
    return;
  }
}

function visitStream(stream: PDFStream, ref: PDFRef | undefined, pageNumber: number, state: ScanState, label: string) {
  if (state.depth > 12) return;
  const subtype = dictName(stream.dict, "Subtype") ?? dictName(stream.dict, "Type");
  const isImage = subtype === "Image" || (subtype !== "Form" && looksLikeImage(stream.dict));
  if (isImage) {
    remember(stream, ref, pageNumber, label, state);
    return;
  }

  const isForm = subtype === "Form" || stream.dict.has(PDFName.of("BBox"));
  if (!isForm) return;

  const id = ref ? refKey(ref) : undefined;
  if (id) {
    if (state.seen.has(`form:${id}`)) return;
    state.seen.add(`form:${id}`);
  }
  state.depth += 1;
  try {
    const resources = stream.dict.lookupMaybe(PDFName.of("Resources"), PDFDict);
    walkResources(resources, pageNumber, state);
  } finally {
    state.depth -= 1;
  }
}

function visitObject(obj: PDFObject | undefined, ref: PDFRef | undefined, pageNumber: number, state: ScanState, label: string) {
  if (!obj) return;
  if (obj instanceof PDFStream) {
    visitStream(obj, ref, pageNumber, state, label);
    return;
  }
  if (obj instanceof PDFDict) {
    const resources = obj.lookupMaybe(PDFName.of("Resources"), PDFDict);
    if (resources) walkResources(resources, pageNumber, state);
  }
}

function walkDictStreams(dict: PDFDict, pageNumber: number, state: ScanState, label: string) {
  for (const [key, raw] of dict.entries()) {
    const ref = raw instanceof PDFRef ? raw : undefined;
    try {
      const resolved = dict.lookup(key);
      if (!resolved) {
        if (ref) state.undecodedRefs.add(refKey(ref));
        continue;
      }
      visitObject(resolved, ref, pageNumber, state, `${label}-${key.decodeText()}`);
    } catch {
      if (ref) state.undecodedRefs.add(refKey(ref));
    }
  }
}

function walkResources(resources: PDFDict | undefined, pageNumber: number, state: ScanState) {
  if (!resources || state.depth > 12) return;
  state.depth += 1;
  try {
    const xObjects = resources.lookupMaybe(PDFName.of("XObject"), PDFDict);
    if (xObjects) walkDictStreams(xObjects, pageNumber, state, "xo");

    const patterns = resources.lookupMaybe(PDFName.of("Pattern"), PDFDict);
    if (patterns) walkDictStreams(patterns, pageNumber, state, "pat");

    const graphics = resources.lookupMaybe(PDFName.of("ExtGState"), PDFDict);
    if (graphics) {
      for (const [key, raw] of graphics.entries()) {
        try {
          const gs = graphics.lookup(key, PDFDict);
          const smask = gs.lookupMaybe(PDFName.of("SMask"), PDFDict);
          if (!smask) continue;
          const group = smask.get(PDFName.of("G"));
          if (!group) continue;
          const ref = group instanceof PDFRef ? group : raw instanceof PDFRef ? raw : undefined;
          visitObject(smask.context.lookup(group), ref, pageNumber, state, `smask-${key.decodeText()}`);
        } catch {
          continue;
        }
      }
    }
  } finally {
    state.depth -= 1;
  }
}

function walkAppearance(obj: PDFObject | undefined, pageNumber: number, state: ScanState, label: string) {
  if (!obj) return;
  if (obj instanceof PDFStream) {
    visitStream(obj, undefined, pageNumber, state, label);
    return;
  }
  if (obj instanceof PDFDict) {
    for (const [key, raw] of obj.entries()) {
      const ref = raw instanceof PDFRef ? raw : undefined;
      try {
        visitObject(obj.lookup(key), ref, pageNumber, state, `${label}-${key.decodeText()}`);
      } catch {
        continue;
      }
    }
  }
}

function walkAnnotations(pageDict: PDFDict, pageNumber: number, state: ScanState) {
  const annots = pageDict.lookupMaybe(PDFName.of("Annots"), PDFArray);
  if (!annots) return;
  for (let i = 0; i < annots.size(); i++) {
    try {
      const annot = annots.lookupMaybe(i, PDFDict);
      const ap = annot?.lookupMaybe(PDFName.of("AP"), PDFDict);
      if (!ap) continue;
      for (const key of ["N", "R", "D"]) {
        const raw = ap.get(PDFName.of(key));
        if (!raw) continue;
        walkAppearance(ap.context.lookup(raw), pageNumber, state, `annot-${i}-${key}`);
      }
    } catch {
      continue;
    }
  }
}

/**
 * Pull every embedded image XObject (and masks, form resources, patterns, and
 * annotation artwork) out of the PDF, without rasterizing pages.
 */
export async function extractEmbeddedPdfImages(pdfData: ArrayBuffer | Uint8Array): Promise<EmbeddedPdfImageScan> {
  const bytes = pdfData instanceof Uint8Array ? pdfData : new Uint8Array(pdfData.slice(0));
  const pdf = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    updateMetadata: false,
    throwOnInvalidObject: false,
  });

  const state: ScanState = {
    images: [],
    undecodedRefs: new Set(),
    pagesWithImages: new Set(),
    seen: new Set(),
    depth: 0,
  };

  pdf.getPages().forEach((page, index) => {
    const pageNumber = index + 1;
    try {
      walkResources(page.node.Resources(), pageNumber, state);
      walkAnnotations(page.node, pageNumber, state);
    } catch {
      return;
    }
  });

  return { images: state.images, undecodedRefs: state.undecodedRefs, pagesWithImages: state.pagesWithImages };
}
