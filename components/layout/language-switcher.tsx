"use client";

import React, { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === "ar" ? "en" : "ar";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      disabled={isPending}
      className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full px-2.5"
      aria-label="Switch interface language"
    >
      <Globe className="size-3.5" />
      <span className="font-semibold">{locale === "ar" ? "English" : "العربية"}</span>
    </Button>
  );
}
