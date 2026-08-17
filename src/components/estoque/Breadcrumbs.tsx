import Link from "next/link";
import type { Crumb } from "@/lib/stock/generateMetadata";

/** Breadcrumb navegável e rastreável — o último item não vira link. */
export function Breadcrumbs({ crumbs, label }: { crumbs: Crumb[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-[13px] text-white/45">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden className="text-white/20">
                  /
                </span>
              )}
              {isLast ? (
                <span aria-current="page" className="text-white/70">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path} className="transition-colors hover:text-teal">
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
