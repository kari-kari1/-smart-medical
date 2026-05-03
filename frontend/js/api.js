// ========== API Service ==========

const API_BASE = 'http://127.0.0.1:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach JWT token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.hash !== '#/login') {
                window.location.hash = '#/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Patient API
const patientApi = {
    getAll: () => api.get('/patients'),
    get: (username) => api.get(`/patients/${username}`),
    update: (username, data) => api.put(`/patients/${username}`, data),
};

// Doctor API
const doctorApi = {
    getAll: () => api.get('/doctors'),
    getByDepartment: (dept) => api.get(`/doctors/department/${dept}`),
    get: (username) => api.get(`/doctors/${username}`),
    update: (username, data) => api.put(`/doctors/${username}`, data),
    checkin: (username, data) => api.post(`/doctors/${username}/checkin`, data),
};

// Registration API
const registrationApi = {
    getAll: () => api.get('/registrations'),
    create: (data) => api.post('/registrations', data),
    getByPatient: (username) => api.get(`/registrations/patient/${username}`),
    getByDoctor: (username) => api.get(`/registrations/doctor/${username}`),
    update: (id, data) => api.put(`/registrations/${id}`, data),
    delete: (id) => api.delete(`/registrations/${id}`),
};

// Prescription API
const prescriptionApi = {
    getAll: () => api.get('/prescriptions'),
    create: (data) => api.post('/prescriptions', data),
    getByPatient: (username) => api.get(`/prescriptions/patient/${username}`),
    getByDoctor: (username) => api.get(`/prescriptions/doctor/${username}`),
    update: (id, data) => api.put(`/prescriptions/${id}`, data),
    delete: (id) => api.delete(`/prescriptions/${id}`),
};

// Opinion API
const opinionApi = {
    create: (data) => api.post('/opinions', data),
    getByDoctor: (username) => api.get(`/opinions/doctor/${username}`),
    getByPatient: (username) => api.get(`/opinions/patient/${username}`),
    delete: (id) => api.delete(`/opinions/${id}`),
};

// Health API
const healthApi = {
    get: (username) => api.get(`/health/${username}`),
    create: (data) => api.post('/health', data),
    update: (username, data) => api.put(`/health/${username}`, data),
};
