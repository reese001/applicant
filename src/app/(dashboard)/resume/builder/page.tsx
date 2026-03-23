"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumGate } from "@/components/shared/premium-gate";
import { Loader2, Sparkles, Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { ResumeContent } from "@/types";

export default function ResumeBuilderPage() {
  return (
    <PremiumGate featureName="AI Resume Builder" description="Build professional resumes with AI-powered content refinement.">
      <ResumeBuilderContent />
    </PremiumGate>
  );
}

function ResumeBuilderContent() {
  const [activeTab, setActiveTab] = useState("personal");
  const [generating, setGenerating] = useState(false);
  const [resume, setResume] = useState<ResumeContent>({
    personalInfo: { name: "", email: "", phone: "", location: "", linkedinUrl: "", portfolioUrl: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
  });

  function addExperience() {
    setResume((prev) => ({
      ...prev,
      experience: [...prev.experience, { company: "", title: "", startDate: "", endDate: "", bullets: [""] }],
    }));
  }

  function removeExperience(index: number) {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  function updateExperience(index: number, field: string, value: string | string[]) {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => i === index ? { ...exp, [field]: value } : exp),
    }));
  }

  function addEducation() {
    setResume((prev) => ({
      ...prev,
      education: [...prev.education, { school: "", degree: "", startDate: "", endDate: "" }],
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

  async function generateSummary() {
    const context = `Experience: ${resume.experience.map((e) => `${e.title} at ${e.company}`).join(", ")}. Skills: ${resume.skills.join(", ")}`;
    const result = await refineWithAI("summary", context);
    if (result) {
      setResume((prev) => ({ ...prev, summary: result }));
      toast.success("Summary generated!");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/resume"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground">Build your professional resume step by step</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="personal">Info</TabsTrigger>
              <TabsTrigger value="experience">Work</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={resume.personalInfo.name} onChange={(e) => setResume((p) => ({ ...p, personalInfo: { ...p.personalInfo, name: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={resume.personalInfo.email} onChange={(e) => setResume((p) => ({ ...p, personalInfo: { ...p.personalInfo, email: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={resume.personalInfo.phone} onChange={(e) => setResume((p) => ({ ...p, personalInfo: { ...p.personalInfo, phone: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={resume.personalInfo.location} onChange={(e) => setResume((p) => ({ ...p, personalInfo: { ...p.personalInfo, location: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input value={resume.personalInfo.linkedinUrl} onChange={(e) => setResume((p) => ({ ...p, personalInfo: { ...p.personalInfo, linkedinUrl: e.target.value } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Portfolio URL</Label>
                  <Input value={resume.personalInfo.portfolioUrl} onChange={(e) => setResume((p) => ({ ...p, personalInfo: { ...p.personalInfo, portfolioUrl: e.target.value } }))} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4 mt-4">
              {resume.experience.map((exp, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Experience {i + 1}</h4>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeExperience(i)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Company</Label>
                        <Input className="h-9" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input className="h-9" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start Date</Label>
                        <Input className="h-9" type="month" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End Date</Label>
                        <Input className="h-9" type="month" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)} placeholder="Present" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Bullet Points</Label>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" disabled={generating}
                          onClick={async () => {
                            const result = await refineWithAI("experience", exp.bullets.join("\n"));
                            if (result) {
                              updateExperience(i, "bullets", result.split("\n").filter(Boolean).map((b: string) => b.replace(/^[-•]\s*/, "")));
                              toast.success("Bullets refined!");
                            }
                          }}>
                          {generating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
                          Refine with AI
                        </Button>
                      </div>
                      <Textarea value={exp.bullets.join("\n")}
                        onChange={(e) => updateExperience(i, "bullets", e.target.value.split("\n"))}
                        placeholder="Enter bullet points (one per line)" rows={4} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addExperience} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </TabsContent>

            <TabsContent value="education" className="space-y-4 mt-4">
              {resume.education.map((edu, i) => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">School</Label>
                        <Input className="h-9" value={edu.school} onChange={(e) => setResume((p) => ({
                          ...p, education: p.education.map((ed, j) => j === i ? { ...ed, school: e.target.value } : ed)
                        }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Degree</Label>
                        <Input className="h-9" value={edu.degree} onChange={(e) => setResume((p) => ({
                          ...p, education: p.education.map((ed, j) => j === i ? { ...ed, degree: e.target.value } : ed)
                        }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start Date</Label>
                        <Input className="h-9" type="month" value={edu.startDate} onChange={(e) => setResume((p) => ({
                          ...p, education: p.education.map((ed, j) => j === i ? { ...ed, startDate: e.target.value } : ed)
                        }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End Date</Label>
                        <Input className="h-9" type="month" value={edu.endDate || ""} onChange={(e) => setResume((p) => ({
                          ...p, education: p.education.map((ed, j) => j === i ? { ...ed, endDate: e.target.value } : ed)
                        }))} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addEducation} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Education
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Textarea value={resume.skills.join(", ")}
                  onChange={(e) => setResume((p) => ({ ...p, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                  placeholder="JavaScript, TypeScript, React, Node.js..."
                  rows={4} />
              </div>
              <Button variant="outline" disabled={generating}
                onClick={async () => {
                  const context = resume.experience.map((e) => `${e.title}: ${e.bullets.join(", ")}`).join(". ");
                  const result = await refineWithAI("skills", `Current skills: ${resume.skills.join(", ")}. Context: ${context}`);
                  if (result) {
                    const newSkills = result.split(",").map((s: string) => s.trim()).filter(Boolean);
                    setResume((p) => ({ ...p, skills: [...new Set([...p.skills, ...newSkills])] }));
                    toast.success("Skills suggested!");
                  }
                }}>
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Suggest More Skills
              </Button>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Professional Summary</Label>
                  <Button variant="outline" size="sm" disabled={generating} onClick={generateSummary}>
                    {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate with AI
                  </Button>
                </div>
                <Textarea value={resume.summary || ""} onChange={(e) => setResume((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="A professional summary highlighting your key strengths..." rows={6} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <div className="space-y-4 text-sm">
                <div className="text-center border-b pb-4">
                  <h2 className="text-xl font-bold mb-0">{resume.personalInfo.name || "Your Name"}</h2>
                  <p className="text-muted-foreground text-xs mt-1">
                    {[resume.personalInfo.email, resume.personalInfo.phone, resume.personalInfo.location].filter(Boolean).join(" | ")}
                  </p>
                </div>

                {resume.summary && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1">Summary</h3>
                    <p className="mt-2 text-muted-foreground">{resume.summary}</p>
                  </div>
                )}

                {resume.experience.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1">Experience</h3>
                    {resume.experience.map((exp, i) => (
                      <div key={i} className="mt-2">
                        <div className="flex justify-between">
                          <strong>{exp.title}</strong>
                          <span className="text-xs text-muted-foreground">{exp.startDate} - {exp.endDate || "Present"}</span>
                        </div>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {exp.bullets.filter(Boolean).map((bullet, j) => (
                            <li key={j} className="text-muted-foreground">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {resume.education.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1">Education</h3>
                    {resume.education.map((edu, i) => (
                      <div key={i} className="mt-2 flex justify-between">
                        <div>
                          <strong>{edu.degree}</strong>
                          <p className="text-muted-foreground">{edu.school}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{edu.startDate} - {edu.endDate || "Present"}</span>
                      </div>
                    ))}
                  </div>
                )}

                {resume.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-1">Skills</h3>
                    <p className="mt-2 text-muted-foreground">{resume.skills.join(" • ")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
