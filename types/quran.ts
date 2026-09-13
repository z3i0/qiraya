export type RevelationType = "Meccan" | "Medinan";

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: RevelationType;
}

export interface SajdaInfo {
  id?: number;
  recommended?: boolean;
  obligatory?: boolean;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | SajdaInfo;
  audio?: string;
  audioSecondary?: string[];
  surah?: Surah;
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: "text" | "audio";
  type: "quran" | "translation" | "versebyverse" | "tafsir";
  direction?: "rtl" | "ltr" | null;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
  edition?: Edition;
}

export interface DualSurahDetail {
  arabic: SurahDetail;
  translation?: SurahDetail;
}

export interface JuzData {
  number: number;
  ayahs: Ayah[];
  surahs: Record<string, Surah>;
  edition?: Edition;
}

export interface DualJuzData {
  arabic: JuzData;
  translation?: JuzData;
}

export interface SearchMatch {
  number: number;
  text: string;
  edition: Edition;
  surah: Surah;
  numberInSurah: number;
}

export interface SearchResponseData {
  count: number;
  matches: SearchMatch[];
}

export interface ReciterEdition {
  identifier: string;
  name: string;
  englishName: string;
  format: "audio";
  type: string;
  language: string;
}

export interface ReadingPosition {
  surahNumber: number;
  ayahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  timestamp: number;
}

export interface BookmarkItem {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahNameArabic: string;
  surahNameEnglish: string;
  textArabic: string;
  textTranslation?: string;
  dateAdded: number;
}

export interface UserSettings {
  arabicFontSize: number;
  showTranslation: boolean;
  translationEdition: string;
  audioReciter: string;
  readingMode: "verse" | "mushaf";
}
