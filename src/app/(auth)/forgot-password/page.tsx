"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Briefcase, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toast.success("If an account exists, a reset link has been sent");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-white/20">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="flex items-center gap-2.5 justify-center mb-10 animate-fade-in">
          <Briefcase className="h-7 w-7" />
          <span className="text-xl font-semibold tracking-tight">applicant</span>
        </div>

        <div className="liquid-glass-strong rounded-3xl p-8 animate-fade-in-up delay-100">
          <div className="space-y-1.5 mb-8">
            <h1 className="text-2xl font-medium tracking-tight">Reset your password</h1>
            <p className="text-sm text-white/40">
              {sent ? "Check your email for a reset link" : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium text-white/50">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="liquid-glass-strong rounded-xl w-full py-3 text-sm font-medium bg-white/[0.08] hover:bg-white/[0.12] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-white/50">
                We&apos;ve sent a password reset link to <strong className="text-white/80">{email}</strong>.
              </p>
              <button
                onClick={() => setSent(false)}
                className="liquid-glass rounded-xl px-5 py-2.5 text-sm text-white/70 hover:text-white transition-colors"
              >
                Try another email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-white/40 hover:text-white/70 transition-colors inline-flex items-center gap-1.5">
              <ArrowLeft className="h-3 w-3" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
