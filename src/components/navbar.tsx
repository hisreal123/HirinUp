"use client";

import Link from "next/link";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { PanelRight } from "lucide-react";
import { useSidebar } from "@/contexts/sidebar.context";

function Navbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="fixed bg-white rounded-lg inset-x-0 top-0 z-[10] h-fit py-4">
      <div className="flex items-center justify-between h-full gap-2 px-4 mx-auto">
        <div className="flex flex-row items-center gap-3">
          <Link href={"/dashboard"} className="flex items-center gap-2">
            <p className="px-2 py-1 text-2xl font-bold text-black">
              Hirin<span className="text-primary">Up</span>{" "}
              <span className="text-[8px]">Beta</span>
            </p>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center">
          <UserButton afterSignOutUrl="/sign-in" signInUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
