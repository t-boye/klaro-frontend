import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import { clearSession } from '../lib/auth';

const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern',
  'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong-Ahafo',
  'Savannah', 'Bono East', 'Ahafo', 'Western North', 'Oti', 'North East',
];

const SPECIALTIES = [
  'Employment Law', 'Property Law', 'Commercial Law', 'Family Law',
  'Criminal Law', 'Copyright & IP', 'Banking & Finance', 'Land Law',
];

function LawyerCard({ lawyer }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">{lawyer.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{lawyer.region}</p>
          {lawyer.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {lawyer.specialties.map((s) => (
                <span key={s} className="text-xs bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2.5 py-0.5">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        {lawyer.phone && (
          <a href={`tel:${lawyer.phone}`} className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
            <span>📞</span> {lawyer.phone}
          </a>
        )}
        {lawyer.email && (
          <a href={`mailto:${lawyer.email}`} className="flex items-center gap-2 text-sm text-brand-600 hover:underline">
            <span>✉</span> {lawyer.email}
          </a>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-2/5" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-24" />
        <div className="h-5 bg-gray-200 rounded-full w-20" />
      </div>
    </div>
  );
}

export default function Lawyers() {
  const navigate = useNavigate();
  const [lawyers, setLawyers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [region, setRegion]       = useState('');
  const [specialty, setSpecialty] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (region)    params.region    = region;
    if (specialty) params.specialty = specialty;

    api.lawyers(params)
      .then((data) => setLawyers(data.lawyers || []))
      .catch((e)   => setError(e.message))
      .finally(()  => setLoading(false));
  }, [region, specialty]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onLogout={() => { clearSession(); navigate('/'); }} />

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find a Lawyer</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verified Ghana lawyers who can help you understand and act on your document.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="input flex-1 text-sm"
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="input flex-1 text-sm"
          >
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="card text-center py-10 text-red-500 text-sm">{error}</div>
        ) : lawyers.length === 0 ? (
          <div className="card text-center py-14">
            <p className="text-4xl mb-3">⚖️</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No lawyers found</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try changing the region or specialty filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lawyers.map((l) => <LawyerCard key={l.id} lawyer={l} />)}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8 px-4">
          Lawyers listed here are independent professionals. Klaro does not endorse any individual lawyer.
        </p>
      </main>
    </div>
  );
}
