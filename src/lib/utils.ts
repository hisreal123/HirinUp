import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToAscii(inputString: string) {
  // remove non ascii characters
  const asciiString = inputString.replace(/[^\x20-\x7F]+/g, '');

  return asciiString;
}

export function formatTimestampToDateHHMM(timestamp: string): string {
  const date = new Date(timestamp);

  // Format date to YYYY-MM-DD
  const datePart =
    date.getDate().toString().padStart(2, '0') +
    '-' +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    '-' +
    date.getFullYear();

  // Format time to HH:MM
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timePart = `${hours}:${minutes}`;

  return `${datePart} ${timePart}`;
}

export function formatDateReadable(timestamp: string): string {
  const date = new Date(timestamp);
  
return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function testEmail(email: string) {
  const re = /\S+@\S+\.\S+/;

  return re.test(email);
}

export function convertSecondstoMMSS(seconds: number) {
  const minutes = Math.trunc(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
}

export function isLightColor(color: string) {
  const hex = color?.replace('#', '');
  const r = parseInt(hex?.substring(0, 2), 16);
  const g = parseInt(hex?.substring(2, 4), 16);
  const b = parseInt(hex?.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 155;
}

// Normalizes an interview description to proper HTML.
// AI-generated descriptions often contain Markdown-style bullets (* item)
// instead of <ul><li> tags. This converts them so dangerouslySetInnerHTML
// and TipTap both render the content correctly.
// If the description already has HTML list tags it is returned unchanged.
export function normalizeDescriptionToHtml(description: string): string {
  if (!description) return '';
  if (/<ul|<ol|<li/i.test(description)) return description;

  const raw = description
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim();

  const lines = raw.split('\n');
  const parts: string[] = [];
  let bulletItems: string[] = [];

  const flushBullets = () => {
    if (bulletItems.length === 0) return;
    parts.push(
      '<ul>' +
        bulletItems.map((item) => `<li><p>${item}</p></li>`).join('') +
        '</ul>'
    );
    bulletItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBullets();
      continue;
    }
    if (/^[*\-] /.test(trimmed)) {
      bulletItems.push(trimmed.slice(2).trim());
    } else {
      flushBullets();
      const formatted = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      parts.push(`<p>${formatted}</p>`);
    }
  }
  flushBullets();

  return parts.join('');
}
