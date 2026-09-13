import React from "react";
import { BookmarksManager } from "@/components/bookmarks/bookmarks-manager";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.bookmarks" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function BookmarksPage() {
  return <BookmarksManager />;
}
