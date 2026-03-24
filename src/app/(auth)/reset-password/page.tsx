"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Briefcase, Loader2, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="relative z-10 w-full max-w-[420px]">
          <div className="liquid-glass-strong rounded-3xl p-8 text-center">
            <p className="text-white/50 mb-4">Invalid reset link. Please request a new one.</p>
            <Link
              href="/forgot-password"
              className="liquid-glass rounded-xl inline-block px-5 py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
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
            <h1 className="text-2xl font-medium tracking-tight">Set new password</h1>
            <p className="text-sm text-white/40">Enter your new password below</p>
          </div>

          {success ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
              <p className="text-sm text-white/50">
                Password reset successfully. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-medium text-white/50">New Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-xs font-medium text-white/50">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm your password"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="liquid-glass-strong rounded-xl w-full py-3 text-sm font-medium bg-white/[0.08] hover:bg-white/[0.12] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
