"use client";

import { useState } from "react";
import { PremiumGate } from "@/components/shared/premium-gate";
import { Loader2, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { InterviewQuestion } from "@/types";

const inputClass = "w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/15 transition-colors";

export default function InterviewPrepPage() {
  return (
    <PremiumGate featureName="AI Interview Prep" description="Practice with AI-generated interview questions tailored to specific roles.">
      <InterviewPrepContent />
    </PremiumGate>
  );
}

function InterviewPrepContent() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  async function generateQuestions() {
    if (!jobTitle || !jobDescription) {
      toast.error("Please fill in both fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, jobDescription }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuestions(data.questions || []);
      toast.success(`Generated ${data.questions?.length || 0} questions!`);
    } catch {
      toast.error("Failed to generate questions");
    } finally {
      setLoading(false);
    }
  }

  const typeBadgeColor: Record<string, string> = {
    behavioral: "bg-blue-500/10 text-blue-400",
    technical: "bg-purple-500/10 text-purple-400",
    situational: "bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white/90">Interview Prep</h1>
        <p className="text-white/40">Generate practice questions tailored to a specific role</p>
      </div>

      <div className="liquid-glass-strong rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50">Job Title</label>
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Senior Frontend Engineer" className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/50">Job Description</label>
          <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..." rows={6} className={`${inputClass} resize-none`} />
        </div>
        <button
          onClick={generateQuestions}
          disabled={loading}
          className="liquid-glass-strong rounded-xl w-full py-3 text-sm font-medium text-white/80 hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate Interview Questions
        </button>
      </div>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white/80">Practice Questions ({questions.length})</h2>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="liquid-glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center gap-3 text-left px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-white/25 text-sm font-mono w-6 shrink-0">{i + 1}</span>
                  <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${typeBadgeColor[q.type] || "bg-white/[0.06] text-white/40"}`}>
                    {q.type}
                  </span>
                  <span className="text-sm font-medium text-white/70 flex-1">{q.question}</span>
                  <ChevronDown className={`h-4 w-4 text-white/30 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5 pl-14 space-y-3 animate-fade-in">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-1">Coaching Tip</p>
                      <p className="text-sm text-white/55">{q.tip}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/30 mb-1">Sample Framework</p>
                      <p className="text-sm whitespace-pre-wrap bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl text-white/50">{q.sampleFramework}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
