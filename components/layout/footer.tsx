import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Sparkles, ExternalLink } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const common = useTranslations("common");
  const nav = useTranslations("nav");

  return (
    <footer className="w-full border-t border-border/80 bg-card/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg overflow-hidden shadow-xs border border-white/10 shrink-0 bg-[#020035]">
                <Image
                  src="/images/logo/logo-icon.png"
                  alt={common("appName")}
                  width={32}
                  height={32}
                  className="size-full object-cover"
                />
              </div>
              <span className="font-arabic font-bold text-lg text-foreground">
                {common("appName")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              {t("tagline")}
            </p>
            <p className="text-xs text-primary font-medium flex items-center gap-1.5 pt-1">
              <span>{t("apiAttribution")}</span>
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {nav("quran")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/quran" className="hover:text-foreground transition-colors">
                  {t("navSurahs")}
                </Link>
              </li>
              <li>
                <Link href="/juz" className="hover:text-foreground transition-colors">
                  {t("navJuz")}
                </Link>
              </li>
              <li>
                <Link href="/recitations" className="hover:text-foreground transition-colors">
                  {t("navRecitations")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {nav("search")} & {nav("bookmarks")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className="hover:text-foreground transition-colors">
                  {t("navSearch")}
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-foreground transition-colors">
                  {t("navBookmarks")}
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-foreground transition-colors">
                  {t("navSettings")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground text-center sm:text-start">
          <p>{t("rights")}</p>
          <div className="flex items-center gap-4">
            <a
              href="https://alquran.cloud/api"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <span>Al Quran Cloud API</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
