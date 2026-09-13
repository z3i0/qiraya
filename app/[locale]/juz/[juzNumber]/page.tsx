import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getJuzWithEditions } from "@/lib/api/quran-cloud";
import { JuzReader } from "@/components/quran/juz-reader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; juzNumber: string }>;
}): Promise<Metadata> {
  const { locale, juzNumber } = await params;
  const num = parseInt(juzNumber, 10);

  if (isNaN(num) || num < 1 || num > 30) {
    return { title: "Juz Not Found | Qiraya" };
  }

  const t = await getTranslations({ locale, namespace: "metadata.juz" });
  return {
    title: t("detailTitle", { num }),
    description: t("detailDescription", { num }),
  };
}

export default async function JuzPage({
  params,
}: {
  params: Promise<{ locale: string; juzNumber: string }>;
}) {
  const { juzNumber } = await params;
  const num = parseInt(juzNumber, 10);

  if (isNaN(num) || num < 1 || num > 30) {
    notFound();
  }

  const data = await getJuzWithEditions(num, "quran-uthmani", "en.sahih");

  if (!data || !data.arabic) {
    notFound();
  }

  return <JuzReader juzArabic={data.arabic} juzTranslation={data.translation} />;
}
