'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import themesConfig from '@/config/themes.json';

const themeIds = themesConfig.themes.map((t) => t.id);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="default"
      themes={themeIds}
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
