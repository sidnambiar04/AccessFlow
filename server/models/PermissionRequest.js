import mongoose from 'mongoose';

const permissionRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        section: {
            type: String,
            enum: ['projects', 'sales'],
            required: true,
        },
        justification: {
            type: String,
            required: [true, 'Please provide a business justification'],
            trim: true,
        },
        duration: {
            type: String,
            enum: ['5m', '24h', '7d', '30d', 'Permanent'],
            default: 'Permanent',
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        adminComment: {
            type: String,
            default: '',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('PermissionRequest', permissionRequestSchema);