import localData from "@/lib/data/mp3quran-data.json";
import localDataEn from "@/lib/data/mp3quran-data-en.json";
import { getReciterImage, getReciterDisplayName } from "@/lib/data/reciters";

const BASE_URL = "https://mp3quran.net/api/v3";

export interface Riwayah {
  id: number;
  name: string;
  recitersCount?: number;
}

export interface Moshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  moshaf_type: number;
  rewaya_id?: number;
  surah_list: string;
}

export interface Mp3Reciter {
  id: number;
  name: string;
  letter: string;
  imageUrl?: string | null;
  moshaf: Moshaf[];
}

interface RiwayahApiResponse {
  riwayat: Riwayah[];
}

interface ReciterApiResponse {
  reciters: Array<{
    id: number;
    name: string;
    letter: string;
    date?: string;
    moshaf: Moshaf[];
  }>;
}

/**
 * Fetch all available Riwayat (recitation types) with reciters count, localized by locale ('ar' | 'en')
 */
export async function getRiwayat(locale: string = "ar"): Promise<Riwayah[]> {
  const isEn = locale === "en";
  const apiLang = isEn ? "eng" : "ar";
  const fallbackSource = isEn ? localDataEn : localData;

  try {
    const [riwayatRes, reciters] = await Promise.all([
      fetch(`${BASE_URL}/riwayat?language=${apiLang}`, {
        next: { revalidate: 86400 * 3 },
      }).then((r) => (r.ok ? (r.json() as Promise<RiwayahApiResponse>) : null)),
      getReciters(undefined, locale),
    ]);

    const riwayatList = riwayatRes?.riwayat || (fallbackSource.riwayat as Riwayah[]);

    return riwayatList.map((rw) => {
      const count = reciters.filter((rec) =>
        rec.moshaf.some((m) => m.rewaya_id === rw.id)
      ).length;
      return {
        ...rw,
        recitersCount: count,
      };
    });
  } catch (err) {
    console.error("Error fetching riwayat from API, using fallback:", err);
    const reciters = (fallbackSource.reciters || []) as unknown as Mp3Reciter[];
    return (fallbackSource.riwayat as Riwayah[]).map((rw) => {
      const count = reciters.filter((rec) =>
        rec.moshaf.some((m) => m.rewaya_id === rw.id)
      ).length;
      return {
        ...rw,
        recitersCount: count,
      };
    });
  }
}

/**
 * Fetch all reciters, optionally filtered by a specific riwayah ID, localized by locale ('ar' | 'en')
 */
export async function getReciters(
  riwayaId?: number,
  locale: string = "ar"
): Promise<Mp3Reciter[]> {
  const isEn = locale === "en";
  const apiLang = isEn ? "eng" : "ar";
  const fallbackSource = isEn ? localDataEn : localData;

  let rawReciters: Mp3Reciter[] = [];

  try {
    const url = riwayaId
      ? `${BASE_URL}/reciters?language=${apiLang}&rewaya=${riwayaId}`
      : `${BASE_URL}/reciters?language=${apiLang}`;

    const res = await fetch(url, {
      next: { revalidate: 86400 * 3 },
    });

    if (res.ok) {
      const data: ReciterApiResponse = await res.json();
      if (data && Array.isArray(data.reciters)) {
        rawReciters = data.reciters;
      }
    }
  } catch (err) {
    console.error("Error fetching reciters from API, using fallback:", err);
  }

  if (rawReciters.length === 0) {
    rawReciters = (fallbackSource.reciters || []) as unknown as Mp3Reciter[];
    if (riwayaId) {
      rawReciters = rawReciters.filter((r) =>
        r.moshaf.some((m) => m.rewaya_id === riwayaId)
      );
    }
  }

  // Attach images and enhance names with curated profiles if available
  return rawReciters.map((r) => {
    const curatedName = getReciterDisplayName(r.id, locale);
    return {
      ...r,
      name: curatedName || r.name,
      imageUrl: getReciterImage(r.id) || getReciterImage(r.name),
    };
  });
}

/**
 * Fetch a single reciter by ID or name, localized by locale ('ar' | 'en')
 */
export async function getReciterById(
  id: number | string,
  locale: string = "ar"
): Promise<Mp3Reciter | null> {
  const isEn = locale === "en";
  const apiLang = isEn ? "eng" : "ar";
  const fallbackSource = isEn ? localDataEn : localData;
  const numericId = typeof id === "number" ? id : parseInt(id, 10);

  if (!isNaN(numericId)) {
    try {
      const res = await fetch(
        `${BASE_URL}/reciters?language=${apiLang}&reciter=${numericId}`,
        {
          next: { revalidate: 86400 },
        }
      );
      if (res.ok) {
        const data: ReciterApiResponse = await res.json();
        const found = data.reciters?.[0];
        if (found) {
          const curatedName = getReciterDisplayName(found.id, locale);
          return {
            ...found,
            name: curatedName || found.name,
            imageUrl: getReciterImage(found.id) || getReciterImage(found.name),
          };
        }
      }
    } catch {
      // Fallback
    }
  }

  // Check in local cache
  const all = (fallbackSource.reciters || []) as unknown as Mp3Reciter[];
  const match = all.find(
    (r) =>
      r.id === numericId ||
      String(r.id) === String(id) ||
      r.name.toLowerCase().includes(String(id).toLowerCase())
  );

  if (match) {
    const curatedName = getReciterDisplayName(match.id, locale);
    return {
      ...match,
      name: curatedName || match.name,
      imageUrl: getReciterImage(match.id) || getReciterImage(match.name),
    };
  }

  return null;
}

/**
 * Build a direct audio URL for a surah from an MP3Quran server
 * e.g. server: "https://server8.mp3quran.net/afs/" -> surah 1 -> "https://server8.mp3quran.net/afs/001.mp3"
 */
export function getSurahAudioUrl(server: string, surahNumber: number): string {
  const cleanServer = server.endsWith("/") ? server : `${server}/`;
  const padded = surahNumber.toString().padStart(3, "0");
  return `${cleanServer}${padded}.mp3`;
}

/**
 * Parse comma-separated list of surah numbers (e.g. "1,2,3,4") into number array
 */
export function parseSurahList(surahListStr: string): number[] {
  if (!surahListStr) return [];
  return surahListStr
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 114);
}
