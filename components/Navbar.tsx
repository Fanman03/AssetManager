'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PasswordPrompt from './PasswordPrompt'; // import your modal component

const appName = process.env.NEXT_PUBLIC_APP_NAME;
const COOKIE_NAME = 'admin_auth';

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name: string) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
}

type NavbarProps = {
    variant?: 'default' | 'backBtn';
    searchTerm?: string;
    setSearchTerm?: (value: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({
    variant = 'default',
    searchTerm = '',
    setSearchTerm = () => { },
}) => {
    const pathname = usePathname();
    const router = useRouter();

    const [authorized, setAuthorized] = useState(false);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

    useEffect(() => {
        setAuthorized(getCookie(COOKIE_NAME) === 'true');
    }, []);

    const handleBackClick = () => {
        const match = pathname.match(/^\/(i|edit)\/(.+)$/);
        if (match) {
            router.push(`/${match[2]}`);
        } else {
            router.push('/');
        }
    };

    const handleLoginClick = () => {
        setShowPasswordPrompt(true);
    };

    const onAuthSuccess = () => {
        setCookie(COOKIE_NAME, 'true', 1);
        setAuthorized(true);
        setShowPasswordPrompt(false);
        alert('Login successful');
    };

    const onAuthCancel = () => {
        setShowPasswordPrompt(false);
    };

    const handleLogout = () => {
        deleteCookie(COOKIE_NAME);
        setAuthorized(false);
        router.push('/');
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-primary">
                <div className="container d-flex align-items-center">
                    {/* Brand on the left */}
                    <a className="navbar-brand text-white me-auto" href="/">
                        <i className="bi bi-pc-display me-2"></i>
                        <span>{appName}</span>
                    </a>

                    {/* Right side group: search + login/logout */}
                    {variant === 'default' ? (
                        <div className="d-flex align-items-center">
                            <form
                                className="form-inline my-2 my-lg-0 me-3"
                                style={{ maxWidth: 400, width: '100%' }}
                            >
                                <input
                                    className="form-control"
                                    type="search"
                                    placeholder="Search"
                                    aria-label="Search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </form>

                            {authorized ? (
                                <button
                                    type="button"
                                    className="btn btn-outline-light"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-outline-light"
                                    onClick={handleLoginClick}
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="d-flex align-items-center">
                            <button
                                type="button"
                                className="btn btn-link navbar-brand text-white text-decoration-none p-0 me-3"
                                onClick={handleBackClick}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                <span>Back</span>
                            </button>

                            {authorized ? (
                                <button
                                    type="button"
                                    className="btn btn-outline-light"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-outline-light"
                                    onClick={handleLoginClick}
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Render PasswordPrompt modal */}
            {showPasswordPrompt && (
                <PasswordPrompt onSuccess={onAuthSuccess} onCancel={onAuthCancel} />
            )}
        </>
    );
};

export default Navbar;