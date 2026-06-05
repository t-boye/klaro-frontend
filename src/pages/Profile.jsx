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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate    = useNavigate();
  const currentUser = getUser();

  const [license,         setLicense]         = useState(null);
  const [name,            setName]            = useState(currentUser?.full_name || '');
  const [email,           setEmail]           = useState('');
  const [lang,            setLang]            = useState(currentUser?.language_preference || 'en');
  const [gender,          setGender]          = useState('');
  const [avatar,          setAvatar]          = useState(currentUser?.avatar || 'male1');
  const [saving,          setSaving]          = useState(false);
  const [saveMsg,         setSaveMsg]         = useState('');
  const [saveErr,         setSaveErr]         = useState('');
  const [showUpgrade,     setShowUpgrade]     = useState(false);
  const [payments,        setPayments]        = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    api.license()
      .then((data) => {
        setLicense(data);
        setName(data.user.full_name || '');
        setEmail(data.user.email || '');
        setLang(data.user.language_preference || 'en');
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
      });
      setSession(getToken(), {
        ...currentUser,
        full_name:           data.user.full_name,
        language_preference: data.user.language_preference,
        avatar:              data.user.avatar,
        gender:              data.user.gender,
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
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Personal details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
              <input className="input" type="text" placeholder="e.g. Kofi Mensah" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address <span className="text-gray-400 text-xs">(optional)</span></label>
              <input className="input" type="email" placeholder="kofi@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Used for payment receipts and notifications</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender <span className="text-gray-400 text-xs">(helps assign your avatar)</span></label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { v: 'male',             l: 'Male' },
                  { v: 'female',           l: 'Female' },
                  { v: 'prefer_not_to_say',l: 'Prefer not to say' },
                ].map(({ v, l }) => (
                  <button key={v} type="button" onClick={() => handleGenderChange(v)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${gender === v ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-brand-300'}`}>
                    {l}
                  </button>
                ))}
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

          {/* Language */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Preferred language</h2>
            <p className="text-xs text-gray-400 mb-3">Documents will be explained in this language by default</p>
            <div className="flex flex-wrap gap-2">
              {[
                { v: 'en',  l: 'English' }, { v: 'tw',  l: 'Twi' },
                { v: 'ga',  l: 'Ga' },      { v: 'ewe', l: 'Ewe' },
                { v: 'dag', l: 'Dagbani' }, { v: 'ha',  l: 'Hausa' },
                { v: 'fan', l: 'Fante' },
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

        {/* Payment history */}
        <div className="card mt-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Payment history</h2>
          {paymentsLoading ? (
            <div className="space-y-2 animate-pulse">{[1, 2].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg" />)}</div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-gray-400">No payments yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {payments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{p.plan_name || p.plan} plan</p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {p.payment_method ? ` · ${PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">GH₵ {Number(p.amount_ghs).toFixed(2)}</p>
                    <span className={`text-xs font-medium ${p.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {p.status === 'success' ? 'Paid' : p.status}
                    </span>
                  </div>
                </div>
              ))}
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
          For legal advice, consult a qualified Ghana lawyer.
        </p>
      </main>
    </div>
  );
}
