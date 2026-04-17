'use client';

import { useTheme } from 'next-themes';
import { Palette, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSidebar } from '@/contexts/sidebar.context';

const THEMES = [
  { id: 'default',        name: 'Brand',     swatch: 'hsl(270 70% 50%)' },
  { id: 'corporate-blue', name: 'Corporate', swatch: 'hsl(221 83% 53%)' },
  { id: 'crypto-dark',    name: 'Crypto',    swatch: 'hsl(174 72% 38%)' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { isCollapsed } = useSidebar();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = THEMES.find((t) => t.id === (theme ?? 'default')) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function handleSelect(id: string) {
    document.documentElement.setAttribute('data-theme-transitioning', '');
    setTheme(id);
    setOpen(false);
    setTimeout(() => {
      document.documentElement.removeAttribute('data-theme-transitioning');
    }, 400);
  }

  return (
    <div ref={ref} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-44 bg-background border border-border rounded-lg shadow-xl p-1.5 space-y-0.5 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150">
          {THEMES.map((t) => {
            const isActive = (theme ?? 'default') === t.id;
            return (
              <button
                key={t.id}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left active:scale-95 ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
                onClick={() => handleSelect(t.id)}
              >
                <span
                  className={`w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-border transition-transform duration-150 ${isActive ? 'scale-125' : ''}`}
                  style={{ backgroundColor: t.swatch }}
                />
                {t.name}
                {isActive && <Check className="ml-auto w-3.5 h-3.5 text-primary animate-in zoom-in-50 duration-150" />}
              </button>
            );
          })}
        </div>
      )}

      <button
        title="Change theme"
        className={`w-full flex items-center h-9 py-2 rounded-lg text-sm font-medium text-primary-foreground/65 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-150 active:scale-95 ${
          isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3'
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        <Palette className="w-[15px] h-[15px] flex-shrink-0" strokeWidth={1.8} />
        {!isCollapsed && (
          <span className="flex items-center gap-2 text-primary-foreground/65">
            Theme
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-primary-foreground/30 transition-all duration-300"
              style={{ backgroundColor: active.swatch }}
            />
          </span>
        )}
      </button>
    </div>
  );
}
