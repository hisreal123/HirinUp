import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const MOBILE_UA_PATTERN = /Android|iPhone|iPad|iPod/i;

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
// AI-generated descriptions often contain Markdown-style syntax (* bullets,
// # headings, > blockquotes, etc.) instead of HTML tags. This converts them
// so dangerouslySetInnerHTML and TipTap both render the content correctly.
// If the description is pure TipTap HTML (no Markdown patterns), it is
// returned unchanged.
export function normalizeDescriptionToHtml(description: string): string {
  if (!description) {
    return '';
  }

  // Detect Markdown patterns (multiline). If none are present and the content
  // already has list/structural HTML, it's TipTap output — return as-is.
  const hasMarkdown =
    /^[ \t]*[*\-] |^#+[ \t]|^>[ \t]|^\d+\.[ \t]|^(-{3,}|\*{3,}|_{3,})$/m.test(
      description
    );
  if (!hasMarkdown && /<p>|<ul|<ol|<li/i.test(description)) {
    // For display: convert TipTap's block <p> tags to inline <br> so spacing
    // exactly matches what was typed: 1 enter = line break, 2 enters = blank line.
    const html = description
      .replace(/<li><p>/gi, '<li>')
      .replace(/<\/p><\/li>/gi, '</li>')
      .replace(/<p><\/p>/gi, '<br>')
      .replace(/<p>([\s\S]*?)<\/p>/gi, '$1<br>')
      .replace(/(<br\s*\/?>)+$/i, '');

    return html;
  }

  // Strip HTML tags to plain text so we can re-parse as Markdown.
  // Preserve newlines from block-level closing tags.
  const raw = description
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/blockquote>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();

  const lines = raw.split('\n');
  const parts: string[] = [];
  let bulletItems: string[] = [];
  let orderedItems: string[] = [];

  const flushBullets = () => {
    if (bulletItems.length === 0) {
      return;
    }
    parts.push(
      '<ul>' + bulletItems.map((item) => `<li>${item}</li>`).join('') + '</ul>'
    );
    bulletItems = [];
  };

  const flushOrdered = () => {
    if (orderedItems.length === 0) {
      return;
    }
    parts.push(
      '<ol>' + orderedItems.map((item) => `<li>${item}</li>`).join('') + '</ol>'
    );
    orderedItems = [];
  };

  // Apply inline Markdown: **bold**, __bold__, *italic*, _italic_
  // Process double markers first so single-marker regex doesn't partially match them.
  const applyInline = (text: string) =>
    text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/_([^_\n]+)_/g, '<em>$1</em>');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBullets();
      flushOrdered();
      // Emit one empty paragraph per blank line so TipTap preserves spacing in
      // the editor. Deduplicate so consecutive blank lines collapse to one.
      if (parts.length > 0 && parts[parts.length - 1] !== '<p></p>') {
        parts.push('<p></p>');
      }
      continue;
    }

    // Headings: ### H3, ## H2, # H1
    if (/^### /.test(trimmed)) {
      flushBullets();
      flushOrdered();
      parts.push(`<h3>${applyInline(trimmed.slice(4).trim())}</h3>`);
    } else if (/^## /.test(trimmed)) {
      flushBullets();
      flushOrdered();
      parts.push(`<h2>${applyInline(trimmed.slice(3).trim())}</h2>`);
    } else if (/^# /.test(trimmed)) {
      flushBullets();
      flushOrdered();
      parts.push(`<h1>${applyInline(trimmed.slice(2).trim())}</h1>`);
    }

    // Blockquote: > text
    else if (/^> /.test(trimmed)) {
      flushBullets();
      flushOrdered();
      parts.push(
        `<blockquote><p>${applyInline(trimmed.slice(2).trim())}</p></blockquote>`
      );
    }

    // Horizontal rule: ---, ***, ___
    else if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushBullets();
      flushOrdered();
      parts.push('<hr>');
    }

    // Unordered list: * item or - item
    else if (/^[*\-] /.test(trimmed)) {
      flushOrdered();
      bulletItems.push(applyInline(trimmed.slice(2).trim()));
    }

    // Ordered list: 1. item
    else if (/^\d+\. /.test(trimmed)) {
      flushBullets();
      orderedItems.push(applyInline(trimmed.replace(/^\d+\. /, '').trim()));
    }

    // Plain paragraph
    else {
      flushBullets();
      flushOrdered();
      parts.push(`<p>${applyInline(trimmed)}</p>`);
    }
  }

  flushBullets();
  flushOrdered();

  return parts.join('');
}

// For initializing TipTap editor — keeps <p> block structure intact.
// Use normalizeDescriptionToHtml (above) only for display/rendering.
export function normalizeDescriptionForEditor(description: string): string {
  if (!description) {
    return '';
  }
  const hasMarkdown =
    /^[ \t]*[*\-] |^#+[ \t]|^>[ \t]|^\d+\.[ \t]|^(-{3,}|\*{3,}|_{3,})$/m.test(
      description
    );
  if (!hasMarkdown && /<p>|<ul|<ol|<li/i.test(description)) {
    return description;
  }
  // Plain text or markdown — run through the full conversion (which outputs <p> format)

  return normalizeDescriptionToHtml(description);
}
