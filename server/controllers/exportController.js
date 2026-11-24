import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Export Access Control Matrix as CSV
// @route   GET /api/export/access-matrix
export const exportAccessMatrixCsv = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'Admin' } }).sort({ department: 1, name: 1 });

        const headers = [
            'Employee Name',
            'Email',
            'Department',
            'Designation',
            'Role',
            'Status',
            'Projects Access',
            'Projects Expiry',
            'Sales Access',
            'Sales Expiry',
            'Hidden Files Count',
            'Created Date',
        ];

        const rows = users.map((u) => [
            `"${u.name}"`,
            `"${u.email}"`,
            `"${u.department || 'N/A'}"`,
            `"${u.designation || 'N/A'}"`,
            `"${u.role}"`,
            `"${u.status}"`,
            u.permissions?.projects ? 'GRANTED' : 'DENIED',
            u.permissionExpiry?.projects ? new Date(u.permissionExpiry.projects).toISOString() : 'PERMANENT',
            u.permissions?.sales ? 'GRANTED' : 'DENIED',
            u.permissionExpiry?.sales ? new Date(u.permissionExpiry.sales).toISOString() : 'PERMANENT',
            u.revokedResources?.length || 0,
            new Date(u.createdAt).toISOString(),
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="AccessFlow_Compliance_Matrix.csv"');
        return res.send(csvContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export Audit Logs as CSV
// @route   GET /api/export/audit-logs
export const exportAuditLogsCsv = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(1000);

        const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Actor Role', 'Action', 'Target', 'IP Address'];
        const rows = logs.map((l) => [
            new Date(l.createdAt).toISOString(),
            `"${l.actor?.name || 'System'}"`,
            `"${l.actor?.email || ''}"`,
            `"${l.actor?.role || ''}"`,
            `"${l.action}"`,
            `"${l.target?.name || l.target?.resourceTitle || 'N/A'}"`,
            `"${l.ipAddress || '127.0.0.1'}"`,
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="AccessFlow_Audit_Logs.csv"');
        return res.send(csvContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};