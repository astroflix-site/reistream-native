import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Episode, Series } from '../types/content';

const API_BASE_URL = 'https://astro-flix.netlify.app/api';
const TOKEN_KEY = '@reistream_token';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to add the token to headers
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    if (response.data.token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
    }
    return response.data;
};

export const registerUser = async (userData: any) => {
    const response = await api.post('/register', userData);
    return response.data;
};

export const logoutUser = async () => {
    try {
        await api.post('/logout');
    } catch (e) {
        console.error("Logout API error:", e);
    } finally {
        await AsyncStorage.removeItem(TOKEN_KEY);
    }
};

export const getUserDetails = async () => {
    const response = await api.get('/user-details');
    return response.data.user;
};

export const updateProfile = async (userData: { username: string }) => {
    const response = await api.put('/update-user', userData);
    return response.data;
};

export const getBookmarks = async (): Promise<Series[]> => {
    const response = await api.get('/bookmarks');
    return response.data.bookmarks || [];
};

export const addBookmark = async (contentId: string | number) => {
    const response = await api.post('/bookmark', { contentId });
    return response.data;
};

export const removeBookmark = async (contentId: string | number) => {
    const response = await api.post('/unbookmark', { contentId });
    return response.data;
};

export const getSeries = async (): Promise<Series[]> => {
    // ... existing code ...
    try {
        const response = await api.get('/all-series');
        return response.data.series || [];
    } catch (error) {
        console.error("Error fetching series:", error);
        return [];
    }
};

export const searchSeries = async (query: string): Promise<Series[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/search-series?title=${encodeURIComponent(query)}`);

        if (response.status === 404) {
            return [];
        }

        if (!response.ok) {
            throw new Error(`Search failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.series || [];
    } catch (error) {
        console.error("Search API error:", error);
        return [];
    }
};

export const getSeriesDetails = async (id: string | number): Promise<Series | null> => {
    try {
        const response = await api.get(`/series/${id}`);
        return response.data.series || null;
    } catch (error) {
        console.error("Error fetching series details:", error);
        return null;
    }
};

export const getEpisodeDetail = async (id: string | number): Promise<Episode | null> => {
    try {
        const response = await api.get(`/episode/${id}`);
        return response.data.episode || null;
    } catch (error) {
        console.error("Error fetching episode detail:", error);
        return null;
    }
};

export default api;
