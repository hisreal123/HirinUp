"use client";

import React from "react";
import { PlayCircleIcon, SpeechIcon, Users, LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { useSidebar } from "@/contexts/sidebar.context";

interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

const menuItems: MenuItem[] = [
  {
    label: "Interviews",
    path: "/dashboard",
    icon: PlayCircleIcon,
    isActive: (pathname) =>
      pathname.endsWith("/dashboard") || pathname.includes("/interviews"),
  },
  {
    label: "Interviewers",
    path: "/dashboard/interviewers",
    icon: SpeechIcon,
    isActive: (pathname) => pathname.endsWith("/interviewers"),
  },
  {
    label: "Candidates",
    path: "/dashboard/candidates",
    icon: Users,
    isActive: (pathname) => pathname.endsWith("/candidates"),
  },
];

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`z-[10] bg-slate-100 fixed top-[64px] left-0 h-full transition-all duration-300 ${
        isCollapsed ? "w-[80px] p-2" : "w-[250px] p-6"
      }`}
    >
      <div className="flex flex-col space-y-5 gap-4">
        {!isCollapsed && (
          <div className="mb-2 border border-primary/50 rounded-md px-2 py-1 shadow-sm">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/dashboard"
              hidePersonal={true}
              afterSelectOrganizationUrl="/dashboard"
              afterLeaveOrganizationUrl="/dashboard"
              appearance={{
                variables: {
                  fontSize: "0.9rem",
                },
              }}
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive(pathname);

            return (
              <div
                key={item.path}
                className={`items-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 flex cursor-pointer ${
                  isActive
                    ? "hover:bg-primary/20"
                    : "hover:bg-secondary/20"
                } text-primary ${
                  isCollapsed
                    ? "justify-center px-2"
                    : "justify-start gap-2 px-4" 
            }`}
                onClick={() => router.push(item.path)}
                title={isCollapsed ? item.label : undefined}
          >
                <Icon className="font-thin text-primary w-5 h-5" />
                {!isCollapsed && (
                  <span className="block font-bold gradient-text">{item.label}</span>
                )}
          </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
