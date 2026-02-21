"use client";

import { useEffect, useState } from "react";

interface UseDevToolsDetectionOptions {
  enabled?: boolean;
  pollInterval?: number; // ms
}

export function useDevToolsDetection({
  enabled = true,
  pollInterval = 800,
}: UseDevToolsDetectionOptions = {}) {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  // Step 2: Block right-click context menu
  useEffect(() => {
    if (!enabled) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [enabled]);

  // Step 3: Detect DevTools via window size difference (docked DevTools shrinks viewport)
  useEffect(() => {
    if (!enabled) return;

    const THRESHOLD = 160; // px — DevTools panel is always wider/taller than this

    const check = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const open = widthDiff > THRESHOLD || heightDiff > THRESHOLD;
      setIsDevToolsOpen(open);
    };

    // Check immediately on mount
    check();

    // Poll continuously
    const interval = setInterval(check, pollInterval);

    return () => clearInterval(interval);
  }, [enabled, pollInterval]);

  return { isDevToolsOpen };
}

export default useDevToolsDetection;
