import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import CreateTaskDialog from "@/components/web/dashboard/tasks/create-task-dialog";
import TaskList from "@/components/web/dashboard/tasks/task-list";
import { getAuthToken } from "@/lib/auth-server";

export const instant = false;

interface Props {
  params: Promise<{ subjectId: Id<"subjects"> }>;
}

export default async function SubjectDetailPage({ params }: Props) {
  const { subjectId } = await params;

  const token = await getAuthToken();

  console.log(`the client token we get using getToken: ${token}`);

  // Fetch the specific subject to get its name
  const subject = await fetchQuery(
    api.subjects.getSubjectById,
    { subjectId },
    { token: token ?? undefined }
  );

  if (!subject) {
    return <div className="text-center py-20 text-2xl font-bold">Subject not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link
        href="/dashboard"
        className={buttonVariants({ variant: "ghost", className: "mb-6" })}
      >
        <ArrowLeft className="mr-2 size-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{subject.subject}</h1>

        <CreateTaskDialog subjectId={subjectId}>
          <Button>
            <Plus className="mr-2 size-4" /> Add Task
          </Button>
        </CreateTaskDialog>
      </div>

      <TaskList subjectId={subjectId} />
    </div>
  );
}