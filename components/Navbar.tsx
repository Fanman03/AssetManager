'use client';

import React from 'react';

const appName = process.env.NEXT_PUBLIC_APP_NAME;

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
    return (
        <nav className="navbar navbar-expand-lg bg-primary">
            <div className="container">
                {variant === 'default' ? (
                    <>
                        <a className="navbar-brand text-white" href="/">
                            <i className="bi bi-pc-display me-2"></i>
                            <span>{appName}</span>
                        </a>
                        <div className="collapse navbar-collapse flex-row-reverse">
                            <form className="form-inline my-2 my-lg-0">
                                <input
                                    className="form-control me-sm-2"
                                    type="search"
                                    placeholder="Search"
                                    aria-label="Search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </form>
                        </div>
                    </>
                ) : (
                    <a className="navbar-brand text-white" href="/">
                        <i className="bi bi-arrow-left me-2"></i>
                        <span>Back</span>
                    </a>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
