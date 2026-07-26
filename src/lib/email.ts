import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail({
  to,
  subject,
  body,
  from,
}: {
  to: string;
  subject: string;
  body: string;
  from?: string;
}) {
  const resend = getResend();
  if (!resend) {
    return { data: null, error: { message: "Resend API key not configured" } };
  }

  const result = await resend.emails.send({
    from: from || "outreach@yourdomain.com",
    to,
    subject,
    html: body.replace(/\n/g, "<br>"),
  });

  return result;
}

export async function getEmailStatus(emailId: string) {
  const resend = getResend();
  if (!resend) return null;

  const result = await resend.emails.get(emailId);
  return result;
}
