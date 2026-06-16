import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { getUser, setSession, getToken, clearSession } from '../lib/auth';
import Navbar from '../components/Navbar';
import UpgradeModal from '../components/UpgradeModal';
import AvatarIcon, { AVATARS, getDefaultAvatar } from '../components/AvatarIcon';

// ─── Avatar display (uses shared AvatarIcon component) ────────────────────────

function AvatarDisplay({ avatarId, size = 80 }) {
  return <AvatarIcon avatarId={avatarId} size={size} />;
}

// ─── Plan info ────────────────────────────────────────────────────────────────

const PLAN_INFO = {
  trial:        { label: 'Free Trial',          color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',         badge: '🆓' },
  pay_per_doc:  { label: 'Pay Per Document',    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', badge: '📄' },
  individual:   { label: 'Individual',          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',       badge: '⭐' },
  professional: { label: 'Professional',        color: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300',   badge: '🚀' },
  business:     { label: 'Business',            color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', badge: '🏢' },
};

const PAYMENT_METHOD_LABELS = { card: 'Card', mobile_money: 'Mobile Money', bank: 'Bank' };

const SUPPORTED_COUNTRIES = [
  { code: 'GH', name: 'Ghana',         flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria',        flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa',   flag: '🇿🇦' },
  { code: 'KE', name: 'Kenya',          flag: '🇰🇪' },
  { code: 'RW', name: 'Rwanda',         flag: '🇷🇼' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal',        flag: '🇸🇳' },
  { code: 'EG', name: 'Egypt',          flag: '🇪🇬' },
  { code: 'TZ', name: 'Tanzania',       flag: '🇹🇿' },
];

const CURRENCY_SYMBOLS = {
  GHS: 'GH₵', NGN: '₦', ZAR: 'R', KES: 'KSh', RWF: 'RWF', XOF: 'CFA', EGP: 'EGP', TZS: 'TZS',
};
const COUNTRY_CURRENCIES = {
  GH: 'GHS', NG: 'NGN', ZA: 'ZAR', KE: 'KES', RW: 'RWF', CI: 'XOF', SN: 'XOF', EG: 'EGP', TZ: 'TZS',
};
const COUNTRY_LAWYER_LABELS = {
  GH: 'Ghana', NG: 'Nigerian', ZA: 'South African', KE: 'Kenyan', RW: 'Rwandan',
  CI: 'Ivorian', SN: 'Senegalese', EG: 'Egyptian', TZ: 'Tanzanian',
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate    = useNavigate();
  const currentUser = getUser();

  const [license,         setLicense]         = useState(null);
  const [name,            setName]            = useState(currentUser?.full_name || '');
  const [email,           setEmail]           = useState('');
  const [lang,            setLang]            = useState(currentUser?.language_preference || 'en');
  const [country,         setCountry]         = useState(currentUser?.country || 'GH');
  const [gender,          setGender]          = useState('');
  const [avatar,          setAvatar]          = useState(currentUser?.avatar || 'male1');
  const [saving,          setSaving]          = useState(false);
  const [saveMsg,         setSaveMsg]         = useState('');
  const [saveErr,         setSaveErr]         = useState('');
  const [showUpgrade,     setShowUpgrade]     = useState(false);
  const [payments,        setPayments]        = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsOpen,    setPaymentsOpen]    = useState(false);

  useEffect(() => {
    api.license()
      .then((data) => {
        setLicense(data);
        setName(data.user.full_name || '');
        setEmail(data.user.email || '');
        setLang(data.user.language_preference || 'en');
        setCountry(data.user.country || 'GH');
        const g = data.user.gender || '';
        setGender(g);
        setAvatar(data.user.avatar || getDefaultAvatar(g));
      })
      .catch(console.error);

    api.payment.history()
      .then((data) => setPayments(data.payments || []))
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
  }, []);

  function handleGenderChange(g) {
    setGender(g);
    // Auto-suggest avatar when gender changes, but only if user hasn't customised yet
    const currentAvatarGender = AVATARS.find(a => a.id === avatar)?.gender;
    if (currentAvatarGender !== g) {
      setAvatar(getDefaultAvatar(g));
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveMsg(''); setSaveErr('');
    setSaving(true);
    try {
      const data = await api.profile.update({
        full_name:           name.trim()  || undefined,
        email:               email.trim() || undefined,
        language_preference: lang,
        avatar,
        gender:              gender || undefined,
        country,
      });
      setSession(getToken(), {
        ...currentUser,
        full_name:           data.user.full_name,
        language_preference: data.user.language_preference,
        avatar:              data.user.avatar,
        gender:              data.user.gender,
        country:             data.user.country,
      });
      setSaveMsg('Profile saved successfully');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  function logout() { clearSession(); navigate('/'); }

  const plan     = license?.plan || currentUser?.plan || 'trial';
  const planInfo = PLAN_INFO[plan] || PLAN_INFO.trial;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onLogout={logout} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <main className="max-w-lg mx-auto px-5 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">&larr; Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Profile & settings</h1>
        </div>

        {/* Avatar + identity card */}
        <div className="card text-center mb-5">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <AvatarDisplay avatarId={avatar} size={88} />
            </div>
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-lg">{name || 'Your name'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{email || currentUser?.email || currentUser?.phone}</p>

          {/* Plan badge */}
          <div className="flex justify-center mt-3">
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full ${planInfo.color}`}>
              <span>{planInfo.badge}</span>
              {planInfo.label}
            </span>
          </div>

          {plan === 'trial' && (
            <p className="text-xs text-gray-400 mt-2">
              {3 - (license?.usage?.trialAnalysesUsed || 0)} free analyses remaining
            </p>
          )}
          {plan === 'individual' && (
            <p className="text-xs text-gray-400 mt-2">
              {Math.max(0, 5 - (license?.usage?.documentsThisMonth || 0))} documents left this month
            </p>
          )}
          {['professional', 'business'].includes(plan) && (
            <p className="text-xs text-brand-500 font-medium mt-2">Unlimited analyses</p>
          )}

          {(plan === 'trial' || plan === 'pay_per_doc' || plan === 'individual') && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="mt-4 px-5 py-2 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Upgrade plan →
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">

          {/* Personal details */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Personal details</h2>
                <p className="text-xs text-gray-400">Your name and contact info</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full name</label>
                <div className="relative">
                  <input className="input pr-10" type="text" placeholder="e.g. Kofi Mensah" value={name} onChange={(e) => setName(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Email address <span className="normal-case font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <input className="input pr-10" type="email" placeholder="kofi@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Used for payment receipts and notifications
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { v: 'male',              l: '👨 Male' },
                    { v: 'female',            l: '👩 Female' },
                    { v: 'prefer_not_to_say', l: '— Prefer not to say' },
                  ].map(({ v, l }) => (
                    <button key={v} type="button" onClick={() => handleGenderChange(v)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${gender === v ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brand-300'}`}>
                      {l}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Helps assign your avatar</p>
              </div>
            </div>
          </div>

          {/* Avatar picker */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Choose your avatar</h2>
            <p className="text-xs text-gray-400 mb-4">Pick the one that represents you</p>

            <div className="grid grid-cols-2 gap-4">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvatar(a.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    avatar === a.id
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-100 dark:border-gray-700 hover:border-brand-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <a.Component size={64} />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{a.gender}</p>
                    <p className="text-xs text-gray-400">{a.label}</p>
                  </div>
                  {avatar === a.id && (
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Selected ✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Your country</h2>
            <p className="text-xs text-gray-400 mb-3">Sets your currency for payments and local law context for document analysis</p>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_COUNTRIES.map(({ code, name, flag }) => (
                <button key={code} type="button" onClick={() => setCountry(code)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all text-xs font-medium ${
                    country === code
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-200 bg-white dark:bg-gray-800'
                  }`}>
                  <span className="text-lg">{flag}</span>
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Preferred language</h2>
            <p className="text-xs text-gray-400 mb-3">Documents will be explained in this language by default</p>
            <div className="flex flex-wrap gap-2">
              {[
                { v: 'en',  l: 'English' },  { v: 'tw',  l: 'Twi' },
                { v: 'ga',  l: 'Ga' },       { v: 'ewe', l: 'Ewe' },
                { v: 'dag', l: 'Dagbani' },  { v: 'ha',  l: 'Hausa' },
                { v: 'fan', l: 'Fante' },    { v: 'sw',  l: 'Swahili' },
                { v: 'fr',  l: 'French' },   { v: 'ar',  l: 'Arabic' },
              ].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setLang(v)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    lang === v ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brand-300'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {saveMsg && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {saveMsg}
            </div>
          )}
          {saveErr && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{saveErr}</p>}

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        {/* Payment history — collapsible */}
        <div className="card mt-5 overflow-hidden">
          <button
            type="button"
            onClick={() => setPaymentsOpen(o => !o)}
            className="w-full flex items-center justify-between gap-3 text-left group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">Payment history</p>
                <p className="text-xs text-gray-400">
                  {paymentsLoading ? 'Loading…' : payments.length === 0 ? 'No payments yet' : `${payments.length} payment${payments.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${paymentsOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {paymentsOpen && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {paymentsLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-gray-100 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded" />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <div className="h-3.5 w-16 bg-gray-100 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-10 bg-gray-100 dark:bg-gray-700 rounded ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <span className="text-3xl">🧾</span>
                  <p className="text-sm text-gray-400">No payments yet. Upgrade to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {payments.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${
                          p.status === 'success' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
                        }`}>
                          {p.status === 'success' ? '✅' : '⏳'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize truncate">
                            {p.plan_name || p.plan} plan
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {new Date(p.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {p.payment_method ? ` · ${PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {CURRENCY_SYMBOLS[COUNTRY_CURRENCIES[country] || 'GHS'] || 'GH₵'} {Number(p.amount_ghs).toFixed(2)}
                        </p>
                        <span className={`text-xs font-semibold ${p.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {p.status === 'success' ? 'Paid' : p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account */}
        <div className="card mt-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Account</h2>
          <p className="text-xs text-gray-400 mb-3">Member since {license?.user?.id ? new Date().getFullYear() : '—'}</p>
          <button onClick={logout} className="w-full text-left text-sm text-red-600 font-medium py-2 hover:underline">
            Log out
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 px-4">
          Klaro explains documents. It does not give legal advice.
          For legal advice, consult a qualified {COUNTRY_LAWYER_LABELS[country] || 'local'} lawyer.
        </p>
      </main>
    </div>
  );
}
