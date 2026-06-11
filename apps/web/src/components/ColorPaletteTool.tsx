import { useState, useCallback, useEffect, useRef } from "react";
import {
  IconRefresh,
  IconCopy,
  IconCheck,
  IconLock,
  IconLockOpen,
  IconDownload,
  IconPalette,
  IconWand,
  IconChevronDown,
  IconX,
  IconBookmark,
  IconBookmarkFilled,
  IconColorPicker,
} from "@tabler/icons-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ColorFormat = "hex" | "rgb" | "hsl";

type PaletteMode =
  | "random"
  | "shades"
  | "contrast"
  | "brand"
  | "complementary"
  | "triadic"
  | "analogous"
  | "split-complementary"
  | "tetradic";

type PaletteColor = {
  id: string;
  hex: string;
  name?: string;
  locked: boolean;
};

// ─── Color Math Utilities ─────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function formatColor(hex: string, format: ColorFormat): string {
  const { r, g, b } = hexToRgb(hex);
  if (format === "hex") return hex.toUpperCase();
  if (format === "rgb") return `rgb(${r}, ${g}, ${b})`;
  const { h, s, l } = rgbToHsl(r, g, b);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/** Relative luminance per WCAG 2.1 */
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

function getTextColor(hex: string): string {
  return luminance(hex) > 0.35 ? "#1f2937" : "#f9fafb";
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function randomHue(): number {
  return Math.floor(Math.random() * 360);
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Palette Generation ───────────────────────────────────────────────────────

function generateRandom(count = 5): string[] {
  // Use golden-angle spacing for visually harmonious random palettes
  const baseHue = randomHue();
  const goldenAngle = 137.508;
  return Array.from({ length: count }, (_, i) => {
    const h = (baseHue + i * goldenAngle) % 360;
    const s = 55 + Math.floor(Math.random() * 30);
    const l = 40 + Math.floor(Math.random() * 25);
    return hslToHex(h, s, l);
  });
}

function generateShades(baseHex: string, count = 7): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s } = rgbToHsl(r, g, b);
  const lightnesses = [90, 75, 60, 45, 35, 22, 12];
  return lightnesses.slice(0, count).map((l) => hslToHex(h, s, l));
}

function generateContrast(baseHex: string): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return [
    baseHex,
    hslToHex((h + 180) % 360, s, l),                         // complement
    hslToHex(h, Math.max(10, s - 30), l > 50 ? 20 : 85),     // dark/light neutral
    hslToHex((h + 60) % 360, 80, 55),                         // warm accent
    hslToHex((h + 300) % 360, 70, 60),                        // cool accent
  ];
}

function generateBrand(baseHex: string): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s } = rgbToHsl(r, g, b);
  return [
    hslToHex(h, s, 55),         // Primary
    hslToHex(h, s - 10, 70),    // Light primary
    hslToHex(h, s, 35),         // Dark primary
    hslToHex(h, 10, 20),        // Text / dark neutral
    hslToHex(h, 15, 96),        // Background / light neutral
    hslToHex((h + 30) % 360, s + 10, 55), // Accent
  ];
}

function generateComplementary(baseHex: string): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const comp = (h + 180) % 360;
  return [
    hslToHex(h, s, l + 15 > 90 ? l - 10 : l + 15),
    hslToHex(h, s, l),
    hslToHex(h, s, l - 15 < 10 ? l + 10 : l - 15),
    hslToHex(comp, s, l),
    hslToHex(comp, s, l - 10 < 10 ? l + 10 : l - 10),
  ];
}

function generateTriadic(baseHex: string): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return [
    hslToHex(h, s, l),
    hslToHex((h + 120) % 360, s, l),
    hslToHex((h + 240) % 360, s, l),
    hslToHex(h, s - 15, l + 20 > 90 ? l : l + 20),
    hslToHex((h + 120) % 360, s - 15, l + 20 > 90 ? l : l + 20),
  ];
}

function generateAnalogous(baseHex: string): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return [-60, -30, 0, 30, 60].map((offset) => hslToHex((h + offset + 360) % 360, s, l));
}

function generateSplitComplementary(baseHex: string): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return [
    hslToHex(h, s, l),
    hslToHex((h + 150) % 360, s, l),
    hslToHex((h + 210) % 360, s, l),
    hslToHex(h, s - 20, l + 15 > 90 ? l : l + 15),
    hslToHex((h + 180) % 360, s - 20, l),
  ];
}

function generateTetradic(baseHex: string): string[] {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return [0, 90, 180, 270].map((offset) => hslToHex((h + offset) % 360, s, l)).concat([
    hslToHex(h, Math.max(20, s - 20), l + 20 > 90 ? l : l + 20),
  ]);
}

function buildPalette(hexes: string[], existingLocked?: PaletteColor[]): PaletteColor[] {
  return hexes.map((hex, i) => {
    const locked = existingLocked?.[i]?.locked ?? false;
    const existingHex = locked ? (existingLocked?.[i]?.hex ?? hex) : hex;
    return { id: uid(), hex: existingHex, locked };
  });
}

function getPaletteHexes(mode: PaletteMode, baseHex: string): string[] {
  switch (mode) {
    case "random":           return generateRandom();
    case "shades":           return generateShades(baseHex);
    case "contrast":         return generateContrast(baseHex);
    case "brand":            return generateBrand(baseHex);
    case "complementary":    return generateComplementary(baseHex);
    case "triadic":          return generateTriadic(baseHex);
    case "analogous":        return generateAnalogous(baseHex);
    case "split-complementary": return generateSplitComplementary(baseHex);
    case "tetradic":         return generateTetradic(baseHex);
    default:                 return generateRandom();
  }
}

// ─── Saved Palettes (localStorage) ───────────────────────────────────────────

const STORAGE_KEY = "snapbit-color-palettes";

function loadSaved(): PaletteColor[][] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PaletteColor[][]) : [];
  } catch {
    return [];
  }
}

function savePalettes(palettes: PaletteColor[][]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
  } catch {
    // ignore storage errors
  }
}

// ─── Mode config ──────────────────────────────────────────────────────────────

const MODES: { value: PaletteMode; label: string; needsBase: boolean; group: string }[] = [
  { value: "random",              label: "Random",               needsBase: false, group: "General" },
  { value: "shades",              label: "Shades",               needsBase: true,  group: "General" },
  { value: "contrast",            label: "Contrast",             needsBase: true,  group: "General" },
  { value: "brand",               label: "Brand",                needsBase: true,  group: "General" },
  { value: "complementary",       label: "Complementary",        needsBase: true,  group: "Color Theory" },
  { value: "triadic",             label: "Triadic",              needsBase: true,  group: "Color Theory" },
  { value: "analogous",           label: "Analogous",            needsBase: true,  group: "Color Theory" },
  { value: "split-complementary", label: "Split-Complementary",  needsBase: true,  group: "Color Theory" },
  { value: "tetradic",            label: "Tetradic",             needsBase: true,  group: "Color Theory" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ColorCard({
  color,
  format,
  onToggleLock,
  onCopy,
  isCopied,
  index,
}: {
  color: PaletteColor;
  format: ColorFormat;
  onToggleLock: (id: string) => void;
  onCopy: (hex: string, id: string) => void;
  isCopied: boolean;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const displayValue = formatColor(color.hex, format);
  const textColor = getTextColor(color.hex);
  const whiteContrast = contrastRatio(color.hex, "#ffffff");
  const blackContrast = contrastRatio(color.hex, "#000000");
  const bestContrast = Math.max(whiteContrast, blackContrast);
  const wcagLevel = bestContrast >= 7 ? "AAA" : bestContrast >= 4.5 ? "AA" : bestContrast >= 3 ? "AA Large" : "Fail";

  return (
    <div
      className="relative flex-1 min-w-0 rounded-xl overflow-hidden group transition-all duration-300 cursor-pointer"
      style={{ backgroundColor: color.hex, minHeight: "200px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onCopy(color.hex, color.id)}
      title={`Click to copy ${displayValue}`}
    >
      {/* Color index badge */}
      <div
        className="absolute top-3 left-3 text-xs font-bold opacity-40"
        style={{ color: textColor }}
      >
        {index + 1}
      </div>

      {/* Lock button */}
      <button
        className="absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
        style={{
          background: `${textColor}20`,
          color: textColor,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock(color.id);
        }}
        title={color.locked ? "Unlock color" : "Lock color"}
      >
        {color.locked ? <IconLock size={14} /> : <IconLockOpen size={14} />}
      </button>

      {/* Locked indicator */}
      {color.locked && (
        <div
          className="absolute top-3 right-3 p-1.5 rounded-lg"
          style={{ background: `${textColor}30`, color: textColor }}
        >
          <IconLock size={14} />
        </div>
      )}

      {/* Bottom info */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${
          hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
        style={{ background: `linear-gradient(to top, ${color.hex}ee, transparent)` }}
      >
        <div
          className="flex items-center justify-between gap-1"
          style={{ color: textColor }}
        >
          <span className="text-xs font-mono font-semibold truncate">{displayValue}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${textColor}20` }}>
              {wcagLevel}
            </span>
            {isCopied ? (
              <IconCheck size={14} />
            ) : (
              <IconCopy size={14} className="opacity-70" />
            )}
          </div>
        </div>
      </div>

      {/* Always visible hex at bottom when not hovered */}
      {!hovered && (
        <div
          className="absolute bottom-3 left-3 right-3"
          style={{ color: textColor }}
        >
          <span className="text-xs font-mono opacity-70">{color.hex.toUpperCase()}</span>
        </div>
      )}

      {/* Copy flash overlay */}
      {isCopied && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: `${color.hex}cc` }}>
          <div className="flex flex-col items-center gap-1" style={{ color: textColor }}>
            <IconCheck size={28} />
            <span className="text-xs font-semibold">Copied!</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ColorPaletteTool() {
  const [mode, setMode] = useState<PaletteMode>("random");
  const [baseColor, setBaseColor] = useState("#2563eb");
  const [inputColor, setInputColor] = useState("#2563eb");
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [palette, setPalette] = useState<PaletteColor[]>(() =>
    buildPalette(generateRandom())
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState<PaletteColor[][]>(loadSaved);
  const [showSaved, setShowSaved] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [colorInputError, setColorInputError] = useState("");
  const exportRef = useRef<HTMLDivElement>(null);

  const currentMode = MODES.find((m) => m.value === mode)!;

  // Close export dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const generate = useCallback(
    (targetMode: PaletteMode = mode, targetBase: string = baseColor) => {
      const hexes = getPaletteHexes(targetMode, targetBase);
      setPalette((prev) => {
        // Respect locked colors
        return hexes.map((hex, i) => {
          const existing = prev[i];
          if (existing?.locked) return { ...existing };
          return { id: uid(), hex, locked: false };
        });
      });
    },
    [mode, baseColor]
  );

  const handleModeChange = (newMode: PaletteMode) => {
    setMode(newMode);
    generate(newMode, baseColor);
  };

  const handleBaseColorChange = (hex: string) => {
    setInputColor(hex);
    // Validate hex
    if (/^#([0-9a-fA-F]{6})$/.test(hex)) {
      setColorInputError("");
      setBaseColor(hex);
      generate(mode, hex);
    } else {
      setColorInputError("Enter a valid 6-digit hex (e.g. #FF5733)");
    }
  };

  const handleColorPickerChange = (hex: string) => {
    setInputColor(hex);
    setBaseColor(hex);
    setColorInputError("");
    generate(mode, hex);
  };

  const toggleLock = (id: string) => {
    setPalette((prev) =>
      prev.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
    );
  };

  const copyColor = async (hex: string, id: string) => {
    const value = formatColor(hex, format);
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // fallback
    }
  };

  const copyAll = async () => {
    const values = palette.map((c) => formatColor(c.hex, format)).join("\n");
    try {
      await navigator.clipboard.writeText(values);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      // fallback
    }
  };

  const savePalette = () => {
    const updated = [palette.map((c) => ({ ...c, locked: false })), ...savedPalettes].slice(0, 10);
    setSavedPalettes(updated);
    savePalettes(updated);
  };

  const loadPalette = (saved: PaletteColor[]) => {
    setPalette(saved.map((c) => ({ ...c, id: uid() })));
  };

  const deleteSaved = (index: number) => {
    const updated = savedPalettes.filter((_, i) => i !== index);
    setSavedPalettes(updated);
    savePalettes(updated);
  };

  const exportCSS = () => {
    const lines = [
      ":root {",
      ...palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`),
      "}",
    ].join("\n");
    downloadText(lines, "palette.css");
    setExportOpen(false);
  };

  const exportJSON = () => {
    const obj = {
      mode,
      format: "hex",
      colors: palette.map((c, i) => ({
        name: `color-${i + 1}`,
        hex: c.hex,
        rgb: formatColor(c.hex, "rgb"),
        hsl: formatColor(c.hex, "hsl"),
      })),
    };
    downloadText(JSON.stringify(obj, null, 2), "palette.json");
    setExportOpen(false);
  };

  const exportTailwind = () => {
    const colors = palette.reduce<Record<string, string>>((acc, c, i) => {
      acc[`brand-${i + 1}`] = c.hex;
      return acc;
    }, {});
    const snippet = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colors, null, 6)}\n    }\n  }\n}`;
    downloadText(snippet, "tailwind-palette.js");
    setExportOpen(false);
  };

  const downloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generalModes = MODES.filter((m) => m.group === "General");
  const theoryModes = MODES.filter((m) => m.group === "Color Theory");

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5">
      {/* ── Controls ── */}
      <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 space-y-5">

        {/* Row 1: Mode selector */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider mr-1">Mode</span>
            <div className="flex flex-wrap gap-1.5">
              {generalModes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleModeChange(m.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    mode === m.value
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-theme-surface-muted text-theme-body hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Theory group */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-theme-muted uppercase tracking-wider mr-1">Theory</span>
            <div className="flex flex-wrap gap-1.5">
              {theoryModes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleModeChange(m.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    mode === m.value
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-theme-surface-muted text-theme-body hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Base color input + format + actions */}
        <div className="flex flex-wrap items-start gap-3">
          {/* Base color (always shown, disabled for random) */}
          <div className="flex-1 min-w-[220px] space-y-1.5">
            <label className="text-xs font-semibold text-theme-muted flex items-center gap-1.5">
              <IconColorPicker size={13} />
              Base Color
              {!currentMode.needsBase && (
                <span className="text-theme-muted font-normal">(not used in random mode)</span>
              )}
            </label>
            <div className="flex items-center gap-2">
              {/* Native color picker */}
              <div className="relative">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => handleColorPickerChange(e.target.value)}
                  disabled={!currentMode.needsBase}
                  className="w-10 h-9 rounded-lg border border-gray-600 bg-theme-surface-muted cursor-pointer p-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Pick a color"
                />
              </div>
              {/* Hex text input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={inputColor}
                  onChange={(e) => handleBaseColorChange(e.target.value)}
                  disabled={!currentMode.needsBase}
                  placeholder="#2563eb"
                  className="w-full bg-theme-surface-muted border border-gray-600 rounded-lg px-3 py-2 text-sm font-mono text-theme-heading placeholder-gray-500 focus:outline-none focus:border-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                />
                {colorInputError && (
                  <p className="text-red-400 text-[11px] mt-1">{colorInputError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Format selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-theme-muted">Format</label>
            <div className="flex gap-1">
              {(["hex", "rgb", "hsl"] as ColorFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    format === f
                      ? "bg-brand-primary text-white"
                      : "bg-theme-surface-muted text-theme-muted hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-theme-muted invisible">Actions</label>
            <div className="flex gap-2">
              <button
                onClick={() => generate()}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white rounded-lg text-sm font-semibold transition-all duration-200 active:scale-95"
              >
                <IconRefresh size={16} />
                Generate
              </button>

              <button
                onClick={copyAll}
                className="flex items-center gap-2 px-3 py-2 bg-theme-surface-muted hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-semibold transition-all duration-200 border border-gray-600 active:scale-95"
                title="Copy all colors"
              >
                {copiedAll ? <IconCheck size={16} className="text-green-400" /> : <IconCopy size={16} />}
                <span className="hidden sm:inline">Copy All</span>
              </button>

              <button
                onClick={savePalette}
                className="flex items-center gap-2 px-3 py-2 bg-theme-surface-muted hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-semibold transition-all duration-200 border border-gray-600 active:scale-95"
                title="Save palette"
              >
                <IconBookmark size={16} />
                <span className="hidden sm:inline">Save</span>
              </button>

              {/* Export dropdown */}
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setExportOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-theme-surface-muted hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-semibold transition-all duration-200 border border-gray-600"
                >
                  <IconDownload size={16} />
                  <span className="hidden sm:inline">Export</span>
                  <IconChevronDown size={13} className={`transition-transform ${exportOpen ? "rotate-180" : ""}`} />
                </button>
                {exportOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-theme-surface-muted border border-theme-border rounded-xl shadow-2xl z-20 overflow-hidden">
                    {[
                      { label: "CSS Variables", action: exportCSS, ext: ".css" },
                      { label: "JSON", action: exportJSON, ext: ".json" },
                      { label: "Tailwind Config", action: exportTailwind, ext: ".js" },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={opt.action}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-700 flex items-center justify-between transition-colors"
                      >
                        <span>{opt.label}</span>
                        <span className="text-xs text-theme-muted font-mono">{opt.ext}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Palette Display ── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:rounded-2xl sm:overflow-hidden"
        style={{ minHeight: "260px" }}>
        {palette.map((color, i) => (
          <ColorCard
            key={color.id}
            color={color}
            format={format}
            index={i}
            onToggleLock={toggleLock}
            onCopy={copyColor}
            isCopied={copiedId === color.id}
          />
        ))}
      </div>

      {/* ── Color detail table ── */}
      <div className="bg-theme-surface border border-theme-border/60 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-theme-border/60 flex items-center justify-between">
          <span className="text-sm font-semibold text-theme-body flex items-center gap-2">
            <IconPalette size={16} className="text-brand-primary" />
            Color Details
          </span>
          <span className="text-xs text-theme-muted">{palette.length} colors · click to copy</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme-border/60">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-theme-muted uppercase tracking-wider">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-theme-muted uppercase tracking-wider">Swatch</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-theme-muted uppercase tracking-wider">HEX</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-theme-muted uppercase tracking-wider">RGB</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-theme-muted uppercase tracking-wider">HSL</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-theme-muted uppercase tracking-wider">
                  <span className="block">On White</span>
                  <span className="block text-theme-body normal-case font-normal tracking-normal mt-0.5">as text on white bg</span>
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-theme-muted uppercase tracking-wider">
                  <span className="block">On Black</span>
                  <span className="block text-theme-body normal-case font-normal tracking-normal mt-0.5">as text on black bg</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {palette.map((c, i) => {
                const wContrast = contrastRatio(c.hex, "#ffffff");
                const bContrast = contrastRatio(c.hex, "#000000");
                const wcagW = wContrast >= 4.5 ? "Pass" : wContrast >= 3 ? "Large only" : "Fail";
                const wcagWTitle = wContrast >= 4.5 ? "Readable at any text size" : wContrast >= 3 ? "Readable only for large text (18px+ or bold 14px+)" : "Too low contrast — avoid as text";
                const wcagB = bContrast >= 4.5 ? "Pass" : bContrast >= 3 ? "Large only" : "Fail";
                const wcagBTitle = bContrast >= 4.5 ? "Readable at any text size" : bContrast >= 3 ? "Readable only for large text (18px+ or bold 14px+)" : "Too low contrast — avoid as text";
                return (
                  <tr
                    key={c.id}
                    className="border-b border-theme-border hover:bg-theme-surface-muted/40 transition-colors cursor-pointer"
                    onClick={() => copyColor(c.hex, c.id)}
                    title="Click to copy"
                  >
                    <td className="px-4 py-3 text-theme-muted font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div
                        className="w-8 h-8 rounded-lg border border-theme-border shadow-sm"
                        style={{ backgroundColor: c.hex }}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-200 text-xs">{c.hex.toUpperCase()}</td>
                    <td className="px-4 py-3 font-mono text-theme-body text-xs">{formatColor(c.hex, "rgb")}</td>
                    <td className="px-4 py-3 font-mono text-theme-body text-xs">{formatColor(c.hex, "hsl")}</td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        title={wcagWTitle}
                        className={`inline-flex items-center gap-1.5 font-mono`}
                      >
                        <span className="text-theme-body">{wContrast}:1</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          wcagW === "Pass" ? "bg-green-900/50 text-green-400 border border-green-700/50" :
                          wcagW === "Large only" ? "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50" :
                          "bg-red-900/50 text-red-400 border border-red-700/50"
                        }`}>{wcagW}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        title={wcagBTitle}
                        className={`inline-flex items-center gap-1.5 font-mono`}
                      >
                        <span className="text-theme-body">{bContrast}:1</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          wcagB === "Pass" ? "bg-green-900/50 text-green-400 border border-green-700/50" :
                          wcagB === "Large only" ? "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50" :
                          "bg-red-900/50 text-red-400 border border-red-700/50"
                        }`}>{wcagB}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="px-5 py-3 border-t border-theme-border flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span className="text-xs text-theme-muted font-medium">Readability legend:</span>
          <span className="flex items-center gap-1.5 text-xs text-theme-muted">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-900/50 text-green-400 border border-green-700/50">Pass</span>
            readable at any text size <span className="text-theme-body">(ratio ≥ 4.5:1)</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-theme-muted">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-900/50 text-yellow-400 border border-yellow-700/50">Large only</span>
            ok for headings only <span className="text-theme-body">(≥ 3:1)</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-theme-muted">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-900/50 text-red-400 border border-red-700/50">Fail</span>
            hard to read, avoid as text <span className="text-theme-body">(&lt; 3:1)</span>
          </span>
        </div>
      </div>

      {/* ── Saved Palettes ── */}
      {savedPalettes.length > 0 && (
        <div className="bg-theme-surface border border-theme-border/60 rounded-2xl overflow-hidden">
          <button
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-theme-surface-muted/40 transition-colors"
            onClick={() => setShowSaved((v) => !v)}
          >
            <span className="text-sm font-semibold text-theme-body flex items-center gap-2">
              <IconBookmarkFilled size={16} className="text-brand-primary" />
              Saved Palettes
              <span className="text-xs bg-brand-primary/20 text-brand-light px-2 py-0.5 rounded-full font-bold">
                {savedPalettes.length}
              </span>
            </span>
            <IconChevronDown
              size={16}
              className={`text-theme-muted transition-transform duration-200 ${showSaved ? "rotate-180" : ""}`}
            />
          </button>

          {showSaved && (
            <div className="border-t border-theme-border/60 divide-y divide-gray-800">
              {savedPalettes.map((saved, si) => (
                <div key={si} className="px-5 py-3 flex items-center gap-3 hover:bg-theme-surface-muted/30 transition-colors">
                  <div className="flex gap-1 flex-1">
                    {saved.map((c, ci) => (
                      <div
                        key={ci}
                        className="flex-1 h-9 rounded-md"
                        style={{ backgroundColor: c.hex }}
                        title={c.hex}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => loadPalette(saved)}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <IconWand size={12} />
                      Load
                    </button>
                    <button
                      onClick={() => deleteSaved(si)}
                      className="p-1.5 text-theme-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Mode explanation ── */}
      <ModeExplainer mode={mode} />
    </div>
  );
}

// ─── Mode Explainer ───────────────────────────────────────────────────────────

const MODE_DESCRIPTIONS: Record<PaletteMode, { title: string; desc: string }> = {
  random: {
    title: "Random Palette",
    desc: "Generates harmonious colors using golden-angle hue spacing for visually pleasing results. Great for exploration and discovering new color combinations.",
  },
  shades: {
    title: "Shades Palette",
    desc: "Creates 7 lightness variants of your base color — from near-white to deep shadow. Perfect for building design system scales like Tailwind's color shades.",
  },
  contrast: {
    title: "Contrast Palette",
    desc: "Produces high-contrast pairings and accents based on your base color. Useful for ensuring accessible UI with clear visual hierarchy.",
  },
  brand: {
    title: "Brand Palette",
    desc: "Generates a complete brand system: primary, light, dark, text, background, and an accent color — all derived from your brand's primary hue.",
  },
  complementary: {
    title: "Complementary",
    desc: "Pairs your color with its direct opposite on the color wheel (180°). Creates strong, vibrant contrast ideal for calls-to-action and highlights.",
  },
  triadic: {
    title: "Triadic",
    desc: "Selects three colors evenly spaced 120° apart on the color wheel. Balanced and vibrant, triadic schemes work well for playful, colorful designs.",
  },
  analogous: {
    title: "Analogous",
    desc: "Selects colors adjacent to each other on the color wheel (±30°–±60°). These harmonious palettes feel natural and are popular in nature-inspired design.",
  },
  "split-complementary": {
    title: "Split-Complementary",
    desc: "Uses your base color plus two colors flanking its complement (+150° and +210°). Softer contrast than complementary, with more variety.",
  },
  tetradic: {
    title: "Tetradic / Square",
    desc: "Four colors evenly spaced 90° apart. Rich, complex palette that works best when one color dominates. Suited for diverse, multi-element designs.",
  },
};

function ModeExplainer({ mode }: { mode: PaletteMode }) {
  const info = MODE_DESCRIPTIONS[mode];
  return (
    <div className="bg-theme-surface-muted/40 border border-theme-border/40 rounded-xl px-5 py-4 flex gap-3 items-start">
      <IconWand size={18} className="text-brand-primary mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-gray-200">{info.title}</p>
        <p className="text-sm text-theme-muted mt-0.5 leading-relaxed">{info.desc}</p>
      </div>
    </div>
  );
}
