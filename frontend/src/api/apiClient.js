/**
 * Central API Client for PulsePoint
 * Handles automatic attachment of Session IDs and 401 Unauthorized handling.
 */

const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthHeaders = () => {
    try {
        const saved = localStorage.getItem('bwc_user');
        if (!saved) return {};
        const user = JSON.parse(saved);
        return {
            'x-user-id': user.id,
            'x-session-id': user.session_id
        };
    } catch (e) {
        return {};
    }
};

export const apiClient = {
    async fetch(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
        
        const headers = {
            ...getAuthHeaders(),
            ...(options.headers || {})
        };

        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            // Check if we actually have a session to clear
            const hasSavedUser = !!localStorage.getItem('bwc_user');
            
            if (hasSavedUser) {
                console.warn(`[apiClient] 401 Unauthorized for ${endpoint}. Dispatching auth error event.`);
                // Dispatch a custom event that AuthContext can listen to
                window.dispatchEvent(new CustomEvent('pulsepoint-auth-error', { 
                    detail: { message: 'Session invalidated or expired.' } 
                }));
            }

            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return response;
    },

    async get(endpoint) {
        return this.fetch(endpoint, { method: 'GET' });
    },

    async post(endpoint, body) {
        return this.fetch(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    },

    async patch(endpoint, body) {
        return this.fetch(endpoint, {
            method: 'PATCH',
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    },

    async delete(endpoint) {
        return this.fetch(endpoint, { method: 'DELETE' });
    }
};
