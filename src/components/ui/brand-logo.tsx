import Image from "next/image";

type Props = {
  className?: string;
  priority?: boolean;
};

/** Full SeekFactory lockup (SF mark + wordmark + tagline). */
export function BrandLogo({ className, priority = false }: Props) {
  return (
    <Image
      src="/brand/seekfactory-logo.png"
      alt="SeekFactory — Green Factories Worldwide"
      width={851}
      height={293}
      priority={priority}
      className={className}
    />
  );
}
