"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const MOBILE_BREAKPOINT = 1024; // Desktop/large devices only (1024px and above)

export default function MobileRestriction({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < MOBILE_BREAKPOINT);
    };

    // Check on mount
    checkDevice();

    // Check on resize
    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  // Show loading state while checking
  if (isMobile === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Block mobile devices
  if (isMobile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-md mx-auto p-8 text-center flex flex-col items-center">
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to HirinUp
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This application is optimized for desktop and large devices.
          </p>
          <div className="mt-auto">
             <p className="px-2 py-1 text-2xl font-bold gradient-text">
              Hirin<span className="text-primary">Up</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Allow desktop/large devices
  return <>{children}</>;
}


