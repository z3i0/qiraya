import React from "react";
import { getVerseOfTheDay } from "@/lib/api/quran-cloud";
import { ContinueReadingCard } from "@/components/home/continue-reading-card";
import {
  HeroSection,
  FeaturesBento,
  RecitersMarquee,
  VerseOfDay,
  CtaSection,
} from "@/components/landing";

export default async function HomePage() {
  const dailyVerseData = await getVerseOfTheDay();

  return (
    <div className="w-full space-y-12 sm:space-y-16">
      {/* 1. Hero Section with DotPattern & Animated Badge */}
      <HeroSection />

      {/* 2. Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 sm:space-y-20">
        {/* Continue Reading Card (Dynamic Client Persistence) */}
        <ContinueReadingCard />

        {/* 3. Features & Benefits Bento Grid (Magic UI BentoGrid) */}
        <FeaturesBento />

        {/* 4. Verse of the Day / Daily Reflection */}
        <VerseOfDay dailyVerseData={dailyVerseData} />

        {/* 5. Featured Recitations Ribbon (Magic UI Marquee) */}
        <RecitersMarquee />

        {/* 6. Final SaaS-Style Conversion CTA Banner */}
        <CtaSection />
      </div>
    </div>
  );
}

