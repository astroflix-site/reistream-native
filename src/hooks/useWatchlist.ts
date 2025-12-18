import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Series } from '../types/content';
import { useAuth } from '../context/AuthContext';
import { getBookmarks, addBookmark, removeBookmark } from '../services/api';

const WATCHLIST_KEY = '@reistream_watchlist';

export const useWatchlist = () => {
    const { user } = useAuth();
    const [watchlist, setWatchlist] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWatchlist();
    }, [user]);

    const loadWatchlist = async () => {
        setLoading(true);
        try {
            if (user) {
                const remoteBookmarks = await getBookmarks();
                setWatchlist(remoteBookmarks);
            } else {
                const stored = await AsyncStorage.getItem(WATCHLIST_KEY);
                if (stored) {
                    setWatchlist(JSON.parse(stored));
                }
            }
        } catch (e) {
            console.error("Failed to load watchlist", e);
        } finally {
            setLoading(false);
        }
    };

    const addToWatchlist = async (item: Series) => {
        try {
            if (user) {
                await addBookmark(item._id);
            }
            const updated = [...watchlist, item];
            setWatchlist(updated);
            if (!user) {
                await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
            }
        } catch (e) {
            console.error("Failed to add to watchlist", e);
        }
    };

    const removeFromWatchlist = async (id: number | string) => {
        try {
            if (user) {
                await removeBookmark(id);
            }
            const updated = watchlist.filter(item => item._id.toString() !== id.toString());
            setWatchlist(updated);
            if (!user) {
                await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
            }
        } catch (e) {
            console.error("Failed to remove from watchlist", e);
        }
    };

    const isInWatchlist = (id: number | string) => {
        return watchlist.some(item => item._id.toString() === id.toString());
    };

    return { watchlist, loading, addToWatchlist, removeFromWatchlist, isInWatchlist, refetch: loadWatchlist };
};
