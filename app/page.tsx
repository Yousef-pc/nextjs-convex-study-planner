import { buttonVariants } from "@/components/ui/button";
import LandingPage from "@/components/web/landing-page";
import { ThemeToggle } from "@/components/web/theme-toggle";
import Link from "next/link";

const Home = () => {
  return (
    <div>
      <header>
        <div className="flex justify-between px-8 py-4 items-center">
          <Link href="/" className="text-3xl font-bold">
            Study<span className="text-primary">Pro</span>
          </Link>

          <div className="flex gap-3">
            <Link
              href="/auth/sing-up"
              className={buttonVariants({ variant: "default" })}
            >
              Sign up
            </Link>
            <Link
              href="/auth/login"
              className={buttonVariants({ variant: "default", className: "mr-3" })}
            >
              Login
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <LandingPage />
    </div>
  );
};

export default Home;
