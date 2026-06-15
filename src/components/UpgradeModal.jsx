import React, { useState } from 'react';
import { api } from '../lib/api';
import { getUser } from '../lib/auth';

const COUNTRY_CURRENCIES = {
  GH: 'GHS', NG: 'NGN', ZA: 'ZAR', KE: 'KES',
  CI: 'XOF', SN: 'XOF', EG: 'EGP',
  // RW and TZ not yet supported by Paystack — fall through to USD
  RW: 'USD', TZ: 'USD',
};

// Countries where payment is not yet available via Paystack
const PAYMENT_COMING_SOON = new Set(['RW', 'TZ']);

const CURRENCY_SYMBOLS = {
  GHS: 'GHS', NGN: '₦', ZAR: 'R', KES: 'KSh', RWF: 'RWF', XOF: 'CFA', EGP: 'EGP', TZS: 'TZS',
};

const PLAN_AMOUNTS = {
  GHS: { basic: 25,   full: 40,   twi: 55,   individual: 89,    professional: 199,   business: 399   },
  NGN: { basic: 2500, full: 4000, twi: 5500, individual: 8900,  professional: 19900, business: 39900 },
  ZAR: { basic: 30,   full: 50,   twi: 70,   individual: 120,   professional: 270,   business: 540   },
  KES: { basic: 250,  full: 400,  twi: 550,  individual: 900,   professional: 2000,  business: 4000  },
  RWF: { basic: 2000, full: 3200, twi: 4400, individual: 7200,  professional: 16000, business: 32000 },
  XOF: { basic: 1000, full: 1600, twi: 2200, individual: 3600,  professional: 8000,  business: 16000 },
  EGP: { basic: 80,   full: 130,  twi: 180,  individual: 290,   professional: 650,   business: 1300  },
  TZS: { basic: 4000, full: 6500, twi: 9000, individual: 14500, professional: 32000, business: 65000 },
};

const PLAN_DEFS = [
  { key: 'basic',        label: 'Pay Per Doc – English',         desc: 'Full English analysis, colour-coded risk, 30-day history' },
  { key: 'full',         label: 'Pay Per Doc – Full',            desc: 'Full analysis + country law context + suggested questions' },
  { key: 'twi',         label: 'Pay Per Doc – Multilingual',    desc: 'Full analysis in English + any supported African language' },
  { key: 'individual',   label: 'Individual Monthly',            desc: '5 documents/month, all languages, Ask Klaro chat', monthly: true },
  { key: 'professional', label: 'Professional Monthly',          desc: 'Unlimited documents, PDF export, priority support', monthly: true },
  { key: 'business',     label: 'Business Monthly',              desc: '5 seats, unlimited documents, dedicated support', monthly: true },
];

function formatAmount(amount, symbol) {
  if (amount >= 1000) return `${symbol} ${amount.toLocaleString()}`;
  return `${symbol} ${amount}`;
}

export default function UpgradeModal({ onClose }) {
  const [loading, setLoading] = useState('');
  const [error, setError]     = useState('');

  const user            = getUser();
  const country         = user?.country || 'GH';
  const paymentSoon     = PAYMENT_COMING_SOON.has(country);
  const currency        = COUNTRY_CURRENCIES[country] || 'GHS';
  const symbol          = CURRENCY_SYMBOLS[currency] || currency;
  const amounts         = PLAN_AMOUNTS[currency] || PLAN_AMOUNTS.GHS;

  async function handleSelect(planKey) {
    if (paymentSoon) return;
    setError('');
    setLoading(planKey);
    try {
      const data = await api.payment.initiate(planKey, window.location.origin + '/payment/callback');
      window.location.href = data.authorization_url;
    } catch (e) {
      setError(e.message);
      setLoading('');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Choose a plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-3">
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

          {paymentSoon ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-5 text-center">
              <p className="text-2xl mb-2">🌍</p>
              <p className="text-sm font-semibold text-amber-800 mb-1">Payments coming soon to your country</p>
              <p className="text-xs text-amber-700 leading-relaxed">We're onboarding a local payment provider for Rwanda and Tanzania. In the meantime, contact us at <span className="font-medium">support@klaro.app</span> to get access.</p>
            </div>
          ) : (
            PLAN_DEFS.map((plan) => {
              const amount = amounts[plan.key];
              const price  = `${formatAmount(amount, symbol)}${plan.monthly ? '/mo' : ''}`;
              return (
                <button
                  key={plan.key}
                  onClick={() => handleSelect(plan.key)}
                  disabled={!!loading}
                  className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">{plan.label}</p>
                    <p className="font-bold text-brand-600 text-sm">{price}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
                  {loading === plan.key && <p className="text-xs text-brand-600 mt-1">Redirecting to payment...</p>}
                </button>
              );
            })
          )}
        </div>

        <div className="px-5 pb-5">
          <p className="text-xs text-gray-400 text-center">
            Payments processed securely by Paystack. Supports mobile money, cards &amp; bank transfer.
          </p>
        </div>
      </div>
    </div>
  );
}
