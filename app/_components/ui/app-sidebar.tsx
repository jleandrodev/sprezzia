"use client";

import Logo from "@/app/assets/logo.svg";
import { Sidebar } from "@/app/_components/ui/sidebar";
import { Sidebar as DashboardSidebar } from "@/app/_components/dashboard/Sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="flex h-16 items-center border-b px-6">
        <Logo className="w-[160px] text-foreground" />
      </div>
      <DashboardSidebar />
    </Sidebar>
  );
}
