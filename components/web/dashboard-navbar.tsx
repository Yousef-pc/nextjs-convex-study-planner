"use client";

import { ThemeToggle } from "@/components/web/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

const DashboardNavbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        throw new Error(error.message || "Could not logout");
      }

      toast.add({ type: "success", description: "Logged out successfully" });
      router.push("/");
      router.refresh(); // Clears the Next.js router cache so the Navbar refetches the auth state
    } catch (err) {
      toast.add({
        type: "error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        priority: "high",
      });
    }
  };

  return (
    <header>
      <div className="flex justify-between px-8 py-4 items-center">
        <Link href="/" className="text-3xl font-bold">
          Study<span className="text-primary">Pro</span>
        </Link>

        <div className="flex gap-3">
          <Button variant="default" onClick={handleLogout}>
            Logout
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;