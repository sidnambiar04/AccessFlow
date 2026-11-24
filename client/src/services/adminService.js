import API from './api';

export const getDashboardStats = async () => {
    const response = await API.get('/admin/dashboard/stats');
    return response.data;
};

export const getRegistrationRequests = async (status) => {
    const response = await API.get('/admin/requests', { params: { status } });
    return response.data;
};

export const approveRequest = async (id, data) => {
    const response = await API.patch(`/admin/requests/${id}/approve`, data);
    return response.data;
};

export const rejectRequest = async (id) => {
    const response = await API.patch(`/admin/requests/${id}/reject`);
    return response.data;
};

export const getEmployees = async (params) => {
    const response = await API.get('/admin/users', { params });
    return response.data;
};

export const updateEmployeeRole = async (id, role) => {
    const response = await API.patch(`/admin/users/${id}/role`, { role });
    return response.data;
};

export const updateEmployeePermissions = async (id, permissions) => {
    const response = await API.patch(`/admin/users/${id}/permissions`, permissions);
    return response.data;
};

export const updateEmployeeStatus = async (id, status) => {
    const response = await API.patch(`/admin/users/${id}/status`, { status });
    return response.data;
};

export const getUserFileAccess = async (id) => {
    const response = await API.get(`/admin/users/${id}/file-access`);
    return response.data;
};

export const updateUserFileAccess = async (id, revokedResources, fileExpiry) => {
    const response = await API.patch(`/admin/users/${id}/file-access`, { revokedResources, fileExpiry });
    return response.data;
};