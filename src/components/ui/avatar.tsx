import { cn } from "@/shared/lib/cn";

type Props = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/** Profile photo, or the person's initials when they have not uploaded one. */
export function Avatar({ src, alt, size = 36, className }: Props) {
  if (!src) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-brand-blue-soft font-bold text-brand-blue select-none",
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }}
      >
        {initials(alt)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img loading="lazy" decoding="async" src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
