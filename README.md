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
- Crop images? → SnapBit Tools
- Format JSON? → SnapBit Tools
- Convert images to PDF? → SnapBit Tools
- Compare text/code? → SnapBit Tools
- Generate placeholder text? → SnapBit Tools

So I built them ALL in one place!

## Features

### Image to Base64 Converter

- Drag & drop or click to upload
- Instant Base64 conversion with data URI
- One-click copy to clipboard
- Supports all image formats

### Image Format Converter

- Convert between PNG, JPEG, WebP, AVIF
- Batch processing support
- Individual or bulk downloads
- Image quality preservation

### Image Compressor

- Adjustable quality control (10%-100%)
- Custom dimension limits
- Real-time compression ratio display
- Batch compression with progress tracking

### Image Cropper

- Precision cropping and resizing
- Aspect ratio locking
- Flip and rotate options
- Real-time preview

### JSON Formatter

- Format, minify, and validate JSON online
- Syntax highlighting with bracket matching
- Download formatted JSON

### Image to PDF

- Convert multiple images to a single PDF
- Reorder images before conversion
- Fast, client-side PDF generation

### Word Counter

- Real-time word, character, and sentence counting
- Reading time estimation
- Text case transformations (UPPERCASE, lowercase, Title Case)

### Diff Checker

- Side-by-side text and code comparison
- Split and Unified view modes
- Smart line-by-line alignment

### CSV ↔ XLSX Converter

- Convert CSV to Excel (.xlsx) and back
- Batch support and zero uploads
- Privacy-first spreadsheet processing

### Lorem Ipsum Generator

- Generate custom paragraphs, sentences, or words
- Instantly refresh for new random text
- Easy copy-to-clipboard functionality

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
   git clone https://github.com/SiddharthaMishra-dev/js-dev-tools
   cd js-dev-tools
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
