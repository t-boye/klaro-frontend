import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/adminApi';
import { setAdminSession } from '../lib/adminAuth';
import Spinner from '../components/Spinner';
import PasswordToggle from '../components/PasswordToggle';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await adminApi.login(email, password);
      setAdminSession(data.token, data.admin);
      navigate('/klaro-hub/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel (desktop only) ───────────────────────────── */}
      <div className="hidden lg:flex w-[44%] bg-[#1B4332] flex-col items-center justify-center p-14 relative overflow-hidden flex-shrink-0">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#52B788] opacity-10 rounded-full" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-[#52B788] opacity-10 rounded-full" />
        <div className="absolute top-1/2 right-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 text-center max-w-xs">
          <img src="/assets/logos/logo.png" alt="Klaro" className="h-16 object-contain brightness-0 invert mx-auto mb-8" />

          <h1 className="text-3xl font-bold text-white mb-3 leading-snug">
            Klaro Admin
          </h1>
          <p className="text-[#52B788] text-sm leading-relaxed">
            Manage users, lawyers, and document analysis for Africa's legal AI platform.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { stat: 'AI', label: 'Powered' },
              { stat: '7+', label: 'Languages' },
              { stat: '9', label: 'Countries' },
            ].map(({ stat, label }) => (
              <div key={stat} className="bg-white/10 rounded-xl py-3 px-2">
                <p className="text-xl font-bold text-white">{stat}</p>
                <p className="text-xs text-[#52B788] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-2 justify-center">
            <div className="w-2 h-2 rounded-full bg-[#52B788]" />
            <p className="text-xs text-white/40 uppercase tracking-widest">Restricted access</p>
            <div className="w-2 h-2 rounded-full bg-[#52B788]" />
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/assets/logos/logo.png" alt="Klaro" className="h-10 object-contain mx-auto mb-3" />
            <p className="text-xs text-gray-400 uppercase tracking-widest">Admin Panel</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-400 mt-1">Authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@klaro.app"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:border-[#1B4332]
                  placeholder-gray-400 transition-colors"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 pr-12 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:border-[#1B4332]
                    placeholder-gray-400 transition-colors"
                  required
                  autoComplete="current-password"
                />
                <PasswordToggle show={showPass} onToggle={() => setShowPass(!showPass)} />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B4332] hover:bg-[#163829] text-white font-semibold py-3 rounded-xl
                text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading
                ? <><Spinner className="w-4 h-4" /> Signing in…</>
                : 'Sign in to Admin Panel'
              }
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Klaro · Admin Panel · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
