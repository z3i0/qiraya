import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string;
  className: string;
  background?: ReactNode;
  Icon: React.ElementType;
  description: string;
  href: string;
  cta: string;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-auto lg:auto-rows-[16rem]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6",
      "bg-card text-card-foreground border border-border/70 hover:border-primary/50 transition-all duration-300 shadow-2xs hover:shadow-sm",
      "min-h-[13.5rem] lg:min-h-0",
      className
    )}
    {...props}
  >
    {background && <div>{background}</div>}

    <div className="z-10 flex flex-col gap-3">
      <div className="size-10 sm:size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
        <Icon className="size-5 sm:size-5.5" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
          {description}
        </p>
      </div>
    </div>

    <div className="z-10 pt-4 mt-auto">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors group/cta"
      >
        <span>{cta}</span>
        <ArrowRight className="size-3.5 sm:size-4 rtl:rotate-180 transition-transform group-hover/cta:translate-x-1 rtl:group-hover/cta:-translate-x-1" />
      </Link>
    </div>
  </div>
);

export { BentoCard, BentoGrid };

