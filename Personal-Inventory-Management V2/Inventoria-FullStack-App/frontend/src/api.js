const API_BASE_URL = 'http://localhost:8080/api';

function getToken() {
    return localStorage.getItem('inventoria_token');
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleResponse(response) {
    if (!response.ok) {
        return response.json().then((data) => {
            const error = data?.message || data?.error || 'Unexpected error';
            return Promise.reject(new Error(error));
        });
    }
    return response.json();
}

export function registerUser(payload) {
    return fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(handleResponse);
}

export function loginUser(payload) {
    return fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(handleResponse);
}

export function fetchItems(search, category, sortBy, sortOrder) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    return fetch(`${API_BASE_URL}/items?${params.toString()}`, {
        headers: { ...authHeaders() },
    }).then(handleResponse);
}

export function createItem(payload) {
    return fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
            ...authHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then(handleResponse);
}

export function updateItem(itemId, payload) {
    return fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'PUT',
        headers: {
            ...authHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then(handleResponse);
}

export function deleteItem(itemId) {
    return fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
    }).then(handleResponse);
}

export function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            ...authHeaders(),
        },
        body: formData,
    }).then(handleResponse);
}
