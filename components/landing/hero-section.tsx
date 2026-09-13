import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Compass,
  Headphones,
  Sparkles,
  ShieldCheck,
  Heart,
  Volume2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

export function HeroSection() {
  const t = useTranslations("home");

  const trustTags = [
    { label: t("trustTagFree"), icon: Heart },
    { label: t("trustTagNoAds"), icon: Zap },
    { label: t("trustTagPrivacy"), icon: ShieldCheck },
    { label: t("trustTagAudio"), icon: Volume2 },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 border-b border-border/60 bg-gradient-to-b from-card/60 via-background to-background">
      {/* Ambient Dot Pattern with radial falloff */}
      <DotPattern
        width={24}
        height={24}
        cx={1}
        cy={1}
        cr={1}
        className="[mask-image:radial-gradient(450px_circle_at_center,white,transparent)] opacity-40 dark:opacity-30"
      />

      {/* Decorative ambient radial glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-[36rem] h-[20rem] bg-primary/10 blur-[100px] rounded-full"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
        {/* Animated Badge */}
        <div className="inline-flex items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-primary/20 shadow-xs hover:border-primary/40 transition-colors">
            <Sparkles className="size-3.5 text-primary shrink-0" />
            <AnimatedGradientText
              speed={1.5}
              colorFrom="var(--primary)"
              colorTo="var(--foreground)"
              className="text-xs font-medium"
            >
              {t("heroBadge")}
            </AnimatedGradientText>
          </div>
        </div>

        {/* Hero Title (Single clear H1 per page) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-arabic font-bold text-foreground tracking-tight leading-[1.25] sm:leading-[1.2] max-w-4xl mx-auto">
          {t("heroTitle")}
        </h1>

        {/* Hero Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
          {t("heroSubtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
          <Link href="/quran" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all text-sm sm:text-base px-6 h-12 rounded-full cursor-pointer"
            >
              <Compass className="size-4.5" />
              <span className="font-semibold">{t("startReading")}</span>
            </Button>
          </Link>

          <Link href="/recitations" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto gap-2.5 border-border hover:bg-card text-foreground hover:text-primary transition-all text-sm sm:text-base px-6 h-12 rounded-full cursor-pointer"
            >
              <Headphones className="size-4.5" />
              <span>{t("browseReciters")}</span>
            </Button>
          </Link>
        </div>

        {/* Trust & Quality Badges */}
        <div className="pt-6 border-t border-border/40 max-w-xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
          {trustTags.map((tag) => {
            const Icon = tag.icon;
            return (
              <div key={tag.label} className="flex items-center gap-1.5 select-none">
                <Icon className="size-3.5 text-primary/80" />
                <span>{tag.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
