"use client";

import "../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers";
import { Toaster } from "sonner";
import MobileRestriction from "@/components/mobile-restriction";

// Note: Call pages are public and don't require authentication
// ClerkProvider is included for compatibility but won't be used for auth on these pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>HirinUp - AI powered Interviews</title>
        <meta name="description" content="AI powered Interviews" />
        <link rel="icon" href="/browser-user-icon.ico" />
      </head>
      <body>
        <MobileRestriction>
          <ClerkProvider>
            <Providers>
              {children}
              <Toaster
                richColors
                toastOptions={{
                  classNames: {
                    actionButton: "bg-primary",
                    cancelButton: "bg-orange-400",
                    closeButton: "bg-lime-400",
                  },
                }}
              />
            </Providers>
          </ClerkProvider>
        </MobileRestriction>
      </body>
    </html>
  );
}
