import api from './api';

export interface Notification {
    id: number;
    sender: { username: string; avatar?: string };
    notification_type: string;
    path: number; // Path ID
    message: string;
    is_read: boolean;
    created_at: string;
}

export const notificationService = {
    getAll: async (): Promise<Notification[]> => {
        const response = await api.get('/notifications/');
        // Handle pagination if your backend sends { results: [] }
        return Array.isArray(response.data) ? response.data : response.data.results;
    },
    
    markAsRead: async (id: number) => {
        await api.post(`/notifications/${id}/mark_read/`);
    },
    
    markAllAsRead: async () => {
        await api.post(`/notifications/mark_all_read/`);
    }
};