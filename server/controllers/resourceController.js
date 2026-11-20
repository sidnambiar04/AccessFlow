import Resource from '../models/Resource.js';

// --- PROJECT RESOURCES ---

// @desc    Get all project resources (Requires 'projects' permission or Admin)
// @route   GET /api/projects
export const getProjects = async (req, res) => {
    try {
        const resources = await Resource.find({ section: 'projects' })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create project resource (Admin only)
// @route   POST /api/projects
export const createProject = async (req, res) => {
    try {
        const { title, description, category, fileUrl } = req.body;
        const resource = await Resource.create({
            title,
            description,
            section: 'projects',
            category,
            fileUrl: fileUrl || '',
            uploadedBy: req.user._id,
        });
        res.status(201).json({ success: true, data: resource });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update project resource (Admin only)
// @route   PUT /api/projects/:id
export const updateProject = async (req, res) => {
    try {
        const resource = await Resource.findOneAndUpdate(
            { _id: req.params.id, section: 'projects' },
            req.body,
            { new: true, runValidators: true }
        );
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json({ success: true, data: resource });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete project resource (Admin only)
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
    try {
        const resource = await Resource.findOneAndDelete({ _id: req.params.id, section: 'projects' });
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- SALES RESOURCES ---

// @desc    Get all sales resources (Requires 'sales' permission or Admin)
// @route   GET /api/sales
export const getSales = async (req, res) => {
    try {
        const resources = await Resource.find({ section: 'sales' })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: resources.length, data: resources });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create sales resource (Admin only)
// @route   POST /api/sales
export const createSales = async (req, res) => {
    try {
        const { title, description, category, fileUrl } = req.body;
        const resource = await Resource.create({
            title,
            description,
            section: 'sales',
            category,
            fileUrl: fileUrl || '',
            uploadedBy: req.user._id,
        });
        res.status(201).json({ success: true, data: resource });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update sales resource (Admin only)
// @route   PUT /api/sales/:id
export const updateSales = async (req, res) => {
    try {
        const resource = await Resource.findOneAndUpdate(
            { _id: req.params.id, section: 'sales' },
            req.body,
            { new: true, runValidators: true }
        );
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json({ success: true, data: resource });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete sales resource (Admin only)
// @route   DELETE /api/sales/:id
export const deleteSales = async (req, res) => {
    try {
        const resource = await Resource.findOneAndDelete({ _id: req.params.id, section: 'sales' });
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- EMPLOYEE DASHBOARD ---

// @desc    Get employee dashboard view (based on permissions)
// @route   GET /api/dashboard
export const getEmployeeDashboard = async (req, res) => {
    try {
        const sections = [];
        if (req.user.role === 'Admin' || req.user.permissions?.projects) sections.push('projects');
        if (req.user.role === 'Admin' || req.user.permissions?.sales) sections.push('sales');

        // Fetch recent resources matching allowed sections
        const recentResources = await Resource.find({ section: { $in: sections } })
            .sort({ createdAt: -1 })
            .limit(6);

        res.json({
            success: true,
            data: {
                accessibleSections: sections,
                recentResources,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};