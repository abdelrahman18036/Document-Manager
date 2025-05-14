import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LockClosedIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/auth/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            // Store token and user info in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.data.user_id,
                username: response.data.username,
                email: response.data.email
            }));

            // Configure axios to use the token for future requests
            axios.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.data) {
                // Handle validation errors from Django
                const errors = err.response.data;
                const errorMessage = Object.keys(errors).map(key =>
                    `${key}: ${errors[key].join(', ')}`
                ).join('\n');
                setError(errorMessage || 'Registration failed. Please try again.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 h-screen">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="bg-indigo-500/20 p-3 rounded-lg inline-flex border border-indigo-500/30 mx-auto">
                    <UserIcon className="h-12 w-12 text-indigo-400" aria-hidden="true" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
                    Create a new account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Or{' '}
                    <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                        sign in to your existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-700">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-md text-sm text-red-300 whitespace-pre-line">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-300">
                                Username
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-md shadow-sm bg-slate-700/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Username"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                Email
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-md shadow-sm bg-slate-700/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Email address"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-md shadow-sm bg-slate-700/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-slate-500" aria-hidden="true" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-md shadow-sm bg-slate-700/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 