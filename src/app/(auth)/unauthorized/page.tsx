"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="liquid-glass-strong rounded-3xl p-10 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl bg-red-500/10 p-5">
              <ShieldX className="h-10 w-10 text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-medium tracking-tight mb-2">Access Denied</h1>
          <p className="text-sm text-white/40 leading-relaxed mb-8">
            You need to be signed in to access this page. Please log in or create an account.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/"
              className="liquid-glass rounded-full px-5 py-2.5 text-sm text-white/70 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <Link
              href="/login"
              className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
