import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CvPreview } from "@/components/app/CvPreview";
import { useActiveResume, useResumeStore } from "@/lib/resume-store";
import { computeAts } from "@/lib/ats";
import { TemplateId, uid } from "@/lib/resume-types";
import { Download, Plus, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";

export const Route = createFileRoute("/_app/editor")({
  component: EditorPage,
});

const templateLabels: Record<TemplateId, string> = {
  harvard: "Harvard Classic",
  modern: "Modern Developer",
  minimal: "Minimal ATS",
  creative: "Creative Portfolio",
};

function EditorPage() {
  const resume = useActiveResume();
  const { updateData, setTemplate, resumes, setActive } = useResumeStore();

  const ats = useMemo(() => (resume ? computeAts(resume.data) : null), [resume]);

  if (!resume) {
    return (
      <>
        <Topbar title="CV Editor" />
        <div className="p-8 text-muted-foreground">Chưa có CV nào. Hãy tạo từ Dashboard.</div>
      </>
    );
  }

  const d = resume.data;
  const id = resume.id;
  const setD = (updater: (data: typeof d) => typeof d) => updateData(id, updater);

  return (
    <>
      <Topbar title="CV Editor" subtitle={resume.title}>
        <Select value={resume.id} onValueChange={setActive}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={resume.template} onValueChange={(v) => setTemplate(id, v as TemplateId)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(templateLabels) as TemplateId[]).map((t) => (
              <SelectItem key={t} value={t}>{templateLabels[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-md bg-primary/10 text-primary text-sm font-medium">
          <ShieldCheck className="h-4 w-4" /> ATS {ats?.score}/100
        </div>
        <Button onClick={() => { toast.success("Đang chuẩn bị PDF..."); setTimeout(() => window.print(), 200); }}>
          <Download /> Export PDF
        </Button>
      </Topbar>

      <div className="grid lg:grid-cols-2 gap-0 flex-1 min-h-0">
        {/* Editor */}
        <div className="border-r overflow-y-auto p-5 max-h-[calc(100vh-4rem)]">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="flex-wrap h-auto justify-start">
              <TabsTrigger value="personal">Thông tin</TabsTrigger>
              <TabsTrigger value="summary">Tóm tắt</TabsTrigger>
              <TabsTrigger value="education">Học vấn</TabsTrigger>
              <TabsTrigger value="skills">Kỹ năng</TabsTrigger>
              <TabsTrigger value="projects">Dự án</TabsTrigger>
              <TabsTrigger value="experience">Kinh nghiệm</TabsTrigger>
              <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
              <TabsTrigger value="languages">Ngôn ngữ</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  ["fullName", "Họ và tên"],
                  ["title", "Vị trí ứng tuyển"],
                  ["email", "Email"],
                  ["phone", "Số điện thoại"],
                  ["location", "Địa chỉ"],
                  ["github", "GitHub"],
                  ["linkedin", "LinkedIn"],
                  ["portfolio", "Portfolio"],
                ] as const).map(([k, label]) => (
                  <div key={k} className="space-y-1.5">
                    <Label>{label}</Label>
                    <Input
                      value={d.personal[k]}
                      onChange={(e) => setD((dd) => ({ ...dd, personal: { ...dd.personal, [k]: e.target.value } }))}
                    />
                  </div>
                ))}
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="mt-4">
              <Card className="p-5 space-y-2">
                <Label>Professional summary</Label>
                <Textarea rows={6} value={d.summary} onChange={(e) => setD((dd) => ({ ...dd, summary: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Mẹo: viết 2–4 câu nêu rõ kỹ năng cốt lõi và mục tiêu.</p>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="mt-4 space-y-3">
              {d.education.map((e, i) => (
                <Card key={e.id} className="p-5 space-y-3">
                  <RowActions onDelete={() => setD((dd) => ({ ...dd, education: dd.education.filter((_, j) => j !== i) }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="School" v={e.school} on={(v)=>upd("education",i,"school",v)} />
                    <Field label="Major" v={e.major} on={(v)=>upd("education",i,"major",v)} />
                    <Field label="Start year" v={e.startYear} on={(v)=>upd("education",i,"startYear",v)} />
                    <Field label="End year" v={e.endYear} on={(v)=>upd("education",i,"endYear",v)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea rows={2} value={e.description} onChange={(ev)=>upd("education",i,"description",ev.target.value)} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => setD((dd)=>({...dd,education:[...dd.education,{id:uid(),school:"",major:"",startYear:"",endYear:"",description:""}]}))}>
                <Plus /> Thêm học vấn
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="mt-4 space-y-3">
              {d.skills.map((s, i) => (
                <Card key={s.id} className="p-5 space-y-3">
                  <RowActions onDelete={() => setD((dd) => ({ ...dd, skills: dd.skills.filter((_, j) => j !== i) }))} />
                  <Field label="Category" v={s.category} on={(v)=>upd("skills",i,"category",v)} />
                  <div className="space-y-1.5">
                    <Label>Skills (phân tách bằng dấu phẩy)</Label>
                    <Input value={s.items} onChange={(e)=>upd("skills",i,"items",e.target.value)} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => setD((dd)=>({...dd,skills:[...dd.skills,{id:uid(),category:"",items:""}]}))}>
                <Plus /> Thêm nhóm kỹ năng
              </Button>
            </TabsContent>

            <TabsContent value="projects" className="mt-4 space-y-3">
              {d.projects.map((p, i) => (
                <Card key={p.id} className="p-5 space-y-3">
                  <RowActions onDelete={() => setD((dd) => ({ ...dd, projects: dd.projects.filter((_, j) => j !== i) }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Project name" v={p.name} on={(v)=>upd("projects",i,"name",v)} />
                    <Field label="Role" v={p.role} on={(v)=>upd("projects",i,"role",v)} />
                    <Field label="Tech stack" v={p.techStack} on={(v)=>upd("projects",i,"techStack",v)} />
                    <Field label="GitHub" v={p.github} on={(v)=>upd("projects",i,"github",v)} />
                    <Field label="Demo" v={p.demo} on={(v)=>upd("projects",i,"demo",v)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description (mỗi dòng = 1 bullet)</Label>
                    <Textarea rows={4} value={p.description} onChange={(e)=>upd("projects",i,"description",e.target.value)} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => setD((dd)=>({...dd,projects:[...dd.projects,{id:uid(),name:"",role:"",techStack:"",description:"",github:"",demo:""}]}))}>
                <Plus /> Thêm dự án
              </Button>
            </TabsContent>

            <TabsContent value="experience" className="mt-4 space-y-3">
              {d.experience.map((e, i) => (
                <Card key={e.id} className="p-5 space-y-3">
                  <RowActions onDelete={() => setD((dd) => ({ ...dd, experience: dd.experience.filter((_, j) => j !== i) }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Company" v={e.company} on={(v)=>upd("experience",i,"company",v)} />
                    <Field label="Position" v={e.position} on={(v)=>upd("experience",i,"position",v)} />
                    <Field label="Start date" v={e.startDate} on={(v)=>upd("experience",i,"startDate",v)} />
                    <Field label="End date" v={e.endDate} on={(v)=>upd("experience",i,"endDate",v)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description (mỗi dòng = 1 bullet)</Label>
                    <Textarea rows={3} value={e.description} onChange={(ev)=>upd("experience",i,"description",ev.target.value)} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => setD((dd)=>({...dd,experience:[...dd.experience,{id:uid(),company:"",position:"",startDate:"",endDate:"",description:""}]}))}>
                <Plus /> Thêm kinh nghiệm
              </Button>
            </TabsContent>

            <TabsContent value="certificates" className="mt-4 space-y-3">
              {d.certificates.map((c, i) => (
                <Card key={c.id} className="p-5 space-y-3">
                  <RowActions onDelete={() => setD((dd) => ({ ...dd, certificates: dd.certificates.filter((_, j) => j !== i) }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Certificate name" v={c.name} on={(v)=>upd("certificates",i,"name",v)} />
                    <Field label="Issuer" v={c.issuer} on={(v)=>upd("certificates",i,"issuer",v)} />
                    <Field label="Date" v={c.date} on={(v)=>upd("certificates",i,"date",v)} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => setD((dd)=>({...dd,certificates:[...dd.certificates,{id:uid(),name:"",issuer:"",date:""}]}))}>
                <Plus /> Thêm chứng chỉ
              </Button>
            </TabsContent>

            <TabsContent value="languages" className="mt-4 space-y-3">
              {d.languages.map((l, i) => (
                <Card key={l.id} className="p-5 space-y-3">
                  <RowActions onDelete={() => setD((dd) => ({ ...dd, languages: dd.languages.filter((_, j) => j !== i) }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Language" v={l.name} on={(v)=>upd("languages",i,"name",v)} />
                    <Field label="Level" v={l.level} on={(v)=>upd("languages",i,"level",v)} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => setD((dd)=>({...dd,languages:[...dd.languages,{id:uid(),name:"",level:""}]}))}>
                <Plus /> Thêm ngôn ngữ
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
        <div className="overflow-auto bg-muted/40 p-6 max-h-[calc(100vh-4rem)]">
          <div className="mx-auto print-area" style={{ width: "fit-content" }}>
            <CvPreview data={d} template={resume.template} />
          </div>
        </div>
      </div>
    </>
  );

  function upd<K extends "education" | "skills" | "projects" | "experience" | "certificates" | "languages">(
    section: K, index: number, key: string, value: string
  ) {
    setD((dd) => {
      const arr = [...(dd[section] as any[])];
      arr[index] = { ...arr[index], [key]: value };
      return { ...dd, [section]: arr };
    });
  }
}

function Field({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}

function RowActions({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="flex justify-end">
      <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 /></Button>
    </div>
  );
}
