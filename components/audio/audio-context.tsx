"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Surah, SurahDetail } from "@/types/quran";
import {
  DEFAULT_RECITERS,
  getReciterImage,
  getReciterAudioUrl,
  resolveReciter,
} from "@/lib/data/reciters";
import { getUserSettings, saveUserSettings } from "@/lib/storage";
export { DEFAULT_RECITERS };

interface ApiAyahAudio {
  numberInSurah: number;
  audio: string;
}

export interface AudioAyahItem {
  ayahNumberInSurah: number;
  audioUrl: string;
}

export interface SurahPlaylistItem {
  surah: Surah;
  audioUrl: string;
  reciterName?: string;
  riwayaName?: string;
  reciterImage?: string | null;
}

interface AudioContextType {
  isPlaying: boolean;
  currentSurah: Surah | null;
  currentAyahNumber: number | null;
  currentReciter: string;
  currentReciterName: string;
  currentRiwayaName: string;
  currentReciterImage: string | null;
  duration: number;
  currentTime: number;
  isLooping: boolean;
  isLoading: boolean;
  playbackType: "verse" | "surah";
  currentAudioUrl: string | null;
  playAyah: (
    surah: Surah | SurahDetail,
    ayahNumberInSurah: number,
    customUrl?: string,
    ayahsAudioPlaylist?: AudioAyahItem[]
  ) => void;
  playSurah: (surah: Surah, reciter?: string) => Promise<void>;
  playDirectSurah: (
    surah: Surah,
    audioUrl: string,
    reciterName: string,
    riwayaName?: string,
    reciterImage?: string | null,
    playlist?: SurahPlaylistItem[]
  ) => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  nextAyah: () => void;
  previousAyah: () => void;
  setReciter: (reciter: string) => void;
  toggleLoop: () => void;
  closePlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentAyahNumber, setCurrentAyahNumber] = useState<number | null>(null);
  const [currentReciter, setCurrentReciter] = useState<string>("123");
  const [currentReciterName, setCurrentReciterName] = useState<string>("مشاري راشد العفاسي");
  const [currentRiwayaName, setCurrentRiwayaName] = useState<string>("حفص عن عاصم");
  const [currentReciterImage, setCurrentReciterImage] = useState<string | null>(
    "/images/reciters/alafasy.jpg"
  );
  const [playbackType, setPlaybackType] = useState<"verse" | "surah">("verse");
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<AudioAyahItem[]>([]);
  const [surahQueue, setSurahQueue] = useState<SurahPlaylistItem[]>([]);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize currentReciter with saved user settings on mount and when settings change
  useEffect(() => {
    const syncWithStorage = () => {
      const saved = getUserSettings().audioReciter;
      if (saved) {
        const info = resolveReciter(saved);
        setCurrentReciter(info.id);
        setCurrentReciterName(info.nameArabic);
        setCurrentReciterImage(info.image);
      }
    };

    syncWithStorage();

    window.addEventListener("qiraya-storage-change", syncWithStorage);
    window.addEventListener("storage", syncWithStorage);
    return () => {
      window.removeEventListener("qiraya-storage-change", syncWithStorage);
      window.removeEventListener("storage", syncWithStorage);
    };
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Safe play helper that swallows AbortError when a new load request is made
  const safePlay = useCallback((audio: HTMLAudioElement) => {
    if (!audio || !audio.src || audio.src === "undefined" || audio.src.endsWith("/undefined")) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const promise = audio.play();
      playPromiseRef.current = promise;

      promise
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
        })
        .catch((err: unknown) => {
          setIsLoading(false);
          // If playback was aborted due to another load or pause call, ignore silently
          const error = err as { name?: string; message?: string };
          if (
            error?.name === "AbortError" ||
            error?.message?.includes("interrupted") ||
            error?.message?.includes("closed") ||
            error?.name === "NotAllowedError"
          ) {
            return;
          }
          console.warn("Audio playback notice:", err);
        })
        .finally(() => {
          playPromiseRef.current = null;
        });
    } catch {
      setIsLoading(false);
    }
  }, []);

  // Safe pause helper waiting for pending play promises to resolve
  const safePause = useCallback((audio: HTMLAudioElement) => {
    if (!audio) return;
    if (playPromiseRef.current) {
      playPromiseRef.current
        .catch(() => {})
        .finally(() => {
          try {
            audio.pause();
          } catch {}
          setIsPlaying(false);
        });
    } else {
      try {
        audio.pause();
      } catch {}
      setIsPlaying(false);
    }
  }, []);

  // Safe source switcher preventing race conditions and "interrupted by a new load request"
  const changeAudioSource = useCallback(
    (audio: HTMLAudioElement, newUrl: string) => {
      if (
        !audio ||
        !newUrl ||
        typeof newUrl !== "string" ||
        newUrl.trim() === "" ||
        newUrl === "undefined" ||
        newUrl.endsWith("/undefined")
      ) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setCurrentAudioUrl(newUrl);

      if (audio.src === newUrl) {
        if (audio.ended || (audio.duration && audio.currentTime >= audio.duration)) {
          audio.currentTime = 0;
        }
        if (audio.paused) {
          safePlay(audio);
        } else {
          setIsLoading(false);
        }
        return;
      }

      if (playPromiseRef.current) {
        playPromiseRef.current
          .catch(() => {})
          .finally(() => {
            try {
              audio.pause();
              audio.currentTime = 0;
              audio.src = newUrl;
              safePlay(audio);
            } catch (err) {
              console.warn("Audio source switch notice:", err);
              setIsLoading(false);
            }
          });
      } else {
        try {
          audio.pause();
          audio.currentTime = 0;
          audio.src = newUrl;
          safePlay(audio);
        } catch (err) {
          console.warn("Audio source switch notice:", err);
          setIsLoading(false);
        }
      }
    },
    [safePlay]
  );

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, []);

  // Next Track callback (Queue navigation)
  const nextTrackCallback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playbackType === "surah" && surahQueue.length > 0 && currentSurah) {
      const currentIndex = surahQueue.findIndex(
        (item) => item.surah.number === currentSurah.number
      );
      if (currentIndex >= 0 && currentIndex < surahQueue.length - 1) {
        const nextItem = surahQueue[currentIndex + 1];
        setCurrentSurah(nextItem.surah);
        setCurrentAyahNumber(null);
        if (nextItem.reciterName) setCurrentReciterName(nextItem.reciterName);
        if (nextItem.riwayaName) setCurrentRiwayaName(nextItem.riwayaName);
        if (nextItem.reciterImage !== undefined)
          setCurrentReciterImage(nextItem.reciterImage);
        changeAudioSource(audio, nextItem.audioUrl);
        return;
      }
    } else if (playbackType === "verse" && currentAyahNumber !== null && playlist.length > 0) {
      const nextIndex = playlist.findIndex(
        (item) => item.ayahNumberInSurah === currentAyahNumber + 1
      );
      if (nextIndex >= 0) {
        const nextItem = playlist[nextIndex];
        setCurrentAyahNumber(nextItem.ayahNumberInSurah);
        changeAudioSource(audio, nextItem.audioUrl);
        return;
      }
    }

    setIsPlaying(false);
  }, [playbackType, surahQueue, currentSurah, currentAyahNumber, playlist, changeAudioSource]);

  // Previous Track callback
  const previousTrackCallback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playbackType === "surah" && surahQueue.length > 0 && currentSurah) {
      const currentIndex = surahQueue.findIndex(
        (item) => item.surah.number === currentSurah.number
      );
      if (currentIndex > 0) {
        const prevItem = surahQueue[currentIndex - 1];
        setCurrentSurah(prevItem.surah);
        setCurrentAyahNumber(null);
        if (prevItem.reciterName) setCurrentReciterName(prevItem.reciterName);
        if (prevItem.riwayaName) setCurrentRiwayaName(prevItem.riwayaName);
        if (prevItem.reciterImage !== undefined)
          setCurrentReciterImage(prevItem.reciterImage);
        changeAudioSource(audio, prevItem.audioUrl);
        return;
      }
    } else if (playbackType === "verse" && currentAyahNumber !== null && playlist.length > 0) {
      const prevIndex = playlist.findIndex(
        (item) => item.ayahNumberInSurah === currentAyahNumber - 1
      );
      if (prevIndex >= 0) {
        const prevItem = playlist[prevIndex];
        setCurrentAyahNumber(prevItem.ayahNumberInSurah);
        changeAudioSource(audio, prevItem.audioUrl);
        return;
      }
    }
  }, [playbackType, surahQueue, currentSurah, currentAyahNumber, playlist, changeAudioSource]);

  // Handle track ending: loop or go to next
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        safePlay(audio);
        return;
      }
      nextTrackCallback();
    };

    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("ended", onEnded);
    };
  }, [isLooping, nextTrackCallback, safePlay]);

  const playAyah = useCallback(
    (
      surah: Surah | SurahDetail,
      ayahNumberInSurah: number,
      customUrl?: string,
      ayahsAudioPlaylist?: AudioAyahItem[]
    ) => {
      const audio = audioRef.current;
      if (!audio) return;

      // Immediately pause currently playing audio so full surah or old track cuts off instantly
      safePause(audio);

      setPlaybackType("verse");
      setCurrentSurah(surah);
      setCurrentAyahNumber(ayahNumberInSurah);

      const info = resolveReciter(currentReciter);
      setCurrentReciterName(info.nameArabic);
      setCurrentReciterImage(info.image);

      if (ayahsAudioPlaylist && ayahsAudioPlaylist.length > 0) {
        setPlaylist(ayahsAudioPlaylist);
      }

      let url = customUrl;
      if (!url && ayahsAudioPlaylist && ayahsAudioPlaylist.length > 0) {
        const found = ayahsAudioPlaylist.find(
          (p) => p.ayahNumberInSurah === ayahNumberInSurah
        );
        url = found?.audioUrl;
      }

      // If no custom URL provided but surah has ayahs metadata, construct CDN URLs directly for instant zero-latency playback
      const surahWithAyahs = surah as Partial<SurahDetail>;
      if (!url && surahWithAyahs.ayahs && surahWithAyahs.ayahs.length > 0) {
        const items: AudioAyahItem[] = surahWithAyahs.ayahs.map((a) => ({
          ayahNumberInSurah: a.numberInSurah,
          audioUrl: `https://cdn.islamic.network/quran/audio/128/${info.editionId}/${a.number}.mp3`,
        }));
        setPlaylist(items);
        const target = items.find(
          (i) => i.ayahNumberInSurah === ayahNumberInSurah
        );
        url = target?.audioUrl;
      }

      if (!url) {
        setIsLoading(true);
        fetch(
          `https://api.alquran.cloud/v1/surah/${surah.number}/${info.editionId}`
        )
          .then((res) => res.json())
          .then((json) => {
            if (json.code === 200 && json.data?.ayahs) {
              const items: AudioAyahItem[] = json.data.ayahs
                .filter((a: ApiAyahAudio) => Boolean(a.audio))
                .map((a: ApiAyahAudio) => ({
                  ayahNumberInSurah: a.numberInSurah,
                  audioUrl: a.audio,
                }));
              setPlaylist(items);
              const target = items.find(
                (i) => i.ayahNumberInSurah === ayahNumberInSurah
              );
              if (target && target.audioUrl) {
                changeAudioSource(audio, target.audioUrl);
              }
            }
          })
          .catch((e) => {
            console.error("Error fetching audio:", e);
          })
          .finally(() => {
            setIsLoading(false);
          });
        return;
      }

      changeAudioSource(audio, url);
    },
    [currentReciter, changeAudioSource, safePause]
  );

  const playSurah = useCallback(
    async (surah: Surah, reciter = currentReciter) => {
      const audio = audioRef.current;
      if (audio) safePause(audio);

      setIsLoading(true);
      setCurrentSurah(surah);

      const info = resolveReciter(reciter);
      setCurrentReciter(info.id);
      setCurrentReciterName(info.nameArabic);
      setCurrentReciterImage(info.image);

      try {
        // If reciter has full surah audio on MP3Quran server, use direct MP3 audio
        if (info.numericId > 0) {
          const directUrl = getReciterAudioUrl(info.numericId, surah.number);
          if (directUrl && audioRef.current) {
            setPlaybackType("surah");
            setCurrentAyahNumber(null);
            changeAudioSource(audioRef.current, directUrl);
            setIsLoading(false);
            return;
          }
        }

        // Verse-by-verse fallback using verified audio editionId
        setPlaybackType("verse");
        const res = await fetch(
          `https://api.alquran.cloud/v1/surah/${surah.number}/${info.editionId}`
        );
        const json = await res.json();
        if (json.code === 200 && json.data?.ayahs?.length > 0) {
          const items: AudioAyahItem[] = json.data.ayahs
            .filter((a: ApiAyahAudio) => Boolean(a.audio))
            .map((a: ApiAyahAudio) => ({
              ayahNumberInSurah: a.numberInSurah,
              audioUrl: a.audio,
            }));
          if (items.length > 0) {
            setPlaylist(items);
            playAyah(surah, 1, items[0].audioUrl, items);
          }
        }
      } catch (err) {
        console.error("Error starting surah playback:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentReciter, playAyah, changeAudioSource, safePause]
  );

  /**
   * Play full surah audio directly from MP3Quran server in the sheikh's voice
   */
  const playDirectSurah = useCallback(
    (
      surah: Surah,
      audioUrl: string,
      reciterName: string,
      riwayaName = "حفص عن عاصم",
      reciterImage?: string | null,
      playlist?: SurahPlaylistItem[]
    ) => {
      const audio = audioRef.current;
      if (!audio) return;

      safePause(audio);
      setPlaybackType("surah");
      setCurrentSurah(surah);
      setCurrentAyahNumber(null);
      setCurrentReciterName(reciterName);
      setCurrentRiwayaName(riwayaName);
      setCurrentReciterImage(
        reciterImage ?? getReciterImage(reciterName) ?? null
      );
      if (playlist && playlist.length > 0) {
        setSurahQueue(playlist);
      }

      changeAudioSource(audio, audioUrl);
    },
    [changeAudioSource, safePause]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      safePause(audio);
    } else {
      safePlay(audio);
    }
  }, [isPlaying, safePause, safePlay]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setReciter = useCallback(
    (newReciter: string) => {
      const info = resolveReciter(newReciter);
      setCurrentReciter(info.id);
      setCurrentReciterName(info.nameArabic);
      setCurrentReciterImage(info.image);
      saveUserSettings({ audioReciter: info.id });

      if (currentSurah && currentAyahNumber !== null) {
        setIsLoading(true);
        fetch(
          `https://api.alquran.cloud/v1/surah/${currentSurah.number}/${info.editionId}`
        )
          .then((res) => res.json())
          .then((json) => {
            if (json.code === 200 && json.data?.ayahs) {
              const items: AudioAyahItem[] = json.data.ayahs
                .filter((a: ApiAyahAudio) => Boolean(a.audio))
                .map((a: ApiAyahAudio) => ({
                  ayahNumberInSurah: a.numberInSurah,
                  audioUrl: a.audio,
                }));
              setPlaylist(items);
              const target = items.find(
                (i) => i.ayahNumberInSurah === currentAyahNumber
              );
              if (target && target.audioUrl) {
                const audio = audioRef.current;
                if (audio) {
                  changeAudioSource(audio, target.audioUrl);
                }
              }
            }
          })
          .catch((err) => {
            console.error("Failed to switch reciter audio:", err);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    },
    [currentSurah, currentAyahNumber, changeAudioSource]
  );

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      safePause(audio);
      audio.src = "";
    }
    setIsPlaying(false);
    setCurrentSurah(null);
    setCurrentAyahNumber(null);
    setCurrentAudioUrl(null);
    setPlaylist([]);
    setSurahQueue([]);
    setCurrentTime(0);
    setDuration(0);
  }, [safePause]);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentSurah,
        currentAyahNumber,
        currentReciter,
        currentReciterName,
        currentRiwayaName,
        currentReciterImage,
        duration,
        currentTime,
        isLooping,
        isLoading,
        playbackType,
        currentAudioUrl,
        playAyah,
        playSurah,
        playDirectSurah,
        togglePlayPause,
        seek,
        nextTrack: nextTrackCallback,
        previousTrack: previousTrackCallback,
        nextAyah: nextTrackCallback,
        previousAyah: previousTrackCallback,
        setReciter,
        toggleLoop,
        closePlayer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
