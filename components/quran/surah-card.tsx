"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Surah } from "@/types/quran";
import { cn } from "cn";

export interface SurahCardProps {
  surah: Surah;
  isPlaying?: boolean;
  onPlay?: (e: React.MouseEvent) => void;
  className?: string;
}

/**
 * Standard SurahCard component adhering strictly to the library's default
 * components, sizes, spacing tokens, and slots (Card, CardHeader, CardTitle,
 * CardDescription, CardAction, CardFooter, Badge, Button).
 * Fully responsive across all devices (mobile 375px, tablet, and desktop).
 */
export function SurahCard({
  surah,
  isPlaying = false,
  onPlay,
  className,
}: SurahCardProps) {
  const t = useTranslations("quran");
  const common = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const isMeccan = surah.revelationType === "Meccan";
  const revelationLabel = isRtl
    ? isMeccan
      ? common("meccan")
      : common("medinan")
    : surah.revelationType;

  return (
    <Card
      className={cn(
        "relative group/surah transition-colors hover:border-primary/50",
        isPlaying && "ring-2 ring-primary border-primary",
        className
      )}
    >
      {/* Background clickable link for accessible card navigation */}
      <Link
        href={`/quran/${surah.number}`}
        className="absolute inset-0 z-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("surahCardAria", {
          name: isRtl ? surah.name : surah.englishName,
        })}
      />

      {/* Standard library CardHeader: Number + Title/Description + Play Action */}
      <CardHeader>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm shrink-0 transition-colors group-hover/surah:bg-primary group-hover/surah:text-primary-foreground">
            {surah.number}
          </div>

          <div className="min-w-0 space-y-1 text-start">
            <CardTitle
              className={cn(
                "font-semibold truncate",
                isRtl ? "font-arabic" : "font-sans"
              )}
            >
              {isRtl ? surah.name : surah.englishName}
            </CardTitle>
            <CardDescription className="truncate">
              {surah.englishNameTranslation}
            </CardDescription>
          </div>
        </div>

        {onPlay && (
          <CardAction className="relative z-10 self-center">
            <Button
              type="button"
              variant={isPlaying ? "default" : "secondary"}
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPlay(e);
              }}
              className="rounded-full cursor-pointer"
              title={isPlaying ? common("pause") : common("play")}
              aria-label={isPlaying ? common("pause") : common("play")}
            >
              {isPlaying ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current translate-x-0.5" />
              )}
            </Button>
          </CardAction>
        )}
      </CardHeader>

      {/* Standard library CardFooter with automatic border-t spacing */}
      <CardFooter className="border-t justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{revelationLabel}</Badge>
          <span>
            {surah.numberOfAyahs} {common("verses")}
          </span>
        </div>

        <span
          className="font-arabic text-xl text-muted-foreground/80 group-hover/surah:text-foreground transition-colors"
          dir="rtl"
        >
          {surah.name}
        </span>
      </CardFooter>
    </Card>
  );
}
