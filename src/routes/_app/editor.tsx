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
import { Download, Plus, Trash2, ShieldCheck, Sparkles, Upload, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { SmartRecommendationDialog } from "@/components/app/SmartRecommendation";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/editor")({
  component: EditorPage,
});

const templateLabels: Record<TemplateId, string> = {
  harvard: "Harvard Classic",
  modern: "Modern Developer",
  minimal: "Minimal ATS",
  creative: "Creative Portfolio",
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

function EditorPage() {
  const resume = useActiveResume();
  const { updateData, setTemplate, resumes, setActive, lastRecommendation } = useResumeStore();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "editing">("saved");

  const ats = useMemo(() => (resume ? computeAts(resume.data) : null), [resume]);

  // Reflect a tiny "Editing → Saved" indicator whenever resume data changes.
  useEffect(() => {
    if (!resume) return;
    setSaveStatus("editing");
    const t = setTimeout(() => setSaveStatus("saved"), 500);
    return () => clearTimeout(t);
  }, [resume?.updatedAt, resume?.id]);


  if (!resume) {
    return (
      <>
        <Topbar title="CV Editor" />
        <div className="p-8 text-muted-foreground">No resume yet. Create one from the Dashboard.</div>
      </>
    );
  }

  const d = resume.data;
  const id = resume.id;
  const setD = (updater: (data: typeof d) => typeof d) => updateData(id, updater);

  const onAvatarFile = (file: File) => {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPG, or WEBP images are allowed");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setD((dd) => ({ ...dd, personal: { ...dd.personal, avatar: result } }));
      toast.success("Avatar uploaded");
    };
    reader.onerror = () => toast.error("Failed to read image");
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Topbar title="CV Editor" subtitle={resume.title}>
        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
          {saveStatus === "saved" ? (
            <><Check className="h-3.5 w-3.5 text-emerald-600" /> Saved</>
          ) : (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Editing…</>
          )}
        </div>
        <div className="hidden lg:flex flex-col items-end leading-tight mr-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Template</div>
          <div className="text-sm font-medium flex items-center gap-1.5">
            {templateLabels[resume.template]}
            {lastRecommendation && lastRecommendation.template !== resume.template && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Sparkles className="h-3 w-3" />
                Recommended: {templateLabels[lastRecommendation.template]}
              </Badge>
            )}
          </div>
        </div>
        <Select value={resume.id} onValueChange={setActive}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={resume.template} onValueChange={(v) => setTemplate(id, v as TemplateId)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(templateLabels) as TemplateId[]).map((t) => (
              <SelectItem key={t} value={t}>{templateLabels[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SmartRecommendationDialog
          trigger={
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" /> Change Template
            </Button>
          }
        />
        <div className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-md bg-primary/10 text-primary text-sm font-medium">
          <ShieldCheck className="h-4 w-4" /> ATS {ats?.score}/100
        </div>
        <Button onClick={() => { toast.success("Preparing PDF..."); setTimeout(() => window.print(), 200); }}>
          <Download /> Export PDF
        </Button>
      </Topbar>

      <div className="grid lg:grid-cols-2 gap-0 flex-1 min-h-0">
        {/* Editor */}
        <div className="border-r overflow-y-auto p-5 max-h-[calc(100vh-4rem)]">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="flex-wrap h-auto justify-start">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="languages">Languages</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4 space-y-4">
              <Card className="p-5">
                <h3 className="font-semibold mb-3">Avatar</h3>
                <div className="flex items-center gap-5">
                  <div className="h-24 w-24 rounded-full bg-muted overflow-hidden border grid place-items-center text-muted-foreground text-xs">
                    {d.personal.avatar ? (
                      <img src={d.personal.avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      "No image"
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => avatarInputRef.current?.click()}>
                        <Upload className="h-4 w-4" /> Upload
                      </Button>
                      {d.personal.avatar && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setD((dd) => ({ ...dd, personal: { ...dd.personal, avatar: undefined } }))
                          }
                        >
                          <X className="h-4 w-4" /> Remove Avatar
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: square image under 2MB. PNG, JPG, or WEBP.
                    </p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onAvatarFile(f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </Card>
              <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  ["fullName", "Full name"],
                  ["title", "Target role"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["location", "Location"],
                  ["github", "GitHub"],
                  ["linkedin", "LinkedIn"],
                  ["portfolio", "Portfolio"],
                ] as const).map(([k, label]) => (
                  <div key={k} className="space-y-1.5">
                    <Label>{label}</Label>
                    <Input
                      value={d.personal[k] ?? ""}
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
                <p className="text-xs text-muted-foreground">Tip: write 2–4 sentences highlighting your core skills and goals.</p>
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
                <Plus /> Add Education
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="mt-4 space-y-3">
              {d.skills.map((s, i) => (
                <Card key={s.id} className="p-5 space-y-3">
                  <RowActions onDelete={() => setD((dd) => ({ ...dd, skills: dd.skills.filter((_, j) => j !== i) }))} />
                  <Field label="Category" v={s.category} on={(v)=>upd("skills",i,"category",v)} />
                  <div className="space-y-1.5">
                    <Label>Skills (comma-separated)</Label>
                    <Input value={s.items} onChange={(e)=>upd("skills",i,"items",e.target.value)} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => setD((dd)=>({...dd,skills:[...dd.skills,{id:uid(),category:"",items:""}]}))}>
                <Plus /> Add Skill Group
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
                    <Label>Description (each line = one bullet)</Label>
                    <Textarea rows={4} value={p.description} onChange={(e)=>upd("projects",i,"description",e.target.value)} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => setD((dd)=>({...dd,projects:[...dd.projects,{id:uid(),name:"",role:"",techStack:"",description:"",github:"",demo:""}]}))}>
                <Plus /> Add Project
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
                    <Label>Description (each line = one bullet)</Label>
                    <Textarea rows={3} value={e.description} onChange={(ev)=>upd("experience",i,"description",ev.target.value)} />
                  </div>
                </Card>
              ))}
              <Button variant="outline" onClick={() => setD((dd)=>({...dd,experience:[...dd.experience,{id:uid(),company:"",position:"",startDate:"",endDate:"",description:""}]}))}>
                <Plus /> Add Experience
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
                <Plus /> Add Certificate
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
                <Plus /> Add Language
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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="ghost" aria-label="Delete item"><Trash2 /></Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This entry will be removed from your CV. You can always add it back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onDelete(); toast.success("Item removed"); }}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
