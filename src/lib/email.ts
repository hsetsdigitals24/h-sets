import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/lib/site";

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

/* ------------------------------------------------------------------ */
/* Branded email layout                                                */
/* ------------------------------------------------------------------ */

// Palette — mirrors the site design tokens (see globals.css / site config).
const BRAND = "#002cd5"; // strong blue
const INK = "#0b1020"; // near-black text
const MUTED = "#667085"; // secondary text
const PAGE_BG = "#f4f5f8"; // soft grey page background
const CARD_BG = "#ffffff";
const BORDER = "#e6e8ee";
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

const LOGO_URL = `${site.url}/logo.png`;

/** A bulletproof, brand-blue CTA button (table-based for Outlook/VML safety). */
export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0">
    <tr>
      <td align="center" bgcolor="${BRAND}" style="border-radius:8px">
        <a href="${href}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:${FONT};font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;border-radius:8px">${label}</a>
      </td>
    </tr>
  </table>`;
}

/** Muted footer social row built from the site's configured social links. */
function socialRow(): string {
  const links: [string, string][] = [
    ["LinkedIn", site.socials.linkedin],
    ["Twitter", site.socials.twitter],
    ["Instagram", site.socials.instagram],
    ["YouTube", site.socials.youtube],
  ];
  return links
    .map(
      ([label, url]) =>
        `<a href="${url}" target="_blank" style="color:${MUTED};text-decoration:none;font-weight:600;margin:0 8px">${label}</a>`
    )
    .join('<span style="color:#c7ccd8">·</span>');
}

type LayoutOpts = {
  /** Optional bold heading shown at the top of the card. */
  heading?: string;
  /** Hidden inbox preview text (improves the preview line in most clients). */
  preheader?: string;
  /** Inner HTML for the card body. */
  body: string;
};

/** Wraps content in the shared, email-client-safe branded shell. */
function layout({ heading, preheader, body }: LayoutOpts): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${site.name}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};-webkit-font-smoothing:antialiased">
${
  preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${PAGE_BG}">${preheader}</div>`
    : ""
}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAGE_BG}">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
        <!-- Header -->
        <tr>
          <td align="center" style="padding:8px 8px 20px">
            <a href="${site.url}" target="_blank" style="text-decoration:none">
              <img src="${LOGO_URL}" width="140" alt="${site.name}" style="display:block;border:0;outline:none;height:auto;max-width:140px">
            </a>
          </td>
        </tr>
        <!-- Card -->
        <tr>
          <td style="background:${CARD_BG};border:1px solid ${BORDER};border-radius:14px;overflow:hidden">
            <div style="height:4px;background:${BRAND};line-height:4px;font-size:4px">&nbsp;</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:36px 40px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK}">
                  ${
                    heading
                      ? `<h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;font-weight:700;color:${INK}">${heading}</h1>`
                      : ""
                  }
                  ${body}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 24px 8px;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};text-align:center">
            <div style="margin-bottom:8px">${socialRow()}</div>
            <div style="font-weight:600;color:${INK}">${site.legalName}</div>
            <div>${site.address}</div>
            <div style="margin-top:6px">
              <a href="${site.url}" target="_blank" style="color:${MUTED};text-decoration:underline">${site.url.replace(/^https?:\/\//, "")}</a>
              <span style="color:#c7ccd8"> · </span>
              <a href="mailto:${site.email}" style="color:${MUTED};text-decoration:underline">${site.email}</a>
            </div>
            <div style="margin-top:12px;color:#98a0b0">You're receiving this email because you contacted or signed up with ${site.name}.</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Renders a key/value table for internal lead notifications. */
function table(rows: Record<string, unknown>): string {
  const entries = Object.entries(rows).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:${FONT};font-size:14px;border:1px solid ${BORDER};border-radius:8px;overflow:hidden">${entries
    .map(
      ([k, v], i) =>
        `<tr style="background:${i % 2 === 0 ? "#fafbfc" : "#ffffff"}">
          <td style="padding:10px 16px;color:${MUTED};text-transform:capitalize;white-space:nowrap;vertical-align:top;border-bottom:1px solid ${BORDER};width:35%">${k}</td>
          <td style="padding:10px 16px;color:${INK};font-weight:600;border-bottom:1px solid ${BORDER}">${String(
            v
          )}</td>
        </tr>`
    )
    .join("")}</table>`;
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

/** Emails a password-reset link to a user. Logs the link to the console when SMTP is unset. */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await send({
    to,
    subject: "Reset your H-SETS password",
    html: layout({
      heading: "Reset your password",
      preheader: "Reset your H-SETS password — this link expires in 1 hour.",
      body: `
        <p style="margin:0 0 16px">Hi there,</p>
        <p style="margin:0 0 20px">We received a request to reset your ${site.name} password. Click the button below to choose a new one. This link expires in 1 hour.</p>
        ${button(resetUrl, "Reset password")}
        <p style="margin:20px 0 0;color:${MUTED};font-size:13px">If you didn't request this, you can safely ignore this email — your password won't change.</p>
        <p style="margin:24px 0 0">— The ${site.name} Team</p>`,
    }),
  });
}

/** Send one nurture-sequence step to a lead. Wraps the step HTML in the layout. */
export async function sendNurtureStep(opts: {
  to: string;
  name?: string | null;
  subject: string;
  body: string;
}) {
  await send({
    to: opts.to,
    subject: opts.subject,
    html: layout({
      preheader: opts.subject,
      body: `
        <p style="margin:0 0 16px">Hi ${opts.name || "there"},</p>
        ${opts.body}
        <p style="margin:24px 0 0">— The ${site.name} Team</p>`,
    }),
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
    html: layout({
      heading: opts.subject,
      preheader: `New ${opts.type} lead`,
      body: `
        <p style="margin:0 0 20px;color:${MUTED}">A new <strong style="color:${INK}">${opts.type}</strong> lead just came in.</p>
        ${table(opts.fields)}`,
    }),
  });

  // Optional confirmation to the user.
  if (opts.userEmail && opts.confirmation) {
    await send({
      to: opts.userEmail,
      subject: opts.confirmation.subject,
      html: layout({
        preheader: opts.confirmation.subject,
        body: `
          <p style="margin:0 0 16px">Hi ${opts.userName || "there"},</p>
          ${opts.confirmation.body}
          <p style="margin:24px 0 0">— The ${site.name} Team</p>`,
      }),
    });
  }
}
