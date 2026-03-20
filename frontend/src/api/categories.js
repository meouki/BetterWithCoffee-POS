const API_URL = import.meta.env.VITE_API_URL || '';

export const categoriesApi = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/api/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },
    create: async (data) => {
        const res = await fetch(`${API_URL}/api/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to create category');
        }
        return res.json();
    },
    update: async (id, data) => {
        const res = await fetch(`${API_URL}/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update category');
        return res.json();
    },
    delete: async (id) => {
        const res = await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to delete category');
        }
        return true;
    }
};
