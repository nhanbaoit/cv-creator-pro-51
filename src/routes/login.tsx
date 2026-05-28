import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { loginUser, seedDemoUserIfEmpty, useAuthStore } from "@/lib/auth";
import { useResumeStore } from "@/lib/resume-store";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  if (typeof window !== "undefined") seedDemoUserIfEmpty();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = loginUser(email, password);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setUser(res.user);
    useResumeStore.getState().loadForCurrentUser();
    toast.success(`Welcome back, ${res.user.name}!`);
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
            Craft an interview-winning resume.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md">
            Overleaf-style CV builder for IT students. Pick a template, edit live,
            check your ATS score, and export PDF in one click.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          Demo account: demo@gmail.com / 123456
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="p-7 w-full max-w-md">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log in to manage your resumes.
          </p>
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </Card>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
