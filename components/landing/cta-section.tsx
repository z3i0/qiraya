import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { BookOpen, Headphones, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/10 via-card to-card border border-primary/25 p-8 sm:p-14 lg:p-16 text-center shadow-lg">
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-96 h-48 bg-primary/20 blur-3xl rounded-full"
      />

      <div className="relative max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-semibold">
          <Sparkles className="size-3.5" />
          <span>{t("ctaBadge")}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-arabic font-bold text-foreground tracking-tight leading-snug">
          {t("ctaTitle")}
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t("ctaSubtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
          <Link href="/quran" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all text-sm sm:text-base px-7 h-12 rounded-full cursor-pointer"
            >
              <BookOpen className="size-4.5" />
              <span className="font-semibold">{t("ctaButton")}</span>
            </Button>
          </Link>

          <Link href="/recitations" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto gap-2.5 border-border hover:bg-background text-foreground hover:text-primary transition-all text-sm sm:text-base px-6 h-12 rounded-full cursor-pointer"
            >
              <Headphones className="size-4.5" />
              <span>{t("ctaSecondary")}</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
