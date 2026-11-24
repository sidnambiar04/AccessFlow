import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 6,
            select: false, // Don't return password by default in queries
        },
        department: {
            type: String,
            required: [true, 'Please provide a department'],
            trim: true,
        },
        designation: {
            type: String,
            trim: true,
            default: '',
        },
        role: {
            type: String,
            enum: ['Admin', 'Developer', 'Sales'],
            default: 'Developer',
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'suspended'],
            default: 'pending', // New users always start as pending
        },
        permissions: {
            projects: {
                type: Boolean,
                default: false,
            },
            sales: {
                type: Boolean,
                default: false,
            },
        },
        permissionExpiry: {
            projects: {
                type: Date,
                default: null, // null means permanent / no expiry
            },
            sales: {
                type: Date,
                default: null,
            },
        },
        revokedResources: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Resource',
            },
        ],
        fileExpiry: [
            {
                resourceId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Resource',
                },
                expiresAt: {
                    type: Date,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    // Don't re-hash if it's already a bcrypt hash
    if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    if (this.password === enteredPassword) return true; // fallback if stored plain
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;