import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserDetails, loginUser, logoutUser, registerUser } from '../services/api';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStoredUser = async () => {
            try {
                const token = await AsyncStorage.getItem('@reistream_token');
                if (token) {
                    const userData = await getUserDetails();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Failed to load user', error);
                await AsyncStorage.removeItem('@reistream_token');
            } finally {
                setIsLoading(false);
            }
        };

        loadStoredUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await loginUser(email, password);
            console.log("AuthContext: login success via API");

            // If the response itself is the user object (contains _id)
            if (data && (data._id || data.id)) {
                // Ensure _id is present (some backends return id)
                const userObj = {
                    ...data,
                    _id: data._id || data.id
                };
                setUser(userObj);

                // If we also got a token (handled in api.ts), we can try to refresh user details
                // to get the cleanest state, but don't unset the user we just got.
                if (data.token) {
                    try {
                        const details = await getUserDetails();
                        if (details) setUser(details);
                    } catch (e) {
                        console.log("AuthContext: secondary user fetch failed, using login data");
                    }
                }
            } else if (data.user) {
                setUser(data.user);
            }
        } catch (error) {
            console.error("AuthContext: login error", error);
            throw error;
        }
    };

    const register = async (userData: any) => {
        await registerUser(userData);
        // We could auto-login here or redirect to login
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const userData = await getUserDetails();
            setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
