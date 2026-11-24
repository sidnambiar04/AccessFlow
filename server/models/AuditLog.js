import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        actor: {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String, required: true },
            email: { type: String, required: true },
            role: { type: String, required: true },
        },
        action: {
            type: String,
            required: true,
            enum: [
                'USER_LOGIN',
                'USER_REGISTERED',
                'ONBOARDING_APPROVED',
                'ONBOARDING_REJECTED',
                'ROLE_UPDATED',
                'PERMISSIONS_UPDATED',
                'FILE_ACCESS_UPDATED',
                'ACCESS_REQUEST_SUBMITTED',
                'ACCESS_REQUEST_APPROVED',
                'ACCESS_REQUEST_DENIED',
                'USER_STATUS_UPDATED',
                'RESOURCE_UPLOADED',
                'RESOURCE_DELETED',
            ],
        },
        target: {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String },
            email: { type: String },
            resourceTitle: { type: String },
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ipAddress: {
            type: String,
            default: '127.0.0.1',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('AuditLog', auditLogSchema);