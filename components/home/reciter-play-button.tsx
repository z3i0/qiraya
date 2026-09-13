"use client";

import React from "react";
import { useAudio } from "@/components/audio/audio-context";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getReciterAudioUrl, getReciterImage } from "@/lib/data/reciters";

interface ReciterPlayButtonProps {
  reciterId: string;
  reciterName: string;
}

export function ReciterPlayButton({
  reciterId,
  reciterName,
}: ReciterPlayButtonProps) {
  const {
    isPlaying,
    currentReciterName,
    playDirectSurah,
    togglePlayPause,
  } = useAudio();

  const isThisReciterPlaying = currentReciterName === reciterName && isPlaying;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isThisReciterPlaying) {
      togglePlayPause();
      return;
    }

    const audioUrl = getReciterAudioUrl(reciterId, 1);
    if (!audioUrl) return;

    playDirectSurah(
      {
        number: 1,
        name: "سُورَةُ ٱلْفَاتِحَةِ",
        englishName: "Al-Faatiha",
        englishNameTranslation: "The Opening",
        numberOfAyahs: 7,
        revelationType: "Meccan",
      },
      audioUrl,
      reciterName,
      "حفص عن عاصم",
      getReciterImage(reciterId)
    );
  };

  return (
    <Button
      variant={isThisReciterPlaying ? "default" : "secondary"}
      size="icon"
      onClick={handleClick}
      className="rounded-full shadow-xs shrink-0 cursor-pointer"
      aria-label={isThisReciterPlaying ? "Pause" : "Play sample"}
    >
      {isThisReciterPlaying ? (
        <Pause className="size-4 fill-current" />
      ) : (
        <Play className="size-4 fill-current translate-x-0.5" />
      )}
    </Button>
  );
}

