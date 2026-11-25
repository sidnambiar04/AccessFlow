import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const employees = [
    // --- 10 Developers (Engineering) ---
    {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@accessflow.com',
        department: 'Engineering',
        designation: 'Senior Frontend Engineer',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },
    {
        name: 'Priya Patel',
        email: 'priya.patel@accessflow.com',
        department: 'Engineering',
        designation: 'Backend Tech Lead',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },
    {
        name: 'Rohan Mehta',
        email: 'rohan.mehta@accessflow.com',
        department: 'Engineering',
        designation: 'Full Stack Engineer',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },
    {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@accessflow.com',
        department: 'DevOps & Cloud',
        designation: 'DevOps Engineer',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },
    {
        name: 'Vikram Joshi',
        email: 'vikram.joshi@accessflow.com',
        department: 'Engineering',
        designation: 'Cloud Solutions Architect',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },
    {
        name: 'Sneha Rao',
        email: 'sneha.rao@accessflow.com',
        department: 'Quality Assurance',
        designation: 'QA Automation Lead',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },
    {
        name: 'Karan Malhotra',
        email: 'karan.malhotra@accessflow.com',
        department: 'Security',
        designation: 'Application Security Engineer',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },
    {
        name: 'Divya Nair',
        email: 'divya.nair@accessflow.com',
        department: 'Data & Analytics',
        designation: 'Data Platform Engineer',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },
    {
        name: 'Arjun Verma',
        email: 'arjun.verma@accessflow.com',
        department: 'Engineering',
        designation: 'Mobile App Developer',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },
    {
        name: 'Tanvi Deshmukh',
        email: 'tanvi.deshmukh@accessflow.com',
        department: 'Engineering',
        designation: 'Junior Software Engineer',
        role: 'Developer',
        status: 'approved',
        permissions: { projects: true, sales: false },
    },

    // --- 8 Sales & Revenue ---
    {
        name: 'Rahul Kapoor',
        email: 'rahul.kapoor@accessflow.com',
        department: 'Sales',
        designation: 'Enterprise Account Executive',
        role: 'Sales',
        status: 'approved',
        permissions: { projects: false, sales: true },
    },
    {
        name: 'Meera Nambiar',
        email: 'meera.nambiar@accessflow.com',
        department: 'Sales',
        designation: 'Regional Sales Director',
        role: 'Sales',
        status: 'approved',
        permissions: { projects: false, sales: true },
    },
    {
        name: 'Siddharth Menon',
        email: 'siddharth.menon@accessflow.com',
        department: 'Business Development',
        designation: 'B2B Sales Specialist',
        role: 'Sales',
        status: 'approved',
        permissions: { projects: false, sales: true },
    },
    {
        name: 'Kavita Pillai',
        email: 'kavita.pillai@accessflow.com',
        department: 'Customer Success',
        designation: 'Customer Success Manager',
        role: 'Sales',
        status: 'approved',
        permissions: { projects: false, sales: true },
    },
    {
        name: 'Nikhil Agarwal',
        email: 'nikhil.agarwal@accessflow.com',
        department: 'Sales',
        designation: 'Sales Operations Lead',
        role: 'Sales',
        status: 'approved',
        permissions: { projects: false, sales: true },
    },
    {
        name: 'Pooja Hegde',
        email: 'pooja.hegde@accessflow.com',
        department: 'Sales',
        designation: 'Inside Sales Representative',
        role: 'Sales',
        status: 'approved',
        permissions: { projects: false, sales: true },
    },
    {
        name: 'Aditya Kulkarni',
        email: 'aditya.kulkarni@accessflow.com',
        department: 'Partnerships',
        designation: 'Strategic Alliances Manager',
        role: 'Sales',
        status: 'approved',
        permissions: { projects: false, sales: true },
    },
    {
        name: 'Ritu Sen',
        email: 'ritu.sen@accessflow.com',
        department: 'Sales',
        designation: 'Account Manager',
        role: 'Sales',
        status: 'approved',
        permissions: { projects: false, sales: true },
    },

    // --- 2 Pending Applicants (Perfect to test/demo the Admin Approval Queue!) ---
    {
        name: 'Kabir Das',
        email: 'kabir.das@accessflow.com',
        department: 'Engineering',
        designation: 'Frontend Intern',
        role: 'Developer',
        status: 'pending',
        permissions: { projects: false, sales: false },
    },
    {
        name: 'Simran Kaur',
        email: 'simran.kaur@accessflow.com',
        department: 'Marketing & Sales',
        designation: 'Sales Associate',
        role: 'Sales',
        status: 'pending',
        permissions: { projects: false, sales: false },
    },
];

const seedEmployees = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(' Connected to MongoDB Atlas...');

        const salt = await bcrypt.genSalt(10);
        const defaultPasswordHash = await bcrypt.hash('Employee123!', salt);

        let createdCount = 0;
        let updatedCount = 0;

        for (const emp of employees) {
            const existing = await User.findOne({ email: emp.email });
            if (existing) {
                // Update properties
                existing.name = emp.name;
                existing.department = emp.department;
                existing.designation = emp.designation;
                existing.role = emp.role;
                existing.status = emp.status;
                existing.permissions = emp.permissions;
                existing.password = defaultPasswordHash;
                await existing.save();
                updatedCount++;
            } else {
                await User.create({
                    ...emp,
                    password: defaultPasswordHash,
                });
                createdCount++;
            }
        }

        console.log(`\n Successfully seeded employees:`);
        console.log(`   - Newly Created: ${createdCount}`);
        console.log(`   - Updated Existing: ${updatedCount}`);
        console.log(`   - Default Password: Employee123!`);
        console.log(`   - Total Employees: ${employees.length}`);

        process.exit(0);
    } catch (error) {
        console.error(' Error seeding employees:', error.message);
        process.exit(1);
    }
};

seedEmployees();
