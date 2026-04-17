'use client';

import { useSidebar } from '@/contexts/sidebar.context';

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`h-screen overflow-y-auto flex-grow transition-all duration-300 ${
        isCollapsed ? 'ml-[64px]' : 'ml-[265px]'
      }`}
    >
      {children}
    </div>
  );
}
