"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumGate } from "@/components/shared/premium-gate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { InterviewQuestion } from "@/types";

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

  const typeBadgeColor = {
    behavioral: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    technical: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    situational: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview Prep</h1>
        <p className="text-muted-foreground">Generate practice questions tailored to a specific role</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Job Title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Senior Frontend Engineer" />
          </div>
          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..." rows={6} />
          </div>
          <Button onClick={generateQuestions} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Interview Questions
          </Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Practice Questions ({questions.length})</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {questions.map((q, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-muted-foreground text-sm font-mono w-6">{i + 1}</span>
                    <Badge variant="outline" className={typeBadgeColor[q.type] || ""}>
                      {q.type}
                    </Badge>
                    <span className="text-sm font-medium">{q.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pl-9">
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Coaching Tip</p>
                    <p className="text-sm">{q.tip}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Sample Framework</p>
                    <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">{q.sampleFramework}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
