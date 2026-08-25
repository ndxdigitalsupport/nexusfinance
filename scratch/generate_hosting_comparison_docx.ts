import * as fs from 'fs';
import * as path from 'path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, PageBreak } from 'docx';

function createHostingDoc() {
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
          new Paragraph({ spacing: { before: 1200 } }),
          
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
                text: "Hosting Platform Comparison",
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
                text: "& Infrastructure Scaling Analysis",
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
                text: "An Evaluation of Cloud Hosting Providers (Google Cloud, Render, Railway) for Dockerized Web Architectures and Supabase Database Services.",
                italics: true,
                size: 22,
                color: "64748B",
              }),
            ],
          }),

          // Divider Line
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

          // Document Info Card
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
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Prepared For", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Management Review" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Target Environment", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Dockerized Node/React Portal" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Date Created", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "August 24, 2026" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Reference ID", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "NEXUS-HOSTING-COMP-V1.0" })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PAGE 2: EXECUTIVE SUMMARY & OPTIONS ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "1. Executive Summary", bold: true, size: 26, color: "0F766E" })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "We are evaluating cloud hosting platforms for the NexusFinance application — a Dockerized Node.js/React loan management system currently deployed on Render. This document compares three main options across features, pricing, and operational scaling overhead.",
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Table 1.1: Platform High-Level Summary", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Platform", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Monthly Cost (Production)", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Best For", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Google Cloud (Cloud Run)", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "$18–30 / month" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Scalability, enterprise security, long-term growth" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Render (Current)", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "$14–45 / month" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Simplicity, minimal server management, fast setup" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Railway", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "$10–25 / month" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Developer experience, usage-based billing, speed" })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "Recommendation: ", bold: true, color: "0D9488" }),
              new TextRun({
                text: "Google Cloud (Cloud Run) offers the best balance of cost, enterprise scalability, and industry-standard infrastructure.",
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 },
            children: [new TextRun({ text: "2. Detailed Hosting Options Analysis", bold: true, size: 26, color: "0F766E" })],
          }),

          // Option 1
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Option 1: Google Cloud Platform (Cloud Run)", bold: true, size: 20, color: "1E293B" })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Architecture: ", bold: true }),
              new TextRun({ text: "Cloud Run (serverless containers) + Cloud SQL (managed PostgreSQL) + Firebase Authentication." }),
            ],
          }),
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [new TextRun({ text: "Table 1.2: Google Cloud Cost Details", bold: true, size: 14, color: "475569" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Free Tier", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Paid (Small App)", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Cloud Run (Compute)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "2M requests/mo, 180K vCPU-sec" })] }),
                  new TableCell({ children: [new Paragraph({ text: "~$0–5 / month" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Cloud SQL (db-f1-micro)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "None ($300 credit for 90 days)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "~$13 / month" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Firebase Auth" })] }),
                  new TableCell({ children: [new Paragraph({ text: "50,000 MAUs free" })] }),
                  new TableCell({ children: [new Paragraph({ text: "$0 (until 50K users)" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Total Estimate", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "$0 / month (with credits)", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "~$18–25 / month", bold: true, color: "0D9488" })] })] }),
                ],
              }),
            ],
          }),
          
          new Paragraph({ spacing: { before: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "Key Features:", bold: true, color: "0F766E" })] }),
          new Paragraph({ children: [new TextRun({ text: "✔  Scales to zero (zero charges when idle)" })] }),
          new Paragraph({ children: [new TextRun({ text: "✔  Automatic scaling based on incoming traffic" })] }),
          new Paragraph({ children: [new TextRun({ text: "✔  Enterprise-grade reliability and security (99.95% SLA)" })] }),
          
          new Paragraph({ spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "Considerations:", bold: true, color: "991B1B" })] }),
          new Paragraph({ children: [new TextRun({ text: "⚠  Cloud SQL has no permanent free tier (~$13/mo minimum)" })] }),
          new Paragraph({ children: [new TextRun({ text: "⚠  Initial infrastructure setup is slightly more complex" })] }),

          new Paragraph({ children: [new PageBreak()] }),

          // Option 2
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Option 2: Render (Current Platform)", bold: true, size: 20, color: "1E293B" })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Architecture: ", bold: true }),
              new TextRun({ text: "Render Web Service (Docker) + Render Managed PostgreSQL + Appwrite Authentication." }),
            ],
          }),
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [new TextRun({ text: "Table 1.3: Render Cost Details", bold: true, size: 14, color: "475569" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Free Tier", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Paid (Production)", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Web Service" })] }),
                  new TableCell({ children: [new Paragraph({ text: "512MB RAM, spins down on idle" })] }),
                  new TableCell({ children: [new Paragraph({ text: "$7–25 / month" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "PostgreSQL" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Expires after 30 days" })] }),
                  new TableCell({ children: [new Paragraph({ text: "$7–20 / month" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Appwrite (Auth)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "75,000 MAUs free" })] }),
                  new TableCell({ children: [new Paragraph({ text: "$0 (until 75K users)" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Total Estimate", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "$0 / month (limited)", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "~$14–45 / month", bold: true, color: "0D9488" })] })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "Key Features:", bold: true, color: "0F766E" })] }),
          new Paragraph({ children: [new TextRun({ text: "✔  Extremely simple Git push-to-deploy setup" })] }),
          new Paragraph({ children: [new TextRun({ text: "✔  Includes fully managed PostgreSQL instances" })] }),
          
          new Paragraph({ spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "Considerations:", bold: true, color: "991B1B" })] }),
          new Paragraph({ children: [new TextRun({ text: "⚠  Free services spin down on idle, causing 30–60s cold start times" })] }),
          new Paragraph({ children: [new TextRun({ text: "⚠  Staging and preview environments double database costs" })] }),

          new Paragraph({ spacing: { before: 300 } }),

          // Option 3
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Option 3: Railway", bold: true, size: 20, color: "1E293B" })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Architecture: ", bold: true }),
              new TextRun({ text: "Railway Compute (Docker) + Railway PostgreSQL + Appwrite Authentication." }),
            ],
          }),
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [new TextRun({ text: "Table 1.4: Railway Cost Details", bold: true, size: 14, color: "475569" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Free Tier", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F1F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Paid (Production)", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Compute" })] }),
                  new TableCell({ children: [new Paragraph({ text: "$1 / month credit" })] }),
                  new TableCell({ children: [new Paragraph({ text: "$5–20 / month" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "PostgreSQL" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Included in credit" })] }),
                  new TableCell({ children: [new Paragraph({ text: "$5–10 / month" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Appwrite (Auth)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "75,000 MAUs free" })] }),
                  new TableCell({ children: [new Paragraph({ text: "$0 (until 75K users)" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Total Estimate", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "$1 / month", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "~$10–25 / month", bold: true, color: "0D9488" })] })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 150 } }),
          new Paragraph({ children: [new TextRun({ text: "Key Features:", bold: true, color: "0F766E" })] }),
          new Paragraph({ children: [new TextRun({ text: "✔  Fastest deployment experience, modern developer dashboard" })] }),
          new Paragraph({ children: [new TextRun({ text: "✔  Usage-based pricing (pay only for exact CPU/RAM consumed)" })] }),
          
          new Paragraph({ spacing: { before: 100 } }),
          new Paragraph({ children: [new TextRun({ text: "Considerations:", bold: true, color: "991B1B" })] }),
          new Paragraph({ children: [new TextRun({ text: "⚠  Usage billing can be unpredictable during traffic spikes" })] }),
          new Paragraph({ children: [new TextRun({ text: "⚠  Fewer global data regions compared to Google Cloud" })] }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PAGE 3: SIDE-BY-SIDE COMPARISON ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "3. Side-by-Side Comparison", bold: true, size: 26, color: "0F766E" })],
          }),

          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [new TextRun({ text: "Table 1.5: Detailed Feature and Platform Matrix", bold: true, size: 16, color: "1E293B" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Feature", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Google Cloud", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Render", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Railway", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Monthly Cost", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "$18–25 / mo" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "$14–45 / mo" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "$10–25 / mo" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Auto-scaling", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Automatic" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Manual" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Automatic" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Scale to Zero", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Yes" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Yes (free only)" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Yes" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Global Regions", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "40+ regions" })] }),
                  new TableCell({ children: [new Paragraph({ text: "5 regions" })] }),
                  new TableCell({ children: [new Paragraph({ text: "6 regions" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "SLA", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "99.95%" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "99.9%" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "99.9%" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Setup Complexity", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Medium" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Low" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Low" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Enterprise Ready", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Yes" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Growing" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "Growing" })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 400 } }),

          // Cost projections
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "4. Cost Projection (12 Months)", bold: true, size: 26, color: "0F766E" })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Platform", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Months 1–3", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Months 4–12", bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ shading: { fill: "0D9488" }, children: [new Paragraph({ children: [new TextRun({ text: "Annual Total Cost", bold: true, color: "FFFFFF" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Google Cloud", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "$0 (from credits)" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "$18–25 / month" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "$162–225", bold: true, color: "0D9488" })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Render", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "$14–25 / month" })] }),
                  new TableCell({ children: [new Paragraph({ text: "$14–45 / month" })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "$168–405", bold: true })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "Railway", bold: true })] })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "$5–10 / month" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ text: "$10–25 / month" })] }),
                  new TableCell({ shading: { fill: "F8FAFC" }, children: [new Paragraph({ children: [new TextRun({ text: "$95–240", bold: true })] })] }),
                ],
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ── PAGE 4: RECOMMENDATION & NEXT STEPS ──
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
            children: [new TextRun({ text: "5. Final Recommendations & Next Steps", bold: true, size: 26, color: "0F766E" })],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "Google Cloud Platform (Cloud Run) is officially recommended as our target hosting system because it offsets the initial 3 months using the $300 free trial credit, auto-scales seamlessly during traffic surges, and uses Google's standard enterprise infrastructure.",
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200 } }),
          new Paragraph({ children: [new TextRun({ text: "Next Steps Outline:", bold: true, color: "0F766E" })] }),
          new Paragraph({ children: [new TextRun({ text: "1.  Obtain management approval for target platform" })] }),
          new Paragraph({ children: [new TextRun({ text: "2.  Initialize Google Cloud Platform (GCP) project dashboard" })] }),
          new Paragraph({ children: [new TextRun({ text: "3.  Provision Cloud SQL instance and migrate the Supabase database" })] }),
          new Paragraph({ children: [new TextRun({ text: "4.  Enable Firebase console and configure WebApp client keys" })] }),
          new Paragraph({ children: [new TextRun({ text: "5.  Trigger Cloud Run deployment and setup custom domains / SSL" })] }),
          new Paragraph({ children: [new TextRun({ text: "6.  Monitor performance and billing console over the first 30 days" })] }),

          new Paragraph({ spacing: { before: 400 } }),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "— End of Evaluation Document —", italics: true, color: "94A3B8" }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
}

const doc = createHostingDoc();
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('c:\\Users\\Asus\\Desktop\\yoooo\\HOSTING_COMPARISON.docx', buffer);
  console.log('SUCCESS: Document written successfully!');
}).catch(err => {
  console.error('ERROR generating document:', err);
  process.exit(1);
});
