'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginClient() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const param = searchParams?.get('redirect');
    if (param) setRedirectTo(param);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(redirectTo);
      } else {
        setError('Incorrect password');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar variant="backBtn" hideLogin />
      <div className="container mt-5">
        <div className="col-md-6 col-lg-4 mx-auto">
          <h1 className="pb-2">Admin Login</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-danger mb-1">{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              <i className="bi bi-key me-2"></i>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
