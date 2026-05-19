import { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function Topbar({ title, subtitle, children }: Props) {
  return (
    <header className="h-16 border-b bg-card/60 backdrop-blur px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div>
        <h1 className="font-semibold text-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
