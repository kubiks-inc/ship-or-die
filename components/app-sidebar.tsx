'use client';

import * as React from 'react';
import {
  Map,
  Settings2,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AnimatedThemeToggler } from '@/components/magicui/animated-theme-toggler';


const data = {
  navMain: [
    {
      title: 'Board',
      url: '/board',
      icon: Map,
    },
    {
      title: 'Integrations',
      url: '/integrations',
      icon: Settings2,
    },
  ],
};

export type AppSidebarProps = {
  disabled?: boolean;
};

export function AppSidebar({ disabled }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <span className="text-sm font-bold">K</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Kubiks Agent</span>
            <span className="truncate text-xs">Local Development</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} disabled={disabled} />
      </SidebarContent>
      <SidebarFooter>
        <AnimatedThemeToggler />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
