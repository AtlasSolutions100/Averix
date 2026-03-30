import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = React.memo(({ message = "Loading...", fullScreen = false }: LoadingSpinnerProps) => {
  const content = (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        {/* Neon RGB animated spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00D9FF] animate-spin"></div>
        <div 
          className="absolute inset-0 rounded-full border-4 border-transparent border-r-[#7C5CFA] animate-spin" 
          style={{ animationDelay: '0.15s', animationDuration: '1.5s' }}
        ></div>
        <div 
          className="absolute inset-0 rounded-full border-4 border-transparent border-b-[#FF006E] animate-spin" 
          style={{ animationDelay: '0.3s', animationDuration: '2s' }}
        ></div>
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        {content}
      </div>
    );
  }

  return content;
});

LoadingSpinner.displayName = 'LoadingSpinner';
