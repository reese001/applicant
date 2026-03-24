import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="liquid-glass-strong rounded-3xl p-10">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl bg-white/[0.06] p-5">
              <Briefcase className="h-10 w-10 text-white/50" />
            </div>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight mb-2">404</h1>
          <p className="text-sm text-white/40 leading-relaxed mb-8">
            Page not found. The page you&apos;re looking for doesn&apos;t exist or has been moved.
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
              href="/dashboard"
              className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium hover:scale-105 active:scale-95 transition-transform"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
