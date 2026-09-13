import React from "react";
import { getRiwayat, getReciters } from "@/lib/api/mp3quran";
import { getAllSurahs } from "@/lib/api/quran-cloud";
import { RecitersDirectory } from "@/components/audio/reciters-directory";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.recitations" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RecitationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [riwayat, reciters, surahs] = await Promise.all([
    getRiwayat(locale),
    getReciters(undefined, locale),
    getAllSurahs(),
  ]);

  return (
    <RecitersDirectory
      riwayat={riwayat}
      reciters={reciters}
      surahs={surahs}
    />
  );
}
