'use client';

import { PlayCircleIcon, SpeechIcon, Users, LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useSidebar } from '@/contexts/sidebar.context';
import Link from 'next/link';

interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Hiring',
    items: [
      {
        label: 'Interviews',
        path: '/dashboard',
        icon: PlayCircleIcon,
        isActive: (pathname) =>
          pathname.endsWith('/dashboard') || pathname.includes('/interviews'),
      },
      {
        label: 'Interviewers',
        path: '/dashboard/interviewers',
        icon: SpeechIcon,
        isActive: (pathname) => pathname.endsWith('/interviewers'),
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        label: 'Candidates',
        path: '/dashboard/candidates',
        icon: Users,
        isActive: (pathname) => pathname.endsWith('/candidates'),
      },
    ],
  },
];

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div
      className={`z-[10] bg-primary fixed top-0 left-0 h-screen flex flex-col py-5 shadow-[2px_0_12px_rgba(0,0,0,0.15)] transition-all duration-300 ${
        isCollapsed ? 'w-[64px] px-2' : 'w-[265px] px-3'
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center mb-5 px-1 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <Link href="/dashboard">
            <p className="text-xl font-bold text-primary-foreground tracking-tight">
              Hirin<span className="text-primary-foreground/60">Up</span>
              <span className="ml-1 text-[9px] font-normal text-primary-foreground/40 align-super">Beta</span>
            </p>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="w-7 h-7 flex items-center justify-center rounded-md text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-150 active:scale-90 flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed
            ? <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
            : <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
          }
        </button>
      </div>

      {/* Org switcher */}
      {!isCollapsed && (
        <div className="mb-5 mx-1 border border-primary-foreground/20 rounded-lg px-2 py-1 bg-primary-foreground/5">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/dashboard"
            hidePersonal={true}
            afterSelectOrganizationUrl="/dashboard"
            afterLeaveOrganizationUrl="/dashboard"
            appearance={{
              variables: { fontSize: '0.85rem' },
              elements: {
                rootBox: 'overflow-hidden rounded-md w-full',
                organizationSwitcherTrigger: 'max-w-full w-full',
                organizationPreviewMainIdentifier: 'truncate max-w-[130px] block',
              },
            }}
          />
        </div>
      )}

      {/* Nav groups */}
      <nav className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.label}>
            {!isCollapsed && (
              <p className="text-[10px] font-semibold text-primary-foreground/65 uppercase tracking-[0.12em] px-3 mb-1.5">
                {group.label}
              </p>
            )}
            {isCollapsed && (
              <div className="h-px bg-primary-foreground/20 mx-1 mb-2" />
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive(pathname);
                return (
                  <div
                    key={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 active:scale-95 ${
                      isCollapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground shadow-sm'
                        : 'text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                    }`}
                    onClick={() => router.push(item.path)}
                  >
                    <Icon className="w-[15px] h-[15px] flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: theme + user */}
      <div className={`flex flex-col gap-2 pt-4 mt-2 border-t border-primary-foreground/15 ${isCollapsed ? 'items-center' : ''}`}>
        <ThemeSwitcher />
        <div className={`flex items-center gap-2.5 py-2 ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}>
          <UserButton
            afterSignOutUrl="/admin/signin"
            signInUrl="/admin/signin"
          />
          {!isCollapsed && (
            <span className="text-sm text-primary-foreground/65">Account</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
