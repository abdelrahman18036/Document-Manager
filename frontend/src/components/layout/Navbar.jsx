import { useState, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserIcon, BellIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/solid';

const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Documents', href: '/documents' },
    { name: 'Upload', href: '/upload' },
];

export default function Navbar() {
    const location = useLocation();

    // Function to check if a nav item is active
    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <Disclosure as="nav" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Link to="/" className="flex items-center">
                                        <DocumentTextIcon className="h-8 w-8 text-indigo-500" />
                                        <span className="ml-2 text-xl font-bold text-white">DocManager</span>
                                    </Link>
                                </div>
                                <div className="hidden md:block">
                                    <div className="ml-10 flex items-baseline space-x-2">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className={`${isActive(item.href)
                                                        ? 'bg-slate-800 text-white'
                                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                                    } rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ease-in-out`}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="ml-4 flex items-center md:ml-6">
                                    {/* Notification bell */}
                                    <button
                                        type="button"
                                        className="relative rounded-full bg-slate-800 p-1 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 mr-3"
                                    >
                                        <span className="sr-only">View notifications</span>
                                        <BellIcon className="h-6 w-6" aria-hidden="true" />

                                        {/* Notification dot */}
                                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-indigo-400 ring-2 ring-slate-800"></span>
                                    </button>

                                    {/* Profile dropdown */}
                                    <Menu as="div" className="relative">
                                        <div>
                                            <Menu.Button className="relative flex rounded-full bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800">
                                                <span className="sr-only">Open user menu</span>
                                                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                                                    <UserIcon className="h-5 w-5 text-slate-300" aria-hidden="true" />
                                                </div>
                                            </Menu.Button>
                                        </div>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="transform opacity-0 scale-95"
                                            enterTo="transform opacity-100 scale-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="transform opacity-100 scale-100"
                                            leaveTo="transform opacity-0 scale-95"
                                        >
                                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-slate-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-700">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="#profile"
                                                            className={`${active ? 'bg-slate-700' : ''
                                                                } block px-4 py-2 text-sm text-slate-300`}
                                                        >
                                                            Your Profile
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="#settings"
                                                            className={`${active ? 'bg-slate-700' : ''
                                                                } block px-4 py-2 text-sm text-slate-300`}
                                                        >
                                                            Settings
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <a
                                                            href="#signout"
                                                            className={`${active ? 'bg-slate-700' : ''
                                                                } block px-4 py-2 text-sm text-slate-300`}
                                                        >
                                                            Sign out
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </div>
                            <div className="-mr-2 flex md:hidden">
                                {/* Mobile menu button */}
                                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="md:hidden">
                        <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`${isActive(item.href)
                                            ? 'bg-slate-800 text-white'
                                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                        } block rounded-md px-3 py-2 text-base font-medium`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        <div className="border-t border-slate-700 pt-4 pb-3">
                            <div className="flex items-center px-5">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                                        <UserIcon className="h-6 w-6 text-slate-300" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-white">User</div>
                                    <div className="text-sm font-medium text-slate-400">user@example.com</div>
                                </div>
                                <button
                                    type="button"
                                    className="relative ml-auto flex-shrink-0 rounded-full bg-slate-800 p-1 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                                >
                                    <span className="sr-only">View notifications</span>
                                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-indigo-400 ring-2 ring-slate-800"></span>
                                </button>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                <Disclosure.Button
                                    as="a"
                                    href="#profile"
                                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    Your Profile
                                </Disclosure.Button>
                                <Disclosure.Button
                                    as="a"
                                    href="#settings"
                                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    Settings
                                </Disclosure.Button>
                                <Disclosure.Button
                                    as="a"
                                    href="#signout"
                                    className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    Sign out
                                </Disclosure.Button>
                            </div>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
} 