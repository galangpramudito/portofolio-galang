'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

export function ThemeProviderComponent({ children }) {
  const pathname = usePathname();
  // Admin panel is styled for dark only; don't let the public site's light choice leak in
  const forcedTheme = pathname?.startsWith('/admin') ? 'dark' : undefined;

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme={forcedTheme}>
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  return useNextTheme();
}
