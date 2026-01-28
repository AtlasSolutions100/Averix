import { useEffect } from 'react';

export function useFavicon() {
  useEffect(() => {
    // Create and append favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/x-icon';
    link.href = 'https://xyeoogvecvmbuvoczuva.supabase.co/storage/v1/object/public/Veridex%20logo/favicon.ico';
    
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
    };
  }, []);
}
