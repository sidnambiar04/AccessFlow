import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide a title'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        section: {
            type: String,
            enum: ['projects', 'sales'],
            required: [true, 'Section is required (projects or sales)'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        fileUrl: {
            type: String,
            default: '',
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;