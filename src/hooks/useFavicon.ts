import { useEffect } from 'react';

export function useFavicon() {
  useEffect(() => {
    // Create SVG favicon with "V" for Veridex
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" rx="20" fill="#3b82f6"/>
        <text x="50" y="72" font-family="system-ui, -apple-system, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">V</text>
      </svg>
    `;
    
    // Convert SVG to data URI
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    // Create and append favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = url;
    
    // Remove any existing favicon
    const existingFavicon = document.querySelector("link[rel*='icon']");
    if (existingFavicon) {
      existingFavicon.remove();
    }
    
    // Append new favicon
    document.head.appendChild(link);
    
    // Cleanup function
    return () => {
      link.remove();
      URL.revokeObjectURL(url);
    };
  }, []);
}