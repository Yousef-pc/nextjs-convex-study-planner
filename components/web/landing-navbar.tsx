"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/web/theme-toggle";
import { useConvexAuth } from "convex/react";

export default function LandingNavbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <header>
      <div className="flex justify-between px-8 py-4 items-center">

        {/* LEFT SIDE: Logo & Dashboard Link */}
        <div className="flex items-center gap-6 relative">
          <Link href="/" className="text-3xl font-bold mr-4">
            Study<span className="text-primary">Pro</span>
          </Link>

          {!isLoading && isAuthenticated && (
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "ghost",
                className: "font-extrabold text-2xs p-4"
              })}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* RIGHT SIDE: Auth Buttons & Theme Toggle */}
        <div className="flex gap-3 items-center">
          {!isLoading && !isAuthenticated && (
            <>
              <Link href="/auth/login" className={buttonVariants({ variant: "ghost" })}>
                Login
              </Link>
              <Link href="/auth/sign-up" className={buttonVariants({ variant: "default" })}>
                Sign up
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>

      </div>
    </header>
  );
}