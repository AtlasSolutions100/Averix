interface VeridexLogoProps {
  className?: string;
}

export function VeridexLogo({ className = "w-8 h-8" }: VeridexLogoProps) {
  return (
    <img
      src="/veridex-logo.png"
      alt="Veridex Logo"
      className={className}
    />
  );
}
