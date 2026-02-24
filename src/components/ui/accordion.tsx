'use client';

import { ReactNode, useState } from 'react';
type FaqItemProps = {
  q: string;
  a: ReactNode;
  defaultOpen?: boolean;
};

export default function Accordion({ q, a, defaultOpen }: FaqItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-white/10 bg-[#6300FF0A]">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between text-left px-5 pt-6 text-black"
        onClick={() => setOpen(!open)}
      >
        <span className="text-base">{q}</span>

        {/* Arrow */}
        <svg
          className={`w-5 h-5 transition-transform duration-300 ease-out ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M19 9l-7 7-7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Content */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden text-[15px] leading-[27px] font-normal px-5 py-3 text-black">
          {a}
        </div>
      </div>
    </div>
  );
}
