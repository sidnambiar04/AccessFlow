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

        // 2. Seed initial demo resources
        const existingResources = await Resource.countDocuments();
        if (existingResources === 0) {
                await Resource.insertMany([
                    {
                        title: 'Q1 System Architecture & Cloud Migration',
                        description: 'Microservices roadmap and MongoDB cluster setup guide.',
                        section: 'projects',
                        category: 'System Architecture',
                        fileUrl: 'https://example.com/docs/arch-v1.pdf',
                        uploadedBy: adminUser._id,
                    },
                    {
                        title: 'Sprint 24 Milestone Progress',
                        description: 'Engineering sprint velocity and deliverables tracking.',
                        section: 'projects',
                        category: 'Project Progress',
                        fileUrl: 'https://example.com/docs/sprint-24.pdf',
                        uploadedBy: adminUser._id,
                    },
                    {
                        title: 'Q4 Enterprise Revenue & Forecast',
                        description: 'Quarterly breakdown of ARR and closed-won contracts (Demo Data).',
                        section: 'sales',
                        category: 'Revenue Analytics',
                        fileUrl: 'https://example.com/docs/revenue-q4.pdf',
                        uploadedBy: adminUser._id,
                    },
                    {
                        title: '2026 Enterprise Pipeline & Targets',
                        description: 'Target accounts and sales quota targets by region (Demo Data).',
                        section: 'sales',
                        category: 'Sales Targets',
                        fileUrl: 'https://example.com/docs/sales-targets-2026.pdf',
                        uploadedBy: adminUser._id,
                    },
                ]);
                console.log(' Seeded demo project & sales resources.');
            }

        console.log(' Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error(' Error during seeding:', error.message);
        process.exit(1);
    }
};

seedData();