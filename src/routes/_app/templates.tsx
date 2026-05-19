import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useResumeStore, useActiveResume } from "@/lib/resume-store";
import { TemplateId } from "@/lib/resume-types";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_app/templates")({
  component: TemplatesPage,
});

const templates: { id: TemplateId; name: string; desc: string; color: string }[] = [
  { id: "harvard", name: "Harvard Classic", desc: "CV truyền thống, serif, phù hợp công ty lớn.", color: "from-neutral-200 to-neutral-100" },
  { id: "modern", name: "Modern Developer", desc: "Bố cục hiện đại với accent indigo, cho developer.", color: "from-indigo-200 to-indigo-50" },
  { id: "minimal", name: "Minimal ATS", desc: "Tối giản, tối ưu cho ATS scanner.", color: "from-slate-200 to-slate-50" },
  { id: "creative", name: "Creative Portfolio", desc: "Sidebar tối + accent fuchsia, cho vai trò sáng tạo.", color: "from-fuchsia-200 to-fuchsia-50" },
];

function TemplatesPage() {
  const resume = useActiveResume();
  const { setTemplate } = useResumeStore();
  const navigate = useNavigate();

  return (
    <>
      <Topbar title="Templates" subtitle="Chọn mẫu CV phù hợp với phong cách của bạn" />
      <main className="p-6 md:p-8 max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {templates.map((t) => {
            const active = resume?.template === t.id;
            return (
              <Card key={t.id} className="overflow-hidden flex flex-col">
                <div className={`aspect-[4/3] bg-gradient-to-br ${t.color} border-b grid place-items-center p-4`}>
                  <MiniPreview id={t.id} />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{t.name}</h3>
                    {active && <span className="text-xs flex items-center gap-1 text-primary font-medium"><Check className="h-3 w-3"/>Đang dùng</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 flex-1">{t.desc}</p>
                  <Button
                    className="mt-4"
                    variant={active ? "secondary" : "default"}
                    onClick={() => {
                      if (!resume) { toast.error("Hãy tạo CV trước"); return; }
                      setTemplate(resume.id, t.id);
                      toast.success(`Đã chọn ${t.name}`);
                      navigate({ to: "/editor" });
                    }}
                  >Sử dụng mẫu này</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}

function MiniPreview({ id }: { id: TemplateId }) {
  const base = "bg-white rounded shadow-sm w-44 h-56 p-3 text-[6px] leading-tight";
  if (id === "harvard")
    return (
      <div className={base + " text-center"}>
        <div className="font-bold uppercase border-b border-black pb-1">Nguyễn Nhân Bảo</div>
        <div className="font-bold mt-1 text-left">EDUCATION</div>
        <div className="h-1 bg-neutral-200 mt-0.5"></div>
        <div className="font-bold mt-1 text-left">PROJECTS</div>
        <div className="h-1 bg-neutral-200 mt-0.5"></div>
        <div className="h-1 bg-neutral-200 mt-0.5 w-4/5"></div>
      </div>
    );
  if (id === "modern")
    return (
      <div className={base}>
        <div className="border-b-2 border-indigo-600 pb-1">
          <div className="font-bold">Nguyễn Nhân Bảo</div>
          <div className="text-indigo-600">Frontend Intern</div>
        </div>
        <div className="text-indigo-600 font-bold mt-2">SKILLS</div>
        <div className="h-1 bg-neutral-200 mt-0.5"></div>
        <div className="text-indigo-600 font-bold mt-1">PROJECTS</div>
        <div className="h-1 bg-neutral-200 mt-0.5"></div>
      </div>
    );
  if (id === "minimal")
    return (
      <div className={base}>
        <div className="font-bold">Nguyễn Nhân Bảo</div>
        <div className="font-bold mt-2 border-b border-neutral-300">SUMMARY</div>
        <div className="h-1 bg-neutral-200 mt-0.5"></div>
        <div className="font-bold mt-1 border-b border-neutral-300">SKILLS</div>
        <div className="h-1 bg-neutral-200 mt-0.5"></div>
      </div>
    );
  return (
    <div className={base + " flex p-0 overflow-hidden"}>
      <div className="bg-neutral-900 text-white w-16 p-2">
        <div className="w-5 h-5 rounded-full bg-fuchsia-500"></div>
        <div className="font-bold mt-1">N. Bảo</div>
        <div className="text-fuchsia-300 mt-1">Skills</div>
      </div>
      <div className="flex-1 p-2">
        <div className="font-bold text-fuchsia-700">About</div>
        <div className="h-1 bg-neutral-200 mt-0.5"></div>
        <div className="font-bold text-fuchsia-700 mt-1">Projects</div>
      </div>
    </div>
  );
}
