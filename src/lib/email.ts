import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Email sending via SMTP (nodemailer).
 *
 * Configure with env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  — your SMTP provider
 *   MAIL_FROM   — the "from" address (defaults to SMTP_USER)
 *   MAIL_TO     — where internal notifications go (defaults to SMTP_USER)
 *
 * If SMTP isn't configured, emails are logged to the console instead of sent,
 * so the app works out of the box and starts sending real mail the moment you
 * add credentials.
 */

const globalForMail = globalThis as unknown as { _hsetsTransport?: Transporter };

function getTransport(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!globalForMail._hsetsTransport) {
    const port = Number(SMTP_PORT) || 587;
    globalForMail._hsetsTransport = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return globalForMail._hsetsTransport;
}

type Mail = { to: string; subject: string; html: string; replyTo?: string };

async function send(mail: Mail) {
  const transport = getTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@h-sets.com";
  if (!transport) {
    console.info(
      `[email:log-only] to=${mail.to} subject="${mail.subject}" (set SMTP_* env vars to send real email)`
    );
    return;
  }
  await transport.sendMail({ from, ...mail });
}

const adminTo = () => process.env.MAIL_TO || process.env.SMTP_USER || "hello@h-sets.com";

function table(rows: Record<string, unknown>): string {
  return `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${Object.entries(
    rows
  )
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;text-transform:capitalize">${k}</td><td style="padding:4px 0;font-weight:600">${String(
          v
        )}</td></tr>`
    )
    .join("")}</table>`;
}

/** Emails a password-reset link to a user. Logs the link to the console when SMTP is unset. */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await send({
    to,
    subject: "Reset your H-SETS password",
    html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#0b1020">
      <p>Hi there,</p>
      <p>We received a request to reset your H-SETS password. Click the button below to choose a new one. This link expires in 1 hour.</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="background:#0b1020;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Reset password</a>
      </p>
      <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
      <p style="margin-top:24px">— The H-SETS Team</p>
    </div>`,
  });
}

/** Notify the team about a new lead, and confirm to the user where we have their email. */
export async function notifyNewLead(opts: {
  type: string;
  subject: string;
  fields: Record<string, unknown>;
  userEmail?: string | null;
  userName?: string | null;
  confirmation?: { subject: string; body: string };
}) {
  // Internal notification (best-effort — never block the user response on email).
  await send({
    to: adminTo(),
    replyTo: opts.userEmail || undefined,
    subject: `[H-SETS] ${opts.subject}`,
    html: `<h2 style="font-family:sans-serif">${opts.subject}</h2>${table(opts.fields)}`,
  });

  // Optional confirmation to the user.
  if (opts.userEmail && opts.confirmation) {
    await send({
      to: opts.userEmail,
      subject: opts.confirmation.subject,
      html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;color:#0b1020">
        <p>Hi ${opts.userName || "there"},</p>
        ${opts.confirmation.body}
        <p style="margin-top:24px">— The H-SETS Team</p>
      </div>`,
    });
  }
}
