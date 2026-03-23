import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Briefcase, BarChart3, FileText, Sparkles, Target, MessageSquare,
  Check, ArrowRight, Zap, Shield, Globe,
} from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Application Tracker",
    description: "Track every job application with a beautiful Kanban board and list view. Never lose track of where you applied.",
  },
  {
    icon: Sparkles,
    title: "AI Resume Builder",
    description: "Build professional resumes with AI-powered content refinement. Get suggestions that make your experience shine.",
  },
  {
    icon: Target,
    title: "ATS Score Checker",
    description: "Check your resume against job descriptions for keyword optimization. Beat the applicant tracking systems.",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description: "Generate tailored cover letters for each application. Personalized to the company and role.",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    description: "AI-generated practice questions specific to the role. With coaching tips and answer frameworks.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visualize your job search progress with pipeline funnels, response rates, and activity trends.",
  },
];

const steps = [
  { step: "1", title: "Add Applications", description: "Paste a job URL to auto-fill details, or add them manually. Track status from saved to offer." },
  { step: "2", title: "Optimize with AI", description: "Build AI-powered resumes, generate cover letters, and prep for interviews with tailored questions." },
  { step: "3", title: "Track & Analyze", description: "Drag-and-drop Kanban board, set follow-up reminders, and get insights from your analytics dashboard." },
];

const freeFeatures = [
  "Unlimited job tracking", "Kanban + List views", "10 URL scrapes/month",
  "3 active reminders", "2 resume templates", "CSV export",
];

const proFeatures = [
  "Everything in Free", "Unlimited URL scrapes", "Unlimited reminders",
  "20+ resume templates", "AI Resume Builder", "AI Resume Tailor",
  "Cover Letter Generator", "Interview Prep", "ATS Checker",
  "Full Analytics", "CSV + JSON export", "Priority support",
];

const faqs = [
  { q: "What happens after the 14-day trial?", a: "Your trial converts to a paid subscription. You can cancel anytime before the trial ends and you won't be charged. After cancellation, you keep access until the end of your billing period." },
  { q: "Can I export my data?", a: "Yes! Free users can export as CSV. Pro users can also export as JSON. You always own your data." },
  { q: "How does the URL scraping work?", a: "Paste any job posting URL and our scraper extracts the job title, company, location, and description automatically. It works with most major job boards." },
  { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption, and your data is stored securely in PostgreSQL. We never share your information with third parties." },
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. You'll retain Pro access until the end of your current billing period." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Applicant</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32 text-center">
        <Badge variant="secondary" className="mb-4">
          <Zap className="mr-1 h-3 w-3" /> AI-Powered Job Search Toolkit
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
          Land your dream job with{" "}
          <span className="text-primary">AI-powered</span> tracking
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
          Track applications, build tailored resumes, generate cover letters, and prep for interviews — all in one place.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button size="lg" asChild>
            <Link href="/register">
              Start Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">View Pricing</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          No credit card required. Free forever plan available.
        </p>
      </section>

      {/* Features */}
      <section className="container py-24 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to land the job</h2>
          <p className="text-muted-foreground mt-2">Powerful features to supercharge your job search</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="rounded-lg bg-primary/10 p-2 w-fit">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg mt-3">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-24 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="text-muted-foreground mt-2">Three simple steps to organize your job search</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-primary text-primary-foreground h-10 w-10 flex items-center justify-center font-bold">
                  {step.step}
                </div>
              </div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-24 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
          <p className="text-muted-foreground mt-2">Start free, upgrade when you need more</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="pt-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary border-2 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Pro
              </CardTitle>
              <div className="pt-2">
                <span className="text-4xl font-bold">$12</span>
                <span className="text-muted-foreground">/month</span>
                <p className="text-xs text-muted-foreground mt-1">or $99/year (save 31%)</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" asChild>
                <Link href="/register">Start 14-Day Free Trial</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-24 border-t">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        </div>
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24 border-t">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">Ready to land your dream job?</h2>
          <p className="text-muted-foreground mt-2">
            Join thousands of job seekers using Applicant to organize and accelerate their job search.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/register">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="font-bold">Applicant</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered job application tracker and career toolkit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Applicant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
