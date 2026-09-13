import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { JUZ_LIST } from "@/lib/data/juz-info";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.juz" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function JuzIndexPage() {
  return <JuzContent />;
}

function JuzContent() {
  const t = useTranslations("juz");
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-arabic font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      {/* Grid of 30 Juz */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {JUZ_LIST.map((juz) => (
          <Link key={juz.number} href={`/juz/${juz.number}`}>
            <Card className="p-5 h-full hover:border-primary/50 hover:shadow-xs transition-all duration-200 group flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-base group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                    {juz.number}
                  </div>
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                      {t("juzTitle", { number: juz.number })}
                    </h2>
                    <p className="text-xs text-muted-foreground font-arabic">
                      {juz.nameArabic}
                    </p>
                  </div>
                </div>

                <div className="font-arabic text-xl text-muted-foreground/75 group-hover:text-foreground transition-colors" dir="rtl">
                  {juz.nameArabic}
                </div>
              </div>

              {/* Starts at */}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {t("startsAt")}:{" "}
                  <strong className="text-foreground font-medium">
                    {isRtl ? juz.startSurahNameArabic : juz.startSurahNameEnglish}{" "}
                    ({juz.startAyahNumber})
                  </strong>
                </span>

                <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:underline">
                  {t("readJuz")}
                  {isRtl ? (
                    <ArrowLeft className="size-3" />
                  ) : (
                    <ArrowRight className="size-3" />
                  )}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
