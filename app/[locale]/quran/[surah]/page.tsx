import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSurahWithEditions } from "@/lib/api/quran-cloud";
import { SurahReader } from "@/components/quran/surah-reader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; surah: string }>;
}): Promise<Metadata> {
  const { locale, surah } = await params;
  const surahNum = parseInt(surah, 10);

  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
    return { title: "Not Found | Qiraya" };
  }

  const data = await getSurahWithEditions(surahNum);
  if (!data) return { title: "Surah Not Found | Qiraya" };

  const t = await getTranslations({ locale, namespace: "metadata.surah" });
  const isAr = locale === "ar";
  const name = isAr ? data.arabic.name : data.arabic.englishName;

  return {
    title: t("title", {
      name,
      translation: data.arabic.englishNameTranslation || "",
    }),
    description: t("description", {
      name,
      count: data.arabic.numberOfAyahs,
    }),
  };
}

export default async function SurahPage({
  params,
}: {
  params: Promise<{ locale: string; surah: string }>;
}) {
  const { surah } = await params;
  const surahNum = parseInt(surah, 10);

  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
    notFound();
  }

  const data = await getSurahWithEditions(surahNum, "quran-uthmani", "en.sahih");

  if (!data || !data.arabic) {
    notFound();
  }

  return (
    <SurahReader
      surahArabic={data.arabic}
      surahTranslation={data.translation}
    />
  );
}
