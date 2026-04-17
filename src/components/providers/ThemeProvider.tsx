'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="default"
      themes={['default', 'corporate-blue', 'crypto-dark']}
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
