"use client";

import React, { useState, useTransition, useSyncExternalStore } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useTheme } from "next-themes";

import { useQirayaStorage } from "@/hooks/use-local-storage";
import { VERSE_RECITERS, resolveReciter } from "@/lib/data/reciters";
import { useAudio } from "@/components/audio/audio-context";
import {
  Sun,
  Moon,
  Monitor,
  Type,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const emptySubscribe = () => () => {};

export function SettingsView() {
  const t = useTranslations("settings");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { setReciter } = useAudio();


  const { settings, updateSettings, resetAll, isLoaded } = useQirayaStorage();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLanguageChange = (newLocale: "ar" | "en") => {
    if (newLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  const handleReset = () => {
    if (window.confirm(t("clearDataDesc"))) {
      resetAll();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-pulse">
        <header className="text-center sm:text-start pb-6 border-b border-border">
          <div className="h-8 w-48 bg-muted/60 rounded-lg" />
          <div className="h-4 w-64 bg-muted/40 rounded-lg mt-2" />
        </header>
        <div className="space-y-6">
          <div className="h-44 bg-muted/30 rounded-2xl border border-border/40" />
          <div className="h-44 bg-muted/30 rounded-2xl border border-border/40" />
          <div className="h-44 bg-muted/30 rounded-2xl border border-border/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <header className="text-center sm:text-start pb-6 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-arabic font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </header>

      <div className="space-y-6">
        {/* Appearance & Theme */}
        <Card className="p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Sun className="size-4 text-primary" />
            <span>{t("appearance")}</span>
          </h2>

          {/* Interface Language */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div>
              <h3 className="font-medium text-sm text-foreground">
                {t("language")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("languageDesc")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={locale === "ar" ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange("ar")}
                disabled={isPending}
                className="text-xs rounded-full font-medium"
              >
                {t("arabic")}
              </Button>
              <Button
                variant={locale === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange("en")}
                disabled={isPending}
                className="text-xs rounded-full font-medium"
              >
                {t("english")}
              </Button>
            </div>
          </div>

          {/* Theme */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border/50">
            <div>
              <h3 className="font-medium text-sm text-foreground">
                {t("theme")}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={mounted && theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="text-xs rounded-full font-medium gap-1.5"
              >
                <Sun className="size-3.5" />
                {t("themeLight")}
              </Button>
              <Button
                variant={mounted && theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="text-xs rounded-full font-medium gap-1.5"
              >
                <Moon className="size-3.5" />
                {t("themeDark")}
              </Button>
              <Button
                variant={mounted && theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="text-xs rounded-full font-medium gap-1.5"
              >
                <Monitor className="size-3.5" />
                {t("themeSystem")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Reading Preferences */}
        <Card className="p-5 sm:p-6 space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Type className="size-4 text-primary" />
            <span>{t("readingPreferences")}</span>
          </h2>

          {/* Arabic Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t("arabicFontSize")}</span>
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
                    updateSettings({ arabicFontSize: newSize });
                  }
                }}
                className="py-1 cursor-pointer"
                aria-label={t("arabicFontSize")}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>20px</span>
                <span>48px</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border text-center overflow-x-auto">
              <p
                style={{ fontSize: `${settings.arabicFontSize}px` }}
                className="font-quran leading-relaxed text-foreground"
                dir="rtl"
              >
                {t("previewText")}
              </p>
            </div>
          </div>

          {/* Show Translation Switch */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div>
              <h3 className="font-medium text-sm text-foreground">
                {t("showTranslation")}
              </h3>
            </div>
            <Switch
              checked={settings.showTranslation}
              onCheckedChange={(checked) =>
                updateSettings({ showTranslation: checked })
              }
              aria-label={t("showTranslation")}
            />
          </div>

          {/* Default Audio Reciter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border/50">
            <div>
              <h3 className="font-medium text-sm text-foreground">
                {t("audioReciter")}
              </h3>
            </div>
            <select
              value={resolveReciter(settings.audioReciter).id}
              onChange={(e) => {
                const selectedId = e.target.value;
                updateSettings({ audioReciter: selectedId });
                setReciter(selectedId);
              }}
              className="bg-card border border-border rounded-md px-3 py-1.5 text-foreground text-xs outline-none cursor-pointer focus:ring-1 focus:ring-primary"
            >
              {VERSE_RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {locale === "ar" ? r.nameArabic : r.nameEnglish}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Trash2 className="size-4 text-destructive" />
            <span>{t("dataManagement")}</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-sm text-foreground">
                {t("clearData")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("clearDataDesc")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <RotateCcw className="size-3.5 me-1.5" />
              <span>{common("clear")}</span>
            </Button>
          </div>

          {resetSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <Check className="size-4" />
              <span>{t("resetSuccess")}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
