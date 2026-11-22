"use client";

import { ThemeToggle } from "@/components/web/dashboard/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

// 1. Define the props to accept the auth state
interface DashboardNavbarProps {
  isAuthenticated?: boolean;
}

const DashboardNavbar = ({ isAuthenticated = true }: DashboardNavbarProps) => {
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
        {/* 2. Only show the mobile sidebar toggle if the user is logged in */}
        {isAuthenticated && <SidebarTrigger className="md:hidden" />} 
        
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold">
            Study<span className="text-primary">Pro</span>
          </span>
        </Link>
      </div>

      <div className="flex gap-3 items-center">
        {/* 3. Conditional rendering for the Auth Button */}
        {isAuthenticated ? (
          <Button variant="default" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          // We use the Shadcn Base UI `render` prop to make this a Link that looks like a button
          <Button variant="default" render={<Link href="/auth/login" />}>
            Sign In
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default DashboardNavbar;