interface VeridexLogoProps {
  className?: string;
}

export function VeridexLogo({ className = "w-8 h-8" }: VeridexLogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left V - Gray/White */}
      <path
        d="M40 40 L100 140 L70 140 L30 70 L30 40 Z"
        fill="#E5E7EB"
        opacity="0.9"
      />
      <path
        d="M30 70 L70 140 L30 140 Z"
        fill="#9CA3AF"
        opacity="0.7"
      />
      
      {/* Right V - Purple/Indigo */}
      <path
        d="M100 40 L160 140 L130 140 L90 70 L90 40 Z"
        fill="#A78BFA"
        opacity="0.95"
      />
      <path
        d="M90 70 L130 140 L90 140 Z"
        fill="#8B5CF6"
      />
      
      {/* Overlap center highlight */}
      <path
        d="M85 90 L100 115 L115 90 Z"
        fill="#C4B5FD"
        opacity="0.6"
      />
    </svg>
  );
}
