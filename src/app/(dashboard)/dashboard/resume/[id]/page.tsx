"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PremiumGate } from "@/components/shared/premium-gate";
import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import { Loader2, Sparkles, Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { ResumeContent } from "@/types";

const inputClass = "w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-colors";
const smallInputClass = "w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-colors";
const labelClass = "text-xs font-medium text-white/50";

const tabs = ["personal", "experience", "education", "skills", "summary"] as const;
const tabLabels: Record<string, string> = { personal: "Info", experience: "Work", education: "Education", skills: "Skills", summary: "Summary" };

export default function ResumeEditPage() {
  return (
    <PremiumGate featureName="Resume Editor">
      <ResumeEditorContent />
    </PremiumGate>
  );
}

function ResumeEditorContent() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState<ResumeContent>({
    personalInfo: { name: "", email: "", phone: "", location: "", linkedinUrl: "", portfolioUrl: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
  });

  useEffect(() => {
    async function fetchResume() {
      try {
        const res = await fetch(`/api/resumes/${params.id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTitle(data.title);
        if (data.contentJson) {
          setResume(data.contentJson as ResumeContent);
        }
      } catch {
        toast.error("Failed to load resume");
        router.push("/dashboard/resume");
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
  }, [params.id, router]);

  function updateExperience(index: number, field: string, value: string | string[]) {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp),
    }));
  }

  async function refineWithAI(section: string, rawInput: string) {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/resume-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, rawInput }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data.result;
    } catch {
      toast.error("AI refinement failed");
      return null;
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/resumes/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contentJson: resume }),
      });
      if (!res.ok) throw new Error();
      toast.success("Resume saved!");
    } catch {
      toast.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DetailSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/resume" className="h-10 w-10 flex items-center justify-center rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Edit Resume</h1>
        </div>
        <div className="flex items-center gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resume title" className={`${smallInputClass} w-48`} />
          <button onClick={handleSave} disabled={saving}
            className="liquid-glass-strong rounded-xl px-4 py-2 text-sm font-medium text-white/80 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 inline-flex items-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl border border-white/[0.08] bg-white/[0.02] mb-4">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${activeTab === tab ? "bg-white/[0.08] text-white/80" : "text-white/40 hover:text-white/60"}`}>
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* Personal Info */}
          {activeTab === "personal" && (
            <div className="grid grid-cols-2 gap-4">
              {([["name", "Full Name"], ["email", "Email"], ["phone", "Phone"], ["location", "Location"], ["linkedinUrl", "LinkedIn URL"], ["portfolioUrl", "Portfolio URL"]] as const).map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <label className={labelClass}>{label}</label>
                  <input value={resume.personalInfo[field]} onChange={(e) => setResume((p) => ({ ...p, personalInfo: { ...p.personalInfo, [field]: e.target.value } }))} className={inputClass} />
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {activeTab === "experience" && (
            <div className="space-y-4">
              {resume.experience.map((exp, i) => (
                <div key={i} className="liquid-glass rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-white/70">Experience {i + 1}</h4>
                    <button onClick={() => setResume((p) => ({ ...p, experience: p.experience.filter((_, j) => j !== i) }))} className="h-8 w-8 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className={labelClass}>Company</label><input className={smallInputClass} value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} /></div>
                    <div className="space-y-1"><label className={labelClass}>Title</label><input className={smallInputClass} value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} /></div>
                    <div className="space-y-1"><label className={labelClass}>Start Date</label><input className={smallInputClass} type="month" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} /></div>
                    <div className="space-y-1"><label className={labelClass}>End Date</label><input className={smallInputClass} type="month" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)} placeholder="Present" /></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Bullet Points</label>
                      <button disabled={generating} onClick={async () => {
                        const result = await refineWithAI("experience", exp.bullets.join("\n"));
                        if (result) { updateExperience(i, "bullets", result.split("\n").filter(Boolean).map((b: string) => b.replace(/^[-•]\s*/, ""))); toast.success("Bullets refined!"); }
                      }} className="text-xs text-white/40 hover:text-white/60 transition-colors inline-flex items-center gap-1 disabled:opacity-50">
                        {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Refine with AI
                      </button>
                    </div>
                    <textarea value={exp.bullets.join("\n")} onChange={(e) => updateExperience(i, "bullets", e.target.value.split("\n"))}
                      placeholder="Enter bullet points (one per line)" rows={4} className={`${inputClass} resize-none`} />
                  </div>
                </div>
              ))}
              <button onClick={() => setResume((p) => ({ ...p, experience: [...p.experience, { company: "", title: "", startDate: "", endDate: "", bullets: [""] }] }))} className="liquid-glass rounded-xl w-full py-2.5 text-sm font-medium text-white/50 hover:text-white/70 transition-colors inline-flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Experience
              </button>
            </div>
          )}

          {/* Education */}
          {activeTab === "education" && (
            <div className="space-y-4">
              {resume.education.map((edu, i) => (
                <div key={i} className="liquid-glass rounded-2xl p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className={labelClass}>School</label><input className={smallInputClass} value={edu.school} onChange={(e) => setResume((p) => ({ ...p, education: p.education.map((ed, j) => j === i ? { ...ed, school: e.target.value } : ed) }))} /></div>
                    <div className="space-y-1"><label className={labelClass}>Degree</label><input className={smallInputClass} value={edu.degree} onChange={(e) => setResume((p) => ({ ...p, education: p.education.map((ed, j) => j === i ? { ...ed, degree: e.target.value } : ed) }))} /></div>
                    <div className="space-y-1"><label className={labelClass}>Start Date</label><input className={smallInputClass} type="month" value={edu.startDate} onChange={(e) => setResume((p) => ({ ...p, education: p.education.map((ed, j) => j === i ? { ...ed, startDate: e.target.value } : ed) }))} /></div>
                    <div className="space-y-1"><label className={labelClass}>End Date</label><input className={smallInputClass} type="month" value={edu.endDate || ""} onChange={(e) => setResume((p) => ({ ...p, education: p.education.map((ed, j) => j === i ? { ...ed, endDate: e.target.value } : ed) }))} /></div>
                  </div>
                </div>
              ))}
              <button onClick={() => setResume((p) => ({ ...p, education: [...p.education, { school: "", degree: "", startDate: "", endDate: "" }] }))} className="liquid-glass rounded-xl w-full py-2.5 text-sm font-medium text-white/50 hover:text-white/70 transition-colors inline-flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Education
              </button>
            </div>
          )}

          {/* Skills */}
          {activeTab === "skills" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className={labelClass}>Skills (comma separated)</label>
                <textarea value={resume.skills.join(", ")} onChange={(e) => setResume((p) => ({ ...p, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                  placeholder="JavaScript, TypeScript, React, Node.js..." rows={4} className={`${inputClass} resize-none`} />
              </div>
            </div>
          )}

          {/* Summary */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Professional Summary</label>
                  <button disabled={generating} onClick={async () => {
                    const context = `Experience: ${resume.experience.map((e) => `${e.title} at ${e.company}`).join(", ")}. Skills: ${resume.skills.join(", ")}`;
                    const result = await refineWithAI("summary", context);
                    if (result) { setResume((p) => ({ ...p, summary: result })); toast.success("Summary generated!"); }
                  }} className="text-xs text-white/40 hover:text-white/60 transition-colors inline-flex items-center gap-1 disabled:opacity-50">
                    {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Generate with AI
                  </button>
                </div>
                <textarea value={resume.summary || ""} onChange={(e) => setResume((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="A professional summary highlighting your key strengths..." rows={6} className={`${inputClass} resize-none`} />
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div>
          <div className="liquid-glass-strong rounded-2xl p-6 sticky top-20">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Preview</h3>
            <div className="space-y-4 text-sm">
              <div className="text-center border-b border-white/[0.06] pb-4">
                <h2 className="text-xl font-bold text-white/90">{resume.personalInfo.name || "Your Name"}</h2>
                <p className="text-white/40 text-xs mt-1">
                  {[resume.personalInfo.email, resume.personalInfo.phone, resume.personalInfo.location].filter(Boolean).join(" | ")}
                </p>
              </div>
              {resume.summary && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 border-b border-white/[0.06] pb-1">Summary</h3>
                  <p className="mt-2 text-white/45">{resume.summary}</p>
                </div>
              )}
              {resume.experience.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 border-b border-white/[0.06] pb-1">Experience</h3>
                  {resume.experience.map((exp, i) => (
                    <div key={i} className="mt-2">
                      <div className="flex justify-between"><strong className="text-white/80">{exp.title}</strong><span className="text-xs text-white/35">{exp.startDate} - {exp.endDate || "Present"}</span></div>
                      <p className="text-white/45">{exp.company}</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">{exp.bullets.filter(Boolean).map((bullet, j) => (<li key={j} className="text-white/40">{bullet}</li>))}</ul>
                    </div>
                  ))}
                </div>
              )}
              {resume.education.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 border-b border-white/[0.06] pb-1">Education</h3>
                  {resume.education.map((edu, i) => (
                    <div key={i} className="mt-2 flex justify-between"><div><strong className="text-white/80">{edu.degree}</strong><p className="text-white/45">{edu.school}</p></div><span className="text-xs text-white/35">{edu.startDate} - {edu.endDate || "Present"}</span></div>
                  ))}
                </div>
              )}
              {resume.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/60 border-b border-white/[0.06] pb-1">Skills</h3>
                  <p className="mt-2 text-white/45">{resume.skills.join(" • ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
