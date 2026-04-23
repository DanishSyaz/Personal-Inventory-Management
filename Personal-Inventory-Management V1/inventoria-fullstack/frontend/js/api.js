// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API utility functions
const api = {
    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('authToken');
    },

    // Set auth token
    setToken(token) {
        localStorage.setItem('authToken', token);
    },

    // Remove auth token
    removeToken() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },

    // Get headers with auth token
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth && this.getToken()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }
        
        return headers;
    },

    // Generic API call function
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.auth !== false),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth endpoints
    auth: {
        async register(username, email, password) {
            const data = await api.request('/auth/register', {
                method: 'POST',
                auth: false,
                body: JSON.stringify({ username, email, password })
            });
            
            api.setToken(data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('email', data.email);
            return data;
        },

        async login(username, password) {
            const data = await api.request('/auth/login', {
                method: 'POST',
                auth: false,
                body: JSON.stringify({ username, password })
            });
            
            api.setToken(data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('email', data.email);
            return data;
        },

        logout() {
            api.removeToken();
            window.location.href = '/pages/login.html';
        }
    },

    // Inventory endpoints
    inventory: {
        async getAll() {
            return await api.request('/inventory');
        },

        async getById(id) {
            return await api.request(`/inventory/${id}`);
        },

        async create(itemData) {
            return await api.request('/inventory', {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
        },

        async update(id, itemData) {
            return await api.request(`/inventory/${id}`, {
                method: 'PUT',
                body: JSON.stringify(itemData)
            });
        },

        async delete(id) {
            return await api.request(`/inventory/${id}`, {
                method: 'DELETE'
            });
        },

        async search(query) {
            return await api.request(`/inventory/search?query=${encodeURIComponent(query)}`);
        },

        async getLowStock() {
            return await api.request('/inventory/low-stock');
        },

        async updateStock(id, quantity) {
            return await api.request(`/inventory/${id}/stock`, {
                method: 'PATCH',
                body: JSON.stringify({ quantity })
            });
        }
    },

    // File upload
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return await response.json();
    }
};

// Check authentication on protected pages
function requireAuth() {
    if (!api.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return false;
    }
    return true;
}
