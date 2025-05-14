import React, { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
    const { currentUser, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', current: true },
        { name: 'Documents', href: '/documents', current: false },
        { name: 'Upload', href: '/upload', current: false },
    ];

    return (
        <Disclosure as="nav" className="bg-slate-800 border-b border-slate-700">
            {({ open }) => (
                <>
                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                            {isAuthenticated && navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as={Link}
                                    to={item.href}
                                    className={classNames(
                                        item.current
                                            ? 'bg-slate-700 border-indigo-500 text-white'
                                            : 'border-transparent text-slate-300 hover:bg-slate-700 hover:border-slate-600 hover:text-white',
                                        'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                                    )}
                                    aria-current={item.current ? 'page' : undefined}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                        </div>
                        <div className="border-t border-slate-700 pb-3 pt-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center px-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-700 text-indigo-300">
                                                <UserCircleIcon className="h-8 w-8" />
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-base font-medium text-white">{currentUser?.username}</div>
                                            <div className="text-sm font-medium text-slate-400">{currentUser?.email}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 space-y-1">
                                        <Disclosure.Button
                                            as={Link}
                                            to="/profile"
                                            className="block px-4 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                                        >
                                            Your Profile
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as={Link}
                                            to="/settings"
                                            className="block px-4 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                                        >
                                            Settings
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as="button"
                                            onClick={handleLogout}
                                            className="block px-4 py-2 text-base font-medium text-red-400 hover:bg-slate-700 hover:text-red-300 w-full text-left"
                                        >
                                            Sign out
                                        </Disclosure.Button>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-3 space-y-1 px-4">
                                    <Disclosure.Button
                                        as={Link}
                                        to="/login"
                                        className="block px-4 py-2 text-base font-medium text-indigo-400 hover:bg-slate-700 hover:text-indigo-300"
                                    >
                                        Log in
                                    </Disclosure.Button>
                                    <Disclosure.Button
                                        as={Link}
                                        to="/register"
                                        className="block px-4 py-2 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md mt-2"
                                    >
                                        Sign up
                                    </Disclosure.Button>
                                </div>
                            )}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
} 