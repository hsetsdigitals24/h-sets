import "server-only";
import { randomBytes } from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

/**
 * Certificate helpers: unique id generation and server-side PDF rendering.
 * PDFs are generated on demand (never stored) so they can't be tampered with.
 */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

/** 8-char public certificate code, e.g. "H7K3P9QX". */
export function generateCertId(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** Public verification URL for a certificate. */
export function verifyUrl(certId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/verify/${certId}`;
}

export type CertificateData = {
  certId: string;
  studentName: string;
  programmeName: string;
  cohortDates: string;
  issuedAt: Date;
};

/** Render an A4-landscape branded certificate PDF. Returns raw PDF bytes. */
export async function renderCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 landscape (pt)
  const { width, height } = page.getSize();

  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);

  const ink = rgb(0.043, 0.063, 0.125); // #0b1020
  const primary = rgb(0, 0.173, 0.835); // #002cd5
  const muted = rgb(0.4, 0.43, 0.5);

  // Border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: primary,
    borderWidth: 2,
  });

  const center = (text: string, y: number, font = serif, size = 16, color = ink) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color });
  };

  center("H-SETS ACADEMY", height - 90, serifBold, 24, primary);
  center("Certificate of Completion", height - 130, serif, 16, muted);
  center("This is proudly presented to", height - 190, sans, 12, muted);
  center(data.studentName, height - 240, serifBold, 34, ink);
  center("for successfully completing the programme", height - 285, sans, 12, muted);
  center(data.programmeName, height - 325, serifBold, 22, primary);
  center(data.cohortDates, height - 355, sans, 12, muted);

  // Footer: issue date + cert id
  const issued = data.issuedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  page.drawText(`Issued: ${issued}`, { x: 60, y: 70, size: 10, font: sans, color: muted });
  page.drawText(`Certificate ID: ${data.certId}`, { x: 60, y: 54, size: 10, font: sans, color: muted });

  // QR code linking to verification page
  const qrDataUrl = await QRCode.toDataURL(verifyUrl(data.certId), { margin: 0, width: 220 });
  const qrPng = await pdf.embedPng(qrDataUrl);
  const qrSize = 90;
  page.drawImage(qrPng, { x: width - 60 - qrSize, y: 54, width: qrSize, height: qrSize });
  const label = "Scan to verify";
  const lw = sans.widthOfTextAtSize(label, 8);
  page.drawText(label, { x: width - 60 - qrSize / 2 - lw / 2, y: 44, size: 8, font: sans, color: muted });

  return pdf.save();
}
