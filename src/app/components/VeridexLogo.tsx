import logoImg from "figma:asset/25471d4a5860682699163a46e628fdab95cf9901.png";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

interface VeridexLogoProps {
  className?: string;
}

export function VeridexLogo({ className = "w-8 h-8" }: VeridexLogoProps) {
  return (
    <ImageWithFallback
      src={logoImg}
      alt="Veridex Logo"
      className={className}
    />
  );
}
