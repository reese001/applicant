"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase, ArrowRight, FileText, BarChart3, MessageSquare,
  Sparkles, Target, Check, ChevronDown, Zap, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Data ─── */

const features = [
  { icon: Briefcase, title: "Application Tracker", desc: "Kanban board with drag-and-drop. Track status from saved to offer across your entire pipeline." },
  { icon: FileText, title: "AI Resume Builder", desc: "Build and tailor resumes with AI-powered content. Optimized for ATS scoring." },
  { icon: MessageSquare, title: "Interview Prep", desc: "AI-generated practice questions specific to the role, with coaching frameworks." },
  { icon: BarChart3, title: "Analytics", desc: "Pipeline funnels, response rates, and trends to optimize your job search strategy." },
  { icon: Target, title: "ATS Checker", desc: "Score your resume against job descriptions. Beat applicant tracking systems every time." },
  { icon: Sparkles, title: "Cover Letters", desc: "Generate tailored cover letters in seconds. Personalized to each company and role." },
];

const freeFeatures = [
  "Unlimited job tracking", "Kanban + List views", "10 URL scrapes/month",
  "3 active reminders", "2 resume templates", "CSV export",
];

const proFeatures = [
  "Everything in Free", "Unlimited URL scrapes", "Unlimited reminders",
  "20+ resume templates", "AI Resume Builder & Tailor", "Cover Letter Generator",
  "Interview Prep", "ATS Checker", "Full Analytics", "Priority support",
];

const faqs = [
  { q: "What happens after the 14-day trial?", a: "Your trial converts to a paid subscription. Cancel anytime before it ends and you won't be charged." },
  { q: "Can I export my data?", a: "Yes. Free users can export as CSV. Pro users can also export as JSON. You always own your data." },
  { q: "How does the URL scraping work?", a: "Paste any job posting URL and our scraper extracts job title, company, location, salary, and description. Works with most major job boards. AI fallback for tricky pages." },
  { q: "Is my data secure?", a: "We use industry-standard encryption with data stored securely in PostgreSQL. We never share your information." },
  { q: "Can I cancel anytime?", a: "Yes, cancel your subscription at any time. You keep Pro access until the end of your current billing period." },
];

/* ─── FAQ Accordion ─── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="liquid-glass rounded-2xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
      >
        <span className="text-sm font-medium text-white/90">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-white/40 transition-transform duration-300 shrink-0",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm text-white/50 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function LandingPage() {
  return (
    <main className="bg-[#08080c] text-white selection:bg-white/20">
      {/* ━━━ HERO ━━━ */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Fallback gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0d1025] to-[#080815]" />
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/nyc-hero.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 flex min-h-screen">
          {/* ── Left Panel ── */}
          <div className="w-full lg:w-[52%] relative p-3 sm:p-4 lg:p-6">
            <div className="absolute inset-3 sm:inset-4 lg:inset-6 rounded-3xl liquid-glass-strong" />
            <div className="relative z-10 flex flex-col h-full min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] p-6 sm:p-8 lg:p-12">
              {/* Nav */}
              <nav className="flex items-center justify-between animate-fade-in">
                <Link href="/" className="flex items-center gap-2.5">
                  <Briefcase className="h-6 w-6" />
                  <span className="text-lg font-semibold tracking-tight">
                    applicant
                  </span>
                </Link>
                <Link
                  href="#features"
                  className="liquid-glass rounded-full px-5 py-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  Explore
                </Link>
              </nav>

              {/* Hero content */}
              <div className="flex-1 flex flex-col justify-center max-w-xl py-12">
                <p className="animate-fade-in-up text-[11px] tracking-[0.3em] uppercase text-white/40 mb-6 font-medium">
                  AI-Powered Career Toolkit
                </p>
                <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-5xl lg:text-[4.25rem] font-medium tracking-[-0.03em] leading-[1.08]">
                  Track every
                  <br />
                  application, land
                  <br />
                  your{" "}
                  <em className="font-serif italic text-white/80 font-normal">
                    dream
                  </em>{" "}
                  job
                </h1>
                <p className="animate-fade-in-up delay-200 text-white/50 mt-6 text-base sm:text-lg leading-relaxed max-w-md">
                  One place to track applications, build AI-powered resumes,
                  generate cover letters, and prep for interviews.
                </p>
                <div className="animate-fade-in-up delay-300 flex items-center gap-4 mt-8">
                  <Link
                    href="/register"
                    className="liquid-glass-strong rounded-full px-7 py-3 text-sm font-medium flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform"
                  >
                    Get Started Free
                    <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                  <Link
                    href="/login"
                    className="text-sm text-white/50 hover:text-white/80 transition-colors"
                  >
                    Sign In &rarr;
                  </Link>
                </div>
                <div className="animate-fade-in-up delay-400 flex flex-wrap gap-2.5 mt-8">
                  {["Job Tracking", "AI Resumes", "Interview Prep"].map(
                    (pill) => (
                      <span
                        key={pill}
                        className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/70"
                      >
                        {pill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Bottom */}
              <div className="animate-fade-in delay-500">
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-2">
                  Trusted Platform
                </p>
                <p className="text-sm text-white/40">
                  No credit card required &middot; Free forever plan available
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="hidden lg:flex flex-col w-[48%] p-6">
            {/* Top actions */}
            <div className="flex items-center justify-end gap-3 animate-fade-in">
              <Link
                href="/login"
                className="liquid-glass rounded-full px-5 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="liquid-glass-strong rounded-full px-5 py-2 text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Get Started
              </Link>
            </div>

            {/* Feature cards */}
            <div className="flex-1 flex flex-col justify-center gap-4 max-w-md ml-auto px-4">
              {/* Pipeline card */}
              <div className="animate-slide-up delay-200 liquid-glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white/80" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">
                      Application Pipeline
                    </p>
                    <p className="text-xs text-white/40">
                      Drag-and-drop Kanban board
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {["Saved", "Applied", "Interview", "Offer"].map((s) => (
                    <span
                      key={s}
                      className="liquid-glass rounded-lg px-3 py-1.5 text-[10px] text-white/60 font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Two cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-slide-up delay-300 liquid-glass rounded-2xl p-5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <FileText className="h-4 w-4 text-white/80" />
                  </div>
                  <p className="text-sm font-medium text-white/90">
                    AI Resumes
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Build & tailor professional resumes
                  </p>
                </div>
                <div className="animate-slide-up delay-400 liquid-glass rounded-2xl p-5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <BarChart3 className="h-4 w-4 text-white/80" />
                  </div>
                  <p className="text-sm font-medium text-white/90">
                    Analytics
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Track progress with insights
                  </p>
                </div>
              </div>

              {/* Bottom card */}
              <div className="animate-slide-up delay-500 liquid-glass rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90">
                      Interview Preparation
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      AI-generated practice questions for any role
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/50 shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex items-center justify-end gap-6 text-white/30 text-xs animate-fade-in delay-600">
              <span>Free forever plan</span>
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      <section id="features" className="relative py-24 lg:py-32 border-t border-white/[0.06]">
        <div className="absolute inset-0 dot-grid opacity-[0.3]" />
        <div className="container relative">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.3em] uppercase text-white/40 mb-4 font-medium">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
              Everything you need to
              <br className="hidden sm:block" />
              <em className="font-serif italic text-white/70 font-normal">
                manage your job search
              </em>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={cn(
                  "liquid-glass rounded-2xl p-7 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]",
                  i === 0 && "sm:col-span-2 lg:col-span-1"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.07] flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-white/70" />
                </div>
                <h3 className="text-[15px] font-medium text-white/90 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ PRICING ━━━ */}
      <section id="pricing" className="relative py-24 lg:py-32">
        <div className="container relative">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.3em] uppercase text-white/40 mb-4 font-medium">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
              Simple,{" "}
              <em className="font-serif italic text-white/70 font-normal">
                transparent
              </em>{" "}
              pricing
            </h2>
            <p className="text-white/40 mt-3 text-base">
              Start free, upgrade when you&apos;re ready
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Free */}
            <div className="liquid-glass rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-white/[0.07] flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white/60" />
                </div>
                <h3 className="text-lg font-medium">Free</h3>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-semibold tracking-tight">
                  $0
                </span>
                <span className="text-white/40 ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-white/60"
                  >
                    <Check className="h-3.5 w-3.5 text-white/40 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="liquid-glass rounded-full w-full py-3 text-sm font-medium text-center block hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="liquid-glass-strong rounded-3xl p-8 relative">
              <div className="absolute -top-3 left-8">
                <span className="bg-white text-[#08080c] text-[11px] font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-white/[0.1] flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white/70" />
                </div>
                <h3 className="text-lg font-medium">Pro</h3>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-semibold tracking-tight">
                  $12
                </span>
                <span className="text-white/40 ml-1">/month</span>
                <p className="text-xs text-white/30 mt-1.5">
                  or $99/year (save 31%)
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {proFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-white/70"
                  >
                    <Check className="h-3.5 w-3.5 text-white/50 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="liquid-glass-strong rounded-full w-full py-3 text-sm font-medium text-center block bg-white/[0.08] hover:bg-white/[0.12] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Start 14-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section id="faq" className="relative py-24 lg:py-32 border-t border-white/[0.06]">
        <div className="container relative">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.3em] uppercase text-white/40 mb-4 font-medium">
              FAQ
            </p>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
              Frequently asked{" "}
              <em className="font-serif italic text-white/70 font-normal">
                questions
              </em>
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="liquid-glass-strong rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 dot-grid opacity-20" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
                Ready to take control of
                <br className="hidden sm:block" />
                your{" "}
                <em className="font-serif italic text-white/70 font-normal">
                  job search
                </em>
                ?
              </h2>
              <p className="text-white/40 mt-4 text-base max-w-lg mx-auto leading-relaxed">
                Join thousands of job seekers who use Applicant to organize and
                accelerate their career moves.
              </p>
              <Link
                href="/register"
                className="liquid-glass-strong rounded-full px-8 py-3.5 text-sm font-medium inline-flex items-center gap-3 mt-8 hover:scale-105 active:scale-95 transition-transform"
              >
                Get Started Free
                <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-white/[0.06]">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-white/70" />
                <span className="font-medium">applicant</span>
              </Link>
              <p className="text-sm text-white/30 leading-relaxed">
                AI-powered job application tracker and career toolkit.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-white/50 mb-4">
                Product
              </h4>
              <ul className="space-y-3 text-sm text-white/30">
                <li>
                  <Link href="#features" className="hover:text-white/60 transition-colors">Features</Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white/60 transition-colors">Changelog</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-white/50 mb-4">
                Company
              </h4>
              <ul className="space-y-3 text-sm text-white/30">
                <li>
                  <Link href="#" className="hover:text-white/60 transition-colors">About</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white/60 transition-colors">Blog</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white/60 transition-colors">Careers</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-white/50 mb-4">
                Legal
              </h4>
              <ul className="space-y-3 text-sm text-white/30">
                <li>
                  <Link href="#" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white/60 transition-colors">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] mt-10 pt-8">
            <p className="text-xs text-white/25">
              &copy; {new Date().getFullYear()} Applicant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
