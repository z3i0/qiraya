import {
  Surah,
  SurahDetail,
  DualSurahDetail,
  JuzData,
  DualJuzData,
  SearchResponseData,
  ReciterEdition,
  Edition,
  Ayah,
} from "@/types/quran";
import localSurahsData from "@/lib/data/surahs.json";

const BASE_URL = "https://api.alquran.cloud/v1";

interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

async function fetchFromApi<T>(
  endpoint: string,
  revalidateSeconds = 86400
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    next: { revalidate: revalidateSeconds },
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Al Quran Cloud API request failed: ${res.status} ${res.statusText} at ${endpoint}`
    );
  }

  const json: ApiResponse<T> = await res.json();
  if (json.code !== 200 || !json.data) {
    throw new Error(
      `Al Quran Cloud API error: status=${json.status}, code=${json.code}`
    );
  }

  return json.data;
}

/**
 * Fetch all 114 Surahs with metadata
 */
export async function getAllSurahs(): Promise<Surah[]> {
  try {
    const data = await fetchFromApi<Surah[]>("/surah", 86400 * 7);
    if (Array.isArray(data) && data.length === 114) {
      return data;
    }
    return localSurahsData.data as Surah[];
  } catch {
    return localSurahsData.data as Surah[];
  }
}

const BISMILLAH_PREFIXES = [
  "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
  "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ",
  "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
  "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ",
  "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
  "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
];

/**
 * Remove prepended Basmalah from Ayah 1 of all surahs except Surah Al-Fatihah (1).
 * In Surah Al-Fatihah, the Basmalah is an independent verse (Ayah 1).
 * In all other surahs, the Basmalah is a surah opener header and should not be merged into the first verse.
 */
export function sanitizeAyahText(
  text: string,
  surahNumber: number,
  ayahNumberInSurah: number
): string {
  if (surahNumber === 1 || ayahNumberInSurah !== 1) return text;

  let trimmed = text.trim();
  for (const prefix of BISMILLAH_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length).trim();
    }
  }

  return trimmed;
}

/**
 * Fetch a single Surah with both Arabic Uthmani text and a translation edition
 */
export async function getSurahWithEditions(
  surahNumber: number,
  arabicEdition = "quran-uthmani",
  translationEdition = "en.sahih"
): Promise<DualSurahDetail | null> {
  try {
    const data = await fetchFromApi<SurahDetail[]>(
      `/surah/${surahNumber}/editions/${arabicEdition},${translationEdition}`,
      86400
    );

    if (Array.isArray(data) && data.length >= 1) {
      // Clean leading Bismillah from Ayah 1 of all surahs except Al-Fatihah
      if (surahNumber !== 1 && data[0]?.ayahs?.[0]) {
        data[0].ayahs[0].text = sanitizeAyahText(
          data[0].ayahs[0].text,
          surahNumber,
          1
        );
      }
      return {
        arabic: data[0],
        translation: data[1] ?? undefined,
      };
    }
    return null;
  } catch (err) {
    console.error(`Error fetching surah ${surahNumber}:`, err);
    return null;
  }
}

/**
 * Fetch a single Juz with both Arabic text and translation
 */
export async function getJuzWithEditions(
  juzNumber: number,
  arabicEdition = "quran-uthmani",
  translationEdition = "en.sahih"
): Promise<DualJuzData | null> {
  try {
    // Note: API juz endpoint does not support comma-separated editions, so we fetch in parallel
    const [arabicData, translationData] = await Promise.all([
      fetchFromApi<JuzData>(`/juz/${juzNumber}/${arabicEdition}`, 86400),
      fetchFromApi<JuzData>(`/juz/${juzNumber}/${translationEdition}`, 86400).catch(
        () => null
      ),
    ]);

    if (arabicData?.ayahs) {
      arabicData.ayahs = arabicData.ayahs.map((ayah) => {
        const surahNum = ayah.surah?.number ?? 1;
        if (surahNum !== 1 && ayah.numberInSurah === 1) {
          return {
            ...ayah,
            text: sanitizeAyahText(ayah.text, surahNum, 1),
          };
        }
        return ayah;
      });
    }

    return {
      arabic: arabicData,
      translation: translationData ?? undefined,
    };
  } catch (err) {
    console.error(`Error fetching juz ${juzNumber}:`, err);
    return null;
  }
}

/**
 * Fetch audio recitation data for a surah by reciter edition
 */
export async function getSurahAudio(
  surahNumber: number,
  reciterIdentifier = "ar.alafasy"
): Promise<SurahDetail | null> {
  try {
    return await fetchFromApi<SurahDetail>(
      `/surah/${surahNumber}/${reciterIdentifier}`,
      86400
    );
  } catch (err) {
    console.error(
      `Error fetching audio for surah ${surahNumber} (${reciterIdentifier}):`,
      err
    );
    return null;
  }
}

/**
 * Fetch single Ayah by global number with editions
 */
export async function getAyahWithEditions(
  ayahNumber: number,
  arabicEdition = "quran-uthmani",
  translationEdition = "en.sahih"
): Promise<{ arabic: Ayah; translation?: Ayah } | null> {
  try {
    const data = await fetchFromApi<Ayah[]>(
      `/ayah/${ayahNumber}/editions/${arabicEdition},${translationEdition}`,
      86400
    );

    if (Array.isArray(data) && data.length >= 2) {
      return {
        arabic: data[0],
        translation: data[1],
      };
    } else if (Array.isArray(data) && data.length === 1) {
      return {
        arabic: data[0],
      };
    }
    return null;
  } catch (err) {
    console.error(`Error fetching ayah ${ayahNumber}:`, err);
    return null;
  }
}

/**
 * Search Quran text
 */
export async function searchQuran(
  query: string,
  surah: string = "all",
  languageOrEdition: string = "en.sahih"
): Promise<SearchResponseData> {
  if (!query.trim()) {
    return { count: 0, matches: [] };
  }

  try {
    const cleanQuery = encodeURIComponent(query.trim());
    return await fetchFromApi<SearchResponseData>(
      `/search/${cleanQuery}/${surah}/${languageOrEdition}`,
      3600
    );
  } catch {
    // If not found or error, return empty matches gracefully
    return { count: 0, matches: [] };
  }
}

/**
 * Fetch all available audio reciter editions
 */
export async function getAudioEditions(): Promise<ReciterEdition[]> {
  try {
    const data = await fetchFromApi<ReciterEdition[]>(
      "/edition?format=audio",
      86400 * 7
    );
    // Filter verse-by-verse editions that have audio URLs
    return data.filter(
      (ed) => ed.format === "audio" && ed.language === "ar"
    );
  } catch (err) {
    console.error("Error fetching audio editions:", err);
    return [];
  }
}

/**
 * Fetch all translation editions
 */
export async function getTranslationEditions(): Promise<Edition[]> {
  try {
    const data = await fetchFromApi<Edition[]>(
      "/edition?type=translation",
      86400 * 7
    );
    return data;
  } catch (err) {
    console.error("Error fetching translation editions:", err);
    return [];
  }
}

/**
 * Deterministic Verse of the Day / Reflection
 * Uses day-of-year calculation across curated inspiring verses from the Holy Quran.
 */
const INSPIRING_VERSES = [
  262,  // 2:255 (Ayat al-Kursi)
  293,  // 2:286 (Allah does not burden a soul beyond that it can bear)
  432,  // 3:139 (Do not weaken and do not grieve...)
  1800, // 14:7 (If you are grateful, I will surely increase you)
  2440, // 20:114 (My Lord, increase me in knowledge)
  2570, // 21:87 (There is no deity except You; exalted are You...)
  2928, // 25:74 (Our Lord, grant us from among our spouses and offspring comfort...)
  3382, // 29:69 (And those who strive for Us - We will surely guide them...)
  4111, // 39:53 (Say, O My servants who have transgressed against themselves...)
  4625, // 49:13 (O mankind, indeed We have created you from male and female...)
  5198, // 59:18 (O you who have believed, fear Allah. And let every soul look to what it has put forth...)
  5240, // 65:3 (And whoever relies upon Allah - then He is sufficient for him)
  6092, // 94:5 (For indeed, with hardship [will be] ease)
  6093, // 94:6 (Indeed, with hardship [will be] ease)
];

export async function getVerseOfTheDay(): Promise<{
  arabic: Ayah;
  translation?: Ayah;
} | null> {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const selectedGlobalAyahNumber =
    INSPIRING_VERSES[dayOfYear % INSPIRING_VERSES.length];

  return await getAyahWithEditions(
    selectedGlobalAyahNumber,
    "quran-uthmani",
    "en.sahih"
  );
}
