import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Issue API calls
export const issueApi = {
    getAll: (params) => api.get('/issues', { params }),
    getById: (id) => api.get(`/issues/${id}`),
    create: (data) => api.post('/issues', data),
    update: (id, data) => api.put(`/issues/${id}`, data),
    updateStatus: (id, data) => api.put(`/issues/${id}/status`, data),
    delete: (id) => api.delete(`/issues/${id}`),
    addComment: (id, text) => api.post(`/issues/${id}/comments`, { text })
};

// Stats API calls
export const statsApi = {
    getDashboard: () => api.get('/stats'),
    getAdmin: () => api.get('/stats/admin')
};

// Upload API calls
export const uploadApi = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    deleteImage: (publicId) => api.delete(`/upload/${publicId}`)
};

export default api;
