import React from "react";
import { cn } from "@/lib/utils";

export type SectionAccent = "teal" | "blue" | "amber" | "purple" | "emerald" | "rose" | "slate";

interface BriefSectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
  accent?: SectionAccent;
  className?: string;
}

const ACCENT: Record<SectionAccent, { bar: string; number: string; title: string }> = {
  teal:    { bar: "border-teal-500",    number: "text-teal-500",    title: "text-teal-800" },
  blue:    { bar: "border-blue-500",    number: "text-blue-500",    title: "text-blue-800" },
  amber:   { bar: "border-amber-500",   number: "text-amber-500",   title: "text-amber-800" },
  purple:  { bar: "border-purple-500",  number: "text-purple-500",  title: "text-purple-800" },
  emerald: { bar: "border-emerald-500", number: "text-emerald-600", title: "text-emerald-800" },
  rose:    { bar: "border-rose-500",    number: "text-rose-500",    title: "text-rose-800" },
  slate:   { bar: "border-slate-400",   number: "text-slate-400",   title: "text-slate-700" },
};

export default function BriefSection({
  number,
  title,
  children,
  accent = "slate",
  className,
}: BriefSectionProps) {
  const a = ACCENT[accent];
  return (
    <section className={cn("py-6 border-b border-slate-100 last:border-0", className)}>
      <div className={cn("flex items-start gap-3 mb-4 pl-4 border-l-2", a.bar)}>
        <div>
          <span className={cn("text-[10px] font-bold uppercase tracking-widest block leading-none mb-0.5", a.number)}>
            {number}
          </span>
          <h2 className={cn("text-xs font-bold uppercase tracking-[0.12em]", a.title)}>
            {title}
          </h2>
        </div>
      </div>
      <div className="pl-4">{children}</div>
    </section>
  );
}
