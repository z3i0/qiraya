import React from "react";
import { getAllSurahs } from "@/lib/api/quran-cloud";
import { SurahDirectory } from "@/components/quran/surah-directory";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.quran" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function QuranDirectoryPage() {
  const surahs = await getAllSurahs();
  return <SurahDirectory surahs={surahs} />;
}
