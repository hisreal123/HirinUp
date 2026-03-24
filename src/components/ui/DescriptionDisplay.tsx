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
    : `<span class="text-gray-400">${emptyText}</span>`;

  return (
    <div
      className={`prose prose-sm max-w-none [&_p]:my-0 [&_ul]:my-0 [&_ol]:my-0 [&_li]:my-0 [&_li>p]:my-0 [&_li]:marker:text-gray-800 [&_h1]:my-1 [&_h2]:my-1 [&_h3]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
