import API from './api';

export const getProjectResources = async () => {
    const response = await API.get('/projects');
    return response.data;
};

export const createProjectResource = async (data) => {
    const response = await API.post('/projects', data);
    return response.data;
};

export const updateProjectResource = async (id, data) => {
    const response = await API.put(`/projects/${id}`, data);
    return response.data;
};

export const deleteProjectResource = async (id) => {
    const response = await API.delete(`/projects/${id}`);
    return response.data;
};

export const getSalesResources = async () => {
    const response = await API.get('/sales');
    return response.data;
};

export const createSalesResource = async (data) => {
    const response = await API.post('/sales', data);
    return response.data;
};

export const updateSalesResource = async (id, data) => {
    const response = await API.put(`/sales/${id}`, data);
    return response.data;
};

export const deleteSalesResource = async (id) => {
    const response = await API.delete(`/sales/${id}`);
    return response.data;
};

export const getEmployeeDashboardData = async () => {
    const response = await API.get('/dashboard');
    return response.data;
};