import { ReactNode } from "react";
import DashboardNavbar from "@/components/web/dashboard-navbar";
import { getAuthToken } from "@/lib/auth-server";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const token = await getAuthToken();

  if (!token) {
    redirect("/auth/login");
  }

  return (
    <div>
      <DashboardNavbar />
      <main>{children}</main>
    </div>
  )
}

export default DashboardLayout;