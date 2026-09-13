import React from "react";
import { getAllSurahs } from "@/lib/api/quran-cloud";
import { QuranSearch } from "@/components/search/quran-search";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.search" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SearchPage() {
  const surahs = await getAllSurahs();
  return <QuranSearch surahs={surahs} />;
}
