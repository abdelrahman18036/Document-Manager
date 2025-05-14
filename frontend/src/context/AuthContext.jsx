import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if there's a user in localStorage
        const loadUserFromStorage = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                if (token && userStr) {
                    console.log('Found token in storage, setting auth headers');
                    const user = JSON.parse(userStr);
                    // Set the token for all future axios requests
                    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error('Error loading user from storage:', error);
                // Clear potentially corrupted storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const login = async (username, password) => {
        try {
            console.log('Making login request to API');
            const response = await axios.post('/api/auth/login/', { username, password });
            console.log('Login response received:', response.status);

            const { token, user_id, username: userName, email } = response.data;

            const user = { id: user_id, username: userName, email };

            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Set for future requests
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            console.log('Auth header set:', `Token ${token}`);

            // Update state
            setCurrentUser(user);

            return user;
        } catch (error) {
            console.error('Login error in context:', error.response?.data || error.message);
            throw error; // Re-throw to be handled by the component
        }
    };

    const register = async (username, email, password) => {
        const response = await axios.post('/api/auth/register/', { username, email, password });
        const { token, user_id, username: userName, email: userEmail } = response.data;

        const user = { id: user_id, username: userName, email: userEmail };

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Set for future requests
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;

        // Update state
        setCurrentUser(user);

        return user;
    };

    const logout = () => {
        // Remove from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Remove from axios headers
        delete axios.defaults.headers.common['Authorization'];

        // Update state
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 