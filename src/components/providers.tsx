'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import compose from '@/lib/compose';
import { InterviewerProvider } from '@/contexts/interviewers.context';
import { InterviewProvider } from '@/contexts/interviews.context';
import { ResponseProvider } from '@/contexts/responses.context';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ClientProvider } from '@/contexts/clients.context';
import { SidebarProvider } from '@/contexts/sidebar.context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Must be defined at module level — if created inside the component body,
// compose() produces new function references on every render, causing React
// to unmount/remount the entire provider tree and reset all interview state.
const ContextProviders = compose([
  InterviewProvider,
  InterviewerProvider,
  ResponseProvider,
  ClientProvider,
  SidebarProvider,
]);

const providers = ({ children }: ThemeProviderProps) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <ContextProviders>{children}</ContextProviders>
      </QueryClientProvider>
    </NextThemesProvider>
  );
};

export default providers;
