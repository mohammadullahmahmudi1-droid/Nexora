/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ThemeSettings } from '../types';

interface ThemeContextType {
  theme: ThemeSettings | null;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'theme'), (docSnap) => {
      if (docSnap.exists()) {
        setTheme({ id: docSnap.id, ...docSnap.data() } as ThemeSettings);
      } else {
        // Fallback default theme
        setTheme({
          id: 'theme',
          primaryColor: '#8b5cf6',
          secondaryColor: '#6d28d9',
          backgroundColor: '#f8fafc',
          headerColor: '#ffffff',
          headerTextColor: '#0f172a',
          footerColor: '#ffffff',
          userBubbleColor: '#8b5cf6',
          aiBubbleColor: '#f1f5f9',
          bubbleTextColor: '#1e293b',
          updatedAt: null
        } as ThemeSettings);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Theme fetch error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
