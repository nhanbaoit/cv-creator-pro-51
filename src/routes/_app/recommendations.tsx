import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2 } from "lucide-react";
import { CV_SAMPLES } from "@/lib/cv-samples";
import { TEMPLATE_META } from "@/lib/recommend";
import { useResumeStore } from "@/lib/resume-store";
import { toast } from "sonner";
import { CvPreview } from "@/components/app/CvPreview";

export const Route = createFileRoute("/_app/recommendations")({
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const remixSample = useResumeStore((s) => s.remixSample);
  const navigate = useNavigate();

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
      <main className="p-6 md:p-8 max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CV_SAMPLES.map((sample) => {
            const meta = TEMPLATE_META[sample.template];
            return (
              <Card key={sample.id} className="overflow-hidden flex flex-col">
                <div className="aspect-[4/3] border-b bg-gradient-to-br from-accent to-muted grid place-items-center overflow-hidden p-4">
                  <div className="origin-center scale-[0.32] w-[210mm] shadow-md bg-white rounded">
                    <CvPreview data={sample.build()} template={sample.template} />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{sample.title}</h3>
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {meta.name}
                    </Badge>
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
      </main>
    </>
  );
}
