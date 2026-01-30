"use client";

import "../globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import SideMenu from "@/components/sideMenu";
import { usePathname } from "next/navigation";
import MobileRestriction from "@/components/mobile-restriction";
import { ContentWrapper } from "@/components/content-wrapper";

const metadata = {
  title: "HirinUp",
  description: " AI-powered Interviews",
  openGraph: {
    title: "HirinUp",
    description: "AI-powered Interviews",
    siteName: "HirinUp",
    images: [
      {
        url: "/hirinup.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/browser-client-icon.ico" />
      </head>
      <body
        className={cn(
          "antialiased overflow-hidden min-h-screen",
        )}
      >
        <MobileRestriction>
          <ClerkProvider
            signInUrl="/admin/signin"
            signUpUrl="/admin/signup"
            signInFallbackRedirectUrl={"/dashboard"}
            afterSignOutUrl={"/admin/signin"}
          >
            <Providers>
              {!pathname.includes("/sign-in") &&
                !pathname.includes("/sign-up") &&
                !pathname.includes("/signin") &&
                !pathname.includes("/signup") &&
                !pathname.includes("/login") &&
                !pathname.includes("/register") &&
                !pathname.includes("/forgot-password") && <Navbar />}
              <div className="flex flex-row h-screen bg-floral-white">
                {!pathname.includes("/sign-in") &&
                  !pathname.includes("/sign-up") &&
                  !pathname.includes("/signin") &&
                  !pathname.includes("/signup") &&
                  !pathname.includes("/login") &&
                  !pathname.includes("/register") &&
                  !pathname.includes("/forgot-password") && <SideMenu />}
                {!pathname.includes("/sign-in") &&
                  !pathname.includes("/sign-up") &&
                  !pathname.includes("/signin") &&
                  !pathname.includes("/signup") &&
                  !pathname.includes("/login") &&
                  !pathname.includes("/register") &&
                  !pathname.includes("/forgot-password") ? (
                  <ContentWrapper>{children}</ContentWrapper>
                ) : (
                  <div className="pt-[64px] h-full overflow-y-auto flex-grow">
                    {children}
                  </div>
                )}
              </div>
              <Toaster
                toastOptions={{
                  classNames: {
                    toast: "bg-white",
                    title: "text-black",
                    description: "text-red-400",
                    actionButton: "bg-primary",
                    cancelButton: "bg-orange-400",
                    closeButton: "bg-white-400",
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
