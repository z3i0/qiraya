"use client";

import {
  ReadingPosition,
  BookmarkItem,
  UserSettings,
  Ayah,
  Surah,
} from "@/types/quran";

const STORAGE_KEYS = {
  LAST_READ: "qiraya_last_read",
  BOOKMARKS: "qiraya_bookmarks",
  SETTINGS: "qiraya_settings",
};

export const DEFAULT_SETTINGS: UserSettings = {
  arabicFontSize: 28,
  showTranslation: true,
  translationEdition: "en.sahih",
  audioReciter: "123",
  readingMode: "verse",
};

function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
    window.dispatchEvent(new Event("qiraya-storage-change"));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export function getLastRead(): ReadingPosition | null {
  const data = safeGetItem(STORAGE_KEYS.LAST_READ);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveLastRead(
  surah: Surah,
  ayahNumberInSurah: number
): void {
  const pos: ReadingPosition = {
    surahNumber: surah.number,
    ayahNumber: ayahNumberInSurah,
    surahNameArabic: surah.name,
    surahNameEnglish: surah.englishName,
    timestamp: Date.now(),
  };
  safeSetItem(STORAGE_KEYS.LAST_READ, JSON.stringify(pos));
}

export function getBookmarks(): BookmarkItem[] {
  const data = safeGetItem(STORAGE_KEYS.BOOKMARKS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function isAyahBookmarked(
  surahNumber: number,
  ayahNumberInSurah: number
): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some(
    (b) =>
      b.surahNumber === surahNumber && b.ayahNumber === ayahNumberInSurah
  );
}

export function toggleBookmark(
  surah: Surah,
  ayah: Ayah,
  translationText?: string
): boolean {
  const bookmarks = getBookmarks();
  const index = bookmarks.findIndex(
    (b) =>
      b.surahNumber === surah.number &&
      b.ayahNumber === ayah.numberInSurah
  );

  if (index >= 0) {
    // Remove
    bookmarks.splice(index, 1);
    safeSetItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return false;
  } else {
    // Add
    const newItem: BookmarkItem = {
      id: `${surah.number}:${ayah.numberInSurah}`,
      surahNumber: surah.number,
      ayahNumber: ayah.numberInSurah,
      surahNameArabic: surah.name,
      surahNameEnglish: surah.englishName,
      textArabic: ayah.text,
      textTranslation: translationText,
      dateAdded: Date.now(),
    };
    bookmarks.unshift(newItem);
    safeSetItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return true;
  }
}

export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks().filter((b) => b.id !== id);
  safeSetItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

export function clearAllBookmarks(): void {
  safeSetItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify([]));
}

export function getUserSettings(): UserSettings {
  const data = safeGetItem(STORAGE_KEYS.SETTINGS);
  if (!data) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getUserSettings();
  const updated = { ...current, ...settings };
  safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

export function resetAllData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.LAST_READ);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.dispatchEvent(new Event("qiraya-storage-change"));
  } catch (e) {
    console.error("Error clearing local storage:", e);
  }
}
