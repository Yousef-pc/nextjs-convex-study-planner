import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth-server";
import DashboardNavbar from "@/components/web/dashboard/navbar";
import { DashboardSidebar } from "@/components/web/dashboard/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const instant = false;

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const token = await getAuthToken();
  if (!token) redirect("/auth/login");

  return (
    <SidebarProvider>
      <DashboardSidebar />
      
      {/* 👈 SidebarInset is a shadcn wrapper that makes the main content fill the rest of the screen */}
      <SidebarInset className="flex flex-col min-h-screen">
        <DashboardNavbar />
        <main className="flex-1 max-w-5xl w-full mx-auto p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;