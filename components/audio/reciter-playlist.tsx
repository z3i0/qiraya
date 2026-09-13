"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Mp3Reciter, Riwayah, parseSurahList, getSurahAudioUrl } from "@/lib/api/mp3quran";
import { Surah } from "@/types/quran";
import { useAudio, SurahPlaylistItem } from "@/components/audio/audio-context";
import { SheikhAvatar } from "@/components/audio/sheikh-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Search,
  CheckCircle2,
  Download,
} from "lucide-react";
import { downloadAudio } from "@/lib/download";

interface ReciterPlaylistProps {
  reciter: Mp3Reciter;
  surahs: Surah[];
  riwayat: Riwayah[];
  initialRiwayaId?: number;
}

export function ReciterPlaylist({
  reciter,
  surahs,
  riwayat,
  initialRiwayaId,
}: ReciterPlaylistProps) {
  const t = useTranslations("recitations");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const {
    currentSurah,
    currentReciterName,
    isPlaying,
    playDirectSurah,
    togglePlayPause,
  } = useAudio();

  // Find index of moshaf that matches initialRiwayaId, or default to 0
  const availableMoshafs = reciter.moshaf || [];
  const defaultMoshafIndex = useMemo(() => {
    if (!initialRiwayaId) return 0;
    const foundIdx = availableMoshafs.findIndex(
      (m) => m.rewaya_id === initialRiwayaId
    );
    return foundIdx !== -1 ? foundIdx : 0;
  }, [availableMoshafs, initialRiwayaId]);

  const [selectedMoshafIndex, setSelectedMoshafIndex] =
    useState<number>(defaultMoshafIndex);
  const [search, setSearch] = useState("");

  const currentMoshaf = availableMoshafs[selectedMoshafIndex] || availableMoshafs[0];

  // Resolve current riwayah title
  const currentRiwayaTitle = useMemo(() => {
    if (!currentMoshaf) return isRtl ? "حفص عن عاصم" : "Hafs A'n Assem";
    const found = riwayat.find((r) => r.id === currentMoshaf.rewaya_id);
    return found?.name || currentMoshaf.name;
  }, [currentMoshaf, riwayat, isRtl]);

  // Available surah numbers for the chosen moshaf
  const availableSurahNumbers = useMemo(() => {
    if (!currentMoshaf?.surah_list) return [];
    return parseSurahList(currentMoshaf.surah_list);
  }, [currentMoshaf]);

  // Filter full surah metadata from quran-cloud list
  const availableSurahs = useMemo(() => {
    if (availableSurahNumbers.length === 0) return surahs;
    const numSet = new Set(availableSurahNumbers);
    return surahs.filter((s) => numSet.has(s.number));
  }, [surahs, availableSurahNumbers]);

  // Filtered by user search
  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return availableSurahs;
    const q = search.toLowerCase().trim();
    return availableSurahs.filter(
      (s) =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.number) === q
    );
  }, [availableSurahs, search]);

  // Build full queue of surahs for continuous playback
  const fullPlaylistQueue: SurahPlaylistItem[] = useMemo(() => {
    if (!currentMoshaf?.server) return [];
    return availableSurahs.map((s) => ({
      surah: s,
      audioUrl: getSurahAudioUrl(currentMoshaf.server, s.number),
      reciterName: reciter.name,
      riwayaName: currentRiwayaTitle,
      reciterImage: reciter.imageUrl,
    }));
  }, [availableSurahs, currentMoshaf, reciter, currentRiwayaTitle]);

  const handlePlaySurah = (surah: Surah) => {
    if (!currentMoshaf?.server) return;

    const isThisPlaying =
      currentSurah?.number === surah.number &&
      currentReciterName === reciter.name &&
      isPlaying;

    if (isThisPlaying) {
      togglePlayPause();
    } else {
      const audioUrl = getSurahAudioUrl(currentMoshaf.server, surah.number);
      playDirectSurah(
        surah,
        audioUrl,
        reciter.name,
        currentRiwayaTitle,
        reciter.imageUrl,
        fullPlaylistQueue
      );
    }
  };

  const handlePlayFirstSurah = () => {
    if (availableSurahs.length > 0) {
      handlePlaySurah(availableSurahs[0]);
    }
  };

  const isSheikhActivePlaying =
    currentReciterName === reciter.name && isPlaying;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Back to recitations directory */}
      <div>
        <Link
          href="/recitations"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          {isRtl ? <ArrowRight className="size-3.5" /> : <ArrowLeft className="size-3.5" />}
          <span>{t("backToDirectory")}</span>
        </Link>
      </div>

      {/* Reciter Profile Hero Banner */}
      <header className="p-6 sm:p-10 rounded-3xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm text-center sm:text-start relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 z-10 min-w-0">
          <SheikhAvatar
            src={reciter.imageUrl}
            name={reciter.name}
            size="xl"
            isPlaying={isSheikhActivePlaying}
            className="ring-4 ring-primary/20 shadow-md shrink-0"
          />

          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <span>{currentRiwayaTitle}</span>
            </div>

            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground truncate ${isRtl ? "font-arabic" : "font-sans"}`}>
              {reciter.name}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground">
              {availableSurahs.length >= 114
                ? t("fullMushafSurahs")
                : t("highQualitySurahs", { count: availableSurahs.length })}
            </p>

            {/* Riwayat Switcher (if sheikh has multiple recitations/riwayat) */}
            {availableMoshafs.length > 1 && (
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="text-xs text-muted-foreground ms-1">
                  {t("recordedRiwayat")}
                </span>
                {availableMoshafs.map((m, idx) => {
                  const rw = riwayat.find((r) => r.id === m.rewaya_id);
                  const isCurrent = idx === selectedMoshafIndex;
                  return (
                    <button
                      key={m.id || idx}
                      onClick={() => setSelectedMoshafIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "bg-muted/80 text-foreground hover:bg-muted"
                      }`}
                    >
                      {rw?.name || m.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Start playback button */}
        <div className="z-10 shrink-0">
          <Button
            size="lg"
            onClick={handlePlayFirstSurah}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 shadow-md cursor-pointer"
          >
            <Play className="size-4 fill-current translate-x-0.5" />
            <span>{t("playFromStart")}</span>
          </Button>
        </div>
      </header>

      {/* Surahs Playlist Header & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div>
          <h2 className={`text-lg sm:text-xl font-bold text-foreground ${isRtl ? "font-arabic" : "font-sans"}`}>
            {t("selectSurah")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isRtl
              ? `${filteredSurahs.length} ${common("surahs")} متوفرة بصوت الشيخ`
              : `${filteredSurahs.length} surahs available by the reciter`}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="size-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={common("search")}
            className="ps-10 h-10 rounded-full bg-card border-border text-sm"
          />
        </div>
      </div>

      {/* Surahs Playlist Grid */}
      <div className="space-y-2">
        {filteredSurahs.map((surah) => {
          const isThisPlaying =
            currentSurah?.number === surah.number &&
            currentReciterName === reciter.name &&
            isPlaying;

          return (
            <div
              key={surah.number}
              onClick={() => handlePlaySurah(surah)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                isThisPlaying
                  ? "bg-primary/10 border-primary/40 shadow-xs"
                  : "bg-card hover:bg-muted/50 border-border"
              }`}
            >
              {/* Left: Play Icon & Surah Info */}
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div
                  className={`size-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isThisPlaying
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                  }`}
                >
                  {isThisPlaying ? (
                    <Pause className="size-4 fill-current" />
                  ) : (
                    <Play className="size-4 fill-current translate-x-0.5" />
                  )}
                </div>

                <div className="min-w-0 text-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground/70">
                      {String(surah.number).padStart(3, "0")}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                      {isRtl ? surah.name : surah.englishName}
                    </h3>
                    {isThisPlaying && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <CheckCircle2 className="size-3" />
                        <span>{t("nowPlaying")}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isRtl ? surah.englishName : surah.name} • {surah.numberOfAyahs} {isRtl ? "آية" : "ayahs"}
                  </p>
                </div>
              </div>

              {/* Right: Download & Read in Mushaf Links */}
              <div
                className="flex items-center gap-1.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => {
                    if (currentMoshaf?.server) {
                      const audioUrl = getSurahAudioUrl(
                        currentMoshaf.server,
                        surah.number
                      );
                      if (audioUrl) {
                        const filename = isRtl
                          ? `سورة ${surah.name} - ${reciter.name}.mp3`
                          : `Surah ${surah.englishName} - ${reciter.name}.mp3`;
                        downloadAudio(audioUrl, filename);
                      }
                    }
                  }}
                  className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title={common("download")}
                  aria-label={common("download")}
                >
                  <Download className="size-4" />
                </Button>

                <Link
                  href={`/quran/${surah.number}`}
                  className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  title={t("readInMushaf")}
                >
                  <BookOpen className="size-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
