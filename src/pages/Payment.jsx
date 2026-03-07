import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { clearSession } from '../lib/auth';

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

    api.payment.verify(reference)
      .then((data) => {
        if (data.status === 'success') {
          setStatus('success');
          setMessage('Payment confirmed! Your plan has been activated.');
        } else {
          setStatus('failed');
          setMessage('Payment was not successful. Please try again.');
        }
      })
      .catch((err) => {
        setStatus('failed');
        setMessage(err.message || 'Could not verify payment.');
      });
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
