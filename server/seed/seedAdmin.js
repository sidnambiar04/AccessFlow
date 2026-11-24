import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Resource from '../models/Resource.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' Connected to MongoDB for seeding...');

        // 1. Reset / recreate Admin with pre-hashed password to avoid any ambiguity
        await User.deleteOne({ email: 'admin@accessflow.com' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('AdminPassword123!', salt);

        const adminUser = await User.create({
            name: 'System Admin',
            email: 'admin@accessflow.com',
            password: hashedPassword,
            department: 'Information Technology',
            designation: 'Lead Administrator',
            role: 'Admin',
            status: 'approved',
            permissions: {
                projects: true,
                sales: true,
            },
        });
        console.log(' Initial Admin account created successfully:');
        console.log('   Email:    admin@accessflow.com');
        console.log('   Password: AdminPassword123!');

        // 2. Seed / refresh demo resources with local PDF files
        await Resource.deleteMany({});
        await Resource.insertMany([
            {
                title: 'Project Northstar Status Report',
                description: 'Key deliverables, phase status, team metrics, and milestone tracker.',
                section: 'projects',
                category: 'Project Reports',
                fileUrl: '/uploads/01_Project_Northstar_Status_Report.pdf',
                uploadedBy: adminUser._id,
            },
            {
                title: 'Project Northstar Solution Architecture',
                description: 'End-to-end cloud infrastructure, API gateway, microservices, and database models.',
                section: 'projects',
                category: 'System Architecture',
                fileUrl: '/uploads/02_Project_Northstar_Solution_Architecture.pdf',
                uploadedBy: adminUser._id,
            },
            {
                title: 'Q4 2026 Sales Performance Report',
                description: 'Executive quarterly review, regional performance breakdown, and quota attainment.',
                section: 'sales',
                category: 'Monthly Sales Reports',
                fileUrl: '/uploads/03_Q4_2026_Sales_Performance_Report.pdf',
                uploadedBy: adminUser._id,
            },
            {
                title: 'Revenue Outlook & Deals Register',
                description: 'Pipeline stage breakdown, ARR growth projections, and enterprise client prospects.',
                section: 'sales',
                category: 'Revenue Analytics',
                fileUrl: '/uploads/04_Revenue_Outlook_and_Deals_Register.pdf',
                uploadedBy: adminUser._id,
            },
        ]);
        console.log(' Seeded demo project & sales resources with uploaded PDF documents.');

        console.log(' Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error(' Error during seeding:', error.message);
        process.exit(1);
    }
};

seedData();