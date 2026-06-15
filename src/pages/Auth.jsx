import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { setSession } from '../lib/auth';
import Spinner from '../components/Spinner';
import PasswordToggle from '../components/PasswordToggle';
import { useLang } from '../context/LangContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const COUNTRIES = [
  { code: 'GH', iso: 'gh', name: 'Ghana'         },
  { code: 'NG', iso: 'ng', name: 'Nigeria'        },
  { code: 'ZA', iso: 'za', name: 'South Africa'   },
  { code: 'KE', iso: 'ke', name: 'Kenya'          },
  { code: 'RW', iso: 'rw', name: 'Rwanda'         },
  { code: 'CI', iso: 'ci', name: "Côte d'Ivoire"  },
  { code: 'SN', iso: 'sn', name: 'Senegal'        },
  { code: 'EG', iso: 'eg', name: 'Egypt'          },
  { code: 'TZ', iso: 'tz', name: 'Tanzania'       },
];

export default function Auth() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [mode, setMode]           = useState('login');  // login | register | forgot
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [fullName, setFullName]   = useState('');
  const [country, setCountry]     = useState(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const googleReady               = useRef(false);

  // Auto-detect country via CF IP on mount
  useEffect(() => {
    api.geo().then(data => { if (data.country) setCountry(data.country); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setGoogleLoading(true);
          setError('');
          try {
            const data = await api.auth.googleAuth(response.credential);
            setSession(data.token, data.user);
            const onboarded = localStorage.getItem('klaro_onboarded');
            navigate(onboarded ? '/dashboard' : '/onboarding');
          } catch (e) {
            setError(e.message);
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      googleReady.current = true;
    };
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [navigate]);

  function handleGoogleClick() {
    if (!googleReady.current) return;
    window.google.accounts.id.prompt();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'forgot') {
        await api.auth.forgotPassword(email.trim());
        setSuccess('If that email exists, a reset link has been sent. Check your inbox.');
        setLoading(false);
        return;
      }
      let data;
      if (mode === 'register') {
        data = await api.auth.register(email.trim(), password, fullName.trim() || undefined, country || undefined);
      } else {
        data = await api.auth.login(email.trim(), password);
      }
      setSession(data.token, data.user);
      const onboarded = localStorage.getItem('klaro_onboarded');
      navigate(onboarded ? '/dashboard' : '/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-page dark:bg-gray-900 flex flex-col justify-center px-5">
      <div className="max-w-sm mx-auto w-full">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src="/assets/logos/logo.png" alt="Klaro" className="h-24 object-contain" />
          </Link>
        </div>

        <div className="card">
          {/* Tab toggle */}
          {mode !== 'forgot' && (
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
              {['login', 'register'].map((m) => (
                <button key={m} type="button"
                  onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    mode === m ? 'bg-white dark:bg-gray-600 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {m === 'login' ? t('auth.signIn') : t('auth.createAccount')}
                </button>
              ))}
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-5">
              <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-sm text-brand-600 hover:underline">&larr; {t('auth.signIn')}</button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-2">{t('auth.resetTitle')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('auth.resetSub')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.fullName')}</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Kofi Mensah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.country')}</label>
                  {!showCountryPicker ? (
                    <button
                      type="button"
                      onClick={() => setShowCountryPicker(true)}
                      className="input w-full flex items-center gap-2.5 text-left"
                    >
                      {(() => {
                        const sel = COUNTRIES.find(c => c.code === country);
                        return sel ? (
                          <>
                            <img
                              src={`https://flagcdn.com/24x18/${sel.iso}.png`}
                              width="24" height="18"
                              alt={sel.name}
                              className="rounded-sm flex-shrink-0"
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-200">{sel.name}</span>
                            <span className="ml-auto text-xs text-brand-600 dark:text-brand-400">Change</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">{t('auth.selectCountry')}</span>
                        );
                      })()}
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800">
                      {COUNTRIES.map(({ code, iso, name }) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => { setCountry(code); setShowCountryPicker(false); }}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-colors ${
                            country === code
                              ? 'bg-brand-600 text-white ring-2 ring-brand-400'
                              : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <img
                            src={`https://flagcdn.com/40x30/${iso}.png`}
                            width="40" height="30"
                            alt={name}
                            className="rounded object-cover shadow-sm"
                          />
                          <span className="text-xs font-medium leading-tight">{name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.email')}</label>
              <input
                className="input"
                type="email"
                placeholder="kofi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPass ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <PasswordToggle show={showPass} onToggle={() => setShowPass(!showPass)} />
              </div>
            </div>

            {error   && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading
                ? <><Spinner className="w-4 h-4" /> {mode === 'register' ? t('auth.creating') : mode === 'forgot' ? t('auth.sending') : t('auth.signing')}</>
                : mode === 'register' ? t('auth.createAccount') : mode === 'forgot' ? t('auth.sendReset') : t('auth.signIn')
              }
            </button>

            {mode === 'login' && (
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                className="w-full text-center text-sm text-gray-400 hover:text-brand-600 transition-colors">
                {t('auth.forgotPass')}
              </button>
            )}
          </form>

          {/* Divider — only on login/register */}
          {mode !== 'forgot' && (
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{t('auth.orContinue')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          )}

          {/* Google sign-in — only on login/register */}
          {mode !== 'forgot' && <button
            type="button"
            onClick={handleGoogleClick}
            disabled={googleLoading || !GOOGLE_CLIENT_ID}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-600 rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? <Spinner className="w-5 h-5" /> : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? t('auth.signing') : t('auth.googleBtn')}
          </button>}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 px-4">
          {t('auth.byUsing')}{' '}
          <Link to="/terms" className="underline hover:text-gray-600 dark:hover:text-gray-300">{t('auth.terms')}</Link>
          {' '}{t('auth.and')}{' '}
          <Link to="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">{t('auth.privacy')}</Link>.
          {' '}{t('auth.noAdvice')}
        </p>
      </div>
    </div>
  );
}
