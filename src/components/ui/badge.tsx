import { cn } from "@/shared/lib/cn";

type Props = {
  count: number;
  className?: string;
  tone?: "danger" | "brand";
};

export function Badge({ count, className, tone = "danger" }: Props) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white",
        tone === "danger" ? "bg-red-500" : "bg-brand-blue",
        className,
      )}
    >
      {count}
    </span>
  );
}
