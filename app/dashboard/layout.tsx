"use client";

import * as React from "react";

import { SidebarProvider } from "../_components/ui/sidebar";
import { AppSidebar } from "../_components/ui/app-sidebar";
import DashboardHeader from "../_components/dashboard/DashboardHeader";
import { Toaster } from "@/app/_components/ui/toaster";
import { BreadcrumbNav } from "@/app/_components/ui/breadcrumb";
import { PageTitleProvider } from "@/app/_contexts/PageTitleContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageTitleProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full h-full">
          <DashboardHeader />
          <div className="p-6 flex flex-col w-full h-full overflow-auto">
            {/* @ts-expect-error Server Component */}
            <BreadcrumbNav />
            {children}
          </div>
        </main>
        <Toaster />
      </SidebarProvider>
    </PageTitleProvider>
  );
}
