"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DEFAULT_SETTINGS,
  getLastRead,
  getBookmarks,
  getUserSettings,
  saveUserSettings,
  toggleBookmark,
  removeBookmark,
  saveLastRead,
  clearAllBookmarks,
  resetAllData,
} from "@/lib/storage";
import { ReadingPosition, BookmarkItem, UserSettings, Ayah, Surah } from "@/types/quran";

export function useQirayaStorage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastRead, setLastReadState] = useState<ReadingPosition | null>(null);
  const [bookmarks, setBookmarksState] = useState<BookmarkItem[]>([]);
  const [settings, setSettingsState] = useState<UserSettings>(DEFAULT_SETTINGS);

  const refresh = useCallback(() => {
    setLastReadState(getLastRead());
    setBookmarksState(getBookmarks());
    setSettingsState(getUserSettings());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);

    const handleStorageChange = () => {
      refresh();
    };

    window.addEventListener("qiraya-storage-change", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("qiraya-storage-change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refresh]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    const updated = saveUserSettings(newSettings);
    setSettingsState(updated);
  }, []);

  const handleToggleBookmark = useCallback(
    (surah: Surah, ayah: Ayah, translationText?: string) => {
      const isSaved = toggleBookmark(surah, ayah, translationText);
      setBookmarksState(getBookmarks());
      return isSaved;
    },
    []
  );

  const handleRemoveBookmark = useCallback((id: string) => {
    removeBookmark(id);
    setBookmarksState(getBookmarks());
  }, []);

  const handleClearBookmarks = useCallback(() => {
    clearAllBookmarks();
    setBookmarksState([]);
  }, []);

  const handleSaveLastRead = useCallback(
    (surah: Surah, ayahNumberInSurah: number) => {
      saveLastRead(surah, ayahNumberInSurah);
      setLastReadState(getLastRead());
    },
    []
  );

  const handleResetAll = useCallback(() => {
    resetAllData();
    refresh();
  }, [refresh]);

  const handleIsAyahBookmarked = useCallback(
    (surahNumber: number, ayahNumberInSurah: number) => {
      return bookmarks.some(
        (b) =>
          b.surahNumber === surahNumber && b.ayahNumber === ayahNumberInSurah
      );
    },
    [bookmarks]
  );

  return {
    isLoaded,
    lastRead,
    bookmarks,
    settings,
    updateSettings,
    toggleBookmark: handleToggleBookmark,
    removeBookmark: handleRemoveBookmark,
    clearBookmarks: handleClearBookmarks,
    saveLastRead: handleSaveLastRead,
    resetAll: handleResetAll,
    isAyahBookmarked: handleIsAyahBookmarked,
  };
}
