import type { Application, Tag, Contact, Reminder, ActivityLog, Resume, User, Subscription } from "@prisma/client";

export type ApplicationWithRelations = Application & {
  tags: Tag[];
  contacts: Contact[];
  reminders: Reminder[];
  activityLogs: ActivityLog[];
  linkedResume: Resume | null;
};

export type UserWithSubscription = User & {
  subscription: Subscription | null;
};

export type KanbanColumn = {
  id: string;
  title: string;
  status: Application["status"];
  applications: Application[];
};

export type ResumeContent = {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
  };
  summary?: string;
  experience: {
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    startDate: string;
    endDate?: string;
    honors?: string;
  }[];
  skills: string[];
};

export type AIResumeEdit = {
  section: string;
  original: string;
  suggested: string;
  reason: string;
};

export type ATSResult = {
  score: number;
  keywordMatch: number;
  missingKeywords: string[];
  formattingWarnings: string[];
  sections: { name: string; score: number; feedback: string }[];
  suggestions: string[];
};

export type InterviewQuestion = {
  question: string;
  type: "behavioral" | "technical" | "situational";
  tip: string;
  sampleFramework: string;
};

export type ViewMode = "kanban" | "list";
export type SortField = "appliedDate" | "company" | "jobTitle" | "status" | "salaryMin";
export type SortOrder = "asc" | "desc";
