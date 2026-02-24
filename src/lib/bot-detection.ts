import { NextRequest } from 'next/server';

// Known bot user agents to block
const BLOCKED_BOTS = [
  'ahrefsbot',
  'semrushbot',
  'mj12bot',
  'dotbot',
  'blexbot',
  'searchmetricsbot',
  'sogou',
  'exabot',
  'facebot',
  'ia_archiver',
  'python-requests',
  'python-urllib',
  'curl',
  'wget',
  'scrapy',
  'phantomjs',
  'headlesschrome',
  'selenium',
  'puppeteer',
  'playwright',
];

// Suspicious patterns in user agents
const SUSPICIOUS_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /scrape/i,
  /fetch/i,
  /http/i,
  /libwww/i,
];

// Good bots we want to allow (search engines)
const ALLOWED_BOTS = [
  'googlebot',
  'bingbot',
  'slurp', // Yahoo
  'duckduckbot',
  'baiduspider',
  'yandexbot',
];

export function isBot(req: NextRequest): {
  isBot: boolean;
  isMalicious: boolean;
  reason?: string;
} {
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';

  // No user agent is suspicious
  if (!userAgent) {
    return { isBot: true, isMalicious: true, reason: 'Missing user agent' };
  }

  // Check for allowed bots first
  for (const bot of ALLOWED_BOTS) {
    if (userAgent.includes(bot)) {
      return { isBot: true, isMalicious: false, reason: 'Allowed bot' };
    }
  }

  // Check for blocked bots
  for (const bot of BLOCKED_BOTS) {
    if (userAgent.includes(bot)) {
      return { isBot: true, isMalicious: true, reason: `Blocked bot: ${bot}` };
    }
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(userAgent)) {
      // Make sure it's not an allowed bot
      const isAllowed = ALLOWED_BOTS.some((bot) => userAgent.includes(bot));
      if (!isAllowed) {
        return {
          isBot: true,
          isMalicious: true,
          reason: `Suspicious pattern: ${pattern}`,
        };
      }
    }
  }

  return { isBot: false, isMalicious: false };
}

export function getClientIP(req: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

// Security headers to add to responses
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
