"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const emptySubscribe = () => () => {};

function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    // Render a placeholder with same dimensions to avoid layout shift
    return (
      <div className="size-8 rounded-full" aria-hidden />
    );
  }

  return (
    <AnimatedThemeToggler
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={(t) => setTheme(t)}
      variant="circle"
      className="inline-flex items-center justify-center size-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer [&_svg]:size-4"
      aria-label="Toggle theme"
    />
  );
}
