// src/app/(marketing)/layout.tsx
'use client';
import '../globals.css';
import Footer from './layout/footer';
import Header from './layout/header';
import TopAnnouncement from './layout/top-annoucment';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import Newsletter from './layout/newsletter';
import { ConsentButton } from '@/components/consent-modal';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/home"
    >
      <main className="min-h-screen bg-[#08040f] text-white">
        <TopAnnouncement />
        <Header />
        {children}
        <Newsletter />
        <Footer />

        <ConsentButton />
      </main>
    </ClerkProvider>
  );
}
