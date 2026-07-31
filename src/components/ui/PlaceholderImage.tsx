import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlaceholderImage({
  label,
  className,
  showLabel = true,
}: {
  label: string;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-teal/14 via-navy-soft to-ink",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)",
          color: "#FFFFFF",
        }}
      />
      {showLabel && (
        <>
          <div className="relative flex flex-col items-center gap-3 px-6 text-center">
            <ImageIcon size={22} strokeWidth={1.25} className="text-white/30" />
            <span className="font-body text-[10px] uppercase tracking-[0.18em] text-white/40">
              {label}
            </span>
          </div>
          <span className="absolute bottom-3 right-3 font-body text-[9px] uppercase tracking-[0.14em] text-white/25">
            Fotografia a inserir
          </span>
        </>
      )}
    </div>
  );
}
