const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const usersApi = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/api/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    login: async (username, password) => {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    create: async (userData) => {
        const response = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create user');
        return data;
    },

    update: async (id, updates) => {
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update user');
        return data;
    },

    delete: async (id) => {
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete user');
        }
        return true;
    }
};
