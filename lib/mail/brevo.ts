import "server-only";

import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/site-config";

function appOrigin() {
  const configured = process.env.APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  throw new Error("APP_URL is not set");
}

export function authLink(path: string, token: string, locale: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const url = new URL(`${prefix}${path}`, appOrigin());
  url.searchParams.set("token", token);
  return url.toString();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character] ?? character;
  });
}

export async function sendAuthEmail(input: { to: string; subject: string; text: string; html: string }) {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured");
    console.info(`[mail] ${input.subject} -> ${input.to}\n${input.text}`);
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify({
      sender: { name: siteConfig.name, email: from },
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
    }),
  });

  if (!response.ok) throw new Error("Could not send email");
}

export async function sendVerificationEmail(to: string, link: string) {
  const safe = escapeHtml(link);
  await sendAuthEmail({
    to,
    subject: `Confirm your ${siteConfig.name} email`,
    text: `Confirm your email by opening this link:\n${link}\nThe link expires in 24 hours.`,
    html: `<p>Confirm your email to finish creating your ${siteConfig.name} account.</p><p><a href="${safe}">Verify email</a></p><p>The link expires in 24 hours.</p>`,
  });
}

export async function sendResetEmail(to: string, link: string) {
  const safe = escapeHtml(link);
  await sendAuthEmail({
    to,
    subject: `Reset your ${siteConfig.name} password`,
    text: `Reset your password by opening this link:\n${link}\nThe link expires in one hour. If you did not ask for this, you can ignore it.`,
    html: `<p>Reset your ${siteConfig.name} password.</p><p><a href="${safe}">Choose a new password</a></p><p>The link expires in one hour. If you did not ask for this, you can ignore it.</p>`,
  });
}
