import { cn } from "@/lib/utils";

export function SectionLabel({
  label,
  tone = "onDark",
  className,
}: {
  index?: string;
  label: string;
  tone?: "onDark" | "onLight";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-body text-xs uppercase tracking-[0.28em]",
        tone === "onDark" ? "text-white/45" : "text-ink/50",
        className
      )}
    >
      <span className="h-px w-8 bg-teal" />
      <span>{label}</span>
    </div>
  );
}
