
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  Languages,
  Sparkles,
  WandSparkles,
  LayoutDashboard,
  Puzzle,
  Settings,
  Store,
  Pencil,
  Plus,
  Search,
  Trash2,
  LogOut,
  Sun,
  ChevronDown,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: CalendarCheck,
    title: "Plan your studies",
    description:
      "Organize your subjects and assignments in one place. Keep track of what needs to be done and what is coming next.",
  },
  {
    icon: Languages,
    title: "Build your Word Bank",
    description:
      "Save unfamiliar words, their meanings, and example sentences. Keep the vocabulary you learn easy to find.",
  },
  {
    icon: WandSparkles,
    title: "Use Smart Import",
    description:
      "Import structured study data in bulk instead of adding every item manually.",
  },
  {
    icon: BookOpen,
    title: "Extend your workspace",
    description:
      "Use the plugin system to add focused study tools and build a workspace that suits your needs.",
  },
];

const previewNavigation = [
  { title: "Dashboard", icon: LayoutDashboard, active: true },
  { title: "Marketplace", icon: Store, active: false },
  { title: "Settings", icon: Settings, active: false },
];

type PreviewSubject = {
  name: string;
  status?: "new" | "updated";
};

const previewSubjects: PreviewSubject[] = [
  { name: "Mathematics", status: "updated" },
  { name: "Computer Science", status: "new" },
  { name: "History" },
  { name: "Physics" },
];

export default function LandingPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center"
      >
        <div className="h-[520px] w-full max-w-6xl rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Hero section */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 md:pt-24 lg:grid-cols-2 lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            A clearer way to organize your studies
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            Make room for learning.
            <span className="mt-2 block bg-gradient-to-r from-primary via-primary to-sky-500 bg-clip-text text-transparent">
              We&apos:ll help organize the rest.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
            Keep your subjects, assignments, and vocabulary organized in one
            workspace. Spend less time managing your study routine and more
            time making progress.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/sign-up"
              className={buttonVariants({
                size: "lg",
                className: "h-11 rounded-xl px-6 text-sm",
              })}
            >
              Get started for free
              <ArrowRight className="ml-1 size-4" />
            </Link>

            <Link
              href="/auth/login"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-11 rounded-xl px-6 text-sm",
              })}
            >
              Sign in to your account
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="size-4 text-primary" />
              Organized workspace
            </span>

            <span className="flex items-center gap-2">
              <Check className="size-4 text-primary" />
              Personal vocabulary bank
            </span>
          </div>
        </div>

        {/* Dashboard preview */}
        <div
          role="img"
          aria-label="Illustrative preview of the StudyPro dashboard, including its sidebar, plugin selector, and study subjects"
          className="relative mx-auto w-full max-w-[650px]"
        >
          <div
            aria-hidden="true"
            className="absolute -left-8 top-12 size-36 rounded-full bg-primary/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-8 -right-5 size-40 rounded-full bg-sky-500/10 blur-3xl"
          />

          <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/10">
            {/* Browser header */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
              <div className="size-3 rounded-full bg-red-500/80" />
              <div className="size-3 rounded-full bg-yellow-500/80" />
              <div className="size-3 rounded-full bg-green-500/80" />

              <div className="ml-4 flex flex-1 justify-center">
                <div className="flex w-64 max-w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-green-500" />
                  StudyPro dashboard preview
                </div>
              </div>
            </div>

            {/* Application layout */}
            <div className="flex min-h-[500px] bg-background sm:min-h-[550px]">
              {/* Sidebar */}
              <aside className="hidden w-48 shrink-0 flex-col border-r border-border bg-muted/20 p-3 md:flex">
                {/* User profile */}
                <div className="flex items-center gap-3 overflow-hidden border-b border-border px-2 pb-5 pt-2">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-sky-500 text-sm font-bold text-white">
                    S
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Student</p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      Personal account
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Application
                  </p>

                  <div className="space-y-1">
                    {previewNavigation.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium ${
                            item.active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-4 shrink-0" />
                          {item.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Main application area */}
              <div className="min-w-0 flex-1">
                {/* Dashboard navbar preview */}
                <div className="flex h-14 items-center justify-between border-b border-border px-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-5 text-primary" />

                    <span className="text-sm font-bold">
                      Study<span className="text-primary">Pro</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-[10px] font-medium text-primary-foreground sm:flex">
                      <LogOut className="size-3" />
                      Logout
                    </div>

                    <div className="flex size-8 items-center justify-center rounded-md border border-border">
                      <Sun className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-3 sm:p-5">
                  {/* Dashboard heading and plugin selector */}
                  <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-bold tracking-tight sm:text-2xl">
                      Dashboard
                    </h2>

                    <div className="flex items-center gap-1.5">
                      <Puzzle className="size-4 text-muted-foreground" />

                      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-2 text-[10px] sm:text-xs">
                        Study Planner
                        <ChevronDown className="size-3 text-muted-foreground" />
                      </div>

                      <div className="flex size-8 items-center justify-center rounded-md border border-border">
                        <Pencil className="size-3.5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Study Planner plugin */}
                  <div>
                    <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                          My Subjects
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                          Manage your classes and track your study material.
                        </p>
                      </div>

                      <div className="flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
                        <Plus className="size-4" />
                        Create Subject
                      </div>
                    </div>

                    {/* Search bar and subject status legend */}
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />

                        <div className="flex h-9 items-center rounded-md border border-border bg-background pl-9 pr-3 text-xs text-muted-foreground">
                          Search subjects...
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-green-500" />
                          New
                        </span>

                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-blue-500" />
                          Updated
                        </span>
                      </div>
                    </div>

                    {/* Subject cards */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {previewSubjects.map((subject) => (
                        <Card
                          key={subject.name}
                          className="group h-full cursor-pointer transition-colors hover:bg-accent/50"
                        >
                          <CardHeader className="flex flex-row items-center justify-between gap-2 py-4">
                            <CardTitle className="flex min-w-0 items-center gap-2 text-xs font-semibold sm:text-sm">
                              {subject.status && (
                                <span
                                  aria-label={
                                    subject.status === "new"
                                      ? "New subject"
                                      : "Updated subject"
                                  }
                                  title={
                                    subject.status === "new"
                                      ? "New subject"
                                      : "Updated subject"
                                  }
                                  className={`size-2.5 shrink-0 rounded-full ${
                                    subject.status === "new"
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                                  }`}
                                />
                              )}

                              <span className="truncate">
                                {subject.name}
                              </span>
                            </CardTitle>

                            <Trash2 className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-4 flex justify-center">
            <span className="rounded-full border border-border bg-card/80 px-4 py-2 text-xs text-muted-foreground shadow-sm">
              A workspace designed around your studies
            </span>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section
        id="features"
        className="px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">
              Everything in one place
            </p>

            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              The tools you need to stay organized
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground">
              A study workspace built around the everyday tasks of being a
              student.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="px-4 py-20 sm:px-6 sm:py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 px-6 py-14 text-center sm:px-12">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-sky-500/10"
          />

          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>

          <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Make your study routine easier to manage.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Bring your subjects, tasks, and vocabulary together. Start
            organizing your work with StudyPro.
          </p>

          <Link
            href="/auth/sign-up"
            className={buttonVariants({
              size: "lg",
              className: "mt-8 h-11 rounded-xl px-6",
            })}
          >
            Create your account
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}