import reciterProfilesData from "@/lib/data/reciter-profiles.json";
import mp3quranData from "@/lib/data/mp3quran-data.json";

export interface ReciterProfile {
  id: number;
  nameArabic: string;
  nameEnglish: string;
  image: string;
  aliases?: string[];
}

export interface ReciterInfo {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  imageUrl?: string;
}

/**
 * Complete registry of reciters with verified portraits downloaded locally.
 */
export const RECITER_PROFILES: ReciterProfile[] = reciterProfilesData as ReciterProfile[];

/**
 * Normalized string helper for fuzzy Arabic / English matching.
 */
function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[-_.'’\s]+/g, " ");
}

/**
 * Automatically constructed lookup map for instant lookup by ID or Name.
 */
export const RECITER_IMAGES_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const p of RECITER_PROFILES) {
    map[String(p.id)] = p.image;
    map[p.nameArabic] = p.image;
    map[p.nameEnglish] = p.image;
    if (p.aliases) {
      for (const alias of p.aliases) {
        if (alias) map[alias] = p.image;
      }
    }
  }
  return map;
})();

/**
 * Get profile for a reciter by ID or name.
 */
export function getReciterProfile(idOrName: string | number): ReciterProfile | null {
  if (!idOrName) return null;
  const raw = String(idOrName).trim();
  const numId = Number(raw);

  if (!isNaN(numId) && numId > 0) {
    const byId = RECITER_PROFILES.find((p) => p.id === numId);
    if (byId) return byId;
  }

  const norm = normalizeText(raw);
  return (
    RECITER_PROFILES.find((p) => {
      if (normalizeText(p.nameArabic) === norm) return true;
      if (normalizeText(p.nameEnglish) === norm) return true;
      if (p.aliases?.some((a) => a && normalizeText(a) === norm)) return true;
      if (norm.includes(normalizeText(p.nameArabic))) return true;
      return false;
    }) || null
  );
}

/**
 * Get image URL for a reciter by ID or name.
 */
export function getReciterImage(idOrName: string | number): string | null {
  if (!idOrName) return null;
  const key = String(idOrName).trim();

  // Fast direct map check
  if (RECITER_IMAGES_MAP[key]) return RECITER_IMAGES_MAP[key];

  // Profile-based match
  const profile = getReciterProfile(idOrName);
  if (profile) return profile.image;

  return null;
}

/**
 * Get localized display name for a reciter by ID or name.
 */
export function getReciterDisplayName(
  idOrName: string | number,
  locale: string = "ar"
): string | null {
  const profile = getReciterProfile(idOrName);
  if (profile) {
    return locale === "en" ? profile.nameEnglish : profile.nameArabic;
  }
  return null;
}

/**
 * Get direct MP3 audio URL for a reciter and surah number.
 */
export function getReciterAudioUrl(
  reciterId: number | string,
  surahNumber: number = 1
): string | null {
  if (!reciterId) return null;
  const num = Number(reciterId);
  const recitersList = (mp3quranData as unknown as { reciters: Array<{ id: number; moshaf: Array<{ rewaya_id: number; server: string; name?: string }> }> }).reciters;
  if (!Array.isArray(recitersList)) return null;

  const r = recitersList.find(
    (item) => item.id === num || String(item.id) === String(reciterId)
  );
  if (!r || !r.moshaf || r.moshaf.length === 0) return null;

  const m =
    r.moshaf.find((item) => item.rewaya_id === 1 && !item.name?.includes("1387")) ||
    r.moshaf.find((item) => item.rewaya_id === 1) ||
    r.moshaf[0];

  if (!m || !m.server) return null;
  const cleanServer = m.server.endsWith("/") ? m.server : `${m.server}/`;
  const padded = String(surahNumber).padStart(3, "0");
  return `${cleanServer}${padded}.mp3`;
}

/**
 * Curated list of prominent, esteemed reciters of the Islamic world
 * ordered with the legendary golden age masters and top imams first.
 */
export const CURATED_RECITER_IDS: number[] = [
  // كبار أئمة التلاوة والجيل الذهبي
  51,   // عبد الباسط عبد الصمد
  112,  // محمد صديق المنشاوي
  118,  // محمود خليل الحصري
  125,  // مصطفى إسماعيل
  121,  // محمود علي البنا
  106,  // محمد الطبلاوي
  37,   // شعبان الصياد
  241,  // محمد رفعت
  9,    // أحمد نعينع
  77,   // علي حجاج السويسي

  // مشاهير قراء الحرمين والخليج
  123,  // مشاري العفاسي
  102,  // ماهر المعيقلي
  54,   // عبد الرحمن السديس
  31,   // سعود الشريم
  92,   // ياسر الدوسري
  30,   // سعد الغامدي
  5,    // أحمد بن علي العجمي
  76,   // علي جابر
  109,  // محمد أيوب
  74,   // علي بن عبد الرحمن الحذيفي
  1,    // إبراهيم الأخضر
  62,   // عبد الله عواد الجهني
  217,  // بندر بليلة
  43,   // صلاح البدير
  67,   // عبد المحسن القاسم
  61,   // عبد الله خياط
  41,   // صالح آل طالب
  4,    // أبو بكر الشاطري
  86,   // ناصر القطامي
  12,   // إدريس أبكر
  81,   // فارس عباد
  20,   // خالد الجليل
  111,  // محمد جبريل
  89,   // هاني الرفاعي
  23,   // توفيق الصائغ
  21,   // خالد القحطاني
  46,   // صلاح بو خاطر
  60,   // عبد الله بصفر
  107,  // محمد اللحيدان
  108,  // محمد المحيسني
  160,  // عادل الكلباني
  48,   // عادل ريان
  6,    // أحمد الحواشي

  // أئمة الروايات والقراءات
  80,   // عمر القزابري (ورش)
  16,   // العيون الكوشي (ورش)
  14,   // القارئ ياسين (ورش)
  138,  // نورين محمد صديق (الدوري)
  13,   // الزين محمد أحمد (الدوري)
  64,   // عبد الرشيد صوفي (خلف / السوسي)
  208,  // الدوكالي محمد العالم (قالون)
  201,  // أحمد الطرابلسي (قالون)
  11,   // الحسيني العزازي (المصحف المعلم)

  // أصوات مؤثرة ومحبوبة
  221,  // رعد محمد الكردي
  231,  // هزاع البلوشي
  307,  // عبد العزيز سحيم
  253,  // إسلام صبحي
  219,  // وديع اليمني
  245,  // منصور السالمي
  225,  // عبد الرحمن العوسي
  240,  // سلمان العتيبي
  259,  // أحمد النفيس
  267,  // عبد الله كامل
];

/**
 * Check if a reciter ID is in the curated important list.
 */
export function isCuratedReciter(id: number): boolean {
  return CURATED_RECITER_IDS.includes(id);
}

/**
 * Featured reciters used on the home page and quick selections,
 * ordered by Islamic significance and renown.
 */
export const DEFAULT_RECITERS: ReciterInfo[] = CURATED_RECITER_IDS.map((id) => {
  const p = getReciterProfile(id);
  if (!p) return null;
  return {
    id: String(p.id),
    nameArabic: p.nameArabic,
    nameEnglish: p.nameEnglish,
    imageUrl: p.image,
  };
}).filter(Boolean) as ReciterInfo[];

export interface QuranReciter {
  id: string;
  numericId: number;
  editionId: string;
  nameArabic: string;
  nameEnglish: string;
  image: string;
}

/**
 * Verified reciters with high quality verse-by-verse and full surah playback support.
 */
export const VERSE_RECITERS: QuranReciter[] = [
  {
    id: "123",
    numericId: 123,
    editionId: "ar.alafasy",
    nameArabic: "مشاري راشد العفاسي",
    nameEnglish: "Mishary Rashid Alafasy",
    image: "/images/reciters/alafasy.jpg",
  },
  {
    id: "51",
    numericId: 51,
    editionId: "ar.abdulbasitmurattal",
    nameArabic: "عبد الباسط عبد الصمد",
    nameEnglish: "Abdul Basit Abdul Samad",
    image: "/images/reciters/abdulbasit.png",
  },
  {
    id: "112",
    numericId: 112,
    editionId: "ar.minshawi",
    nameArabic: "محمد صديق المنشاوي",
    nameEnglish: "Mohamed Siddiq Al-Minshawi",
    image: "/images/reciters/minshawi.jpg",
  },
  {
    id: "118",
    numericId: 118,
    editionId: "ar.husary",
    nameArabic: "محمود خليل الحصري",
    nameEnglish: "Mahmoud Khalil Al-Husary",
    image: "/images/reciters/husary.jpg",
  },
  {
    id: "102",
    numericId: 102,
    editionId: "ar.mahermuaiqly",
    nameArabic: "ماهر المعيقلي",
    nameEnglish: "Maher Al Muaiqly",
    image: "/images/reciters/muaiqly.png",
  },
  {
    id: "54",
    numericId: 54,
    editionId: "ar.abdurrahmaansudais",
    nameArabic: "عبد الرحمن السديس",
    nameEnglish: "Abdurrahman As-Sudais",
    image: "/images/reciters/sudais.jpg",
  },
  {
    id: "31",
    numericId: 31,
    editionId: "ar.saoodshuraym",
    nameArabic: "سعود الشريم",
    nameEnglish: "Saud Al-Shuraim",
    image: "/images/reciters/shuraim.png",
  },
  {
    id: "5",
    numericId: 5,
    editionId: "ar.ahmedajamy",
    nameArabic: "أحمد بن علي العجمي",
    nameEnglish: "Ahmed ibn Ali Al-Ajamy",
    image: "/images/reciters/ajmy.png",
  },
  {
    id: "4",
    numericId: 4,
    editionId: "ar.shaatree",
    nameArabic: "أبو بكر الشاطري",
    nameEnglish: "Abu Bakr Ash-Shatri",
    image: "/images/reciters/shatri.jpg",
  },
  {
    id: "60",
    numericId: 60,
    editionId: "ar.abdullahbasfar",
    nameArabic: "عبد الله بصفر",
    nameEnglish: "Abdullah Basfar",
    image: "/images/reciters/60.jpg",
  },
  {
    id: "111",
    numericId: 111,
    editionId: "ar.muhammadjibreel",
    nameArabic: "محمد جبريل",
    nameEnglish: "Muhammad Jibreel",
    image: "/images/reciters/jibreel.png",
  },
  {
    id: "1",
    numericId: 1,
    editionId: "ar.ibrahimakhbar",
    nameArabic: "إبراهيم الأخضر",
    nameEnglish: "Ibrahim Al-Akhdar",
    image: "/images/reciters/akhdar.png",
  },
];

/**
 * Resolve any reciter ID, edition identifier, or numeric ID to canonical QuranReciter info.
 */
export function resolveReciter(idOrEdition?: string | number | null): QuranReciter {
  if (!idOrEdition) return VERSE_RECITERS[0];
  const str = String(idOrEdition).trim();
  const found = VERSE_RECITERS.find(
    (r) =>
      r.id === str ||
      r.editionId === str ||
      String(r.numericId) === str ||
      r.nameArabic.includes(str) ||
      r.nameEnglish.toLowerCase().includes(str.toLowerCase())
  );
  if (found) return found;

  const num = Number(str);
  if (!isNaN(num) && num > 0) {
    const profile = getReciterProfile(num);
    if (profile) {
      return {
        id: String(profile.id),
        numericId: profile.id,
        editionId: "ar.alafasy",
        nameArabic: profile.nameArabic,
        nameEnglish: profile.nameEnglish,
        image: profile.image,
      };
    }
  }

  return VERSE_RECITERS[0];
}

