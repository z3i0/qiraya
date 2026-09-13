"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Download,
  Share2,
  Copy,
  Check,
  Square,
  Smartphone,
  Monitor,
  Sparkles,
  Loader2,
  Maximize2,
  Palette,
  Type,
  X,
} from "lucide-react";
import { cn } from "cn";

export interface VerseShareData {
  textArabic: string;
  textTranslation?: string;
  surahNameArabic?: string;
  surahNameEnglish?: string;
  surahNumber?: number;
  ayahNumberInSurah?: number;
}

interface VerseShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  verse: VerseShareData | null;
}

type AspectRatioType = "1:1" | "9:16" | "16:9";
type ThemeType =
  | "onyx"
  | "emerald"
  | "navy"
  | "amethyst"
  | "ruby"
  | "amber"
  | "teal"
  | "olive"
  | "slate"
  | "parchment";
type FontScaleType = "normal" | "large" | "xlarge";

interface ThemePalette {
  id: ThemeType;
  nameAr: string;
  nameEn: string;
  bgGradTop: string;
  bgGradBottom: string;
  borderColor: string;
  accentGold: string;
  textArabic: string;
  textTranslation: string;
  metaText: string;
  watermark: string;
  badgeBg: string;
  swatchBg: string;
  cornerAccent: string;
  centerGlow?: string;
  isLight?: boolean;
}

const THEMES: Record<ThemeType, ThemePalette> = {
  onyx: {
    id: "onyx",
    nameAr: "فاحم فاخر",
    nameEn: "Imperial Onyx",
    bgGradTop: "#0a0b0e",
    bgGradBottom: "#14151b",
    borderColor: "rgba(255, 255, 255, 0.12)",
    accentGold: "#e5a93c",
    textArabic: "#ffffff",
    textTranslation: "#94a3b8",
    metaText: "#d1d5db",
    watermark: "rgba(148, 163, 184, 0.7)",
    badgeBg: "rgba(255, 255, 255, 0.08)",
    swatchBg: "linear-gradient(135deg, #0a0b0e, #1e2029)",
    cornerAccent: "rgba(255, 255, 255, 0.14)",
    centerGlow: "rgba(255, 255, 255, 0.045)",
  },
  emerald: {
    id: "emerald",
    nameAr: "زمرد ملكي",
    nameEn: "Royal Emerald",
    bgGradTop: "#01160e",
    bgGradBottom: "#062c1d",
    borderColor: "rgba(52, 211, 153, 0.28)",
    accentGold: "#f5c553",
    textArabic: "#ffffff",
    textTranslation: "#94a3b8",
    metaText: "#6ee7b7",
    watermark: "rgba(167, 243, 208, 0.7)",
    badgeBg: "rgba(52, 211, 153, 0.09)",
    swatchBg: "linear-gradient(135deg, #01160e, #0e3d2c)",
    cornerAccent: "rgba(52, 211, 153, 0.22)",
    centerGlow: "rgba(52, 211, 153, 0.065)",
  },
  navy: {
    id: "navy",
    nameAr: "كحلي أندلسي",
    nameEn: "Andalusian Sapphire",
    bgGradTop: "#030917",
    bgGradBottom: "#0a1c38",
    borderColor: "rgba(96, 165, 250, 0.28)",
    accentGold: "#f5c252",
    textArabic: "#ffffff",
    textTranslation: "#94a3b8",
    metaText: "#93c5fd",
    watermark: "rgba(147, 197, 253, 0.7)",
    badgeBg: "rgba(96, 165, 250, 0.09)",
    swatchBg: "linear-gradient(135deg, #030917, #132a52)",
    cornerAccent: "rgba(96, 165, 250, 0.22)",
    centerGlow: "rgba(96, 165, 250, 0.065)",
  },
  amethyst: {
    id: "amethyst",
    nameAr: "أرجواني دمشقي",
    nameEn: "Damascene Velvet",
    bgGradTop: "#0e0619",
    bgGradBottom: "#1f0f33",
    borderColor: "rgba(192, 132, 252, 0.28)",
    accentGold: "#f5bf4f",
    textArabic: "#ffffff",
    textTranslation: "#c4b5fd",
    metaText: "#d8b4fe",
    watermark: "rgba(216, 180, 254, 0.7)",
    badgeBg: "rgba(192, 132, 252, 0.09)",
    swatchBg: "linear-gradient(135deg, #0e0619, #2b1547)",
    cornerAccent: "rgba(192, 132, 252, 0.22)",
    centerGlow: "rgba(192, 132, 252, 0.065)",
  },
  ruby: {
    id: "ruby",
    nameAr: "عقيقي سلطاني",
    nameEn: "Imperial Garnet",
    bgGradTop: "#17060b",
    bgGradBottom: "#2c0d16",
    borderColor: "rgba(244, 63, 94, 0.28)",
    accentGold: "#f3c467",
    textArabic: "#ffffff",
    textTranslation: "#fecdd3",
    metaText: "#fca5a5",
    watermark: "rgba(254, 205, 211, 0.7)",
    badgeBg: "rgba(244, 63, 94, 0.09)",
    swatchBg: "linear-gradient(135deg, #17060b, #3d121f)",
    cornerAccent: "rgba(244, 63, 94, 0.22)",
    centerGlow: "rgba(244, 63, 94, 0.06)",
  },
  amber: {
    id: "amber",
    nameAr: "كهرماني مذهب",
    nameEn: "Gilded Amber",
    bgGradTop: "#140b03",
    bgGradBottom: "#281708",
    borderColor: "rgba(245, 158, 11, 0.3)",
    accentGold: "#fbbf24",
    textArabic: "#ffffff",
    textTranslation: "#fde68a",
    metaText: "#fcd34d",
    watermark: "rgba(253, 230, 138, 0.7)",
    badgeBg: "rgba(245, 158, 11, 0.1)",
    swatchBg: "linear-gradient(135deg, #140b03, #3a200c)",
    cornerAccent: "rgba(245, 158, 11, 0.24)",
    centerGlow: "rgba(245, 158, 11, 0.07)",
  },
  teal: {
    id: "teal",
    nameAr: "فيروزي قاهري",
    nameEn: "Cairo Turquoise",
    bgGradTop: "#021316",
    bgGradBottom: "#06282e",
    borderColor: "rgba(45, 212, 191, 0.28)",
    accentGold: "#f5c553",
    textArabic: "#ffffff",
    textTranslation: "#99f6e4",
    metaText: "#5eead4",
    watermark: "rgba(153, 246, 228, 0.7)",
    badgeBg: "rgba(45, 212, 191, 0.09)",
    swatchBg: "linear-gradient(135deg, #021316, #0c3841)",
    cornerAccent: "rgba(45, 212, 191, 0.22)",
    centerGlow: "rgba(45, 212, 191, 0.065)",
  },
  olive: {
    id: "olive",
    nameAr: "زيتي حجازي",
    nameEn: "Hejaz Olive",
    bgGradTop: "#0b1408",
    bgGradBottom: "#172511",
    borderColor: "rgba(163, 230, 53, 0.26)",
    accentGold: "#eab308",
    textArabic: "#ffffff",
    textTranslation: "#d9f99d",
    metaText: "#bef264",
    watermark: "rgba(217, 249, 157, 0.7)",
    badgeBg: "rgba(163, 230, 53, 0.08)",
    swatchBg: "linear-gradient(135deg, #0b1408, #23391a)",
    cornerAccent: "rgba(163, 230, 53, 0.20)",
    centerGlow: "rgba(163, 230, 53, 0.06)",
  },
  slate: {
    id: "slate",
    nameAr: "بلاتيني نورديك",
    nameEn: "Nordic Platinum",
    bgGradTop: "#101318",
    bgGradBottom: "#1c222b",
    borderColor: "rgba(203, 213, 225, 0.20)",
    accentGold: "#e2ba72",
    textArabic: "#ffffff",
    textTranslation: "#94a3b8",
    metaText: "#cbd5e1",
    watermark: "rgba(203, 213, 225, 0.7)",
    badgeBg: "rgba(203, 213, 225, 0.08)",
    swatchBg: "linear-gradient(135deg, #101318, #2a3340)",
    cornerAccent: "rgba(203, 213, 225, 0.18)",
    centerGlow: "rgba(203, 213, 225, 0.05)",
  },
  parchment: {
    id: "parchment",
    nameAr: "عاجي أصيل",
    nameEn: "Antique Manuscript",
    bgGradTop: "#fcf8f0",
    bgGradBottom: "#ede3cf",
    borderColor: "rgba(180, 140, 75, 0.35)",
    accentGold: "#854d0e",
    textArabic: "#17120d",
    textTranslation: "#473b2c",
    metaText: "#78350f",
    watermark: "rgba(71, 85, 105, 0.75)",
    badgeBg: "rgba(255, 255, 255, 0.85)",
    swatchBg: "linear-gradient(135deg, #fcf8f0, #ede3cf)",
    cornerAccent: "rgba(180, 140, 75, 0.32)",
    centerGlow: "rgba(180, 140, 75, 0.06)",
    isLight: true,
  },
};

const ASPECT_RATIOS: Record<
  AspectRatioType,
  {
    width: number;
    height: number;
    icon: React.ElementType;
    labelAr: string;
    labelEn: string;
    subAr: string;
    subEn: string;
  }
> = {
  "1:1": {
    width: 1200,
    height: 1200,
    icon: Square,
    labelAr: "مربع (1:1)",
    labelEn: "Square (1:1)",
    subAr: "للمنشورات وتويتر",
    subEn: "Instagram & Feeds",
  },
  "9:16": {
    width: 1080,
    height: 1920,
    icon: Smartphone,
    labelAr: "ستوري (9:16)",
    labelEn: "Story (9:16)",
    subAr: "للحالات والريلز",
    subEn: "Stories & Reels",
  },
  "16:9": {
    width: 1920,
    height: 1080,
    icon: Monitor,
    labelAr: "عريض (16:9)",
    labelEn: "Wide (16:9)",
    subAr: "للشاشات والبانر",
    subEn: "Landscape & Desktop",
  },
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

const toArabicDigits = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

function getCanvasFonts(): { arabic: string; sans: string; quran: string } {
  return {
    quran: '"Amiri", "Scheherazade New", serif',
    arabic: '"IBM Plex Sans Arabic", -apple-system, sans-serif',
    sans: '"Plus Jakarta Sans", system-ui, sans-serif',
  };
}

async function ensureFontsLoaded(arabicText: string): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.allSettled([
      document.fonts.load('700 48px Amiri', arabicText),
      document.fonts.load('400 36px Amiri', 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'),
      document.fonts.load('700 30px "IBM Plex Sans Arabic"'),
      document.fonts.load('700 24px "IBM Plex Sans Arabic"'),
      document.fonts.load('400 20px "IBM Plex Sans Arabic"'),
    ]);
  } catch (err) {
    console.warn("Font preloading fallback:", err);
  }
  try {
    await document.fonts.ready;
  } catch {}
}

export function VerseShareModal({
  isOpen,
  onClose,
  verse,
}: VerseShareModalProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("1:1");
  const [theme, setTheme] = useState<ThemeType>("onyx");
  const [fontScale, setFontScale] = useState<FontScaleType>("large");
  const [includeTranslation, setIncludeTranslation] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [mounted, setMounted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut (Esc to close) and body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // Preload logo image
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = "/images/logo/logo-icon.png";
      img.onload = () => {
        logoImageRef.current = img;
        setLogoLoaded(true);
      };
      if (img.complete && img.naturalWidth > 0) {
        logoImageRef.current = img;
        setLogoLoaded(true);
      }
    }
  }, []);

  const drawCanvas = useCallback(() => {
    if (!verse) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsRendering(true);

    const { width, height } = ASPECT_RATIOS[aspectRatio];
    canvas.width = width;
    canvas.height = height;

    const currentPalette = THEMES[theme];
    const canvasFonts = getCanvasFonts();

    // 1. Outer Card Rounded Clipping
    ctx.clearRect(0, 0, width, height);
    const cardRadius = aspectRatio === "9:16" ? 54 : 46;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, cardRadius);
    ctx.clip();

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, currentPalette.bgGradTop);
    bgGrad.addColorStop(1, currentPalette.bgGradBottom);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Center Glow to make the white text pop
    const centerGlow = ctx.createRadialGradient(
      width / 2,
      height / 2,
      30,
      width / 2,
      height / 2,
      Math.min(width, height) * 0.72
    );
    centerGlow.addColorStop(0, currentPalette.centerGlow || "rgba(255, 255, 255, 0.045)");
    centerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    // 2. Corner Bracket Accents (as in reference design)
    const cornerRadius = 32;
    const cornerOffset = 42;
    ctx.save();
    ctx.strokeStyle = currentPalette.cornerAccent || "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2;

    // Top-Left corner
    ctx.beginPath();
    ctx.arc(
      cornerOffset + cornerRadius,
      cornerOffset + cornerRadius,
      cornerRadius,
      Math.PI,
      1.5 * Math.PI
    );
    ctx.stroke();

    // Top-Right corner
    ctx.beginPath();
    ctx.arc(
      width - cornerOffset - cornerRadius,
      cornerOffset + cornerRadius,
      cornerRadius,
      1.5 * Math.PI,
      2 * Math.PI
    );
    ctx.stroke();

    // Bottom-Right corner
    ctx.beginPath();
    ctx.arc(
      width - cornerOffset - cornerRadius,
      height - cornerOffset - cornerRadius,
      cornerRadius,
      0,
      0.5 * Math.PI
    );
    ctx.stroke();

    // Bottom-Left corner
    ctx.beginPath();
    ctx.arc(
      cornerOffset + cornerRadius,
      height - cornerOffset - cornerRadius,
      cornerRadius,
      0.5 * Math.PI,
      Math.PI
    );
    ctx.stroke();
    ctx.restore();

    // 3. Proportional Layout Config per Aspect Ratio
    let basmalahY: number;
    let basmalahFontSize: number;
    let badgeY: number;
    let badgeH: number;
    let badgePadX: number;
    let badgeFontSize: number;
    let brandCenterY: number;
    let logoSize: number;
    let pillH: number;
    let pillPadX: number;
    let brandFontSize: number;
    let baseFontSize: number;
    let maxTextWidth: number;
    let transFontSize: number;
    let transLineHeight: number;

    const textLen = verse.textArabic.length;

    if (aspectRatio === "9:16") {
      // 1080 x 1920 (Story / Reel)
      basmalahY = 220;
      basmalahFontSize = 52;
      badgeY = basmalahY + 62;
      badgeH = 48;
      badgePadX = 28;
      badgeFontSize = 23;

      brandCenterY = height - 140;
      logoSize = 52;
      pillH = 72;
      pillPadX = 32;
      brandFontSize = 30;

      maxTextWidth = Math.round(width * 0.88);
      transFontSize = 30;
      transLineHeight = 44;

      if (textLen < 60) baseFontSize = 100;
      else if (textLen < 120) baseFontSize = 86;
      else if (textLen < 200) baseFontSize = 74;
      else if (textLen < 300) baseFontSize = 62;
      else baseFontSize = 52;
    } else if (aspectRatio === "16:9") {
      // 1920 x 1080 (Banner / Landscape)
      basmalahY = 110;
      basmalahFontSize = 38;
      badgeY = basmalahY + 48;
      badgeH = 40;
      badgePadX = 22;
      badgeFontSize = 19;

      brandCenterY = height - 85;
      logoSize = 40;
      pillH = 56;
      pillPadX = 24;
      brandFontSize = 24;

      maxTextWidth = Math.round(width * 0.82);
      transFontSize = 24;
      transLineHeight = 36;

      if (textLen < 60) baseFontSize = 80;
      else if (textLen < 120) baseFontSize = 68;
      else if (textLen < 200) baseFontSize = 58;
      else if (textLen < 300) baseFontSize = 48;
      else baseFontSize = 40;
    } else {
      // 1:1 (1200 x 1200 - Square feed)
      basmalahY = 135;
      basmalahFontSize = 46;
      badgeY = basmalahY + 54;
      badgeH = 44;
      badgePadX = 24;
      badgeFontSize = 21;

      brandCenterY = height - 100;
      logoSize = 48;
      pillH = 66;
      pillPadX = 28;
      brandFontSize = 28;

      maxTextWidth = Math.round(width * 0.86);
      transFontSize = 28;
      transLineHeight = 42;

      if (textLen < 60) baseFontSize = 92;
      else if (textLen < 120) baseFontSize = 80;
      else if (textLen < 200) baseFontSize = 68;
      else if (textLen < 300) baseFontSize = 56;
      else baseFontSize = 46;
    }

    // 4. Draw Basmalah Calligraphy (Rich Calligraphy Gold)
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `normal ${basmalahFontSize}px ${canvasFonts.quran}`;
    ctx.fillStyle = currentPalette.accentGold;
    ctx.fillText("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", width / 2, basmalahY);
    ctx.restore();

    // 5. Draw Surah & Ayah Badge Pill
    const surahCleanName =
      verse.surahNameArabic?.replace(/^سُورَةُ\s*|^سورة\s*/, "") || "الفاتحة";
    const badgeText = isRtl
      ? `سُورَةُ ${surahCleanName} • الآية ${toArabicDigits(verse.ayahNumberInSurah || 1)}`
      : `Surah ${verse.surahNameEnglish || "Al-Fatihah"} • Ayah ${verse.ayahNumberInSurah || 1}`;

    ctx.save();
    ctx.font = `bold ${badgeFontSize}px ${canvasFonts.arabic}`;
    const badgeTextW = ctx.measureText(badgeText).width;
    const badgeW = badgeTextW + badgePadX * 2;

    ctx.fillStyle = currentPalette.badgeBg;
    ctx.strokeStyle = currentPalette.borderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(width / 2 - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, badgeH / 2);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = currentPalette.metaText;
    ctx.fillText(badgeText, width / 2, badgeY + 1);
    ctx.restore();

    // 6. Translation Setup (if enabled)
    const hasTranslation =
      includeTranslation &&
      Boolean(verse.textTranslation && verse.textTranslation.trim());

    let transLines: string[] = [];
    let totalTransHeight = 0;

    if (hasTranslation && verse.textTranslation) {
      ctx.font = `italic 400 ${transFontSize}px ${canvasFonts.sans}`;
      transLines = wrapText(
        ctx,
        `“${verse.textTranslation.trim()}”`,
        Math.round(maxTextWidth * 0.9)
      );
      if (transLines.length > 3) {
        transLines = transLines.slice(0, 3);
        transLines[2] = transLines[2].replace(/\s+\S*$/, "...");
      }
      totalTransHeight = transLines.length * transLineHeight + 48;
    }

    // 7. Middle Area: Verse Typography
    const headerBottom = badgeY + badgeH / 2 + 25;
    const footerTop = brandCenterY - pillH / 2 - 25;
    const availableMiddleH = footerTop - headerBottom;
    const maxAllowedArabicH = availableMiddleH - totalTransHeight - 20;

    // Scale multiplier: normal (0.88), large (1.05), xlarge (1.22)
    const scaleMultiplier =
      fontScale === "xlarge" ? 1.22 : fontScale === "large" ? 1.05 : 0.88;

    let currentFontSize = Math.round(baseFontSize * scaleMultiplier);

    const ayahBadge = verse.ayahNumberInSurah
      ? ` ۝${toArabicDigits(verse.ayahNumberInSurah)}`
      : "";
    const fullArabicText = `${verse.textArabic.trim()}${ayahBadge}`;

    let verseLines: string[] = [];
    let arabicLineHeight = Math.round(currentFontSize * 1.72);

    while (currentFontSize > 28) {
      ctx.font = `700 ${currentFontSize}px ${canvasFonts.quran}`;
      verseLines = wrapText(ctx, fullArabicText, maxTextWidth);
      arabicLineHeight = Math.round(currentFontSize * 1.72);
      const testTotalH = verseLines.length * arabicLineHeight;

      if (testTotalH <= maxAllowedArabicH) {
        break;
      }
      currentFontSize -= 2;
    }

    const totalArabicHeight = verseLines.length * arabicLineHeight;
    const totalContentHeight = totalArabicHeight + totalTransHeight;

    const startY =
      headerBottom +
      Math.max(16, Math.round((availableMiddleH - totalContentHeight) / 2)) +
      arabicLineHeight / 2;

    // Render Quranic Text (Pure, Crisp White with full tashkeel)
    ctx.save();
    ctx.font = `700 ${currentFontSize}px ${canvasFonts.quran}`;
    ctx.fillStyle = currentPalette.textArabic;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    verseLines.forEach((line, index) => {
      const lineY = startY + index * arabicLineHeight;
      ctx.fillText(line, width / 2, lineY);
    });
    ctx.restore();

    // Render Translation Text (if enabled)
    if (hasTranslation && transLines.length > 0) {
      ctx.save();
      const transStartY =
        startY +
        (verseLines.length - 1) * arabicLineHeight +
        Math.round(currentFontSize * 0.65) +
        24;

      // Decorative divider with centered diamond
      const divW = Math.min(220, Math.round(maxTextWidth * 0.35));
      ctx.strokeStyle = currentPalette.borderColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - divW / 2, transStartY);
      ctx.lineTo(width / 2 + divW / 2, transStartY);
      ctx.stroke();

      // Centered decorative diamond
      ctx.fillStyle = currentPalette.accentGold;
      const dSize = 5;
      ctx.beginPath();
      ctx.moveTo(width / 2, transStartY - dSize);
      ctx.lineTo(width / 2 + dSize, transStartY);
      ctx.lineTo(width / 2, transStartY + dSize);
      ctx.lineTo(width / 2 - dSize, transStartY);
      ctx.closePath();
      ctx.fill();

      // Translation text
      ctx.font = `italic 400 ${transFontSize}px ${canvasFonts.sans}`;
      ctx.fillStyle = currentPalette.textTranslation;

      transLines.forEach((line, idx) => {
        ctx.fillText(line, width / 2, transStartY + 32 + idx * transLineHeight);
      });
      ctx.restore();
    }

    // 8. Brand Footer Pill (Dark Pill with Qiraya square logo + text)
    const logoImg = logoImageRef.current;
    ctx.save();
    const brandName = isRtl ? "قِراية" : "Qiraya";
    const gap = Math.round(logoSize * 0.28);
    const logoRadius = Math.round(logoSize * 0.24);

    ctx.font = `bold ${brandFontSize}px ${canvasFonts.arabic}`;
    const nameW = ctx.measureText(brandName).width;

    const totalContentW = logoSize + gap + nameW;
    const pillW = totalContentW + pillPadX * 2;
    const pillX = Math.round(width / 2 - pillW / 2);
    const pillY = Math.round(brandCenterY - pillH / 2);
    const textCenterY = Math.round(pillY + pillH / 2);

    ctx.fillStyle = currentPalette.badgeBg;
    ctx.strokeStyle = currentPalette.borderColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.stroke();

    if (isRtl) {
      const logoX = pillX + pillW - pillPadX - logoSize;
      const logoY = Math.round(pillY + (pillH - logoSize) / 2);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, logoRadius);
      ctx.fillStyle = "#020035";
      ctx.fill();
      ctx.clip();

      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      } else {
        ctx.fillStyle = currentPalette.accentGold;
        ctx.font = `${Math.round(logoSize * 0.55)}px ${canvasFonts.arabic}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("📖", logoX + logoSize / 2, logoY + logoSize / 2);
      }
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = currentPalette.isLight ? "rgba(133, 77, 14, 0.25)" : "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, logoRadius);
      ctx.stroke();
      ctx.restore();

      const nameRightX = logoX - gap;
      ctx.textBaseline = "middle";
      ctx.textAlign = "right";
      ctx.font = `bold ${brandFontSize}px ${canvasFonts.arabic}`;
      ctx.fillStyle = currentPalette.metaText;
      ctx.fillText(brandName, nameRightX, textCenterY + 1);
    } else {
      const logoX = pillX + pillPadX;
      const logoY = Math.round(pillY + (pillH - logoSize) / 2);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, logoRadius);
      ctx.fillStyle = "#020035";
      ctx.fill();
      ctx.clip();

      if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      } else {
        ctx.fillStyle = currentPalette.accentGold;
        ctx.font = `${Math.round(logoSize * 0.55)}px ${canvasFonts.arabic}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("📖", logoX + logoSize / 2, logoY + logoSize / 2);
      }
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = currentPalette.isLight ? "rgba(133, 77, 14, 0.25)" : "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, logoRadius);
      ctx.stroke();
      ctx.restore();

      const nameLeftX = logoX + logoSize + gap;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.font = `bold ${brandFontSize}px ${canvasFonts.arabic}`;
      ctx.fillStyle = currentPalette.metaText;
      ctx.fillText(brandName, nameLeftX, textCenterY + 1);
    }
    ctx.restore();

    // End outer card clipping
    ctx.restore();

    setIsRendering(false);
  }, [verse, aspectRatio, theme, fontScale, includeTranslation, isRtl, logoLoaded]);

  // Ensure fonts are loaded before drawing
  useEffect(() => {
    if (!isOpen || !verse) return;
    let isMounted = true;
    setIsRendering(true);

    ensureFontsLoaded(verse.textArabic).then(() => {
      if (isMounted) {
        drawCanvas();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    verse,
    aspectRatio,
    theme,
    fontScale,
    includeTranslation,
    isRtl,
    logoLoaded,
    drawCanvas,
  ]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !verse) return;
    const link = document.createElement("a");
    const surahTag = verse.surahNumber ? `surah-${verse.surahNumber}` : "surah";
    const ayahTag = verse.ayahNumberInSurah
      ? `-ayah-${verse.ayahNumberInSurah}`
      : "";
    link.download = `qiraya-${surahTag}${ayahTag}-${aspectRatio.replace(":", "-")}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  const copyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png", 1.0)
      );
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      downloadImage();
    }
  };

  const shareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !verse) return;
    setIsSharing(true);

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png", 1.0)
      );
      if (!blob) throw new Error("Canvas blob failed");

      const file = new File(
        [blob],
        `qiraya-verse-${verse.surahNumber || "share"}.png`,
        { type: "image/png" }
      );

      const shareData = {
        title: verse.surahNameArabic
          ? `${verse.surahNameArabic} - آية ${verse.ayahNumberInSurah}`
          : "قِراية - آية من القرآن الكريم",
        text: `${verse.textArabic}\n\n— عبر منصة قِراية`,
        files: [file],
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: window.location.href,
        });
      } else {
        downloadImage();
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        downloadImage();
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (!verse || !mounted) return null;
  if (!isOpen) return null;

  const surahCleanName =
    verse.surahNameArabic?.replace(/^سُورَةُ\s*|^سورة\s*/, "") || "الفاتحة";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isRtl ? "استوديو مشاركة الآية" : "Verse Share Studio"}
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-2xl text-foreground select-none overflow-hidden animate-in fade-in-0 duration-200"
    >
      {/* Invisible preloader for Amiri and IBM Plex fonts */}
      <div
        aria-hidden="true"
        className="sr-only pointer-events-none opacity-0 select-none absolute -top-[9999px] -left-[9999px]"
      >
        <span className="font-quran font-bold text-4xl">{verse.textArabic}</span>
        <span className="font-quran font-normal text-2xl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
        <span className="font-arabic font-bold text-lg">{verse.surahNameArabic} قِراية</span>
      </div>

      {/* Top Studio Header */}
      <header className="h-14 sm:h-16 border-b border-border/50 bg-card/70 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Right in RTL: Close Button + Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title={isRtl ? "إغلاق (Esc)" : "Close (Esc)"}
          >
            <X className="size-5" />
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="size-7 sm:size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Sparkles className="size-3.5 sm:size-4" />
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-foreground truncate">
                {isRtl ? "استوديو مشاركة الآية" : "Verse Share Studio"}
              </h2>
              <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/40 shrink-0 hidden sm:inline-block">
                سُورَةُ {surahCleanName} • آية {toArabicDigits(verse.ayahNumberInSurah || 1)}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Quick Aspect Ratio Switcher on Desktop */}
        <div className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
          {(Object.keys(ASPECT_RATIOS) as AspectRatioType[]).map((ar) => {
            const item = ASPECT_RATIOS[ar];
            const Icon = item.icon;
            const isSelected = aspectRatio === ar;
            return (
              <button
                key={ar}
                type="button"
                onClick={() => setAspectRatio(ar)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  isSelected
                    ? "bg-card text-foreground shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-3.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                <span>{isRtl ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Left in RTL: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyImage}
            className="h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-medium gap-1.5 border-border/60 hover:bg-muted/60 cursor-pointer hidden sm:inline-flex"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-medium">{isRtl ? "تم النسخ" : "Copied"}</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5 text-muted-foreground" />
                <span>{isRtl ? "نسخ" : "Copy"}</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareImage}
            disabled={isSharing}
            className="h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-medium gap-1.5 border-border/60 hover:bg-muted/60 cursor-pointer"
          >
            <Share2 className="size-3.5 text-primary" />
            <span className="hidden sm:inline">{isRtl ? "مشاركة" : "Share"}</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={downloadImage}
            className="h-9 px-3 sm:px-4 rounded-xl text-xs font-bold gap-1.5 sm:gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md cursor-pointer transition-all active:scale-[0.98]"
          >
            <Download className="size-3.5" />
            <span>{isRtl ? "تنزيل" : "Download"}</span>
          </Button>
        </div>
      </header>

      {/* Main Studio Body: Responsive Stage & Controls Dock */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview Stage Area */}
        <main className="flex-1 min-h-[260px] relative flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 bg-muted/10 overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

          {/* Canvas Viewport Frame */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center max-h-full">
            {isRendering && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
                <Loader2 className="size-8 text-primary animate-spin" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className={cn(
                "rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] ring-1 ring-border/40 object-contain transition-all duration-300 max-h-[calc(100vh-250px)] max-w-[92vw] sm:max-w-[85vw] lg:max-w-full",
                aspectRatio === "9:16" && "aspect-[9/16]",
                aspectRatio === "1:1" && "aspect-square",
                aspectRatio === "16:9" && "aspect-[16/9]"
              )}
            />
          </div>

          {/* Canvas Specification Badge */}
          <div className="mt-2.5 sm:mt-3 flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-card/80 px-3.5 py-1 rounded-full border border-border/50 shadow-2xs shrink-0 z-10">
            <span>{ASPECT_RATIOS[aspectRatio].width} × {ASPECT_RATIOS[aspectRatio].height}px</span>
            <span className="text-border">•</span>
            <span>{isRtl ? ASPECT_RATIOS[aspectRatio].labelAr : ASPECT_RATIOS[aspectRatio].labelEn}</span>
            <span className="text-border">•</span>
            <span>PNG عالية الدقة</span>
          </div>
        </main>

        {/* Controls Dock Sidebar */}
        <aside className="w-full lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-s border-border/50 bg-card/70 backdrop-blur-md flex flex-col max-h-[50vh] lg:max-h-none overflow-y-auto p-4 sm:p-5 lg:p-6 gap-5 z-20">
          {/* Section 1: Aspect Ratio */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Maximize2 className="size-3.5 text-primary" />
                {isRtl ? "أبعاد ومقاس الصورة" : "Aspect Ratio"}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground font-normal">
                {ASPECT_RATIOS[aspectRatio].width}×{ASPECT_RATIOS[aspectRatio].height}
              </span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ASPECT_RATIOS) as AspectRatioType[]).map((ar) => {
                const item = ASPECT_RATIOS[ar];
                const Icon = item.icon;
                const isSelected = aspectRatio === ar;
                return (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => setAspectRatio(ar)}
                    className={cn(
                      "flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all text-center gap-1 cursor-pointer",
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-xs font-bold ring-1 ring-primary/30"
                        : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-semibold leading-tight">{isRtl ? item.labelAr : item.labelEn}</span>
                    <span className="text-[10px] opacity-75">{isRtl ? item.subAr : item.subEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Themes & Color Palettes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Palette className="size-3.5 text-primary" />
                {isRtl ? "نمط التصميم والألوان" : "Color Theme"}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50 border border-border/40">
                {Object.keys(THEMES).length} {isRtl ? "أنماط فاخرة" : "themes"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {(Object.keys(THEMES) as ThemeType[]).map((th) => {
                const pal = THEMES[th];
                const isSelected = theme === th;
                return (
                  <button
                    key={th}
                    type="button"
                    onClick={() => setTheme(th)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer text-start group",
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30 shadow-xs"
                        : "border-border/60 bg-muted/20 hover:bg-muted/50 text-foreground hover:border-border"
                    )}
                  >
                    <span
                      className="size-6 rounded-lg border border-white/20 shadow-xs shrink-0 flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ background: pal.swatchBg }}
                    >
                      {isSelected && (
                        <Check
                          className={cn(
                            "size-3.5 drop-shadow-md",
                            pal.isLight ? "text-amber-950" : "text-white"
                          )}
                        />
                      )}
                    </span>
                    <span className={cn("text-xs font-semibold truncate", isSelected ? "text-primary" : "text-foreground")}>
                      {isRtl ? pal.nameAr : pal.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Quran Font Size */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Type className="size-3.5 text-primary" />
              {isRtl ? "حجم خط الآية" : "Quran Font Size"}
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50">
              {(
                [
                  { id: "normal", ar: "صغير", en: "Compact" },
                  { id: "large", ar: "متوسط", en: "Medium" },
                  { id: "xlarge", ar: "كبير", en: "Large" },
                ] as const
              ).map((opt) => {
                const isSelected = fontScale === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFontScale(opt.id)}
                    className={cn(
                      "py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center",
                      isSelected
                        ? "bg-card text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isRtl ? opt.ar : opt.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Content Options (Translation) */}
          {verse.textTranslation && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/50">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-foreground block">
                  {isRtl ? "إظهار الترجمة الإنجليزية" : "English Translation"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isRtl ? "عرض الترجمة المعنوية أسفل الآية" : "Show translation below Arabic text"}
                </span>
              </div>
              <Switch
                checked={includeTranslation}
                onCheckedChange={setIncludeTranslation}
              />
            </div>
          )}

          {/* Section 5: Action Buttons (Bottom) */}
          <div className="space-y-2.5 pt-3 border-t border-border/50 mt-auto">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={downloadImage}
              className="w-full gap-2.5 text-sm font-bold rounded-xl h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md cursor-pointer transition-all active:scale-[0.99]"
            >
              <Download className="size-4.5 shrink-0" />
              <span>{isRtl ? "تنزيل الصورة PNG" : "Download Image PNG"}</span>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={shareImage}
                disabled={isSharing}
                className="h-10 rounded-xl border-border/60 hover:bg-muted/60 font-medium text-xs px-3 gap-2 cursor-pointer transition-all"
              >
                <Share2 className="size-4 shrink-0 text-primary" />
                <span className="whitespace-nowrap">{isRtl ? "مشاركة" : "Share"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={copyImage}
                className="h-10 rounded-xl border-border/60 hover:bg-muted/60 font-medium text-xs px-3 gap-2 cursor-pointer transition-all"
              >
                {copied ? (
                  <>
                    <Check className="size-4 shrink-0 text-emerald-500" />
                    <span className="text-emerald-500 font-medium whitespace-nowrap">
                      {isRtl ? "تم النسخ" : "Copied"}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4 shrink-0 text-muted-foreground" />
                    <span className="whitespace-nowrap">{isRtl ? "نسخ الصورة" : "Copy"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}
