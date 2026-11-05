"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have this
import Link from "next/link";

export default function SubjectList() {
  const subjects = useQuery(api.subjects.getSubjects);

  // 1. Loading State
  if (subjects === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // 2. Empty State
  if (subjects.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
        <BookOpen className="mx-auto size-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No subjects yet</h3>
        <p className="text-muted-foreground">Create your first subject to get started.</p>
      </div>
    );
  }

  // 3. Data State
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subjects.map((sub) => (
        <Link href={`/dashboard/subjects/${sub._id}`} key={sub._id}>
          <Card key={sub._id} className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary" /> {/* Fake color dot for now */}
                {sub.subject}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}