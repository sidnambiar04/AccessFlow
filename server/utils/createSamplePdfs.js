import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to generate a minimal valid PDF with visible text
function createSimplePdf(title, subtitle, bullets = []) {
  const contentLines = [
    `BT`,
    `/F1 22 Tf`,
    `50 720 Td`,
    `(${title}) Tj`,
    `ET`,
    `BT`,
    `/F1 12 Tf`,
    `50 685 Td`,
    `(${subtitle}) Tj`,
    `ET`,
    `BT`,
    `/F1 10 Tf`,
    `50 650 Td`,
    `(-------------------------------------------------------------------------------------------------) Tj`,
    `ET`,
  ];

  let y = 620;
  bullets.forEach((bullet) => {
    contentLines.push(`BT /F1 11 Tf 50 ${y} Td (${bullet}) Tj ET`);
    y -= 25;
  });

  const streamContent = contentLines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
385
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

export function generatePdfs() {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const docs = [
    {
      filename: 'System_Architecture_Diagram.pdf',
      title: 'AccessFlow - System Architecture & Cloud Migration',
      subtitle: 'Technical Design Specification - Document ID: ARCH-2026-Q1',
      bullets: [
        '1. Architecture Overview: Decoupled MERN stack micro-services with Vite React frontend.',
        '2. Security Layer: JWT authentication with on-demand MongoDB permissions validation.',
        '3. Database Design: MongoDB Atlas multi-region cluster with optimized compound indices.',
        '4. Section Isolation: Independent authorization middleware enforcing projects/sales gates.',
        '5. File Storage Strategy: Local static development directory transitioning to S3/GCS.',
      ],
    },
    {
      filename: 'Sprint_Milestone_Progress.pdf',
      title: 'Engineering Sprint 24 Velocity & Milestones',
      subtitle: 'Deliverables and Quality Assurance Summary - Q1 2026',
      bullets: [
        '1. Sprint Goal: Deliver Employee Onboarding and Access Management Portal.',
        '2. Velocity: Completed 42 of 42 allocated story points (100% completion rate).',
        '3. Feature Deliverables: Dynamic permission matrix, route guards, and in-app document viewer.',
        '4. Bug Fixes: Fixed Mongoose pre-save async hooks and Atlas cluster namespace routing.',
        '5. QA Status: Passed zero-defect signoff criteria for employee role separation.',
      ],
    },
    {
      filename: 'Q4_Revenue_Analytics.pdf',
      title: 'Q4 Enterprise Revenue & Financial Analytics',
      subtitle: 'Executive Summary & ARR Growth Report (Demo Data)',
      bullets: [
        '1. Total Q4 Net New ARR: $1,240,000 (Target surpassed by 14%).',
        '2. Annual Run Rate: $4,200,000 ending fiscal year 2026.',
        '3. Enterprise Expansion: 18 key enterprise logos added in engineering and manufacturing.',
        '4. Retention Metric: Net Revenue Retention (NRR) stood at 118%.',
        '5. Forecast for Q1: Projected ARR growth trajectory of 22% quarter-over-quarter.',
      ],
    },
    {
      filename: 'Sales_Targets_2026.pdf',
      title: '2026 Global Enterprise Quota & Sales Targets',
      subtitle: 'Regional Targets, Pipeline Distribution & Compensation Goals (Demo Data)',
      bullets: [
        '1. North America Enterprise Quota: $2,800,000 across 4 enterprise sales directors.',
        '2. APAC & EMEA Expansion Target: $1,400,000 targeting mid-market cloud accounts.',
        '3. Average Deal Size: $65,000 ACV with average sales cycle of 45 days.',
        '4. Commission Tier: 120% accelerator upon achievement of quarterly pipeline milestones.',
        '5. Lead Conversion Funnel: Target 28% SQL to Closed-Won conversion rate.',
      ],
    },
  ];

  docs.forEach((doc) => {
    const pdfBuf = createSimplePdf(doc.title, doc.subtitle, doc.bullets);
    const dest = path.join(uploadsDir, doc.filename);
    fs.writeFileSync(dest, pdfBuf);
    console.log(` Created sample PDF: ${dest}`);
  });
}

generatePdfs();
