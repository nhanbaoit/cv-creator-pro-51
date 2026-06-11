import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { registerUser, loginUser, useAuthStore } from "@/lib/auth";
import { useResumeStore } from "@/lib/resume-store";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = registerUser({ name, email, password });
    if (!r.ok) {
      setLoading(false);
      toast.error(r.error);
      return;
    }
    const login = loginUser(email, password);
    setLoading(false);
    if (!login.ok) {
      toast.error(login.error);
      return;
    }
    setUser(login.user);
    useResumeStore.getState().loadForCurrentUser();
    toast.success("Account created!");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary/15 via-accent to-background border-r">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <FileText className="h-5 w-5" />
          </div>
          <div className="font-semibold text-lg">DevResume</div>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Start building your career portfolio.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md">
            Create an account to save your CVs, switch templates, and track ATS scores.
          </p>
        </div>
        <div />
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="p-7 w-full max-w-md">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All data is saved locally in your browser.
          </p>
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
