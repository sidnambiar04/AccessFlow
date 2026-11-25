import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const projectResources = [
    {
        title: 'Project Northstar Solution Architecture',
        description: 'End-to-end cloud infrastructure, microservices, and database models.',
        section: 'projects',
        category: 'System Architecture',
        fileUrl: '/uploads/projects/Project_Northstar_Solution_Architecture.pdf',
    },
    {
        title: 'Project Northstar Status Report',
        description: 'Key deliverables, sprint status, team metrics, and milestone tracker.',
        section: 'projects',
        category: 'Project Reports',
        fileUrl: '/uploads/projects/Project_Northstar_Status_Report.pdf',
    },
    {
        title: 'Project Overview Charter',
        description: 'Scope, executive sponsorship, core objectives, and team governance.',
        section: 'projects',
        category: 'Project Documentation',
        fileUrl: '/uploads/projects/Project_Overview_Charter.pdf',
    },
    {
        title: 'Project Progress Report',
        description: 'Bi-weekly sprint progress, velocity charts, and burndown analytics.',
        section: 'projects',
        category: 'Project Reports',
        fileUrl: '/uploads/projects/Project_Progress_Report.pdf',
    },
    {
        title: 'Release Roadmap & Milestones',
        description: 'Quarterly product release timeline, major gate reviews, and target launches.',
        section: 'projects',
        category: 'Roadmap & Planning',
        fileUrl: '/uploads/projects/Release_Roadmap_Milestones.pdf',
    },
    {
        title: 'System Architecture Document',
        description: 'Detailed technical architecture, security perimeter, and API gateways.',
        section: 'projects',
        category: 'System Architecture',
        fileUrl: '/uploads/projects/System_Architecture_Document.pdf',
    },
    {
        title: 'Technical Documentation & API Reference',
        description: 'Comprehensive REST API endpoints, payload contracts, and error schemas.',
        section: 'projects',
        category: 'Technical Documentation',
        fileUrl: '/uploads/projects/Technical_Documentation_API_Reference.pdf',
    },
];

const salesResources = [
    {
        title: 'Client & Lead Information Directory',
        description: 'Qualified B2B enterprise leads, prospect company sizes, and POC contacts.',
        section: 'sales',
        category: 'Lead Management',
        fileUrl: '/uploads/sales/Client_and_Lead_Information.pdf',
    },
    {
        title: 'Monthly Sales Report - October 2026',
        description: 'Monthly quota attainment, regional revenue numbers, and customer conversions.',
        section: 'sales',
        category: 'Monthly Sales Reports',
        fileUrl: '/uploads/sales/Monthly_Sales_Report_Oct2026.pdf',
    },
    {
        title: 'Q3 Sales Report',
        description: 'Third-quarter revenue performance, deal velocity, and team benchmarks.',
        section: 'sales',
        category: 'Quarterly Reviews',
        fileUrl: '/uploads/sales/Q3_Sales_Report.pdf',
    },
    {
        title: 'Q4 2026 Sales Performance Report',
        description: 'Quarterly enterprise sales KPIs, top performers, and ARR expansion.',
        section: 'sales',
        category: 'Quarterly Reviews',
        fileUrl: '/uploads/sales/Q4_2026_Sales_Performance_Report.pdf',
    },
    {
        title: 'Revenue & Deals Report',
        description: 'Closed-won contracts, pipeline probability weighting, and win rates.',
        section: 'sales',
        category: 'Revenue Analytics',
        fileUrl: '/uploads/sales/Revenue_and_Deals_Report.pdf',
    },
    {
        title: 'Revenue Outlook & Deals Register',
        description: 'Forward-looking revenue forecast, contract renewal pipeline, and deal sizes.',
        section: 'sales',
        category: 'Revenue Analytics',
        fileUrl: '/uploads/sales/Revenue_Outlook_and_Deals_Register.pdf',
    },
    {
        title: 'Sales Performance Analytics',
        description: 'Deep-dive conversion metrics, CAC-to-LTV ratios, and cycle times.',
        section: 'sales',
        category: 'Sales Analytics',
        fileUrl: '/uploads/sales/Sales_Performance_Analytics.pdf',
    },
];

const seedResources = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' Connected to MongoDB Atlas...');

        const admin = await User.findOne({ email: 'admin@accessflow.com' });
        const adminId = admin ? admin._id : null;

        // Reset resources
        await Resource.deleteMany({});

        const allResources = [
            ...projectResources.map((r) => ({ ...r, uploadedBy: adminId })),
            ...salesResources.map((r) => ({ ...r, uploadedBy: adminId })),
        ];

        const inserted = await Resource.insertMany(allResources);
        console.log(` Successfully seeded ${inserted.length} enterprise PDF resources:`);
        console.log(`   - 7 Project Resources in /uploads/projects/`);
        console.log(`   - 7 Sales Resources in /uploads/sales/`);

        process.exit(0);
    } catch (err) {
        console.error(' Error seeding resources:', err.message);
        process.exit(1);
    }
};

seedResources();
