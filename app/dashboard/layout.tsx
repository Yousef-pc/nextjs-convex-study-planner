import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers"; // 👈 Import headers
import { getAuthToken } from "@/lib/auth-server";
import DashboardNavbar from "@/components/web/dashboard/navbar";
import { DashboardSidebar } from "@/components/web/dashboard/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toast";

export const instant = false;

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  // 👈 1. Securely verify the user
  const token = await getAuthToken();
  const isAuthenticated = !!token;

  // 👈 2. Read the pathname from the headers (In Next 15+, headers() is async)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isMarketplaceRoute = pathname.startsWith("/dashboard/marketplace");

  // 👈 3. If NOT authenticated AND NOT in marketplace -> Redirect to login
  if (!isAuthenticated && !isMarketplaceRoute) {
    redirect("/auth/login");
  }

  // 👈 4. If NOT authenticated AND in marketplace -> Show Navbar, hide Sidebar
  if (!isAuthenticated && isMarketplaceRoute) {
    return (
      <SidebarProvider>
        <SidebarInset className="flex flex-col min-h-screen">
          <DashboardNavbar isAuthenticated={false} />
          <main className="flex-1 max-w-5xl w-full mx-auto p-8">
            {children}
          </main>
          <Toaster />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // 👈 5. If authenticated -> Show the normal layout (Sidebar + Navbar)
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <DashboardNavbar isAuthenticated={true} />
        <main className="flex-1 max-w-5xl w-full mx-auto p-8">
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;