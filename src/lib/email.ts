import { Resend } from "resend";

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

let _resend: ReturnType<typeof getResendClient> | null = null;
function resend() {
  if (!_resend) _resend = getResendClient();
  return _resend;
}

const FROM_EMAIL = "Applicant <noreply@applicant.app>";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await resend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset for your Applicant account.</p>
        <p>Click the link below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #1a73e8; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendReminderEmail(
  email: string,
  jobTitle: string,
  company: string,
  message?: string | null
) {
  await resend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Reminder: ${jobTitle} at ${company}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Application Reminder</h2>
        <p>This is your reminder about your application for <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
        ${message ? `<p>${message}</p>` : ""}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #1a73e8; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          View Dashboard
        </a>
      </div>
    `,
  });
}
