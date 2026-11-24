import API from './api';

export const createPermissionRequest = async (data) => {
    const res = await API.post('/permission-requests', data);
    return res.data;
};

export const getMyPermissionRequests = async () => {
    const res = await API.get('/permission-requests/my');
    return res.data;
};

export const getAllPermissionRequests = async (status) => {
    const res = await API.get('/permission-requests', { params: { status } });
    return res.data;
};

export const reviewPermissionRequest = async (id, data) => {
    const res = await API.patch(`/permission-requests/${id}/review`, data);
    return res.data;
};