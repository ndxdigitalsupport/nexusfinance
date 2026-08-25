import * as fs from 'fs';
import * as path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, PageBreak } from 'docx';

function createDocument() {
  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "94A3B8" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Segoe UI",
            size: 22, // 11pt
            color: "334155", // Cool Slate Body Text
          },
          paragraph: {
            spacing: { line: 276, before: 120, after: 120 }, // 1.15 line spacing, 6pt margins
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        children: [
          // ── PAGE 1: TITLE PAGE ──
          new Paragraph({ spacing: { before: 1200 } }), // Top spacing
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "N E X U S   F I N A N C E",
                bold: true,
                size: 20,
                color: "0D9488", // Teal Accent
              }),
            ],
          }),
          
          new Paragraph({ spacing: { before: 400 } }),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Communications Technical Specification",
                bold: true,
                size: 40,
                color: "1E293B", // Dark Slate
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "& Systems Integration Manual",
                bold: true,
                size: 30,
                color: "475569", // Medium Slate
              }),
            ],
          }),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
            children: [
              new TextRun({
                text: "A Deep-Dive Technical Blueprint detailing the node-cron daemon, direct broadcast patterns, webhook events, dynamic SQL schemas, and the API integration stack.",
                italics: true,
                size: 22,
                color: "64748B",
              }),
            ],
          }),

          // Accent Divider Line
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 16, color: "0D9488" },
            },
            rows: [new TableRow({ children: [new TableCell({ children: [] })] })],
          }),

          new Paragraph({ spacing: { before: 800 } }),

          // Technical Metadata
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Specification Specifications", bold: true, size: 18, color: "1E293B" }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Author Team", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Core Architecture Group" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Review Status", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Technical Sign-Off" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Target Environment", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Production Server Stack" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Document Ref", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "TECH-SPEC-COMM-V2.1" })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PAGE 2: TECHNOLOGY STACK ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "1. Core Technology Stack", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The communications stack is built for high reliability and low latency, combining scheduled system sweeps with event-driven dispatches. Below is the list of frameworks, engines, and APIs driving this engine:",
              }),
            ],
          }),

          // Table 1.1: Tech Stack
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Table 1.1: Communications Stack Technology Inventory", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Layer", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Technology Selection", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Operational Purpose", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Backend Server" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Node.js & Express (TypeScript / TSX)" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Handles REST routing, auth middleware, and API responses." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Database Engine" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Supabase (PostgreSQL Database Client)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Stores loan transactions, audit logs, configuration parameters, and reminder rules." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Scheduler Daemon" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "node-cron Scheduler Library" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Manages background execution loops and cron patterns." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Telegram Gateway" })] }),
                  new TableCell({ children: [new Paragraph({ text: "node-telegram-bot-api Package" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Dispatches instant chat messages to verified customer accounts." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Mail Dispatcher" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Nodemailer SMTP Client / SendGrid" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Sends HTML email confirmations for approved or disbursed loans." })] }),
                ],
              }),
            ],
          }),

          // CALLOUT: SCHEDULER SYSTEM
          new Paragraph({ spacing: { before: 200, after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: "0D9488" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F0FDFA" },
                    margins: { top: 160, bottom: 160, left: 240, right: 240 },
                    children: [
                      new Paragraph({
                        spacing: { before: 0, after: 0 },
                        children: [
                          new TextRun({ text: "Did You Know? ", bold: true, color: "0F766E" }),
                          new TextRun({
                            text: "The cron scheduler is fully dynamic. When an admin updates the reminder sweep time through the frontend dashboard settings, the backend automatically halts the running daemon and reschedules the new cron string on the fly without rebooting the server.",
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PAGE 3: LOGIC FLOWS ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "2. Operational Logic & Data Flows", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The flows below describe the exact step-by-step sequential operations executed by the backend communications dispatcher.",
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "2.1 Automated Reminder Run Flow", bold: true, size: 20, color: "1E293B" })],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "1. Cron Activation: ", bold: true, color: "0F766E" }),
              new TextRun({ text: "The daemon triggers the job according to the configured sweep time." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "2. Database Query: ", bold: true, color: "0F766E" }),
              new TextRun({ text: "Queries all active loans and reminder rules configurations." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "3. Day Difference Calculation: ", bold: true, color: "0F766E" }),
              new TextRun({ text: "Computes the days remaining until the next payment due date." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "4. Template Compile: ", bold: true, color: "0F766E" }),
              new TextRun({ text: "Compiles rules templates by substituting tags like {customer_name} with customer record values." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "5. Dispatch Dispatching: ", bold: true, color: "0F766E" }),
              new TextRun({ text: "Appends the in-app notification first. Then, checks if user has linked Telegram and sends message." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "6. Outcome Auditing: ", bold: true, color: "0F766E" }),
              new TextRun({ text: "Writes success or fail logs with details to the database." }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
            children: [new TextRun({ text: "2.2 targeted Direct Broadcast Flow", bold: true, size: 20, color: "1E293B" })],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "1. Admin Composition: ", bold: true, color: "3B82F6" }),
              new TextRun({ text: "Admin sets target groups and channel variables, then composes message in panel." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "2. Recipient Resolution: ", bold: true, color: "3B82F6" }),
              new TextRun({ text: "The backend queries registered accounts matching the criteria." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "3. Direct Dispatch: ", bold: true, color: "3B82F6" }),
              new TextRun({ text: "Sends messages in parallel. For in-app alerts, inserts notifications. For Telegram, dispatches bot api calls." }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({ text: "4. Summary Logging: ", bold: true, color: "3B82F6" }),
              new TextRun({ text: "Saves total success and fail counts inside the platform database." }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PAGE 4: DATABASE SCHEMAS & CONFIG DETAILS ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "3. Schema Architecture Specs", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The communications engine database structure is designed to hold operational parameters and log tracking entries.",
              }),
            ],
          }),

          // Table 3.1: Config columns
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Table 3.1: public.nexus_config Table Structure", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Column Name", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Type", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Purpose Description", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "baseInterestRate" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "NUMERIC" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Base APR percentage (e.g. 8%) used for yield calculations." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "maxLoanAmount" })] }),
                  new TableCell({ children: [new Paragraph({ text: "NUMERIC" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Maximum loan threshold allowed for customer application submission." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "kycRequired" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "BOOLEAN" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Determines if video KYC check is mandatory." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "autoApproveLimit" })] }),
                  new TableCell({ children: [new Paragraph({ text: "NUMERIC" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Loans with amounts below this threshold can be auto-approved." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "reminder_time" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "TEXT" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Daily time schedule for trigger scans (e.g. '07:00')." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "telegram_admin_id" })] }),
                  new TableCell({ children: [new Paragraph({ text: "TEXT" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Destination chat ID for direct administrative report messages." })] }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    const dir = path.join(process.cwd(), 'DOC');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, 'nexus_finance_comms_tech_spec.docx');
    fs.writeFileSync(filePath, buffer);
    console.log(`Document successfully written to: ${filePath}`);
  });
}

createDocument();
