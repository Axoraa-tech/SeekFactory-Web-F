import Image from "next/image";
import { useTranslations } from "next-intl";

type Props = {
  className?: string;
  priority?: boolean;
};

/** Full SeekFactory lockup (SF mark + wordmark + tagline). */
export function BrandLogo({ className, priority = false }: Props) {
  const t = useTranslations();
  return (
    <Image
      src="/brand/seekfactory-logo.png"
      alt={t("ui.seekfactoryGreenFactoriesWorldwide")}
      width={851}
      height={293}
      priority={priority}
      className={className}
    />
  );
}
