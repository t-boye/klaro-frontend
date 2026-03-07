import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { getUser, setSession, getToken, clearSession } from '../lib/auth';
import Navbar from '../components/Navbar';
import UpgradeModal from '../components/UpgradeModal';

const PLAN_LABELS = {
  trial:       'Free Trial',
  pay_per_doc: 'Pay Per Document',
  individual:  'Individual Monthly',
  professional:'Professional Monthly',
  business:    'Business',
};

function Avatar({ name, phone }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : (phone || '?').replace('+', '').slice(-2);
  return (
    <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold mx-auto">
      {initials}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [license, setLicense]         = useState(null);
  const [name, setName]               = useState(currentUser?.full_name || '');
  const [email, setEmail]             = useState('');
  const [lang, setLang]               = useState(currentUser?.language_preference || 'en');
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState('');
  const [saveErr, setSaveErr]         = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    api.license()
      .then((data) => {
        setLicense(data);
        setName(data.user.full_name || '');
        setEmail(data.user.email || '');
        setLang(data.user.language_preference || 'en');
      })
      .catch(console.error);
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaveMsg('');
    setSaveErr('');
    setSaving(true);
    try {
      const data = await api.profile.update({
        full_name: name.trim() || undefined,
        email: email.trim() || undefined,
        language_preference: lang,
      });
      // Refresh stored user
      setSession(getToken(), {
        ...currentUser,
        full_name: data.user.full_name,
        language_preference: data.user.language_preference,
      });
      setSaveMsg('Profile saved');
    } catch (err) {
      setSaveErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearSession();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onLogout={logout} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <main className="max-w-md mx-auto px-5 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">&larr; Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Profile & settings</h1>
        </div>

        {/* Avatar + phone */}
        <div className="card text-center mb-5">
          <Avatar name={name} phone={currentUser?.phone} />
          <p className="text-sm text-gray-700 font-medium mt-3">{currentUser?.email || currentUser?.phone}</p>
          <p className="text-xs text-gray-400 mt-0.5">Account identifier cannot be changed</p>
        </div>

        {/* Plan card */}
        <div className="card mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">Current plan</p>
              <p className="font-bold text-gray-900 dark:text-white">{PLAN_LABELS[license?.plan] || '...'}</p>
              {license?.plan === 'trial' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {3 - (license?.usage?.trialAnalysesUsed || 0)} analyses remaining
                </p>
              )}
              {license?.plan === 'individual' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {5 - (license?.usage?.documentsThisMonth || 0)} documents left this month
                </p>
              )}
            </div>
            {(license?.plan === 'trial' || license?.plan === 'pay_per_doc' || license?.plan === 'individual') && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-sm bg-brand-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Personal details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
            <input
              className="input"
              type="text"
              placeholder="Kofi Mensah"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address <span className="text-gray-400">(optional)</span></label>
            <input
              className="input"
              type="email"
              placeholder="kofi@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Used for payment receipts</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred language</label>
            <div className="flex flex-wrap gap-2">
              {[
                { v: 'en',  l: 'English' },
                { v: 'tw',  l: 'Twi' },
                { v: 'ga',  l: 'Ga' },
                { v: 'ewe', l: 'Ewe' },
                { v: 'dag', l: 'Dagbani' },
                { v: 'ha',  l: 'Hausa' },
                { v: 'fan', l: 'Fante' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLang(v)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    lang === v
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {saveMsg && <p className="text-sm text-green-600">{saveMsg}</p>}
          {saveErr && <p className="text-sm text-red-600">{saveErr}</p>}

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        {/* Danger zone */}
        <div className="card mt-5">
          <h2 className="font-semibold text-gray-900 mb-3">Account</h2>
          <button
            onClick={logout}
            className="w-full text-left text-sm text-red-600 font-medium py-2 hover:underline"
          >
            Log out
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8 px-4">
          Klaro explains documents — it does not give legal advice.
          For legal advice, consult a qualified Ghana lawyer.
        </p>
      </main>
    </div>
  );
}
