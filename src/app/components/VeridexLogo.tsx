interface VeridexLogoProps {
  className?: string;
}

export function VeridexLogo({ className = "w-8 h-8" }: VeridexLogoProps) {
  return (
    <svg
      width="240"
      height="360"
      viewBox="0 0 240 360"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left (neutral / base) V */}
      <path
        d="M40 20 L120 200 L80 260 L120 340 L40 340 L0 260 L40 200 L0 20 Z"
        fill="#E6E6E6"
      />

      {/* Right (signal / intelligence) V */}
      <path
        d="M160 20 L240 20 L200 80 L200 200 L160 260 L200 340 L120 340 L160 260 L120 200 L160 140 Z"
        fill="#7C5CFA"
      />

      {/* Inner triangle cut */}
      <path
        d="M175 70 L215 70 L195 105 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
