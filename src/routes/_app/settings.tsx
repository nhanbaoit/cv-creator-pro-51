import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useResumeStore, useActiveResume } from "@/lib/resume-store";
import { logoutUser, useAuthStore } from "@/lib/auth";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const resume = useActiveResume();
  const { resumes, clearMyResumes, resetMemory } = useResumeStore();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const exportJson = () => {
    if (!resume) return toast.error("No resume to export");
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported resume JSON");
  };

  const onImport = async (f: File) => {
    const text = await f.text();
    if (useResumeStore.getState().importJSON(text)) toast.success("Resume imported");
    else toast.error("Invalid JSON file");
  };

  const onLogout = () => {
    logoutUser();
    setUser(null);
    resetMemory();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your account and app preferences">
        <Button variant="outline" onClick={onLogout} className="gap-2">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </Topbar>
      <main className="p-6 md:p-8 max-w-3xl w-full mx-auto space-y-5">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Profile</h3>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-semibold">
              {initials}
            </div>
            <div>
              <div className="font-medium">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {resumes.length} resume{resumes.length === 1 ? "" : "s"} saved
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">App preferences</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark mode</Label>
              <p className="text-xs text-muted-foreground">Switch to a dark interface</p>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Language</Label>
              <p className="text-xs text-muted-foreground">Interface language</p>
            </div>
            <span className="text-sm">English</span>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">My data</h3>
          <p className="text-xs text-muted-foreground">
            All actions below apply only to your account ({user?.email}).
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportJson}>Export resume JSON</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>Import resume JSON</Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Clear my resumes</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all your resumes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All resumes for {user?.email} will be permanently removed from this browser.
                    Other accounts are not affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { clearMyResumes(); toast.success("Your resumes were cleared"); }}>
                    Delete all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </main>
    </>
  );
}
