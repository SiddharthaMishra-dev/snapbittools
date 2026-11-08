import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconCheck, IconCopy, IconFile, IconHash, IconShieldLock, IconTrash, IconTypography } from "@tabler/icons-react";

import RelatedTools from "@/components/RelatedTools";
import ToolContentDisplay from "@/components/ToolContentDisplay";
import ToolInfo from "@/components/ToolInfo";
import { toolContent } from "@/data/toolContent";
import { getSeoMetadata } from "@/lib/seo";
import { themeClasses as tc } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const ALGORITHMS = ["SHA-256", "SHA-384", "SHA-512", "SHA-1"] as const;
type HashAlgorithm = (typeof ALGORITHMS)[number];

type HashRow = {
  algorithm: HashAlgorithm;
  hex: string;
};

const faqs = [
  {
    question: "Is the hash generator private?",
    answer:
      "Yes. Text and files are hashed with the browser's built-in Web Crypto API. The input stays on your device, and SnapBit does not receive a copy.",
  },
  {
    question: "Which checksum should I use?",
    answer:
      "Use SHA-256 unless the publisher of a file asked for something else. SHA-384 and SHA-512 are longer digests from the same family. SHA-1 is here for older documents. This tool does not compute MD5.",
  },
  {
    question: "Why does my SHA-256 not match sha256sum?",
    answer:
      "Text mode hashes the exact characters you paste, as UTF-8, and does not add a newline. echo hello | sha256sum hashes hello plus a newline, so the digests differ. File mode hashes the raw bytes, which matches sha256sum for that file.",
  },
  {
    question: "Can I use this to store passwords?",
    answer:
      "No. These are checksums. They are fast on purpose, which makes them a poor way to store passwords. Use them to verify a download, a file, or a snippet.",
  },
  {
    question: "Does a matching checksum prove a signature?",
    answer:
      "It proves the bytes match the digest you compared. It does not, by itself, prove who created the file. Trust the checksum only when it comes from the same place you trust the download.",
  },
];

export const Route = createFileRoute("/_wrap/hash-generator")({
  head: () =>
    getSeoMetadata({
      title: "Hash Generator | SHA-256 Checksum Online | SnapBit Tools",
      description:
        "Generate SHA-256, SHA-384, SHA-512, and SHA-1 checksums for text or files in your browser. No upload, no account.",
      keywords: [
        "hash generator",
        "sha256 online",
        "sha256 checksum",
        "file hash",
        "sha512",
        "sha1 checksum",
        "checksum without upload",
      ],
      url: "/hash-generator",
      type: "software",
      faqs,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Data tools", path: "/data-tools" },
        { name: "Hash Generator", path: "/hash-generator" },
      ],
    }),
  component: HashGeneratorPage,
});

async function digestHex(algorithm: HashAlgorithm, bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest(algorithm, bytes.slice());
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function expectedToken(value: string): string {
  const token = value.trim().toLowerCase().split(/\s+/)[0] ?? "";
  return token.replace(/[^a-f0-9]/g, "");
}

function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<HashRow[]>([]);
  const [byteLength, setByteLength] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [expected, setExpected] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestRef.current;
    let cancelled = false;

    async function run() {
      if (!globalThis.crypto?.subtle) {
        setHashes([]);
        setByteLength(null);
        setError("Hashing needs a secure page. Open this tool on HTTPS or localhost.");
        return;
      }

      if (!file && input.length === 0) {
        setHashes([]);
        setByteLength(null);
        setError(null);
        setPending(false);
        return;
      }

      setPending(true);
      setError(null);
      try {
        const bytes = file ? new Uint8Array(await file.arrayBuffer()) : new TextEncoder().encode(input);
        const rows = await Promise.all(
          ALGORITHMS.map(async (algorithm) => ({
            algorithm,
            hex: await digestHex(algorithm, bytes),
          })),
        );
        if (cancelled || requestId !== requestRef.current) return;
        setHashes(rows);
        setByteLength(bytes.byteLength);
      } catch {
        if (cancelled || requestId !== requestRef.current) return;
        setHashes([]);
        setByteLength(null);
        setError("Could not hash that input.");
      } finally {
        if (!cancelled && requestId === requestRef.current) setPending(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [file, input]);

  const normalizedExpected = useMemo(() => expectedToken(expected), [expected]);
  const matched = hashes.find((row) => normalizedExpected.length > 0 && row.hex === normalizedExpected);

  const copyHex = useCallback(async (algorithm: string, hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(algorithm);
      window.setTimeout(() => setCopied((current) => (current === algorithm ? null : current)), 2000);
    } catch {
      setError("Could not copy the checksum.");
    }
  }, []);

  const clearAll = () => {
    requestRef.current += 1;
    setInput("");
    setFile(null);
    setExpected("");
    setHashes([]);
    setByteLength(null);
    setError(null);
    setPending(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const takeFile = (next: File | undefined) => {
    if (!next) return;
    setFile(next);
  };

  const sourceLabel = file ? file.name : input.length > 0 ? "Pasted text" : "Nothing to hash yet";

  return (
    <div className="bg-theme-page theme-page-gradient py-2 px-4 flex flex-col items-center">
      <div className="w-full max-w-7xl flex-1 flex flex-col mx-auto">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl mt-6 mb-12 text-center mx-auto">
            <h1 className="text-2xl sm:text-5xl font-bold text-theme-heading mb-2 tracking-tight text-shadow-sm">Hash Generator</h1>
          </div>

          <main className="w-full max-w-5xl mx-auto space-y-6">
            <section className="rounded-xl shadow-lg border border-theme-border bg-theme-surface px-4 py-4 sm:p-8">
              <div className="flex flex-wrap gap-3 justify-center">
                <button type="button" onClick={() => fileInputRef.current?.click()} className={cn(tc.btnSecondary, "px-4 py-2")}>
                  <IconFile className="w-4 h-4" />
                  Choose file
                </button>
                <button type="button" onClick={clearAll} className={cn(tc.btnDanger, "px-4 py-2")}>
                  <IconTrash className="w-4 h-4" />
                  Clear
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={(event) => takeFile(event.target.files?.[0])}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-theme-heading flex items-center gap-2">
                    <IconTypography className="w-5 h-5 text-brand-primary" />
                    Text
                  </h2>
                  <span className="text-xs text-theme-muted">{input.length.toLocaleString()} characters</span>
                </div>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Paste the exact text to hash. A trailing newline changes the checksum."
                  className={cn(tc.field, "w-full h-64 p-4 font-mono text-sm resize-y")}
                  spellCheck={false}
                />
              </div>

              <div className="space-y-4">
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    takeFile(event.dataTransfer.files?.[0]);
                  }}
                  className="rounded-xl border border-dashed border-theme-border bg-theme-surface-muted p-5"
                >
                  <h2 className="text-lg font-semibold text-theme-heading flex items-center gap-2 mb-2">
                    <IconFile className="w-5 h-5 text-brand-primary" />
                    File
                  </h2>
                  <p className="text-sm text-theme-muted leading-relaxed">
                    Drop a file here, or use Choose file. The checksum uses the file bytes. Clear the file to hash the text box instead.
                  </p>
                  {file && (
                    <p className="mt-3 text-sm text-theme-heading">
                      {file.name}{" "}
                      <span className="text-theme-muted">({file.size.toLocaleString()} bytes)</span>
                    </p>
                  )}
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-theme-heading">Expected checksum</span>
                  <input
                    value={expected}
                    onChange={(event) => setExpected(event.target.value)}
                    placeholder="Paste a SHA-256, or the full sha256sum line"
                    className={cn(tc.field, "w-full p-3 font-mono text-sm")}
                    spellCheck={false}
                    autoComplete="off"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-theme-border bg-theme-surface p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-theme-heading flex items-center gap-2">
                  <IconHash className="w-5 h-5 text-brand-primary" />
                  Checksums
                </h2>
                <p className="text-xs text-theme-muted">
                  {pending ? "Hashing…" : sourceLabel}
                  {byteLength !== null && !pending ? ` · ${byteLength.toLocaleString()} bytes` : ""}
                </p>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {hashes.length === 0 && !error && (
                <p className="text-sm text-theme-muted">Paste text or choose a file to generate checksums.</p>
              )}

              <ul className="space-y-3">
                {hashes.map((row) => {
                  const isMatch = matched?.algorithm === row.algorithm;
                  return (
                    <li
                      key={row.algorithm}
                      className={cn(
                        "rounded-lg border p-3",
                        isMatch ? "border-brand-primary/50 bg-brand-primary/10" : "border-theme-border bg-theme-surface-muted",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-sm font-semibold text-theme-heading">{row.algorithm}</span>
                        <button
                          type="button"
                          onClick={() => void copyHex(row.algorithm, row.hex)}
                          className={cn(tc.btn, "px-3 py-1.5 text-sm", copied === row.algorithm ? "theme-btn-success" : "theme-btn-secondary")}
                        >
                          {copied === row.algorithm ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                          {copied === row.algorithm ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <p className="font-mono text-xs sm:text-sm text-theme-body break-all">{row.hex}</p>
                      {isMatch && <p className="mt-2 text-xs font-medium text-brand-primary">Matches the checksum you pasted.</p>}
                    </li>
                  );
                })}
              </ul>

              {normalizedExpected.length > 0 && hashes.length > 0 && !matched && (
                <p className="text-sm text-theme-muted">That checksum does not match SHA-256, SHA-384, SHA-512, or SHA-1 for this input.</p>
              )}

              <div className="bg-theme-surface-muted border border-theme-border rounded-lg p-3 flex items-start gap-3">
                <IconShieldLock className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div className="text-sm text-theme-body">
                  <p className="font-semibold">100% private processing</p>
                  <p className="mt-1 text-theme-muted">
                    Checksums are calculated in your browser. The text or file is not uploaded. This is for verifying bytes, not for storing
                    passwords.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>

        <ToolContentDisplay
          title={toolContent["hash-generator"].title}
          intro={toolContent["hash-generator"].intro}
          benefits={toolContent["hash-generator"].benefits}
          useCases={toolContent["hash-generator"].useCases}
        />

        <ToolInfo
          title="SHA checksums without an upload"
          description="Hash text or a file locally and compare the digest with a published checksum."
          features={[
            {
              title: "Four digests at once",
              description: "SHA-256, SHA-384, SHA-512, and SHA-1 update together as the input changes.",
              icon: IconHash,
            },
            {
              title: "Text or file bytes",
              description: "Text is hashed as exact UTF-8. A file is hashed as the bytes on disk.",
              icon: IconFile,
            },
            {
              title: "Checksum compare",
              description: "Paste a published digest, including a sha256sum line, and see which algorithm matches.",
              icon: IconCheck,
            },
            {
              title: "Private by default",
              description: "Web Crypto runs in the tab. The input is not sent to a server.",
              icon: IconShieldLock,
            },
          ]}
          steps={[
            { title: "Add the input", description: "Paste text or choose a file." },
            { title: "Read the digest", description: "Copy SHA-256 unless you were asked for another algorithm." },
            { title: "Compare", description: "Paste the published checksum to confirm the bytes match." },
          ]}
          privacyInfo="Hashing runs entirely in your browser. Text and files are not uploaded or stored."
          faqs={faqs}
        />

        <RelatedTools currentToolSlug="hash-generator" category="Data" />
      </div>
    </div>
  );
}
