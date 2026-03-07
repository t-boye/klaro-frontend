import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    bg: 'from-brand-600 to-brand-700',
    icon: (
      <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-xl overflow-hidden">
        <img src="/assets/logos/logo.png" alt="Klaro" className="w-full h-full object-contain p-3" />
      </div>
    ),
    title: 'Welcome to Klaro',
    subtitle: 'Your legal document companion',
    desc: "Every day, Ghanaians sign contracts they don't understand — losing money, land, and rights. Klaro reads your documents and explains what they mean, in plain language.",
  },
  {
    bg: 'from-indigo-600 to-indigo-700',
    icon: (
      <div className="w-28 h-28 bg-white/20 rounded-3xl flex items-center justify-center">
        <span className="text-6xl">📄</span>
      </div>
    ),
    title: 'Upload any document',
    subtitle: 'PDF, photo, or paste text',
    desc: 'Land agreements, music contracts, employment letters, loan forms, rental agreements — over 40 document types. Upload a PDF or paste the text directly.',
  },
  {
    bg: 'from-emerald-600 to-emerald-700',
    icon: (
      <div className="w-28 h-28 bg-white/20 rounded-3xl flex items-center justify-center flex-col gap-1 p-4">
        {[
          { color: 'bg-green-300',  label: 'STANDARD' },
          { color: 'bg-yellow-300', label: 'ATTENTION' },
          { color: 'bg-red-400',    label: 'DANGER' },
          { color: 'bg-blue-300',   label: 'YOUR RIGHTS' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 w-full">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
            <span className="text-white text-xs font-bold">{label}</span>
          </div>
        ))}
      </div>
    ),
    title: 'Colour-coded clauses',
    subtitle: 'See danger at a glance',
    desc: 'Every clause in your document gets a colour. GREEN is standard. YELLOW needs attention. RED is dangerous. BLUE gives you rights. No legal knowledge needed.',
  },
  {
    bg: 'from-amber-500 to-orange-600',
    icon: (
      <div className="w-28 h-28 bg-white/20 rounded-3xl flex items-center justify-center">
        <span className="text-6xl">🇬🇭</span>
      </div>
    ),
    title: 'Built for Ghana',
    subtitle: 'Ghana law. 7 local languages.',
    desc: "Klaro knows Ghana's Labour Act, Lands Act, Copyright Act, and real market norms — not US or UK law. Read explanations in English, Twi, Ga, Ewe, Dagbani, Hausa, or Fante.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  function complete() {
    localStorage.setItem('klaro_onboarded', 'true');
    navigate('/upload');
  }

  function next() {
    if (current < SLIDES.length - 1) setCurrent((c) => c + 1);
    else complete();
  }

  function skip() {
    complete();
  }

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b ${slide.bg} transition-all duration-500`}>
      {/* Skip */}
      <div className="flex justify-end px-5 pt-5">
        <button onClick={skip} className="text-white/70 text-sm font-medium hover:text-white">
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="mb-8">
          {slide.icon}
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2 leading-tight">
          {slide.title}
        </h1>
        <p className="text-white/80 font-semibold text-base mb-4">{slide.subtitle}</p>
        <p className="text-white/70 text-sm leading-relaxed max-w-xs">
          {slide.desc}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-12">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2.5 bg-white'
                  : 'w-2.5 h-2.5 bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className={`w-full bg-white font-bold text-base py-4 rounded-2xl shadow-lg active:scale-95 transition-transform ${
            current === 0 ? 'text-brand-600'
            : current === 1 ? 'text-indigo-600'
            : current === 2 ? 'text-emerald-600'
            : 'text-amber-600'
          }`}
        >
          {isLast ? 'Get started — it\'s free' : 'Next'}
        </button>
      </div>
    </div>
  );
}
