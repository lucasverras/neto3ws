import { cn } from "@/lib/utils";

/**
 * Absolute-positioned divider for the bottom edge of a section, using the
 * exact fold silhouette provided by the brand asset: shallow and flat
 * across the center, easing out to full height right at both screen
 * edges — no wave, diagonal or arc, and no exaggerated curvature.
 */
export function SectionDivider({
  fillClassName,
  className,
}: {
  fillClassName: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full", className)}
    >
      <svg
        viewBox="0 0 6297.55 355"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <path
          d="M6297.55,6.77l-9.7-4.42-973.82,1.57c-50.04.05-92.44,22.7-132.96,45.48-42.45,23.87-84.61,36.75-135.61,36.75l-3802.38-.08c-101.65,0-166.73-82.28-258.75-82.34L15.49,3.06c-1.96-4.1-3.58-4.12-4.84.13L.96,9.03l.04,329.94-1,.04v15.99h6297.55V6.77Z"
          className={fillClassName}
        />
      </svg>
    </div>
  );
}
