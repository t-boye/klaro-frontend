import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';

export default function ResetPassword() {
  const [params]    = useSearchParams();
  const navigate    = useNavigate();
  const token       = params.get('token') || '';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState('');
  const [showPass,  setShowPass]  = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-5">
        <div className="card max-w-sm w-full text-center py-10">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Invalid reset link</p>
          <Link to="/auth" className="btn-primary mt-4 inline-block">Back to sign in</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-5">
        <div className="card max-w-sm w-full text-center py-10">
          <p className="text-4xl mb-3">✓</p>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Password updated</h1>
          <p className="text-sm text-gray-500 mb-6">You can now sign in with your new password.</p>
          <Link to="/auth" className="btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center px-5">
      <div className="max-w-sm mx-auto w-full">
        <div className="flex justify-center mb-8">
          <Link to="/"><img src="/assets/logos/logo.png" alt="Klaro" className="h-16 object-contain" /></Link>
        </div>
        <div className="card">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Set new password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose a strong password of at least 8 characters.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New password</label>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required minLength={8}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm password</label>
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <><Spinner className="w-4 h-4" /> Updating...</> : 'Set new password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
