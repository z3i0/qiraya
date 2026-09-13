import React from "react";
import { SettingsView } from "@/components/settings/settings-view";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.settings" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function SettingsPage() {
  return <SettingsView />;
}
