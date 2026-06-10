import { ResumeData, TemplateId } from "@/lib/resume-types";
import { templateSupportsAvatar } from "@/lib/recommend";
import { Github, Globe, Linkedin, Mail, MapPin, Phone } from "lucide-react";

interface Props {
  data: ResumeData;
  template: TemplateId;
}

export function CvPreview({ data, template }: Props) {
  // Defensive: strip avatar for templates that don't support it, so the data
  // can never accidentally render in Harvard / Minimal layouts.
  const safeData: ResumeData = templateSupportsAvatar(template)
    ? data
    : { ...data, personal: { ...data.personal, avatar: undefined } };

  return (
    <div className="a4-page font-serif" data-template={template}>
      {template === "harvard" && <HarvardTemplate data={safeData} />}
      {template === "modern" && <ModernTemplate data={safeData} />}
      {template === "minimal" && <MinimalTemplate data={safeData} />}
      {template === "creative" && <CreativeTemplate data={safeData} />}
    </div>
  );
}

const bullets = (text: string) =>
  text.split("\n").map((l) => l.trim()).filter(Boolean);

/* ---------- Harvard ---------- */
function HarvardTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  return (
    <div className="text-[10.5pt] text-neutral-900">
      <div className="text-center border-b border-neutral-900 pb-2">
        <h1 className="text-[20pt] font-bold tracking-wide uppercase">{p.fullName}</h1>
        <p className="text-[11pt] mt-0.5">{p.title}</p>
        <p className="text-[9pt] mt-1">
          {[p.email, p.phone, p.location, p.github, p.linkedin, p.portfolio]
            .filter(Boolean)
            .join("  •  ")}
        </p>
      </div>
      <Section title="Summary">{data.summary}</Section>
      <Section title="Education">
        {data.education.map((e) => (
          <div key={e.id} className="mb-2">
            <div className="flex justify-between">
              <b>{e.school}</b>
              <span>{e.startYear} – {e.endYear}</span>
            </div>
            <div className="italic">{e.major}</div>
            {e.description && <div>{e.description}</div>}
          </div>
        ))}
      </Section>
      <Section title="Projects">
        {data.projects.map((pr) => (
          <div key={pr.id} className="mb-2">
            <div className="flex justify-between">
              <b>{pr.name}</b>
              <span className="italic">{pr.role}</span>
            </div>
            <div className="text-[9.5pt] italic">{pr.techStack}</div>
            <ul className="list-disc pl-5">
              {bullets(pr.description).map((l, i) => <li key={i}>{l}</li>)}
            </ul>
            {(pr.github || pr.demo) && (
              <div className="text-[9pt]">{[pr.github, pr.demo].filter(Boolean).join(" • ")}</div>
            )}
          </div>
        ))}
      </Section>
      {data.experience.length > 0 && (
        <Section title="Experience">
          {data.experience.map((e) => (
            <div key={e.id} className="mb-2">
              <div className="flex justify-between"><b>{e.company}</b><span>{e.startDate} – {e.endDate}</span></div>
              <div className="italic">{e.position}</div>
              <ul className="list-disc pl-5">{bullets(e.description).map((l,i)=><li key={i}>{l}</li>)}</ul>
            </div>
          ))}
        </Section>
      )}
      <Section title="Skills">
        {data.skills.map((s) => (
          <div key={s.id}><b>{s.category}:</b> {s.items}</div>
        ))}
      </Section>
      {data.certificates.length > 0 && (
        <Section title="Certificates">
          {data.certificates.map((c) => (
            <div key={c.id}>• {c.name} — <i>{c.issuer}</i> ({c.date})</div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3">
      <h2 className="text-[11pt] font-bold uppercase tracking-wider border-b border-neutral-400 mb-1">{title}</h2>
      <div className="text-[10pt]">{children}</div>
    </section>
  );
}

/* ---------- Modern ---------- */
function ModernTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  return (
    <div className="text-[10.5pt] text-neutral-900 font-sans">
      <header className="flex items-start justify-between gap-6 pb-3 border-b-2 border-indigo-600">
        <div className="flex items-center gap-3">
          {p.avatar && (
            <img
              src={p.avatar}
              alt={p.fullName}
              className="h-16 w-16 rounded-full object-cover border-2 border-indigo-600"
            />
          )}
          <div>
            <h1 className="text-[22pt] font-bold leading-tight text-neutral-900">{p.fullName}</h1>
            <p className="text-[12pt] text-indigo-700 font-medium">{p.title}</p>
          </div>
        </div>
        <div className="text-[9pt] text-right space-y-0.5">
          {p.email && <div className="flex items-center gap-1 justify-end"><Mail className="h-3 w-3"/>{p.email}</div>}
          {p.phone && <div className="flex items-center gap-1 justify-end"><Phone className="h-3 w-3"/>{p.phone}</div>}
          {p.location && <div className="flex items-center gap-1 justify-end"><MapPin className="h-3 w-3"/>{p.location}</div>}
          {p.github && <div className="flex items-center gap-1 justify-end"><Github className="h-3 w-3"/>{p.github}</div>}
          {p.linkedin && <div className="flex items-center gap-1 justify-end"><Linkedin className="h-3 w-3"/>{p.linkedin}</div>}
          {p.portfolio && <div className="flex items-center gap-1 justify-end"><Globe className="h-3 w-3"/>{p.portfolio}</div>}
        </div>
      </header>

      <ModernSection title="Profile">{data.summary}</ModernSection>
      <ModernSection title="Skills">
        <div className="grid grid-cols-2 gap-x-4">
          {data.skills.map((s) => (
            <div key={s.id}><b className="text-indigo-700">{s.category}:</b> {s.items}</div>
          ))}
        </div>
      </ModernSection>
      <ModernSection title="Projects">
        {data.projects.map((pr) => (
          <div key={pr.id} className="mb-2">
            <div className="flex justify-between"><b>{pr.name}</b><span className="italic text-neutral-600">{pr.role}</span></div>
            <div className="text-[9.5pt] text-indigo-700">{pr.techStack}</div>
            <ul className="list-disc pl-5">{bullets(pr.description).map((l,i)=><li key={i}>{l}</li>)}</ul>
          </div>
        ))}
      </ModernSection>
      {data.experience.length > 0 && (
  <ModernSection title="Experience">
    {data.experience.map((e) => (
      <div key={e.id} className="mb-2">
        <div className="flex justify-between">
          <b>{e.company}</b>
          <span>
            {e.startDate} – {e.endDate}
          </span>
        </div>

        <div className="italic">
          {e.position}
        </div>

        <ul className="list-disc pl-5">
          {bullets(e.description).map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    ))}
  </ModernSection>
)}
      <ModernSection title="Education">
        {data.education.map((e) => (
          <div key={e.id}>
            <div className="flex justify-between"><b>{e.school}</b><span>{e.startYear}–{e.endYear}</span></div>
            <div className="italic">{e.major}</div>
            {e.description && <div className="text-[9.5pt]">{e.description}</div>}
          </div>
        ))}
      </ModernSection>
      {data.certificates.length > 0 && (
        <ModernSection title="Certificates">
          {data.certificates.map((c) => (<div key={c.id}>• {c.name} — {c.issuer} ({c.date})</div>))}
        </ModernSection>
      )}
    </div>
  );
}

function ModernSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3">
      <h2 className="text-[11pt] font-bold uppercase tracking-wider text-indigo-700 mb-1">{title}</h2>
      <div className="text-[10pt]">{children}</div>
    </section>
  );
}

/* ---------- Minimal ATS ---------- */
function MinimalTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  return (
    <div className="text-[10.5pt] text-neutral-900 font-sans">
      <h1 className="text-[18pt] font-bold">{p.fullName}</h1>
      <p>{p.title}</p>
      <p className="text-[9.5pt]">
        {[p.email, p.phone, p.location].filter(Boolean).join(" | ")}
      </p>
      <p className="text-[9.5pt]">
        {[p.github, p.linkedin, p.portfolio].filter(Boolean).join(" | ")}
      </p>
      <MinSection title="SUMMARY">{data.summary}</MinSection>
      <MinSection title="SKILLS">
        {data.skills.map((s) => <div key={s.id}><b>{s.category}:</b> {s.items}</div>)}
      </MinSection>
      <MinSection title="PROJECTS">
        {data.projects.map((pr) => (
          <div key={pr.id} className="mb-2">
            <b>{pr.name}</b> — {pr.role}
            <div>Tech: {pr.techStack}</div>
            <ul className="list-disc pl-5">{bullets(pr.description).map((l,i)=><li key={i}>{l}</li>)}</ul>
          </div>
        ))}
      </MinSection>
      {data.experience.length > 0 && (
  <MinSection title="EXPERIENCE">
    {data.experience.map((e) => (
      <div key={e.id} className="mb-2">
        <b>{e.company}</b> — {e.position}
        <div>{e.startDate} – {e.endDate}</div>

        <ul className="list-disc pl-5">
          {bullets(e.description).map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    ))}
  </MinSection>
)}
      <MinSection title="EDUCATION">
        {data.education.map((e) => (
          <div key={e.id}><b>{e.school}</b>, {e.major} ({e.startYear}–{e.endYear})</div>
        ))}
      </MinSection>
      {data.certificates.length > 0 && (
        <MinSection title="CERTIFICATES">
          {data.certificates.map((c) => <div key={c.id}>• {c.name} — {c.issuer} ({c.date})</div>)}
        </MinSection>
      )}
    </div>
  );
}
function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3">
      <h2 className="text-[10.5pt] font-bold border-b border-neutral-300">{title}</h2>
      <div className="mt-1">{children}</div>
    </section>
  );
}

/* ---------- Creative ---------- */
function CreativeTemplate({ data }: { data: ResumeData }) {
  const p = data.personal;
  return (
    <div className="text-[10.5pt] text-neutral-900 font-sans grid grid-cols-3 gap-4">
      <aside className="col-span-1 bg-neutral-900 text-white -m-[14mm] mr-0 p-5 space-y-3">
        {p.avatar ? (
          <img
            src={p.avatar}
            alt={p.fullName}
            className="h-24 w-24 rounded-full object-cover border-4 border-fuchsia-500"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-fuchsia-500 grid place-items-center text-3xl font-bold">
            {p.fullName.split(" ").slice(-1)[0]?.[0]}
          </div>
        )}
        <h1 className="text-[16pt] font-bold leading-tight">{p.fullName}</h1>
        <p className="text-fuchsia-300">{p.title}</p>
        <div className="space-y-1 text-[9pt]">
          {p.email && <div>{p.email}</div>}
          {p.phone && <div>{p.phone}</div>}
          {p.location && <div>{p.location}</div>}
          {p.github && <div>{p.github}</div>}
          {p.linkedin && <div>{p.linkedin}</div>}
        </div>
        <div>
          <h3 className="uppercase text-fuchsia-300 text-[10pt] mt-3 mb-1">Skills</h3>
          {data.skills.map((s) => (
            <div key={s.id} className="text-[9pt] mb-1"><b>{s.category}</b><br/>{s.items}</div>
          ))}
        </div>
      </aside>
      <main className="col-span-2 pl-2">
        <h2 className="text-[12pt] font-bold text-fuchsia-700">About</h2>
        <p className="mb-2">{data.summary}</p>
        <h2 className="text-[12pt] font-bold text-fuchsia-700">Projects</h2>
        {data.projects.map((pr) => (
          <div key={pr.id} className="mb-2">
            <b>{pr.name}</b> <span className="italic text-neutral-600">— {pr.role}</span>
            <div className="text-[9.5pt] text-fuchsia-700">{pr.techStack}</div>
            <ul className="list-disc pl-5">{bullets(pr.description).map((l,i)=><li key={i}>{l}</li>)}</ul>
          </div>
        ))}
        {data.experience.length > 0 && (
  <>
    <h2 className="text-[12pt] font-bold text-fuchsia-700">
      Experience
    </h2>

    {data.experience.map((e) => (
      <div key={e.id} className="mb-2">
        <b>{e.company}</b>

        <div className="italic">
          {e.position}
        </div>

        <div>
          {e.startDate} – {e.endDate}
        </div>

        <ul className="list-disc pl-5">
          {bullets(e.description).map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </div>
    ))}
  </>
)}
        <h2 className="text-[12pt] font-bold text-fuchsia-700">Education</h2>
        {data.education.map((e) => (
          <div key={e.id}><b>{e.school}</b> — {e.major} ({e.startYear}–{e.endYear})</div>
        ))}
        {data.certificates.length > 0 && <>
          <h2 className="text-[12pt] font-bold text-fuchsia-700 mt-2">Certificates</h2>
          {data.certificates.map((c) => <div key={c.id}>• {c.name} — {c.issuer}</div>)}
        </>}
      </main>
    </div>
  );
}
