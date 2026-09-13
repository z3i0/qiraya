import React from "react";
import { Link } from "@/i18n/routing";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground font-mono font-bold text-xl">
        404
      </div>
      <h2 className="text-xl sm:text-2xl font-arabic font-bold text-foreground">
        الصفحة غير موجودة • Page Not Found
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        لم نتمكن من العثور على الصفحة أو السورة المطلوبة.
      </p>
      <Link href="/quran">
        <Button className="gap-2 bg-primary text-primary-foreground mt-2">
          <Compass className="size-4" />
          <span>المصحف الشريف • The Holy Quran</span>
        </Button>
      </Link>
    </div>
  );
}
