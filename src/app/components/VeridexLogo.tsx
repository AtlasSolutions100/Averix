import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

interface VeridexLogoProps {
  className?: string;
}

export function VeridexLogo({ className = "w-8 h-8" }: VeridexLogoProps) {
  return (
    <ImageWithFallback
      src="https://xyeoogvecvmbuvoczuva.supabase.co/storage/v1/object/public/Veridex%20logo/Veridex-Logo2.png"
      alt="Veridex Logo"
      className={className}
    />
  );
}