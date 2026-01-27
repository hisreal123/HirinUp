"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import compose from "@/lib/compose";
import { InterviewerProvider } from "@/contexts/interviewers.context";
import { InterviewProvider } from "@/contexts/interviews.context";
import { ResponseProvider } from "@/contexts/responses.context";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ClientProvider } from "@/contexts/clients.context";
import { SidebarProvider } from "@/contexts/sidebar.context";

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

const providers = ({ children }: ThemeProviderProps) => {
  const Provider = compose([
    InterviewProvider,
    InterviewerProvider,
    ResponseProvider,
    ClientProvider,
    SidebarProvider,
  ]);

  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <Provider>{children}</Provider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
};

export default providers;
