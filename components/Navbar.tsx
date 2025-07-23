'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const appName = process.env.NEXT_PUBLIC_APP_NAME;

type NavbarProps = {
  variant?: 'default' | 'backBtn';
  hideLogin?: boolean;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({
  variant = 'default',
  hideLogin = false,
  searchTerm = '',
  setSearchTerm = () => { },
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch('/api/check-auth', { credentials: 'include' })
      .then((res) => setAuthorized(res.ok))
      .catch(() => setAuthorized(false));
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
    router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }

    setAuthorized(false);
    router.push('/');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevents page refresh
  };

  return (
    <nav className="navbar navbar-expand-lg bg-primary">
      {hideLogin ? (
        <style>{`#logoutBtn, #loginBtn {display: none !important};`}</style>
      ) : (<></>)}
      <div className="container d-flex align-items-center">
        {/* Brand on the left */}
        <a className="navbar-brand text-white me-auto" href="/">
          <i className="bi bi-pc-display me-2"></i>
          <span>{appName}</span>
        </a>

        {/* Right side group: search + login/logout */}
        {variant === 'default' ? (
          <div className="d-flex align-items-center searchBarContainer">
            <form
              className="form-inline my-2 my-lg-0"
              id="searchBar"
              onSubmit={handleSubmit}
            >
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  className="form-control"
                  type="search"
                  id="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            {authorized ? (
              <button
                type="button"
                className="btn btn-outline-light"
                id="logoutBtn"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-light"
                id="loginBtn"
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
                id="logoutBtn"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-light"
                id="loginBtn"
                onClick={handleLoginClick}
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;