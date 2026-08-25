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
                color: "0D9488",
              }),
            ],
          }),
          
          new Paragraph({ spacing: { before: 400 } }),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Communications Engine & Underwriting Manual",
                bold: true,
                size: 40,
                color: "1E293B",
              }),
            ],
          }),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
            children: [
              new TextRun({
                text: "A Comprehensive Guide to Reminder Schedules, Targeted Direct Broadcasts, and Dynamic Underwriting Configuration.",
                italics: true,
                size: 22,
                color: "64748B",
              }),
            ],
          }),

          // Horizontal divider line
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.SINGLE, size: 12, color: "0D9488" }, // Accent line
            },
            rows: [new TableRow({ children: [new TableCell({ children: [] })] })],
          }),

          new Paragraph({ spacing: { before: 800 } }),

          // Document Metadata
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Document Specifications", bold: true, size: 18, color: "1E293B" }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Author", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Nexus Engineering Core" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Approved / Production" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Last Modified", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "August 19, 2026" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Reference ID", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "DOC-COMM-ENG-V1.4" })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PAGE 2: ARCHITECTURE OVERVIEW & REMINDER SYSTEM ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "1. Communications Infrastructure Architecture", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The Nexus Finance Communications module comprises two core operational sub-systems: the ",
              }),
              new TextRun({ text: "Automated Payment Reminders Engine", bold: true, color: "0D9488" }),
              new TextRun({ text: " and the " }),
              new TextRun({ text: "Direct Broadcast Dispatcher", bold: true, color: "3B82F6" }),
              new TextRun({
                text: ". Together, these features enable administrators to automate billing collections, push announcements, and sync audit compliance trails in real-time.",
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "2. Automated Payment Reminders Engine", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "To ensure liquidity and decrease loan defaults, the backend runs a daily sweep schedule at a configured time (e.g. 07:00 Cambodia Time) to scan all outstanding loans. For each loan, it calculates the remaining days to the next installment and matches against rules:",
              }),
            ],
          }),

          // Table 2.1
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Table 2.1: Payment Reminder Logic Matrices", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Rule Name", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Days Remaining", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Communication Channels", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Priority", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "7 Days Before" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "7 days before due date" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Both (Telegram & In-App)" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Medium" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "3 Days Before" })] }),
                  new TableCell({ children: [new Paragraph({ text: "3 days before due date" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Both (Telegram & In-App)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "High" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Due Today" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "0 days (exact due date)" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Both (Telegram & In-App)" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Critical" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Overdue Warning" })] }),
                  new TableCell({ children: [new Paragraph({ text: "-1 days (past due date)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Both (Telegram & In-App)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Critical / Warning" })] }),
                ],
              }),
            ],
          }),

          // CALLOUT BOX: REMINDER CRON DETAILS
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
                          new TextRun({ text: "Sweep Log Tracking: ", bold: true, color: "0F766E" }),
                          new TextRun({
                            text: "Each sweep writes historical tracking statistics to the 'nexus_reminder_logs' table. If a customer hasn't linked their Telegram chat ID, the sweep marks the log status as 'failed' with error notes, helping administrators identify un-notified clients easily.",
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

          // ── PAGE 3: BROADCAST SYSTEM & WEBHOOKS ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "3. Direct Broadcast Dispatcher", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The Direct Broadcast panel enables admins to send immediate messages to customer segments. Broadcast logs store performance metrics (Success vs Failure dispatches) to monitor audience reach.",
              }),
            ],
          }),

          // Table 3.1
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Table 3.1: Broadcast Cohorts Specifications", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Cohort Name", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Target Integration", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Primary Use Case", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "All Customers" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "All active registered accounts" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Critical system updates, general alerts." })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Telegram-Linked Users" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Users with verified Telegram link" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Interactive notifications, sweep confirmations." })] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [new TextRun({ text: "4. Webhook System Integration", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The platform features a webhooks API that dispatches real-time event updates to third-party endpoints. Developers can register URLs to listen for core ledger actions. The table below represents supported webhook events:",
              }),
            ],
          }),

          // Table 4.1
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Table 4.1: Supported Webhook Events", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Event String", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Trigger Phase", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Data Payload", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "loan.created" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Customer application submitted" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "loanId, applicant, amount, type" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "loan.approved" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Loan approved by admin or auto-underwritten" })] }),
                  new TableCell({ children: [new Paragraph({ text: "loanId, applicant, amount, type" })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PAGE 4: DATABASE SCHEMAS & REST ENDPOINTS ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "5. Database Schema Specifications", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The communications engine relies on the following structural database tables configured inside Supabase to persist logs, parameter variables, and sweep configurations.",
              }),
            ],
          }),

          // Table 5.1
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Table 5.1: public.nexus_reminder_logs Schema", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Column Name", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Data Type", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "id" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "SERIAL PRIMARY KEY" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Unique auto-incrementing identifier" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "loan_id" })] }),
                  new TableCell({ children: [new Paragraph({ text: "TEXT" })] }),
                  new TableCell({ children: [new Paragraph({ text: "ID of the target loan installment file" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "status" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "TEXT" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Dispatch status flag ('success' or 'failed')" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "error_message" })] }),
                  new TableCell({ children: [new Paragraph({ text: "TEXT (Nullable)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Audit log of dispatch failure reason" })] }),
                ],
              }),
            ],
          }),

          // Table 5.2
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Table 5.2: public.nexus_audit_logs Schema", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Column Name", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Data Type", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "action" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "TEXT" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Event tag e.g. 'config-updated'" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "details" })] }),
                  new TableCell({ children: [new Paragraph({ text: "TEXT" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Summary text (formatted params/JSON dump)" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "userEmail" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "TEXT" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Email of the admin user executing the action" })] }),
                ],
              }),
            ],
          }),

          // SECTION 6: API REFERENCE
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 },
            children: [new TextRun({ text: "6. REST API Endpoint Specifications", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "The communications modules expose the following endpoints over HTTP. All endpoints require a bearer authorization header token.",
              }),
            ],
          }),

          // Table 6.1
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Table 6.1: Communication REST Endpoints", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Route", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Method", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Required Role", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Operation", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "/api/config" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "GET" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Super Admin" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Fetch current global config" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "/api/config" })] }),
                  new TableCell({ children: [new Paragraph({ text: "PATCH" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Super Admin" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Update settings/reminder sweep time" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "/api/broadcast" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "POST" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Super Admin" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Dispatch targeted alerts" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "/api/reminder-logs" })] }),
                  new TableCell({ children: [new Paragraph({ text: "GET" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Admin / Officer" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Retrieve history sweep logs" })] }),
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
    const filePath = path.join(dir, 'nexus_finance_communication_module.docx');
    fs.writeFileSync(filePath, buffer);
    console.log(`Document successfully written to: ${filePath}`);
  });
}

createDocument();
