import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Marquee } from "@/components/ui/marquee";
import { SheikhAvatar } from "@/components/audio/sheikh-avatar";
import { ReciterPlayButton } from "@/components/home/reciter-play-button";
import { DEFAULT_RECITERS } from "@/lib/data/reciters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export function RecitersMarquee() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const isRtl = locale === "ar";

  // Select top 12 prominent reciters for the marquee
  const reciters = DEFAULT_RECITERS.slice(0, 12);
  const firstRow = reciters.slice(0, 6);
  const secondRow = reciters.slice(6, 12);

  return (
    <section className="relative overflow-hidden py-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="space-y-1.5 text-start">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Sparkles className="size-3.5" />
            <span>{t("featuredRecitations")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t("recitersMarqueeTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("recitersMarqueeSubtitle")}
          </p>
        </div>

        <Link href="/recitations">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-primary hover:text-primary/90">
            <span>{nav("recitations")}</span>
            {isRtl ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
          </Button>
        </Link>
      </div>

      {/* Marquee Track Container with gradient fade edges */}
      <div className="relative w-full overflow-hidden -mx-4 sm:-mx-6">
        {/* Start Fade Mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-0 w-16 sm:w-28 bg-gradient-to-r rtl:bg-gradient-to-l from-background via-background/80 to-transparent z-10"
        />
        {/* End Fade Mask */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 end-0 w-16 sm:w-28 bg-gradient-to-l rtl:bg-gradient-to-r from-background via-background/80 to-transparent z-10"
        />

        {/* Row 1 */}
        <Marquee reverse={isRtl} pauseOnHover className="[--duration:45s] py-2">
          {firstRow.map((reciter) => {
            const name = isRtl ? reciter.nameArabic : reciter.nameEnglish;
            return (
              <Card
                key={reciter.id}
                dir={isRtl ? "rtl" : "ltr"}
                className="w-72 sm:w-80 p-3.5 hover:border-primary/50 transition-all duration-200 flex items-center justify-between gap-3 shrink-0 shadow-2xs group bg-card/90 backdrop-blur-xs"
              >
                <Link
                  href={`/recitations/${reciter.id}`}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <SheikhAvatar
                    src={reciter.imageUrl}
                    name={name}
                    size="md"
                    shape="circle"
                    className="group-hover:scale-105 transition-transform shrink-0"
                  />
                  <div className="min-w-0 text-start">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {isRtl ? "حفص عن عاصم • المصحف كاملاً" : "Hafs 'an 'Asim • Complete"}
                    </p>
                  </div>
                </Link>

                <div className="shrink-0">
                  <ReciterPlayButton reciterId={reciter.id} reciterName={name} />
                </div>
              </Card>
            );
          })}
        </Marquee>

        {/* Row 2 (Opposite direction) */}
        <Marquee reverse={!isRtl} pauseOnHover className="[--duration:50s] py-2">
          {secondRow.map((reciter) => {
            const name = isRtl ? reciter.nameArabic : reciter.nameEnglish;
            return (
              <Card
                key={reciter.id}
                dir={isRtl ? "rtl" : "ltr"}
                className="w-72 sm:w-80 p-3.5 hover:border-primary/50 transition-all duration-200 flex items-center justify-between gap-3 shrink-0 shadow-2xs group bg-card/90 backdrop-blur-xs"
              >
                <Link
                  href={`/recitations/${reciter.id}`}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <SheikhAvatar
                    src={reciter.imageUrl}
                    name={name}
                    size="md"
                    shape="circle"
                    className="group-hover:scale-105 transition-transform shrink-0"
                  />
                  <div className="min-w-0 text-start">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {isRtl ? "حفص عن عاصم • تلاوة مرتلة" : "Hafs 'an 'Asim • Murattal"}
                    </p>
                  </div>
                </Link>

                <div className="shrink-0">
                  <ReciterPlayButton reciterId={reciter.id} reciterName={name} />
                </div>
              </Card>
            );
          })}
        </Marquee>
      </div>
    </section>
  );
}
