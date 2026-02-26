import '../globals.css';
import UserLayoutProviders from './user-layout-providers';

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
        <title>AI Recruiter for Voice Interviews</title>
        <meta name="description" content="AI Recruiter for Voice Interviews" />
        <link rel="icon" href="/browser-user-icon.ico" />
      </head>
      <body>
        <UserLayoutProviders>{children}</UserLayoutProviders>
      </body>
    </html>
  );
}
