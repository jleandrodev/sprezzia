"use client";

import Logo from "@/app/assets/logo.svg";
import {
  Calendar,
  ClipboardList,
  DollarSign,
  FolderKanban,
  Settings,
  Users,
} from "lucide-react";
import { Sidebar } from "@/app/_components/ui/sidebar";
import { Sidebar as DashboardSidebar } from "@/app/_components/dashboard/Sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="flex h-16 items-center border-b px-6">
        <Logo className="w-[160px]" />
      </div>
      <DashboardSidebar />
    </Sidebar>
  );
}
