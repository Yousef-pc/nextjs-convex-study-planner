"use client";

import { ThemeToggle } from "@/components/web/dashboard/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link"; // 👈 Import Link

const DashboardNavbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message || "Could not logout");
      
      toast.add({ type: "success", description: "Logged out successfully" });
      router.push("/");
      router.refresh(); 
    } catch (err) {
      toast.add({
        type: "error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        priority: "high",
      });
    }
  };

  return (
    <header className="flex h-16 items-center justify-between px-6 border-b bg-background">
      
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" /> 
        
        {/* 👈 The Logo is now here, on the left side of the Navbar */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold">
            Study<span className="text-primary">Pro</span>
          </span>
        </Link>
      </div>

      <div className="flex gap-3 items-center">
        <Button variant="default" onClick={handleLogout}>
          Logout
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default DashboardNavbar;