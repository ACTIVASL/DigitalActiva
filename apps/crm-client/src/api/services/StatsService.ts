import { getAuth } from 'firebase/auth';
import { app } from '@monorepo/engine-auth';

const API_URL = import.meta.env.VITE_API_URL;

// API_URL is read from environment; if undefined, API calls will fail at runtime

export const StatsService = {
  getDashboardStats: async () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const token = await user.getIdToken();
    const response = await fetch(`${API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
};
