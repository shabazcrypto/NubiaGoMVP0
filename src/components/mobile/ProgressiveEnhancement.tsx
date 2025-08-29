'use client';

import React, { useState, useEffect, ReactNode } from 'react';

interface ProgressiveEnhancementProps {
  children: ReactNode;
  fallback?: ReactNode;
  features?: {
    webp?: boolean;
    serviceWorker?: boolean;
    indexedDB?: boolean;
    webGL?: boolean;
  };
}

export const ProgressiveEnhancement: React.FC<ProgressiveEnhancementProps> = ({ 
  children, 
  fallback = null,
  features = {}
}) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFeatures = async () => {
      const featureChecks: Promise<boolean>[] = [];

      if (features.webp !== undefined) {
        featureChecks.push(checkWebPSupport());
      }
      
      if (features.serviceWorker !== undefined) {
        featureChecks.push(Promise.resolve(checkServiceWorkerSupport()));
      }
      
      if (features.indexedDB !== undefined) {
        featureChecks.push(Promise.resolve(checkIndexedDBSupport()));
      }
      
      if (features.webGL !== undefined) {
        featureChecks.push(Promise.resolve(checkWebGLSupport()));
      }

      try {
        const results = await Promise.all(featureChecks);
        const allSupported = results.every(Boolean);
        setIsSupported(allSupported);
      } catch (error) {
        console.error('Error checking features:', error);
        setIsSupported(false);
      }
    };

    checkFeatures();
  }, [features]);

  const checkWebPSupport = (): Promise<boolean> => {
    if (typeof window === 'undefined') return Promise.resolve(false);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width > 0 && img.height > 0);
      img.onerror = () => resolve(false);
      img.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    });
  };

  const checkServiceWorkerSupport = (): boolean => {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator;
  };

  const checkIndexedDBSupport = (): boolean => {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  };

  const checkWebGLSupport = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  };

  if (isSupported === null) {
    return <>{fallback}</>;
  }

  return <>{isSupported ? children : fallback}</>;
};

// Export NoScriptStyles as a separate component
export const NoScriptStyles: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <noscript>{children}</noscript>;
};
