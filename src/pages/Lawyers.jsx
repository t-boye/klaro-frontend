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
  'Employment Law', 'Labour Relations', 'Land Law', 'Property Law',
  'Contract Law', 'Corporate Law', 'Business Law', 'Family Law',
  'Inheritance Law', 'Criminal Law', 'Human Rights', 'IP Law',
  'Commercial Law', 'Civil Litigation', 'Probate', 'Conveyancing',
];

function LawyerCard({ lawyer }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card hover:border-brand-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-full bg-brand-600 flex-shrink-0 overflow-hidden">
            <svg viewBox="0 0 44 44" fill="none" width="44" height="44">
              <ellipse cx="22" cy="40" rx="15" ry="9" fill="#52B788" opacity="0.85" />
              <circle cx="22" cy="18" r="9" fill="#52B788" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white">{lawyer.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lawyer.region}{lawyer.years_experience > 0 ? ` · ${lawyer.years_experience} yrs experience` : ''}
            </p>
            {lawyer.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {lawyer.specialties.map((s) => (
                  <span key={s} className="text-xs bg-brand-50 text-brand-700 border border-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800 rounded-full px-2.5 py-0.5">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {lawyer.consultation_fee_ghs > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">Consultation</p>
            <p className="text-sm font-bold text-brand-600">GH₵ {Number(lawyer.consultation_fee_ghs).toFixed(0)}</p>
          </div>
        )}
      </div>

      {lawyer.bio && (
        <div className="mt-3">
          <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{lawyer.bio}</p>
          {lawyer.bio.length > 120 && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-brand-600 mt-1 hover:underline">
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {lawyer.whatsapp && (
          <a href={`https://wa.me/${lawyer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              <path d="M11.998 2C6.477 2 2 6.477 2 12c0 1.99.583 3.845 1.587 5.403L2 22l4.688-1.542A9.932 9.932 0 0011.998 22c5.522 0 10-4.478 10-10s-4.478-10-10-10z"/>
            </svg>
            WhatsApp
          </a>
        )}
        {lawyer.phone && (
          <a href={`tel:${lawyer.phone}`}
            className="flex items-center gap-1.5 text-sm font-medium bg-brand-50 text-brand-700 border border-brand-100 rounded-lg px-3 py-1.5 hover:bg-brand-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"/>
            </svg>
            Call
          </a>
        )}
        {lawyer.email && (
          <a href={`mailto:${lawyer.email}`}
            className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Email
          </a>
        )}
        {lawyer.gba_number && (
          <span className="text-xs text-gray-400 dark:text-gray-500 self-center ml-auto">GBA {lawyer.gba_number}</span>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 rounded w-2/5" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-24" />
        <div className="h-5 bg-gray-200 rounded-full w-20" />
      </div>
    </div>
  );
}

export default function Lawyers() {
  const navigate = useNavigate();
  const [lawyers,   setLawyers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [region,    setRegion]    = useState('');
  const [specialty, setSpecialty] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verified Ghana lawyers who can help you act on your document analysis.</p>
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="input flex-1 text-sm">
            <option value="">All regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input flex-1 text-sm">
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>
        ) : error ? (
          <div className="card text-center py-10 text-red-500 text-sm">{error}</div>
        ) : lawyers.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-3xl mb-3">👨‍⚖️</p>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">No lawyers found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try a different region or specialty.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">{lawyers.length} lawyer{lawyers.length !== 1 ? 's' : ''} found</p>
            {lawyers.map((l) => <LawyerCard key={l.id} lawyer={l} />)}
          </div>
        )}

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-8 px-4">
          All lawyers listed are verified members of the Ghana Bar Association.
          Klaro is not responsible for the services provided by listed lawyers.
        </p>
      </main>
    </div>
  );
}
