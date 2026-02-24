'use client';

import Link from 'next/link';

interface NavDropdownProps {
  label: string;
  setMenu?: (open: boolean) => void;
  items: {
    title: string;
    href?: string;
    highlight?: boolean;
  }[];
}

export default function NavDropdown({
  label,
  items,
  setMenu,
}: NavDropdownProps) {
  const hasItems = items.length > 0;

  return (
    <li className="relative group cursor-pointer">
      {/* TOP LABEL */}
      <div
        className="flex items-center gap-2 text-white hover:text-[#6300ff]"
        onClick={() => {
          if (!hasItems) {setMenu?.(false);}
        }}
      >
        {label}

        {hasItems && (
          <span className="text-base">
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 320 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z" />
            </svg>
          </span>
        )}
      </div>

      {/* DROPDOWN */}
      {hasItems && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-56
                     opacity-0 invisible group-hover:opacity-100 group-hover:visible
                     transition-all duration-200"
        >
          <div className="rounded-xl overflow-hidden shadow-xl bg-white text-xs text-black">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href || '#'}
                className="block px-4 py-3 hover:bg-[#6300ff] hover:text-white"
                onClick={() => setMenu?.(false)}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
