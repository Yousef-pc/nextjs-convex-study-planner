import SubjectDetails from "@/components/web/dashboard/plugins/study-planner/subject-details";
import { Id } from "@/convex/_generated/dataModel";

interface Props {
  params: Promise<{ subjectId: Id<"subjects"> }>;
}

export default async function SubjectDetailPage({ params }: Props) {
  const { subjectId } = await params;
  return <SubjectDetails subjectId={subjectId} />;
}