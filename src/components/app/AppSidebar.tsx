import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileEdit,
  LayoutTemplate,
  ShieldCheck,
  Settings,
  FileText,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUser, useAuthStore } from "@/lib/auth";
import { useResumeStore } from "@/lib/resume-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/editor", label: "CV Editor", icon: FileEdit },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/recommendations", label: "CV Recommendations", icon: Sparkles },
  { to: "/ats", label: "ATS Checker", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const resetMemory = useResumeStore((s) => s.resetMemory);
  const navigate = useNavigate();

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onLogout = () => {
    logoutUser();
    setUser(null);
    resetMemory();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 h-16 border-b">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold">DevResume</div>
          <div className="text-xs text-muted-foreground">CV builder for IT</div>
        </div>
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {items.map((it) => {
          const active = path === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t space-y-2">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-accent grid place-items-center font-semibold text-accent-foreground">
            {initials}
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[140px]">
              {user?.email}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </aside>
  );
}
