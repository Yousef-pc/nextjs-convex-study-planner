import { getToken } from "@/lib/auth-server"; // 👈 Import this
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateSubjectDialog from "@/components/web/dashboard/subjects/create-subject-dialog";
import SubjectList from "@/components/web/dashboard/subjects/subject-list";

export const instant = false;

const Dashboard = async () => {
  const token = await getToken(); // 👈 Get the token

  console.log("=== DASHBOARD SERVER TOKEN ===", token ? "TOKEN EXISTS" : "TOKEN IS NULL/UNDEFINED");

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Subjects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your classes and track your study material.
            </p>
          </div>
          
          <CreateSubjectDialog>
            <Button>
              <Plus className="mr-2 size-4" />
              Create Subject
            </Button>
          </CreateSubjectDialog>
        </div>

        {/* The Grid of Subjects */}
        <SubjectList />
        
      </main>
    </div>
  )
}

export default Dashboard;