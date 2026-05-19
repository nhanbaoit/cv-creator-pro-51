import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FileEdit, LayoutTemplate, ShieldCheck, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/editor", label: "CV Editor", icon: FileEdit },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/ats", label: "ATS Checker", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 h-16 border-b">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold">DevResume</div>
          <div className="text-xs text-muted-foreground">CV builder cho IT</div>
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
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-accent grid place-items-center font-semibold text-accent-foreground">
            NB
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium">Nguyễn Nhân Bảo</div>
            <div className="text-xs text-muted-foreground truncate max-w-[140px]">
              nhanbao.0401@gmail.com
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
