"use client";

import * as React from "react";

import Image from "next/image";
import { SidebarProvider, SidebarTrigger } from "../_components/ui/sidebar";
import { AppSidebar } from "../_components/ui/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="grid grid-cols-[32px,1fr]">
        <SidebarTrigger />
        <div className="py-8 flex flex-col w-full h-full overflow-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
