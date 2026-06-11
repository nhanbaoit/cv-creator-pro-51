import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/app/Topbar";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useActiveResume } from "@/lib/resume-store";
import { computeAts, matchJobKeywords } from "@/lib/ats";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState } from "react";
import { Check, X, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/_app/ats")({
  component: AtsPage,
});

function AtsPage() {
  const resume = useActiveResume();
  const [jd, setJd] = useState("");

  if (!resume) {
    return (
      <>
        <Topbar title="ATS Checker" />
        <div className="p-8 text-muted-foreground">No resume yet.</div>
      </>
    );
  }

  const ats = useMemo(() => computeAts(resume.data), [resume]);
  const match = useMemo(() => matchJobKeywords(resume.data, jd), [resume, jd]);

  const suggestions = ats.breakdown.filter((b) => !b.ok).map((b) => `Improve: ${b.label}`);

  return (
    <>
      <Topbar title="ATS Checker" subtitle="Check how well your CV passes ATS systems" />
      <main className="p-6 md:p-8 max-w-6xl w-full mx-auto grid lg:grid-cols-3 gap-5">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">ATS Score</div>
          <div className="text-4xl font-bold text-primary mt-1">
            {ats.score}
            <span className="text-base text-muted-foreground">/100</span>
          </div>
          <Progress value={ats.score} className="mt-3" />
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Resume Quality</div>
          <div className="text-4xl font-bold mt-1">
            {ats.quality}
            <span className="text-base text-muted-foreground">/100</span>
          </div>
          <Progress value={ats.quality} className="mt-3" />
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Job Match</div>
          <div className="text-4xl font-bold mt-1">
            {match.pct}
            <span className="text-base text-muted-foreground">%</span>
          </div>
          <Progress value={match.pct} className="mt-3" />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">ATS criteria breakdown</h3>
          <div className="space-y-2">
            {ats.breakdown.map((b) => (
              <div
                key={b.label}
                className="flex items-center justify-between text-sm border-b last:border-0 pb-2"
              >
                <div className="flex items-center gap-2">
                  {b.ok ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <span>{b.label}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {b.points}/{b.max}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" /> Suggestions
          </h3>
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your CV is ATS-ready! 🎉</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {suggestions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5 lg:col-span-3 space-y-3">
          <h3 className="font-semibold">Match against Job Description</h3>
          <Textarea
            rows={5}
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
          {jd && (
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <div>
                <div className="text-sm font-medium mb-2 text-emerald-700">
                  Matched keywords ({match.matched.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {match.matched.slice(0, 60).map((k) => (
                    <span
                      key={k}
                      className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"
                    >
                      {k}
                    </span>
                  ))}
                  {match.matched.length === 0 && (
                    <span className="text-xs text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2 text-destructive">
                  Missing keywords ({match.missing.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {match.missing.slice(0, 60).map((k) => (
                    <span
                      key={k}
                      className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
