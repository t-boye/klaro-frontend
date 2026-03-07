import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { clearSession, getUser } from '../lib/auth';
import RiskBadge from '../components/RiskBadge';
import Navbar from '../components/Navbar';
import UpgradeModal from '../components/UpgradeModal';

function PlanBanner({ license, onUpgrade }) {
  if (!license) return null;
  const { plan, usage } = license;

  if (plan === 'trial') {
    const remaining = 3 - (usage.trialAnalysesUsed || 0);
    return (
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-brand-700 font-medium">
          Free trial: <strong>{remaining} analysis{remaining !== 1 ? 'es' : ''} remaining</strong>
        </p>
        <p className="text-xs text-brand-600 mt-1">
          <Link to="/upload" className="underline">Analyse a document</Link> or{' '}
          <button onClick={onUpgrade} className="underline">choose a plan</button> for more.
        </p>
      </div>
    );
  }

  if (plan === 'individual') {
    const remaining = 5 - (usage.documentsThisMonth || 0);
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-green-700 font-medium">
          Individual plan: <strong>{remaining} document{remaining !== 1 ? 's' : ''} left this month</strong>
        </p>
        {remaining === 0 && (
          <button onClick={onUpgrade} className="text-xs text-green-700 underline mt-1">Upgrade to Professional for unlimited</button>
        )}
      </div>
    );
  }

  if (plan === 'pay_per_doc') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-700 font-medium">Pay-per-document plan</p>
        <p className="text-xs text-gray-500 mt-1">
          Each analysis requires a payment.{' '}
          <button onClick={onUpgrade} className="underline text-brand-600">Switch to a monthly plan</button> for better value.
        </p>
      </div>
    );
  }

  if (plan === 'professional' || plan === 'business') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-green-700 font-medium capitalize">{plan} plan — unlimited analyses</p>
      </div>
    );
  }

  return null;
}

function SkeletonCard() {
  return (
    <div className="card flex items-center gap-4 animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/5" />
        <div className="h-3 bg-gray-200 rounded w-2/5" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
      <div className="h-6 w-16 bg-gray-200 rounded-full flex-shrink-0" />
    </div>
  );
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const user      = getUser();
  const [analyses, setAnalyses]       = useState([]);
  const [license, setLicense]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [deleting, setDeleting]       = useState(null); // id being deleted

  useEffect(() => {
    Promise.all([api.analyze.list(), api.license()])
      .then(([aData, lData]) => {
        setAnalyses(aData.analyses || []);
        setLicense(lData);
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(e, id) {
    e.preventDefault(); // don't navigate to analysis
    e.stopPropagation();
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.analyze.remove(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message || 'Could not delete analysis.');
    } finally {
      setDeleting(null);
    }
  }

  function logout() {
    clearSession();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onLogout={logout} />

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.full_name ? `Hi, ${user.full_name.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your document analyses</p>
          </div>
          <Link to="/upload" className="btn-primary text-sm">
            + Analyse
          </Link>
        </div>

        <PlanBanner license={license} onUpgrade={() => setShowUpgrade(true)} />

        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : loadError ? (
          <div className="card text-center py-10 text-red-500 text-sm">{loadError}</div>
        ) : analyses.length === 0 ? (
          <div className="card text-center py-14">
            <p className="text-4xl mb-3">📄</p>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No analyses yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Upload a document to get started.</p>
            <Link to="/upload" className="btn-primary">Analyse your first document</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((a) => (
              <Link
                key={a.id}
                to={`/analysis/${a.id}`}
                className="card flex items-center gap-4 hover:border-brand-200 hover:shadow transition-all relative group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{a.document_type || 'Legal Document'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{a.original_filename || 'Unnamed document'}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(a.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <RiskBadge risk={a.overall_risk} />
                <button
                  onClick={(e) => handleDelete(e, a.id)}
                  disabled={deleting === a.id}
                  className="ml-1 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                  title="Delete analysis"
                >
                  {deleting === a.id ? '…' : '✕'}
                </button>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
