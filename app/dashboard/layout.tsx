"use client";

import * as React from "react";

import Image from "next/image";
import { SidebarProvider, SidebarTrigger } from "../_components/ui/sidebar";
import { AppSidebar } from "../_components/ui/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
