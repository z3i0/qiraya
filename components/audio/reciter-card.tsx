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
import { SheikhAvatar } from "@/components/audio/sheikh-avatar";
import { Play, Pause, ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { cn } from "cn";

export interface ReciterCardProps {
  reciter: {
    id: number | string;
    name: string;
    imageUrl?: string | null;
  };
  riwayaTitle?: string;
  totalSurahs?: number;
  isFullQuran?: boolean;
  href?: string;
  isPlaying?: boolean;
  onPlay?: (e: React.MouseEvent) => void;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Standard ReciterCard component adhering strictly to the library's default
 * components, sizes, spacing tokens, and slots (Card, CardHeader, CardTitle,
 * CardDescription, CardAction, CardFooter, Badge, Button).
 */
export function ReciterCard({
  reciter,
  riwayaTitle,
  totalSurahs = 114,
  isFullQuran = totalSurahs >= 114,
  href,
  isPlaying = false,
  onPlay,
  action,
  className,
}: ReciterCardProps) {
  const t = useTranslations("recitations");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const resolvedHref = href || `/recitations/${reciter.id}`;
  const defaultRiwayah = isRtl ? "حفص عن عاصم" : "Hafs 'an 'Asim";
  const displayRiwayah = riwayaTitle || defaultRiwayah;

  return (
    <Card
      className={cn(
        "relative group/reciter transition-colors hover:border-primary/50",
        isPlaying && "ring-2 ring-primary border-primary",
        className
      )}
    >
      {/* Background clickable link for accessible card navigation */}
      <Link
        href={resolvedHref}
        className="absolute inset-0 z-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={reciter.name}
      />

      {/* Standard library CardHeader with avatar, title, description, and action */}
      <CardHeader>
        <div className="flex items-center gap-3.5 min-w-0">
          <SheikhAvatar
            src={reciter.imageUrl}
            name={reciter.name}
            size="md"
            isPlaying={isPlaying}
            className="shrink-0"
          />

          <div className="min-w-0 space-y-1 text-start">
            <CardTitle className="truncate font-arabic font-semibold">
              {reciter.name}
            </CardTitle>
            <CardDescription className="truncate">
              {displayRiwayah}
            </CardDescription>
          </div>
        </div>

        {(action || onPlay) && (
          <CardAction className="relative z-10 self-center">
            {action ? (
              action
            ) : (
              <Button
                type="button"
                variant={isPlaying ? "default" : "secondary"}
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlay?.(e);
                }}
                title={t("quickPlayReciter", { name: reciter.name })}
                aria-label={t("quickPlayReciter", { name: reciter.name })}
              >
                {isPlaying ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="size-4 fill-current translate-x-0.5" />
                )}
              </Button>
            )}
          </CardAction>
        )}
      </CardHeader>

      {/* Standard library CardFooter with automatic border-t spacing */}
      <CardFooter className="border-t justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={isFullQuran ? "default" : "secondary"}>
            {isFullQuran
              ? t("fullMushafSurahs")
              : t("surahsAvailableCount", { count: totalSurahs })}
          </Badge>

          {isPlaying && (
            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
              <Volume2 className="size-3.5 animate-pulse" />
              <span className="hidden sm:inline">{t("nowPlaying")}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover/reciter:text-primary transition-colors">
          <span className="hidden sm:inline">{t("listenToQuran")}</span>
          {isRtl ? (
            <ArrowLeft className="size-3.5 transition-transform group-hover/reciter:-translate-x-1" />
          ) : (
            <ArrowRight className="size-3.5 transition-transform group-hover/reciter:translate-x-1" />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
