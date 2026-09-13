"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mic } from "lucide-react";

interface SheikhAvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "rounded";
  isPlaying?: boolean;
  className?: string;
  priority?: boolean;
}

const sizeMap = {
  sm: {
    container: "size-10",
    text: "text-sm",
    icon: "size-4",
  },
  md: {
    container: "size-14",
    text: "text-lg",
    icon: "size-6",
  },
  lg: {
    container: "size-20",
    text: "text-2xl",
    icon: "size-8",
  },
  xl: {
    container: "size-28",
    text: "text-4xl",
    icon: "size-10",
  },
};

export function SheikhAvatar({
  src,
  name,
  size = "md",
  shape = "circle",
  isPlaying = false,
  className = "",
  priority = false,
}: SheikhAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(src) && !imageError;

  const cfg = sizeMap[size];
  const roundedStyle = shape === "circle" ? "rounded-full" : "rounded-2xl";

  // Clean initial letter from name
  const cleanName = (name || "")
    .replace(/الشيخ|القارئ|sheikh|qari|reciter/gi, "")
    .trim();
  const initial = (cleanName[0] || name[0] || "").toUpperCase();

  return (
    <div
      className={`relative shrink-0 select-none overflow-hidden flex items-center justify-center transition-all duration-200 border border-border/70 dark:border-white/10 ${
        roundedStyle
      } ${cfg.container} ${
        isPlaying
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : ""
      } ${
        hasImage
          ? "bg-muted"
          : "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary font-bold"
      } ${className}`}
    >
      {hasImage ? (
        <Image
          src={src!}
          alt={name}
          fill
          priority={priority}
          sizes={
            size === "xl"
              ? "112px"
              : size === "lg"
              ? "80px"
              : size === "md"
              ? "56px"
              : "40px"
          }
          className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
          unoptimized={src!.startsWith("http")}
        />
      ) : initial ? (
        <span className={`font-bold select-none leading-none ${cfg.text}`}>
          {initial}
        </span>
      ) : (
        <Mic className={`${cfg.icon} opacity-60`} />
      )}
    </div>
  );
}
