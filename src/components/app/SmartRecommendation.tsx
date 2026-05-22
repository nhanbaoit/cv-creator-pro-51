import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, Wand2, CheckCircle2 } from "lucide-react";
import {
  EXPERIENCE_OPTIONS,
  ExperienceLevel,
  recommendTemplate,
  RecommendResult,
  ResumeStyle,
  ROLE_OPTIONS,
  STYLE_OPTIONS,
  TargetRole,
  TEMPLATE_META,
} from "@/lib/recommend";
import { useResumeStore, useActiveResume } from "@/lib/resume-store";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface FormProps {
  onResult?: (r: RecommendResult) => void;
  compact?: boolean;
}

function RecommendForm({ onResult, compact }: FormProps) {
  const [role, setRole] = useState<TargetRole>("frontend");
  const [exp, setExp] = useState<ExperienceLevel>("projects");
  const [style, setStyle] = useState<ResumeStyle>("professional");
  const [result, setResult] = useState<RecommendResult | null>(null);
  const resume = useActiveResume();
  const { setTemplate, createResume } = useResumeStore();
  const navigate = useNavigate();

  const submit = () => {
    const r = recommendTemplate({ role, experience: exp, style });
    setResult(r);
    onResult?.(r);
  };

  const apply = () => {
    if (!result) return;
    let id = resume?.id;
    if (!id) id = createResume("New CV");
    setTemplate(id, result.template);
    toast.success(`Applied ${TEMPLATE_META[result.template].name}`);
    navigate({ to: "/editor" });
  };

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
        <div className="space-y-1.5">
          <Label>Target Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as TargetRole)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Experience Level</Label>
          <Select value={exp} onValueChange={(v) => setExp(v as ExperienceLevel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EXPERIENCE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Resume Style</Label>
          <Select value={style} onValueChange={(v) => setStyle(v as ResumeStyle)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STYLE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={submit} className="gap-2">
        <Wand2 className="h-4 w-4" /> Recommend Template
      </Button>

      {result && (
        <Card className="p-5 border-primary/40 bg-primary/5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2 flex-wrap">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-lg">
                  {TEMPLATE_META[result.template].name}
                </h4>
                <Badge variant="default" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {result.match}% match
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{result.reason}</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {TEMPLATE_META[result.template].tags.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            </div>
            <Button onClick={apply}>Use This Template</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export function SmartRecommendationPanel() {
  return (
    <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/30">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Find the Best Resume Template for You</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Answer 3 quick questions and we'll suggest the most suitable template.
      </p>
      <RecommendForm />
    </Card>
  );
}

interface DialogProps {
  trigger?: React.ReactNode;
}

export function SmartRecommendationDialog({ trigger }: DialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" /> Smart Template Recommendation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Find the Best Resume Template for You
          </DialogTitle>
          <DialogDescription>
            Pick your target role, experience, and style — we'll recommend a template.
          </DialogDescription>
        </DialogHeader>
        <RecommendForm compact onResult={() => { /* keep open to show result */ }} />
      </DialogContent>
    </Dialog>
  );
}
