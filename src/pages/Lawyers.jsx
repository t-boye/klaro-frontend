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

const AVATAR_COLORS = [
  '#1B4332', '#2D6A4F', '#52B788', '#1E3A5F', '#2B4C7E',
  '#6B3D2E', '#5C4033', '#4A1942', '#3B3B6E', '#1A5276',
];

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Lawyer card ─────────────────────────────────────────────────────────────

function LawyerCard({ lawyer }) {
  const [expanded, setExpanded] = useState(false);
  const color = getAvatarColor(lawyer.name);
  const hasContact = lawyer.whatsapp || lawyer.phone || lawyer.email;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-md hover:border-brand-200 dark:hover:border-brand-700 transition-all">
      {/* Card header */}
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
          style={{ background: color }}
        >
          {getInitials(lawyer.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{lawyer.name}</p>
                {/* GBA verified badge */}
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 rounded-full px-2 py-0.5">
                  <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  GBA Verified
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {lawyer.region}
                </span>
                {lawyer.years_experience > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {lawyer.years_experience} yrs exp.
                  </span>
                )}
                {lawyer.gba_number && (
                  <span className="text-xs text-gray-300 dark:text-gray-600">#{lawyer.gba_number}</span>
                )}
              </div>
            </div>

            {/* Fee */}
            {lawyer.consultation_fee_ghs > 0 && (
              <div className="text-right flex-shrink-0 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-1.5">
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">Consultation</p>
                <p className="text-sm font-bold text-brand-600 dark:text-brand-400 leading-tight">
                  GH₵{Number(lawyer.consultation_fee_ghs).toFixed(0)}
                </p>
              </div>
            )}
          </div>

          {/* Specialties */}
          {lawyer.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {lawyer.specialties.map((s) => (
                <span key={s} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2.5 py-0.5">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {lawyer.bio && (
        <div className="px-5 pb-4 border-t border-gray-50 dark:border-gray-700/50 pt-3">
          <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {lawyer.bio}
          </p>
          {lawyer.bio.length > 130 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-brand-600 dark:text-brand-400 mt-1 hover:underline font-medium"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Contact row */}
      {hasContact && (
        <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex-wrap">
          {lawyer.whatsapp && (
            <a
              href={`https://wa.me/${lawyer.whatsapp.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg px-3 py-1.5 hover:bg-green-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                <path d="M11.998 2C6.477 2 2 6.477 2 12c0 1.99.583 3.845 1.587 5.403L2 22l4.688-1.542A9.932 9.932 0 0011.998 22c5.522 0 10-4.478 10-10s-4.478-10-10-10z"/>
              </svg>
              WhatsApp
            </a>
          )}
          {lawyer.phone && (
            <a
              href={`tel:${lawyer.phone}`}
              className="flex items-center gap-1.5 text-xs font-semibold bg-brand-600 text-white rounded-lg px-3 py-1.5 hover:bg-brand-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"/>
              </svg>
              Call
            </a>
          )}
          {lawyer.email && (
            <a
              href={`mailto:${lawyer.email}`}
              className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg px-3 py-1.5 hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Email
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
          </div>
        </div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
    </div>
  );
}

// ─── Apply modal ─────────────────────────────────────────────────────────────

const LANGUAGES_OPTIONS = [
  { code: 'en', label: 'English' }, { code: 'tw', label: 'Twi' },
  { code: 'ga', label: 'Ga' },      { code: 'ewe', label: 'Ewe' },
  { code: 'dag', label: 'Dagbani' },{ code: 'ha', label: 'Hausa' },
  { code: 'fan', label: 'Fante' },
];

const EMPTY_FORM = {
  full_name: '', email: '', phone: '', whatsapp: '', gba_number: '',
  region: '', specialties: [], years_experience: '', consultation_fee_ghs: '',
  languages: ['en'], bio: '', docs_url: '',
};

// Multi-step apply modal
const STEPS = ['Personal info', 'Practice details', 'Verification'];

function ApplyModal({ onClose }) {
  const [step,    setStep]    = useState(0);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })); }
  function toggleArr(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  }

  function validateStep() {
    if (step === 0) {
      if (!form.full_name.trim()) return 'Full name is required.';
      if (!form.email.trim()) return 'Email is required.';
      if (!form.phone.trim()) return 'Phone number is required.';
      if (!form.gba_number.trim()) return 'GBA number is required.';
    }
    if (step === 1) {
      if (!form.region) return 'Select your region.';
      if (form.specialties.length === 0) return 'Select at least one specialty.';
      if (form.bio.trim().length < 50) return 'Bio must be at least 50 characters.';
    }
    if (step === 2) {
      if (!form.docs_url.trim()) return 'Verification document link is required.';
    }
    return null;
  }

  function handleNext(e) {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(''); setSaving(true);
    try {
      await api.lawyerApplication.submit({
        ...form,
        years_experience:     parseInt(form.years_experience) || 0,
        consultation_fee_ghs: parseFloat(form.consultation_fee_ghs) || 0,
      });
      setSuccess(true);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 sm:pt-14" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Apply to join Klaro</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xl leading-none">&times;</button>
          </div>

          {!success && (
            /* Step progress */
            <div className="flex items-center gap-0">
              {STEPS.map((label, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < step ? 'bg-brand-600 text-white' :
                      i === step ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-900/40' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}>
                      {i < step
                        ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        : i + 1
                      }
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-brand-700 dark:text-brand-400' : 'text-gray-400'}`}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${i < step ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">Application submitted!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              Thank you, <strong className="text-gray-700 dark:text-gray-300">{form.full_name.split(' ')[0]}</strong>.
              Our team will review your credentials and contact you at <strong className="text-gray-700 dark:text-gray-300">{form.email}</strong> within 3 business days.
            </p>
            <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors">Done</button>
          </div>
        ) : (
          <form className="flex-1 overflow-y-auto">
            {error && (
              <div className="mx-6 mt-4 text-sm text-red-700 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            {/* Step 0 — Personal info */}
            {step === 0 && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Full name *</label>
                    <input required value={form.full_name} onChange={e => set('full_name', e.target.value)} className="input text-sm w-full" placeholder="e.g. Kwabena Ofori-Atta" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Email address *</label>
                    <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input text-sm w-full" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">GBA number *</label>
                    <input required value={form.gba_number} onChange={e => set('gba_number', e.target.value)} className="input text-sm w-full" placeholder="GBA/2015/0412" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Phone number *</label>
                    <input required value={form.phone} onChange={e => set('phone', e.target.value)} className="input text-sm w-full" placeholder="+233 24 000 0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">WhatsApp <span className="font-normal text-gray-400">(optional)</span></label>
                    <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} className="input text-sm w-full" placeholder="+233 24 000 0000" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 — Practice details */}
            {step === 1 && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Region *</label>
                    <select required value={form.region} onChange={e => set('region', e.target.value)} className="input text-sm w-full">
                      <option value="">Select region</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Years of experience</label>
                    <input type="number" min="0" max="50" value={form.years_experience} onChange={e => set('years_experience', e.target.value)} className="input text-sm w-full" placeholder="0" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Consultation fee (GH₵)</label>
                    <input type="number" min="0" value={form.consultation_fee_ghs} onChange={e => set('consultation_fee_ghs', e.target.value)} className="input text-sm w-full" placeholder="e.g. 200" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Specialties * <span className="font-normal text-gray-400">(select all that apply)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(s => (
                      <button key={s} type="button" onClick={() => toggleArr('specialties', s)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.specialties.includes(s) ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-brand-300'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Languages spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES_OPTIONS.map(l => (
                      <button key={l.code} type="button" onClick={() => toggleArr('languages', l.code)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.languages.includes(l.code) ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-brand-300'}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Professional bio * <span className="font-normal text-gray-400">(min. 50 chars)</span>
                  </label>
                  <textarea required value={form.bio} onChange={e => set('bio', e.target.value)} rows={4} className="input text-sm w-full resize-none"
                    placeholder="Describe your legal expertise, practice areas, and how you help clients in Ghana..." />
                  <p className={`text-xs mt-1 ${form.bio.length < 50 ? 'text-gray-400' : 'text-brand-600'}`}>{form.bio.length} / 50 characters minimum</p>
                </div>
              </div>
            )}

            {/* Step 2 — Verification */}
            {step === 2 && (
              <div className="p-6 space-y-5">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Verification required</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    You must provide a link to your GBA practising certificate. Applications without a valid certificate will be rejected.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Link to GBA certificate *</label>
                  <input required type="url" value={form.docs_url} onChange={e => set('docs_url', e.target.value)} className="input text-sm w-full" placeholder="https://drive.google.com/..." />
                  <p className="text-xs text-gray-400 mt-1.5">Upload to Google Drive, Dropbox, or any cloud storage and paste the shareable link here.</p>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-1.5">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Review your application</p>
                  {[
                    ['Name', form.full_name],
                    ['Email', form.email],
                    ['Phone', form.phone],
                    ['Region', form.region],
                    ['GBA No.', form.gba_number],
                    ['Specialties', form.specialties.join(', ') || 'None selected'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 text-xs">
                      <span className="text-gray-400 flex-shrink-0">{label}</span>
                      <span className="text-gray-700 dark:text-gray-300 text-right truncate">{value || 'Not provided'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex gap-3 px-6 pb-6 pt-2 flex-shrink-0">
              {step > 0 && (
                <button type="button" onClick={() => { setError(''); setStep(s => s - 1); }}
                  className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={handleNext}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors">
                  Continue
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={saving}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                  {saving
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                    : 'Submit application'
                  }
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Lawyers() {
  const navigate  = useNavigate();
  const [lawyers,   setLawyers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [region,    setRegion]    = useState('');
  const [specialty, setSpecialty] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [view,      setView]      = useState('grid'); // 'grid' | 'list'

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

  const isFiltered = !!(region || specialty);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onLogout={() => { clearSession(); navigate('/'); }} />
      {showApply && <ApplyModal onClose={() => setShowApply(false)} />}

      {/* Hero header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Verified lawyers</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Find a Ghana Lawyer</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                Verified GBA members ready to help you act on your document analysis. All lawyers listed are qualified and registered.
              </p>
            </div>
            <button
              onClick={() => setShowApply(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Apply as a lawyer</span>
              <span className="sm:hidden">Apply</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-5 py-6">

        {/* Filter bar */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3 mb-5 space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <select value={region} onChange={e => setRegion(e.target.value)} className="input pl-9 text-sm w-full appearance-none">
                <option value="">All regions</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="input pl-9 text-sm w-full appearance-none">
                <option value="">All specialties</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {isFiltered && (
              <button onClick={() => { setRegion(''); setSpecialty(''); }} className="px-3 text-sm border border-gray-200 dark:border-gray-600 text-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
                Clear
              </button>
            )}
          </div>
          {/* Active filter chips */}
          {isFiltered && (
            <div className="flex gap-2 flex-wrap">
              {region && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700 rounded-full px-3 py-1 font-medium">
                  {region}
                  <button onClick={() => setRegion('')} className="hover:text-brand-900">×</button>
                </span>
              )}
              {specialty && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700 rounded-full px-3 py-1 font-medium">
                  {specialty}
                  <button onClick={() => setSpecialty('')} className="hover:text-brand-900">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results header: count + view toggle */}
        {!loading && !error && lawyers.length > 0 && (
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {lawyers.length} lawyer{lawyers.length !== 1 ? 's' : ''}{isFiltered ? ' (filtered)' : ''}
            </p>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <button onClick={() => setView('grid')} title="Grid view"
                className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button onClick={() => setView('list')} title="List view"
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-10 text-center">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Could not load lawyers</p>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
        ) : lawyers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-14 text-center">
            <p className="text-5xl mb-4">👨‍⚖️</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No lawyers found</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {isFiltered ? 'Try a different region or specialty.' : 'No lawyers are listed yet.'}
            </p>
            {isFiltered && (
              <button onClick={() => { setRegion(''); setSpecialty(''); }} className="btn-primary text-sm">Clear filter</button>
            )}
          </div>
        ) : (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
            {lawyers.map(l => <LawyerCard key={l.id} lawyer={l} />)}
          </div>
        )}

        {/* CTA banner */}
        <div className="mt-8 bg-gradient-to-br from-brand-700 to-brand-900 rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #52B788 0%, transparent 50%)' }} />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="font-bold text-white text-base mb-1">Are you a GBA member?</p>
            <p className="text-sm text-white/70 mb-4 max-w-xs mx-auto">
              Join our verified directory. Clients come to you already having reviewed their documents.
            </p>
            <button onClick={() => setShowApply(true)} className="px-6 py-2.5 bg-white text-brand-700 rounded-xl text-sm font-bold hover:bg-brand-50 transition-colors shadow-sm">
              Apply to join
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-5 px-4 leading-relaxed">
          All lawyers listed are verified members of the Ghana Bar Association.
          Klaro is not responsible for the services provided by listed lawyers.
        </p>
      </main>
    </div>
  );
}
