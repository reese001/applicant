"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { CardSkeleton } from "@/components/shared/loading-skeleton";
import { PremiumGate } from "@/components/shared/premium-gate";
import { Plus, FileText, MoreVertical, Copy, Trash2, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Resume {
  id: string;
  title: string;
  templateId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { applications: number };
}

export default function ResumesPage() {
  return (
    <PremiumGate featureName="Resume Manager" description="Create, manage, and tailor multiple resumes with AI assistance.">
      <ResumeContent />
    </PremiumGate>
  );
}

function ResumeContent() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await fetch("/api/resumes");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResumes(data);
      } catch {
        toast.error("Failed to load resumes");
      } finally {
        setLoading(false);
      }
    }
    fetchResumes();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    }
  }

  async function handleDuplicate(resume: Resume) {
    try {
      const original = await fetch(`/api/resumes/${resume.id}`);
      if (!original.ok) throw new Error();
      const data = await original.json();

      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${data.title} (Copy)`,
          contentJson: data.contentJson,
          templateId: data.templateId,
        }),
      });
      if (!res.ok) throw new Error();
      const newResume = await res.json();
      setResumes((prev) => [newResume, ...prev]);
      toast.success("Resume duplicated");
    } catch {
      toast.error("Failed to duplicate resume");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Resumes</h1>
          <p className="text-white/40">Manage and create tailored resumes</p>
        </div>
        <Link
          href="/dashboard/resume/builder"
          className="liquid-glass-strong rounded-xl px-4 py-2 text-sm font-medium text-white/80 hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Resume
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Create your first AI-powered resume to start applying with confidence."
          actionLabel="Create Resume"
          onAction={() => router.push("/dashboard/resume/builder")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <div key={resume.id} className="liquid-glass rounded-2xl p-5 hover:bg-white/[0.03] transition-colors relative">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-1 flex-1">
                  <Link href={`/dashboard/resume/${resume.id}`} className="text-sm font-semibold text-white/80 hover:text-white transition-colors">
                    {resume.title}
                  </Link>
                  <p className="flex items-center gap-1 text-xs text-white/30">
                    <Calendar className="h-3 w-3" />
                    Updated {formatDate(resume.updatedAt)}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === resume.id ? null : resume.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openMenu === resume.id && (
                    <div className="absolute right-0 top-9 z-10 w-40 rounded-xl bg-[#0c0c12]/95 backdrop-blur-xl border border-white/[0.08] py-1 shadow-xl">
                      <button
                        onClick={() => { handleDuplicate(resume); setOpenMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                      >
                        <Copy className="h-4 w-4" /> Duplicate
                      </button>
                      <button
                        onClick={() => { handleDelete(resume.id); setOpenMenu(null); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <FileText className="h-3 w-3" />
                <span>{resume._count?.applications || 0} linked applications</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
