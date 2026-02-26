'use client';

import { ClerkProvider } from '@clerk/nextjs';
import Providers from '@/components/providers';
import { Toaster } from 'sonner';
import MobileRestriction from '@/components/mobile-restriction';

export default function UserLayoutProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileRestriction>
      <ClerkProvider>
        <Providers>
          {children}
          <Toaster
            toastOptions={{
              classNames: {
                actionButton: 'bg-primary',
                cancelButton: 'bg-orange-400',
                closeButton: 'bg-lime-400',
              },
            }}
            richColors
          />
        </Providers>
      </ClerkProvider>
    </MobileRestriction>
  );
}
