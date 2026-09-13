import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getAllSurahs } from "@/lib/api/quran-cloud";
import { getReciterById, getRiwayat, Mp3Reciter } from "@/lib/api/mp3quran";
import { DEFAULT_RECITERS, getReciterDisplayName } from "@/lib/data/reciters";
import { ReciterPlaylist } from "@/components/audio/reciter-playlist";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; reciter: string }>;
}): Promise<Metadata> {
  const { locale, reciter } = await params;

  const mp3Reciter = await getReciterById(reciter, locale);
  const knownName = getReciterDisplayName(reciter, locale);
  const name = mp3Reciter?.name || knownName || reciter;

  const t = await getTranslations({ locale, namespace: "metadata.recitations" });

  return {
    title: t("reciterTitle", { name }),
    description: t("reciterDescription", { name }),
  };
}

export default async function ReciterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; reciter: string }>;
  searchParams: Promise<{ riwaya?: string }>;
}) {
  const { locale, reciter } = await params;
  const { riwaya } = await searchParams;

  const [surahs, riwayat, mp3Reciter] = await Promise.all([
    getAllSurahs(),
    getRiwayat(locale),
    getReciterById(reciter, locale),
  ]);

  let resolvedReciter: Mp3Reciter | null = mp3Reciter;

  if (!resolvedReciter) {
    const known = DEFAULT_RECITERS.find((r) => r.id === reciter);
    if (known) {
      resolvedReciter = {
        id: parseInt(known.id, 10) || 123,
        name: known.nameArabic,
        letter: known.nameArabic[0],
        imageUrl: known.imageUrl,
        moshaf: [
          {
            id: 1,
            name: "حفص عن عاصم - مرتل",
            rewaya_id: 1,
            server: "https://server8.mp3quran.net/afs/",
            surah_total: 114,
            moshaf_type: 11,
            surah_list: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114",
          },
        ],
      };
    }
  }

  if (!resolvedReciter) {
    notFound();
  }

  const initialRiwayaId = riwaya ? parseInt(riwaya, 10) : undefined;

  return (
    <ReciterPlaylist
      reciter={resolvedReciter}
      surahs={surahs}
      riwayat={riwayat}
      initialRiwayaId={initialRiwayaId}
    />
  );
}
