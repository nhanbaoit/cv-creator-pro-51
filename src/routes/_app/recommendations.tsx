import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Wand2, Search, FileText } from "lucide-react";
import { CV_SAMPLES } from "@/lib/cv-samples";
import { TEMPLATE_META } from "@/lib/recommend";
import { useResumeStore } from "@/lib/resume-store";
import { computeAts } from "@/lib/ats";
import { toast } from "sonner";
import { CvPreview } from "@/components/app/CvPreview";
import { useMemo, useState } from "react";
import { TemplateId } from "@/lib/resume-types";

export const Route = createFileRoute("/_app/recommendations")({
  component: RecommendationsPage,
});

const ROLE_OPTIONS = ["All", "Frontend", "Backend", "Tester", "UI/UX", "Student"];
const LEVEL_OPTIONS = ["All", "No experience", "Intern", "Junior"];
const STYLE_OPTIONS: { label: string; value: TemplateId | "all" }[] = [
  { label: "All styles", value: "all" },
  { label: "Harvard Classic", value: "harvard" },
  { label: "Modern Developer", value: "modern" },
  { label: "Minimal ATS", value: "minimal" },
  { label: "Creative Portfolio", value: "creative" },
];

function RecommendationsPage() {
  const remixSample = useResumeStore((s) => s.remixSample);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [level, setLevel] = useState("All");
  const [style, setStyle] = useState<TemplateId | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CV_SAMPLES.filter((s) => {
      if (style !== "all" && s.template !== style) return false;
      if (role !== "All" && !s.tags.some((t) => t.toLowerCase() === role.toLowerCase())) return false;
      if (level !== "All" && !s.tags.some((t) => t.toLowerCase() === level.toLowerCase())) return false;
      if (q && !`${s.title} ${s.description} ${s.tags.join(" ")}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [query, role, level, style]);

  const onRemix = (sampleId: string) => {
    const id = remixSample(sampleId);
    if (!id) {
      toast.error("Could not remix this sample");
      return;
    }
    toast.success("CV sample remixed successfully. You can now customize it.");
    navigate({ to: "/editor" });
  };

  return (
    <>
      <Topbar title="CV Recommendations" subtitle="Pick a ready-made CV sample and remix it as your own" />
      <main className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
        <Card className="p-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto] items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, role, or tag..."
                className="pl-9"
              />
            </div>
          </div>
          <FilterSelect label="Target role" value={role} onChange={setRole} options={ROLE_OPTIONS} />
          <FilterSelect label="Experience" value={level} onChange={setLevel} options={LEVEL_OPTIONS} />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Resume style</label>
            <Select value={style} onValueChange={(v) => setStyle(v as TemplateId | "all")}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold">No matching samples</h3>
            <p className="text-sm text-muted-foreground">Try clearing filters or searching another keyword.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((sample) => {
              const meta = TEMPLATE_META[sample.template];
              const data = sample.build();
              const atsScore = computeAts(data).score;
              return (
                <Card key={sample.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="aspect-[4/3] border-b bg-gradient-to-br from-accent to-muted grid place-items-center overflow-hidden p-4">
                    <div className="origin-center scale-[0.32] w-[210mm] shadow-md bg-white rounded">
                      <CvPreview data={data} template={sample.template} />
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{sample.title}</h3>
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        {meta.name}
                      </Badge>
                      <Badge variant="outline" className="ml-auto">ATS {atsScore}/100</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex-1">{sample.description}</p>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {sample.tags.map((t) => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                    <Button className="mt-4 gap-2" onClick={() => onRemix(sample.id)}>
                      <Wand2 className="h-4 w-4" /> Remix This CV
                    </Button>
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

function FilterSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
