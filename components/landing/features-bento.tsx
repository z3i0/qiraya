import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import {
  BookOpen,
  Headphones,
  Search,
  Bookmark,
  Sparkles,
} from "lucide-react";

export function FeaturesBento() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const features = [
    {
      Icon: BookOpen,
      name: t("mushafFeatureTitle"),
      description: t("mushafFeatureDesc"),
      href: "/quran",
      cta: isRtl ? "تصفح المصحف" : "Explore Reader",
      className: "col-span-1 lg:col-span-2",
    },
    {
      Icon: Headphones,
      name: t("audioFeatureTitle"),
      description: t("audioFeatureDesc"),
      href: "/recitations",
      cta: isRtl ? "استمع للقرّاء" : "Listen Now",
      className: "col-span-1 lg:col-span-1",
    },
    {
      Icon: Search,
      name: t("searchFeatureTitle"),
      description: t("searchFeatureDesc"),
      href: "/search",
      cta: isRtl ? "جرّب البحث" : "Search Verses",
      className: "col-span-1 lg:col-span-1",
    },
    {
      Icon: Bookmark,
      name: t("bookmarksFeatureTitle"),
      description: t("bookmarksFeatureDesc"),
      href: "/bookmarks",
      cta: isRtl ? "عرض المحفوظات" : "View Bookmarks",
      className: "col-span-1 lg:col-span-2",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <Sparkles className="size-3.5" />
          <span>{t("bentoBadge")}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
          {t("bentoTitle")}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("bentoSubtitle")}
        </p>
      </div>

      <BentoGrid className="lg:grid-rows-2">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </section>
  );
}
