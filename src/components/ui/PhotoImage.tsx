import Image from "next/image";
import { cn } from "@/lib/utils";

export function PhotoImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1280px) 40vw, (min-width: 768px) 60vw, 100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-white/10", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
