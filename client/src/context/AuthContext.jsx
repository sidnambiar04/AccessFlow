import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // When app loads, verify token with backend to fetch fresh role & permissions from DB
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const data = await getCurrentUser();
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                } catch (error) {
                    console.error('Session expired or invalid:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        const data = await loginUser(credentials);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
    };

    const register = async (userData) => {
        return await registerUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const refreshUser = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (err) {
            console.error('Failed to refresh user:', err);
        }
    };

    // Auto background sync every 8 seconds & on tab focus so permissions update live without refreshing
    useEffect(() => {
        if (!token) return;

        const timer = setInterval(refreshUser, 8000);
        const handleFocus = () => refreshUser();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(timer);
            window.removeEventListener('focus', handleFocus);
        };
    }, [token]);

    // Helper: checks both boolean flag and timestamp expiry
    const isPermissionActive = (permKey) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        if (!user.permissions?.[permKey]) return false;

        const expiry = user.permissionExpiry?.[permKey];
        if (expiry && new Date(expiry).getTime() < Date.now()) {
            return false; // Access expired
        }
        return true;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                refreshUser,
                isAdmin: user?.role === 'Admin',
                hasProjectsAccess: isPermissionActive('projects'),
                hasSalesAccess: isPermissionActive('sales'),
                isPermissionActive,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};