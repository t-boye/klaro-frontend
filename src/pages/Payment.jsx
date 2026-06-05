import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { clearSession, getUser, getToken, setSession } from '../lib/auth';

export default function Payment() {
  const navigate = useNavigate();
  const [params]  = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');

  const [status, setStatus]   = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found.');
      return;
    }

    // Retry up to 4 times with 2s delay — Paystack webhook may not have processed yet
    let attempts = 0;
    const MAX_ATTEMPTS = 4;
    const DELAY_MS = 2000;

    function attempt() {
      attempts++;
      api.payment.verify(reference)
        .then((data) => {
          if (data.status === 'success') {
            // Sync the new plan into localStorage so Navbar badge updates immediately
            api.license().then((licenseData) => {
              const currentUser = getUser();
              if (currentUser && licenseData.plan) {
                setSession(getToken(), { ...currentUser, plan: licenseData.plan });
              }
            }).catch(() => {});
            setStatus('success');
            setMessage('Payment confirmed! Your plan has been activated.');
          } else if (attempts < MAX_ATTEMPTS) {
            setTimeout(attempt, DELAY_MS);
          } else {
            setStatus('failed');
            setMessage('Payment could not be confirmed yet. If you were charged, please contact support and your plan will be activated shortly.');
          }
        })
        .catch((err) => {
          if (attempts < MAX_ATTEMPTS) {
            setTimeout(attempt, DELAY_MS);
          } else {
            setStatus('failed');
            setMessage(err.message || 'Could not verify payment.');
          }
        });
    }

    // Small initial delay so webhook has time to process first
    setTimeout(attempt, 1500);
  }, [reference]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={() => { clearSession(); navigate('/'); }} />
      <main className="max-w-sm mx-auto px-5 py-16 text-center">
        {status === 'verifying' && (
          <>
            <div className="flex justify-center mb-4">
              <Spinner className="w-12 h-12 text-brand-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">Verifying payment...</p>
            <p className="text-sm text-gray-500 mt-1">This only takes a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <p className="text-5xl mb-4">✓</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/upload" className="btn-primary">Analyse a document now</Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <p className="text-5xl mb-4">✗</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/dashboard" className="btn-primary">Back to dashboard</Link>
          </>
        )}
      </main>
    </div>
  );
}
