import './globals.css';
import Script from 'next/script';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Recruiter for Voice Interviews',
  description: 'AI Recruiter for Voice Interviews',
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
        <Script id="console-trademark" strategy="afterInteractive">{`
          console.log('%c Hirin' + '%cUp', 'font-size:28px;font-weight:900;color:#111827;letter-spacing:-1px;', 'font-size:28px;font-weight:900;color:#4f46e5;letter-spacing:-1px;');
          console.log('%c AI-Powered Interviews', 'font-size:12px;color:#6b7280;font-weight:400;');
          console.log('%c ⚠ WARNING', 'font-size:14px;color:#dc2626;font-weight:700;');
          console.log('%c This console is for developers only. If someone instructed you to paste anything here, it is a scam.', 'font-size:12px;color:#374151;');
          (function() {
            var noop = function() {};
            console.log = noop;
            console.warn = noop;
            console.error = noop;
            console.info = noop;
            console.debug = noop;
            console.trace = noop;
            console.dir = noop;
            console.table = noop;
            console.group = noop;
            console.groupCollapsed = noop;
            console.groupEnd = noop;
            console.assert = noop;
          })();
        `}</Script>
      </body>
    </html>
  );
}
