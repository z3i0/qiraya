"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Sliders, Eye, Type, Layers, Headphones } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { UserSettings } from "@/types/quran";
import { VERSE_RECITERS, resolveReciter } from "@/lib/data/reciters";
import { useAudio } from "@/components/audio/audio-context";

interface ReadingSettingsDialogProps {
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
}

export function ReadingSettingsDialog({
  settings,
  onUpdateSettings,
}: ReadingSettingsDialogProps) {
  const t = useTranslations("reader");
  const locale = useLocale();
  const { setReciter } = useAudio();
  const currentReciterInfo = resolveReciter(settings.audioReciter);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-medium border-border"
          >
            <Sliders className="size-3.5" />
            <span>{t("readingPreferences")}</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Sliders className="size-4 text-primary" />
            <span>{t("readingPreferences")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-3">
          {/* Font Size Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Type className="size-4 text-muted-foreground" />
                {t("fontSize")}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {settings.arabicFontSize}px
              </span>
            </div>
            <div dir="ltr" className="space-y-1">
              <Slider
                value={[settings.arabicFontSize]}
                min={20}
                max={48}
                step={2}
                onValueChange={(val) => {
                  const newSize = Array.isArray(val) ? val[0] : (val as number);
                  if (typeof newSize === "number") {
                    onUpdateSettings({ arabicFontSize: newSize });
                  }
                }}
                className="py-1 cursor-pointer"
                aria-label={t("fontSize")}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>20px</span>
                <span>48px</span>
              </div>
            </div>
            {/* Live Font Preview */}
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-center overflow-x-auto">
              <p
                style={{ fontSize: `${settings.arabicFontSize}px` }}
                className="font-quran leading-relaxed text-foreground"
                dir="rtl"
              >
                {t("bismillah")}
              </p>
            </div>
          </div>

          {/* Translation Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div className="space-y-0.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Eye className="size-4 text-muted-foreground" />
                {t("showTranslation")}
              </span>
            </div>
            <Switch
              checked={settings.showTranslation}
              onCheckedChange={(checked) =>
                onUpdateSettings({ showTranslation: checked })
              }
              aria-label={t("showTranslation")}
            />
          </div>

          {/* Reading Mode */}
          <div className="space-y-2.5 py-2 border-t border-border">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Layers className="size-4 text-muted-foreground" />
              {t("readingMode")}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={settings.readingMode === "verse" ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdateSettings({ readingMode: "verse" })}
                className="w-full text-xs justify-center"
              >
                {t("modeVerse")}
              </Button>
              <Button
                type="button"
                variant={settings.readingMode === "mushaf" ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdateSettings({ readingMode: "mushaf" })}
                className="w-full text-xs justify-center"
              >
                {t("modeMushaf")}
              </Button>
            </div>
          </div>

          {/* Reciter Selection */}
          <div className="space-y-2.5 py-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Headphones className="size-4 text-muted-foreground" />
                {t("audioReciter")}
              </span>
            </div>
            <select
              value={currentReciterInfo.id}
              onChange={(e) => {
                const selectedId = e.target.value;
                onUpdateSettings({ audioReciter: selectedId });
                setReciter(selectedId);
              }}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-foreground text-xs font-medium outline-none cursor-pointer focus:ring-1 focus:ring-primary transition-all"
            >
              {VERSE_RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {locale === "ar" ? r.nameArabic : r.nameEnglish}
                </option>
              ))}
            </select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
