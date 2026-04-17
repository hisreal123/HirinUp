'use client';

import { normalizeDescriptionToHtml } from '@/lib/utils';

interface DescriptionDisplayProps {
  description: string;
  className?: string;
  emptyText?: string;
}

export function DescriptionDisplay({
  description,
  className,
  emptyText = 'No description set.',
}: DescriptionDisplayProps) {
  const html = description
    ? normalizeDescriptionToHtml(description)
    : `<span class="text-muted-foreground">${emptyText}</span>`;

  return (
    <div
      className={`max-w-none text-sm leading-[1.4] [&_p]:mt-0 [&_p]:mb-3.5 [&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li>p]:my-0 [&_li]:marker:text-foreground [&_h1]:mt-0 [&_h1]:mb-3.5 [&_h2]:mt-0 [&_h2]:mb-3.5 [&_h3]:mt-0 [&_h3]:mb-3.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
