import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import UpgradeModal from '../components/UpgradeModal';
import { clearSession, getUser } from '../lib/auth';
import { useLang } from '../context/LangContext';

const MAX_FILE_BYTES = 50 * 1024 * 1024;

const ANALYSE_STEPS = [
  { label: 'Reading document'        },
  { label: 'Detecting document type' },
  { label: 'Analysing clauses'       },
  { label: 'Finalising results'      },
];

async function extractPdfText(file) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }
  return text;
}

async function extractDocxText(file) {
  const mammoth = await import('mammoth');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

const LOCAL_LANG_PLANS = ['pay_per_doc', 'individual', 'professional', 'business'];

export default function Upload() {
  const navigate = useNavigate();
  const fileRef  = useRef();
  const user     = getUser();
  const { t, lang } = useLang();
  const canUseLocalLang = LOCAL_LANG_PLANS.includes(user?.plan);

  const [mode, setMode]           = useState('upload');
  const [text, setText]           = useState('');
  const [filename, setFilename]   = useState('');
  const [language, setLanguage]   = useState(lang === 'fr' && canUseLocalLang ? 'fr' : 'en');
  const [loading, setLoading]     = useState(false);
  const [progress, setProgress]   = useState('');
  const [analyseStep, setAnalyseStep] = useState(0);
  const [error, setError]         = useState('');
  const [dragging, setDragging]   = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!loading) { setAnalyseStep(0); return; }
    const delays = [4000, 10000, 28000];
    const timers = delays.map((d, i) => setTimeout(() => setAnalyseStep(i + 1), d));
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setError('');
    setFilename(file.name);

    if (file.size > MAX_FILE_BYTES) {
      setError('File is too large. Maximum size is 50 MB.');
      return;
    }

    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || file.name.toLowerCase().endsWith('.docx');
    const isDoc = file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc');

    if (file.type === 'application/pdf') {
      setProgress('Extracting text from PDF...');
      try {
        const extracted = await extractPdfText(file);
        if (!extracted.trim()) {
          setError('This PDF appears to be image-only (scanned). Please copy and paste the text instead.');
          setProgress('');
          return;
        }
        setText(extracted);
        setProgress('');
      } catch {
        setError('Could not read this PDF. It may be password-protected or corrupted. Try pasting the text instead.');
        setProgress('');
      }
    } else if (isDocx) {
      setProgress('Extracting text from Word document...');
      try {
        const extracted = await extractDocxText(file);
        if (!extracted.trim()) {
          setError('This Word document appears to be empty or image-only. Please copy and paste the text instead.');
          setProgress('');
          return;
        }
        setText(extracted);
        setProgress('');
      } catch {
        setError('Could not read this Word document. Try saving as PDF or pasting the text instead.');
        setProgress('');
      }
    } else if (isDoc) {
      setError('Older .doc files are not supported. Please save as .docx or PDF and try again.');
    } else if (file.type.startsWith('text/')) {
      const t = await file.text();
      setText(t);
    } else {
      setError('Please upload a PDF, Word document (.docx), or plain text file.');
    }
  }, []);

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleFile(e) {
    processFile(e.target.files?.[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!text.trim() || text.trim().length < 30) {
      return setError('The document text is too short. Please upload a PDF or paste at least a few sentences of contract text.');
    }

    setLoading(true);

    try {
      const data = await api.analyze.create({ text, filename, language, country: user?.country || undefined });
      // Store result + id in sessionStorage so Analysis page can render immediately
      sessionStorage.setItem('klaro_analysis', JSON.stringify(data.analysis));
      sessionStorage.setItem('klaro_analysis_id', data.id);
      navigate('/analysis/new');
    } catch (err) {
      if (err.status === 403) {
        setShowUpgrade(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      setProgress('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onLogout={() => { clearSession(); navigate('/'); }} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <main className="max-w-2xl mx-auto px-5 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">&larr; Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{t('upload.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('upload.sub')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${mode === 'upload' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-200'}`}
            >
              Upload file
            </button>
            <button
              type="button"
              onClick={() => setMode('paste')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${mode === 'paste' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-200'}`}
            >
              Paste text
            </button>
          </div>

          {/* Upload area */}
          {mode === 'upload' && (
            <div
              className={`card border-2 border-dashed text-center py-10 cursor-pointer transition-colors ${
                dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-brand-400'
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFile} />
              <p className="text-4xl mb-3">{dragging ? '📥' : '📂'}</p>
              {filename ? (
                <p className="font-medium text-gray-900">{filename}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    {dragging ? 'Drop it here' : 'Tap to choose or drag a file here'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Word (.docx) or TXT · Max 50MB</p>
                </>
              )}
              {text && <p className="text-xs text-green-600 mt-2">Text extracted successfully ({text.length.toLocaleString()} chars)</p>}
            </div>
          )}

          {/* Paste area */}
          {mode === 'paste' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paste your document text
              </label>
              <textarea
                className="input min-h-[200px] resize-y font-mono text-sm"
                placeholder="Paste the text of your contract or agreement here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Explanation language</label>
            <div className="flex flex-wrap gap-2">
              {[
                { v: 'en',  l: 'English',  local: false },
                { v: 'tw',  l: 'Twi',      local: true },
                { v: 'ga',  l: 'Ga',       local: true },
                { v: 'ewe', l: 'Ewe',      local: true },
                { v: 'dag', l: 'Dagbani',  local: true },
                { v: 'ha',  l: 'Hausa',    local: true },
                { v: 'fan', l: 'Fante',    local: true },
                { v: 'sw',  l: 'Swahili',  local: true },
                { v: 'fr',  l: 'French',   local: true },
                { v: 'ar',  l: 'Arabic',   local: true },
              ].map(({ v, l, local }) => {
                const locked = local && !canUseLocalLang;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { if (!locked) setLanguage(v); else setShowUpgrade(true); }}
                    title={locked ? 'Requires Individual plan or above' : undefined}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 ${
                      language === v
                        ? 'bg-brand-600 text-white border-brand-600'
                        : locked
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-pointer'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                    }`}
                  >
                    {l}{locked && <span className="text-xs">🔒</span>}
                  </button>
                );
              })}
            </div>
            {!canUseLocalLang && (
              <p className="text-xs text-amber-600 mt-1">
                Local language explanations require an <button type="button" onClick={() => setShowUpgrade(true)} className="underline font-medium">Individual plan or above</button>.
              </p>
            )}
            {['ga', 'dag', 'ha', 'ar'].includes(language) && (
              <div className="flex items-start gap-2 mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2.5">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">Heads up:</span> Your document will be fully analysed in English then translated — {{ ga: 'Ga', dag: 'Dagbani', ha: 'Hausa', ar: 'Arabic' }[language]} text support uses a translation step. Voice reading will use your device's built-in voice.
                </p>
              </div>
            )}
          </div>

          {progress && !loading && (
            <div className="flex items-center gap-3 text-sm text-brand-600">
              <Spinner className="w-4 h-4" /> {progress}
            </div>
          )}

          {loading && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Analysing your document…</p>
                <span className="text-xs text-gray-400 dark:text-gray-500">30–60 seconds</span>
              </div>
              <div className="space-y-3">
                {ANALYSE_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 transition-opacity duration-500 ${i <= analyseStep ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                      i < analyseStep  ? 'bg-brand-600 text-white' :
                      i === analyseStep ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 ring-2 ring-brand-500 ring-offset-1' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}>
                      {i < analyseStep
                        ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                        : i + 1
                      }
                    </div>
                    <span className={`text-sm ${i === analyseStep ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                      {s.label}
                      {i === analyseStep && (
                        <span className="inline-block w-1 h-3.5 bg-brand-500 ml-1.5 align-middle rounded-full animate-pulse" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn-primary w-full text-base py-4" disabled={loading || !text.trim()}>
            {loading ? t('common.loading') : t('upload.btn')}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Klaro explains documents. It does not give legal advice. Consult a qualified lawyer in your country for advice on what to do.
        </p>
      </main>
    </div>
  );
}
