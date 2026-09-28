<!-- Add Home page Screenshot -->

[![SnapBit Tools Screenshot](/apps/web/public/screenshot.png)](https://snapbittools.com/)

Try it out: [https://snapbittools.com/](https://snapbittools.com/)

## SnapBit Tools

A powerful suite of privacy-first online tools for developers and creators. All processing happens
100% in your browser.

## Why This Project?

Tired of jumping between different websites for simple image tasks? Me too!

- Need to compress images? → SnapBit Tools
- Convert to Base64? → SnapBit Tools
- Change formats? → SnapBit Tools
- Crop or resize images? → SnapBit Tools
- Remove a background? → SnapBit Tools
- Convert, compress, or extract photos from a PDF? → SnapBit Tools
- Format JSON or convert CSV? → SnapBit Tools
- Compare text/code? → SnapBit Tools

So I built them ALL in one place!

## Tools

All tools run in the browser. Nothing is uploaded.

### Images

- [Image to Base64](https://snapbittools.com/image-to-base64) — Convert images to Base64 instantly with full client-side privacy.
- [Format Converter](https://snapbittools.com/image-format-converter) — Convert PNG, JPEG, WebP, and AVIF in seconds. No uploads needed.
- [Image Compressor](https://snapbittools.com/image-compressor) — Shrink file size without losing quality. Fast, offline-friendly.
- [Background Remover](https://snapbittools.com/image-background-remover) — Remove image backgrounds with AI. Private, browser-only cutouts.
- [Image Cropper](https://snapbittools.com/image-cropper) — Crop, rotate, and resize images with pixel-perfect previews.
- [Image Resizer](https://snapbittools.com/image-resizer) — Resize images instantly while keeping the original aspect ratio.

### PDF

- [Image to PDF](https://snapbittools.com/image-to-pdf) — Combine multiple images into a single PDF instantly, all offline.
- [PDF to JPG](https://snapbittools.com/pdf-to-jpg) — Convert PDF pages to JPG or PNG in your browser. Private, no upload.
- [PDF Image Extractor](https://snapbittools.com/pdf-extract-images) — Extract photos from a PDF and download them as a ZIP of JPG and PNG files. Private, no upload.
- [PDF Compressor](https://snapbittools.com/pdf-compressor) — Shrink PDF size in your browser. Private, no upload required.

### Data

- [Base64 to File](https://snapbittools.com/base64-to-file) — Decode Base64 back to original files like TXT, images, PDF, Excel, and more.
- [JSON Formatter](https://snapbittools.com/json-formatter) — Format, validate, and minify JSON securely in your browser.
- [CSV ↔ XLSX](https://snapbittools.com/csv-xlsx-converter) — Convert CSV to Excel and back with batch support and zero uploads.
- [HTML Minifier](https://snapbittools.com/html-minifier) — Minify HTML by removing comments and extra whitespace. Fast, private, browser-based.
- [JSON to CSV](https://snapbittools.com/json-to-csv) — Convert nested JSON arrays to CSV instantly. Flatten objects and handle large files.
- [CSV to JSON](https://snapbittools.com/csv-to-json) — Convert CSV data to structured JSON objects instantly. Handle headers and quoted fields.

### Utility

- [Bulk File Renamer](https://snapbittools.com/bulk-file-renamer) — Rename multiple files at once with pattern matching like `file-[1,2,3...]`. Works offline with zero uploads.
- [Color Palette](https://snapbittools.com/color-palette-generator) — Generate color palettes using color theory. Complementary, triadic, shades, brand, and more. Export as CSS, JSON, or Tailwind.
- [Word Counter](https://snapbittools.com/word-counter) — Count words, characters, and sentences in real time with reading time estimation.
- [Diff Checker](https://snapbittools.com/diff-checker) — Compare two text files or code snippets side by side. Private, with additions and deletions highlighted.
- [Lorem Ipsum](https://snapbittools.com/lorem-ipsum-generator) — Generate placeholder text with custom paragraphs, words, and sentences.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS
- **Icons**: Tabler Icons
- **Build Tool**: Vite

## Project Structure

- `apps/web/src/routes/*.tsx`: Individual tool implementations and routes.
- `apps/web/src/components`: Shared UI components.
- `apps/web/src/data/tools.ts`: Tool registration and metadata.
- `public`: Static assets and icons.

## How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/SiddharthaMishra-dev/snapbittools.git
   cd snapbittools
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the dev server:
   ```bash
   bun dev
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug
fixes.

- Report Bugs
- Suggest Features
- Star the Repository if you find it useful!
