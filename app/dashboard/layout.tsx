"use client";

import * as React from "react";

import { SidebarProvider } from "../_components/ui/sidebar";
import { AppSidebar } from "../_components/ui/app-sidebar";
import DashboardHeader from "../_components/dashboard/DashboardHeader";
import { Toaster } from "@/app/_components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-full">
        <DashboardHeader />
        <div className="p-6 flex flex-col w-full h-full overflow-auto">
          {children}
        </div>
      </main>
      <Toaster />
    </SidebarProvider>
  );
}
