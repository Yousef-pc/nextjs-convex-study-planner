import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center pb-8">
      
      {/* 1. The Badge */}
      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground mb-8">
        <CheckCircle className="mr-1 h-3 w-3" />
        The #1 tool for high school students
      </div>

      {/* 2. The Main Headline */}
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-3xl mb-6">
        Master your studies with <span className="text-primary">StudyPro</span>
      </h1>

      {/* 3. The Subheadline */}
      <p className="text-xl text-muted-foreground max-w-2xl mb-10">
        Organize your subjects, track your assignments, and never miss a deadline again. 
        Built for students who want to get things done.
      </p>

      {/* 4. Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/auth/sign-up" className={buttonVariants({ size: "lg" })}>
          Get Started for Free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link href="/auth/login" className={buttonVariants({ variant: "outline", size: "lg" })}>
          I already have an account
        </Link>
      </div>

      {/* 5. Feature Highlights (Optional but recommended) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl">
        <div className="flex flex-col items-center p-6 border rounded-xl bg-card">
          <BookOpen className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">Organize Subjects</h3>
          <p className="text-sm text-muted-foreground">Keep all your classes and materials in one place.</p>
        </div>
        <div className="flex flex-col items-center p-6 border rounded-xl bg-card">
          <Calendar className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">Track Deadlines</h3>
          <p className="text-sm text-muted-foreground">Never forget a homework assignment or exam again.</p>
        </div>
        <div className="flex flex-col items-center p-6 border rounded-xl bg-card">
          <CheckCircle className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-bold text-lg mb-2">Stay Focused</h3>
          <p className="text-sm text-muted-foreground">Use our built-in timer to track your study sessions.</p>
        </div>
      </div>
    </div>
  );
}