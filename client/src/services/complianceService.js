import API from './api';

// Audit Logs
export const getAuditLogs = async (params) => {
    const res = await API.get('/audit-logs', { params });
    return res.data;
};

// Notifications
export const getMyNotifications = async () => {
    const res = await API.get('/notifications');
    return res.data;
};

export const markNotificationRead = async (id) => {
    const res = await API.patch(`/notifications/${id}/read`);
    return res.data;
};

export const markAllNotificationsRead = async () => {
    const res = await API.patch('/notifications/read-all');
    return res.data;
};

// Download CSVs with automatic authentication and instant browser trigger
export const downloadAccessMatrixCsv = async () => {
    try {
        const res = await API.get('/export/access-matrix', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'AccessFlow_Compliance_Matrix.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to export matrix:', err);
        alert('Failed to download compliance matrix');
    }
};

export const downloadAuditLogsCsv = async () => {
    try {
        const res = await API.get('/export/audit-logs', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'AccessFlow_Audit_Logs.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to export audit logs:', err);
        alert('Failed to download audit logs');
    }
};