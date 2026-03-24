import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const applicationSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  salaryMin: z.number().positive().optional().nullable(),
  salaryMax: z.number().positive().optional().nullable(),
  salaryCurrency: z.string().default("USD"),
  description: z.string().optional(),
  status: z.enum(["SAVED", "APPLIED", "PHONE_SCREEN", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"]).default("APPLIED"),
  appliedDate: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  linkedResumeId: z.string().optional().nullable(),
});

export const applicationUpdateSchema = applicationSchema.partial().extend({
  position: z.number().optional(),
});

export const scrapeSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const reminderSchema = z.object({
  applicationId: z.string(),
  remindAt: z.string(),
  message: z.string().optional(),
});

export const resumeBuildSchema = z.object({
  section: z.string(),
  rawInput: z.string(),
});

export const resumeTailorSchema = z.object({
  resumeJson: z.record(z.string(), z.unknown()),
  jobDescription: z.string().min(1),
});

export const coverLetterSchema = z.object({
  resumeJson: z.record(z.string(), z.unknown()),
  jobDescription: z.string().min(1),
  companyName: z.string().min(1),
});

export const interviewPrepSchema = z.object({
  jobDescription: z.string().min(1),
  jobTitle: z.string().min(1),
});

export const atsCheckSchema = z.object({
  resumeJson: z.record(z.string(), z.unknown()),
  jobDescription: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationUpdateInput = z.infer<typeof applicationUpdateSchema>;
export const contactUpdateSchema = contactSchema.partial();

export const reminderCreateSchema = z.object({
  remindAt: z.string(),
  message: z.string().optional(),
});

export const reminderUpdateSchema = reminderCreateSchema.partial();

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const resumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  contentJson: z.record(z.string(), z.unknown()),
  templateId: z.string().optional().nullable(),
});

export const resumeUpdateSchema = resumeSchema.partial();

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type ResumeInput = z.infer<typeof resumeSchema>;
export type ResumeUpdateInput = z.infer<typeof resumeUpdateSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
