import './globals.css';
import Script from 'next/script';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HirinUp',
  description: 'AI-powered Interviews',
  icons: [{ url: '/favicon/foloup-favicon-1-32x32.webp', type: 'image/webp' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
