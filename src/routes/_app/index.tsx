import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileEdit, Copy, Trash2, FileText } from "lucide-react";
import { useResumeStore } from "@/lib/resume-store";
import { computeAts } from "@/lib/ats";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Topbar } from "@/components/app/Topbar";
import { SmartRecommendationDialog } from "@/components/app/SmartRecommendation";
import { TEMPLATE_META } from "@/lib/recommend";

export const Route = createFileRoute("/_app/")({
  component: DashboardPage,
});

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "a few minutes ago";
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function DashboardPage() {
  const { resumes, createResume, duplicateResume, deleteResume, setActive } = useResumeStore();
  const navigate = useNavigate();

  const handleCreate = () => {
    const id = createResume("Untitled CV");
    setActive(id);
    toast.success("New CV created");
    navigate({ to: "/editor" });
  };

  return (
    <>
      <Topbar title="My Resumes" subtitle="Manage all your CVs in one place">
        <SmartRecommendationDialog />
        <Button onClick={handleCreate}><Plus /> New CV</Button>
      </Topbar>
      <main className="p-6 md:p-8 max-w-7xl w-full mx-auto">
        {resumes.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-lg">No resumes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start building your first CV right now.</p>
            <Button onClick={handleCreate}><Plus /> Create CV</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((r) => {
              const ats = computeAts(r.data);
              return (
                <Card key={r.id} className="p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
                  <div className="aspect-[1/1.2] rounded-md bg-gradient-to-br from-accent to-muted border grid place-items-center overflow-hidden relative">
                    <div className="absolute inset-3 bg-white rounded-sm shadow-sm p-3 text-[6px] leading-tight overflow-hidden">
                      <div className="font-bold text-[8px] text-neutral-800">{r.data.personal.fullName}</div>
                      <div className="text-indigo-600">{r.data.personal.title}</div>
                      <div className="h-px bg-neutral-300 my-1"></div>
                      <div className="space-y-0.5">
                        <div className="h-1 bg-neutral-200 rounded w-full"></div>
                        <div className="h-1 bg-neutral-200 rounded w-4/5"></div>
                        <div className="h-1 bg-neutral-200 rounded w-3/5"></div>
                      </div>
                      <div className="font-bold text-indigo-600 mt-1 text-[7px]">PROJECTS</div>
                      <div className="space-y-0.5 mt-0.5">
                        <div className="h-1 bg-neutral-200 rounded w-full"></div>
                        <div className="h-1 bg-neutral-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold truncate">{r.title}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{TEMPLATE_META[r.template]?.name ?? r.template}</span>
                      <span>{formatTime(r.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        ATS {ats.score}/100
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button size="sm" className="flex-1" asChild onClick={() => setActive(r.id)}>
                      <Link to="/editor"><FileEdit /> Edit</Link>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { duplicateResume(r.id); toast.success("Resume duplicated"); }}>
                      <Copy />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline"><Trash2 /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action can't be undone. "{r.title}" will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => { deleteResume(r.id); toast.success("Resume deleted"); }}
                          >Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
