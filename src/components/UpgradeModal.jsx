import React, { useState } from 'react';
import { api } from '../lib/api';

const PLANS = [
  { key: 'basic',        label: 'Pay Per Doc – Basic',        price: 'GHS 25',     desc: 'Full English analysis, colour-coded risk, 30-day history' },
  { key: 'full',         label: 'Pay Per Doc – Full',         price: 'GHS 40',     desc: 'Full analysis + Ghana law context + suggested questions' },
  { key: 'twi',          label: 'Pay Per Doc – Multilingual', price: 'GHS 55',     desc: 'Full analysis in English + any of 7 Ghanaian languages' },
  { key: 'individual',   label: 'Individual Monthly',         price: 'GHS 89/mo',  desc: '5 documents/month, all languages, Ask Klaro chat' },
  { key: 'professional', label: 'Professional Monthly',       price: 'GHS 199/mo', desc: 'Unlimited documents, PDF export, priority support' },
  { key: 'business',     label: 'Business Monthly',           price: 'GHS 399/mo', desc: '5 seats, unlimited documents, dedicated support' },
];

export default function UpgradeModal({ onClose }) {
  const [loading, setLoading] = useState('');
  const [error, setError]     = useState('');

  async function handleSelect(planKey) {
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

          {PLANS.map((plan) => (
            <button
              key={plan.key}
              onClick={() => handleSelect(plan.key)}
              disabled={!!loading}
              className="w-full text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">{plan.label}</p>
                <p className="font-bold text-brand-600 text-sm">{plan.price}</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
              {loading === plan.key && <p className="text-xs text-brand-600 mt-1">Redirecting to payment...</p>}
            </button>
          ))}
        </div>

        <div className="px-5 pb-5">
          <p className="text-xs text-gray-400 text-center">
            Payments processed securely by Paystack. Supports MoMo, Visa & bank transfer.
          </p>
        </div>
      </div>
    </div>
  );
}
