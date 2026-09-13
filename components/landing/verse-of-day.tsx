import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Ayah } from "@/types/quran";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VerseOfDayProps {
  dailyVerseData: { arabic: Ayah; translation?: Ayah } | null;
}

export function VerseOfDay({ dailyVerseData }: VerseOfDayProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRtl = locale === "ar";

  if (!dailyVerseData) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 p-6 sm:p-10 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-foreground">
              {t("verseOfTheDay")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("verseOfTheDayDesc")}
            </p>
          </div>
        </div>

        {dailyVerseData.arabic.surah && (
          <Badge
            variant="outline"
            className="text-xs font-mono border-primary/30 text-primary bg-primary/5 px-3 py-1 rounded-full"
          >
            {isRtl
              ? dailyVerseData.arabic.surah.name
              : dailyVerseData.arabic.surah.englishName}{" "}
            ({dailyVerseData.arabic.numberInSurah})
          </Badge>
        )}
      </div>

      {/* Arabic Verse */}
      <div dir="rtl" className="text-center py-4 sm:py-6 max-w-4xl mx-auto">
        <p className="font-quran text-2xl sm:text-3xl lg:text-4xl leading-loose sm:leading-loose text-foreground select-text">
          {dailyVerseData.arabic.text}
          <span className="ayah-symbol inline-block text-primary/80 ms-2">
            ۝
            <span className="text-[0.65em] font-mono px-1 text-foreground">
              {dailyVerseData.arabic.numberInSurah}
            </span>
          </span>
        </p>
      </div>

      {/* Translation (if available) */}
      {dailyVerseData.translation && (
        <div
          dir="ltr"
          className="mt-4 pt-4 border-t border-border/40 text-center max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed italic"
        >
          <p>&ldquo;{dailyVerseData.translation.text}&rdquo;</p>
        </div>
      )}

      {dailyVerseData.arabic.surah && (
        <div className="mt-6 flex justify-center">
          <Link href={`/quran/${dailyVerseData.arabic.surah.number}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs text-primary hover:text-primary/90 rounded-full"
            >
              <span>{t("readInSurah")}</span>
              {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
