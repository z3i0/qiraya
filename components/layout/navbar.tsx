"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";

import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BookOpen,
  Compass,
  Headphones,
  Search,
  Bookmark,
  Settings,
  Menu,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("home"), icon: BookOpen },
    { href: "/quran", label: t("quran"), icon: Compass },
    { href: "/juz", label: t("juz"), icon: Compass },
    { href: "/recitations", label: t("recitations"), icon: Headphones },
    { href: "/search", label: t("search"), icon: Search },
    { href: "/bookmarks", label: t("bookmarks"), icon: Bookmark },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg sm:text-xl text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="size-9 rounded-xl overflow-hidden shadow-xs border border-white/10 dark:border-white/15 shrink-0 bg-[#020035]">
            <Image
              src="/images/logo/logo-icon.png"
              alt={common("appName")}
              width={36}
              height={36}
              className="size-full object-cover"
              priority
            />
          </div>
          <span className="font-arabic font-bold text-lg sm:text-xl tracking-tight">
            {common("appName")}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Tools: Language, Theme & Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {/* Mobile Sheet Trigger */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("toggleMenu")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Menu className="size-5" />
                  </Button>
                }
              />
              <SheetContent side={locale === "ar" ? "right" : "left"} className="w-72 pt-8">
                <SheetHeader className="mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="size-8 rounded-lg overflow-hidden shadow-xs border border-white/10 shrink-0 bg-[#020035]">
                      <Image
                        src="/images/logo/logo-icon.png"
                        alt={common("appName")}
                        width={32}
                        height={32}
                        className="size-full object-cover"
                      />
                    </div>
                    <span className="font-arabic font-bold text-lg">
                      {common("appName")}
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1.5">
                  {navLinks.map((link) => {
                    const active = isActive(link.href);
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <Icon className="size-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
