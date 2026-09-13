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

  const trimmed = text.trim();
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
 * Fetch single Ayah by global number or surah:ayah reference with editions
 */
export async function getAyahWithEditions(
  ayahReference: number | string,
  arabicEdition = "quran-uthmani",
  translationEdition = "en.sahih"
): Promise<{ arabic: Ayah; translation?: Ayah } | null> {
  try {
    const data = await fetchFromApi<Ayah[]>(
      `/ayah/${ayahReference}/editions/${arabicEdition},${translationEdition}`,
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
    console.error(`Error fetching ayah ${ayahReference}:`, err);
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
 * Curated inspiring verses from the Holy Quran for reflection and contemplation (آيات التدبّر والسكينة).
 * Formatted as "surah:ayah" for high precision and clarity.
 */
export const INSPIRING_VERSES: (string | number)[] = [
  "2:152", // فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ
  "2:186", // وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ
  "2:255", // آية الكرسي
  "2:286", // لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا
  "3:139", // وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ
  "3:159", // وَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ
  "3:200", // يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا
  "4:135", // كُونُوا قَوَّامِينَ بِالْقِسْطِ
  "6:59",  // وَعِندَهُ مَفَاتِحُ الْغَيْبِ لَا يَعْلَمُهَا إِلَّا هُوَ
  "7:199", // خُذِ الْعَفْوَ وَأْمُرْ بِالْعُرْفِ وَأَعْرِضْ عَنِ الْجَاهِلِينَ
  "9:128", // لَقَدْ جَاءَكُمْ رَسُولٌ مِّنْ أَنفُسِكُمْ عَزِيزٌ عَلَيْهِ مَا عَنِتُّمْ
  "9:129", // فَإِن تَوَلَّوْا فَقُلْ حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ
  "10:57", // قَدْ جَاءَتْكُم مَّوْعِظَةٌ مِّن رَّبِّكُمْ وَشِفَاءٌ لِّمَا فِي الصُّدُورِ
  "11:88", // وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ
  "12:86", // قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ
  "12:90", // إِنَّهُ مَن يَتَّقِ وَيَصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ
  "13:28", // أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
  "14:7",  // لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ
  "15:98", // فَسَبِّحْ بِحَمْدِ رَبِّكَ وَكُن مِّنَ السَّاجِدِينَ
  "16:90", // إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ
  "16:128",// إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا وَّالَّذِينَ هُم مُّحْسِنُونَ
  "17:23", // وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا
  "17:82", // وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ
  "18:46", // وَالْبَاقِيَاتُ الصَّالِحَاتُ خَيْرٌ عِندَ رَبِّكَ ثَوَابًا وَخَيْرٌ أَمَلًا
  "20:114",// وَقُل رَّبِّ زِدْنِي عِلْمًا
  "21:87", // لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ
  "21:88", // فَاسْتَجَبْنَا لَهُ وَنَجَّيْنَاهُ مِنَ الْغَمِّ ۚ وَكَذَٰلِكَ نُنجِي الْمُؤْمِنِينَ
  "24:35", // اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ
  "25:63", // وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا
  "25:74", // رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ
  "28:77", // وَأَحْسِن كَمَا أَحْسَنَ اللَّهُ إِلَيْكَ
  "29:69", // وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا
  "30:21", // وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا
  "33:41", // يَا أَيُّهَا الَّذِينَ آمَنُوا اذْكُرُوا اللَّهَ ذِكْرًا كَثِيرًا
  "39:53", // قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ
  "40:60", // وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ
  "41:34", // ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ فَإِذَا الَّذِي بَيْنَكَ وَبَيْنَهُ عَدَاوَةٌ كَأَنَّهُ وَلِيٌّ حَمِيمٌ
  "42:19", // اللَّهُ لَطِيفٌ بِعِبَادِهِ يَرْزُقُ مَن يَشَاءُ
  "49:10", // إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ
  "49:13", // إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ
  "50:16", // وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ
  "55:60", // هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ
  "57:4",  // وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ ۚ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ
  "59:18", // يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ
  "65:2",  // وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
  "65:3",  // وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ
  "67:2",  // الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا
  "87:14", // قَدْ أَفْلَحَ مَن تَزَكَّىٰ
  "93:3",  // مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ
  "93:5",  // وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ
  "94:5",  // فَإِنَّ مَعَ الْعُسْرِ يُسْرًا
  "94:6",  // إِنَّ مَعَ الْعُسْرِ يُسْرًا
];

/**
 * Returns a random reflection verse from the curated inspiring verses on every call.
 */
export async function getRandomVerse(): Promise<{
  arabic: Ayah;
  translation?: Ayah;
} | null> {
  const randomIndex = Math.floor(Math.random() * INSPIRING_VERSES.length);
  const selectedRef = INSPIRING_VERSES[randomIndex];

  return await getAyahWithEditions(
    selectedRef,
    "quran-uthmani",
    "en.sahih"
  );
}

/**
 * Alias for getRandomVerse to maintain backwards compatibility.
 * Provides a fresh random verse on every refresh / request.
 */
export const getVerseOfTheDay = getRandomVerse;

