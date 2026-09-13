import React from "react";
import { useTranslations } from "next-intl";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BookOpen, Disc, Layers, Users } from "lucide-react";

export function StatsTicker() {
  const t = useTranslations("home");

  const stats = [
    {
      value: 114,
      suffix: "",
      label: t("statsSurahs"),
      icon: BookOpen,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      value: 6236,
      suffix: "",
      label: t("statsAyahs"),
      icon: Disc,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    {
      value: 30,
      suffix: "",
      label: t("statsJuz"),
      icon: Layers,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    {
      value: 60,
      suffix: "+",
      label: t("statsReciters"),
      icon: Users,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
    },
  ];

  return (
    <section className="py-8 sm:py-12 border-y border-border/60">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-4 sm:p-6 rounded-2xl bg-card/60 border border-border/40 hover:border-primary/30 transition-colors flex flex-col items-center justify-center space-y-2 group"
            >
              <div className={`p-2.5 rounded-xl ${stat.color} mb-1 group-hover:scale-105 transition-transform`}>
                <Icon className="size-5" />
              </div>

              <div className="flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-foreground tracking-tight" dir="ltr">
                <NumberTicker value={stat.value} className="text-foreground" />
                {stat.suffix && (
                  <span className="text-primary ms-0.5">{stat.suffix}</span>
                )}
              </div>

              <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
