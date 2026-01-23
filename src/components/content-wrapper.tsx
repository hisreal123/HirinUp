"use client";

import { useSidebar } from "@/contexts/sidebar.context";

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`pt-[64px] h-full overflow-y-auto flex-grow transition-all duration-300 ${
        isCollapsed ? "ml-[80px]" : "ml-[250px]"
      }`}
    >
      {children}
    </div>
  );
}

