"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useQirayaStorage } from "@/hooks/use-local-storage";
import { BookMarked, ArrowRight, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContinueReadingCard() {
  const t = useTranslations("home");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const { lastRead, isLoaded } = useQirayaStorage();

  if (!isLoaded) {
    return (
      <div className="w-full h-24 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
    );
  }

  if (!lastRead) {
    return (
      <div className="w-full p-5 sm:p-6 rounded-2xl bg-card border border-border/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-start w-full sm:w-auto">
          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Compass className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              {t("continueReading")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("noRecentReading")}
            </p>
          </div>
        </div>
        <Link href="/quran" className="w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs gap-1.5">
            <span>{common("surahs")}</span>
            {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-card to-card border border-primary/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 text-start w-full sm:w-auto">
        <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0 shadow-xs">
          <BookMarked className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-foreground">
              {isRtl ? lastRead.surahNameArabic : lastRead.surahNameEnglish}
            </h3>
            <span className="text-xs font-mono font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10">
              {common("verse")} {lastRead.ayahNumber}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("continueReadingDesc")}
          </p>
        </div>
      </div>
      <Link href={`/quran/${lastRead.surahNumber}`} className="w-full sm:w-auto">
        <Button size="sm" className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <span>{t("resume")}</span>
          {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
        </Button>
      </Link>
    </div>
  );
}
