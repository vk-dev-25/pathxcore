/**
 * One-off generator: client access guide PDF.
 * Run: node docs/client-access-guide/generate.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "PathX-client-access-guide.pdf");
const img = (name) => path.join(__dirname, "images", name);

const TEAL = "#0d9488";
const INK = "#0f172a";
const MUTED = "#475569";

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 48, bottom: 48, left: 54, right: 54 },
  info: {
    Title: "PathXdx — How to view shared files & project trackers",
    Author: "Pathology X Diagnostic Services",
    Subject: "Client access guide",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

function heading(text) {
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(18).text(text);
  doc.moveDown(0.35);
}

function body(text) {
  doc.fillColor(MUTED).font("Helvetica").fontSize(10.5).text(text, {
    lineGap: 2,
  });
  doc.moveDown(0.45);
}

function step(n, title, detail) {
  doc
    .fillColor(TEAL)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(`Step ${n} — ${title}`);
  doc.moveDown(0.15);
  doc.fillColor(MUTED).font("Helvetica").fontSize(10.5).text(detail, {
    lineGap: 2,
  });
  doc.moveDown(0.4);
}

function caption(text) {
  doc.fillColor("#64748b").font("Helvetica-Oblique").fontSize(8.5).text(text, {
    align: "center",
  });
  doc.moveDown(0.5);
}

function drawImage(file, maxH = 220) {
  const pageW =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const x = doc.page.margins.left;
  const y = doc.y;
  doc.image(file, x, y, { fit: [pageW, maxH], align: "center" });
  // Advance y past the fitted image
  const imgObj = doc.openImage(file);
  const scale = Math.min(pageW / imgObj.width, maxH / imgObj.height);
  doc.y = y + imgObj.height * scale + 6;
}

// ——— Page 1 ———
doc
  .fillColor(TEAL)
  .font("Helvetica-Bold")
  .fontSize(11)
  .text("PATHXdx  ·  CLIENT GUIDE");
doc.moveDown(0.35);
heading("How to view what’s shared with you");
body(
  "Use this short guide to open Project Tracker updates or Shared files that PathX has shared with your email. No password is required — you sign in with a one-time magic link.",
);

doc
  .roundedRect(doc.page.margins.left, doc.y, 504, 42, 6)
  .fill("#f0fdfa");
doc
  .fillColor(INK)
  .font("Helvetica")
  .fontSize(10)
  .text(
    "You need: the same email address PathX used when they shared access, plus inbox access for that email.",
    doc.page.margins.left + 12,
    doc.y + 12,
    { width: 480 },
  );
doc.y += 54;

step(
  1,
  "Open pathxdx.com and choose Sign in",
  "Go to https://pathxdx.com and click Sign in in the top right.",
);
drawImage(img("01-homepage-sign-in.jpg"), 175);
caption("Homepage — Sign in (top right)");

step(
  2,
  "Choose the client option",
  "On the Sign in page, skip the employee password form. Under “Are you a client?”, click Email me a sign-in link.",
);
drawImage(img("02-sign-in-client-option.png"), 185);
caption("Sign in page — client magic-link option at the bottom");

// ——— Page 2 ———
doc.addPage();
doc
  .fillColor(TEAL)
  .font("Helvetica-Bold")
  .fontSize(11)
  .text("PATHXdx  ·  CLIENT GUIDE");
doc.moveDown(0.4);

step(
  3,
  "Enter your invited email",
  "On Client sign in, enter the email PathX invited, then click Email me a sign-in link. Only invited client emails can sign in.",
);
drawImage(img("03-client-sign-in.png"), 195);
caption("Client sign in — request your magic link");

step(
  4,
  "Open the magic link from your email",
  "Check your inbox (and spam) for a message from Supabase Auth with subject about your sign-in link. Click Sign in. The link expires shortly and can be used only once — request a new one if needed.",
);
drawImage(img("04-magic-link-email.png"), 150);
caption("Example magic-link email — click Sign in");

// ——— Page 3 ———
doc.addPage();
doc
  .fillColor(TEAL)
  .font("Helvetica-Bold")
  .fontSize(11)
  .text("PATHXdx  ·  CLIENT GUIDE");
doc.moveDown(0.4);

step(
  5,
  "Open Shared files or Project Tracker",
  "After you sign in, you’ll land in the PathX workspace. Use the tabs at the top:",
);
doc
  .fillColor(MUTED)
  .font("Helvetica")
  .fontSize(10.5)
  .list(
    [
      "Shared files — download files PathX shared with you (download before the expiry date).",
      "Project Tracker — view study / project progress PathX has shared with your email.",
    ],
    { bulletRadius: 2, textIndent: 12, lineGap: 2 },
  );
doc.moveDown(0.5);

drawImage(img("05-shared-files.png"), 210);
caption("Shared files — download before the expiry date");

doc.moveDown(0.3);
heading("Tips");
doc
  .fillColor(MUTED)
  .font("Helvetica")
  .fontSize(10.5)
  .list(
    [
      "Always use the email PathX shared with — a different address will not see your files or trackers.",
      "If a magic link has expired, return to Client sign in and request a new one.",
      "Shared files disappear after their expiry date; download what you need in time.",
      "Questions? Contact PathX at info@pathxdx.com or via pathxdx.com/contact.",
    ],
    { bulletRadius: 2, textIndent: 12, lineGap: 3 },
  );

doc.moveDown(1.2);
doc
  .fillColor("#94a3b8")
  .font("Helvetica")
  .fontSize(8.5)
  .text(
    "Pathology X Diagnostic Services, Inc.  ·  pathxdx.com  ·  Client access guide",
    { align: "center" },
  );

doc.end();

await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});

console.log("Wrote", outPath);
