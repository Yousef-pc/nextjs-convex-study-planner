
"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { GithubIcon } from "@/components/ui/github";
import { useConvexAuth } from "convex/react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/web/dashboard/shared/theme-toggle";

export default function LandingNavbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        {/* Brand and dashboard link */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link
            href="/"
            aria-label="StudyPro home"
            className="flex shrink-0 items-center gap-2"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </span>

            <span className="text-lg font-bold tracking-tight sm:text-xl">
              Study<span className="text-primary">Pro</span>
            </span>
          </Link>

          {!isLoading && isAuthenticated && (
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "ghost",
                className: "rounded-xl px-3 text-sm",
              })}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* GitHub, authentication, and theme controls */}
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="https://github.com/Yousef-pc/nextjs-convex-study-planner"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the StudyPro GitHub repository in a new tab"
            title="View source code on GitHub"
            className={buttonVariants({
              variant: "outline",
              className:
                "h-9 gap-2 rounded-xl border-border bg-background/60 px-3 text-sm",
            })}
          >
            <GithubIcon className="size-4" />
            <span className="hidden sm:inline">GitHub repo</span>
          </a>

          {!isLoading && !isAuthenticated && (
            <>
              <Link
                href="/auth/login"
                className={buttonVariants({
                  variant: "ghost",
                  className: "hidden rounded-xl px-3 sm:inline-flex",
                })}
              >
                Login
              </Link>

              <Link
                href="/auth/sign-up"
                className={buttonVariants({
                  className: "h-9 rounded-xl px-3",
                })}
              >
                Sign up
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
