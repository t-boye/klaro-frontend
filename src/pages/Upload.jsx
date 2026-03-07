import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import UpgradeModal from '../components/UpgradeModal';
import { clearSession } from '../lib/auth';

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

export default function Upload() {
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [mode, setMode]           = useState('upload'); // 'upload' | 'paste'
  const [text, setText]           = useState('');
  const [filename, setFilename]   = useState('');
  const [language, setLanguage]   = useState('en');
  const [loading, setLoading]     = useState(false);
  const [progress, setProgress]   = useState('');
  const [error, setError]         = useState('');
  const [dragging, setDragging]   = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setError('');
    setFilename(file.name);
    if (file.type === 'application/pdf') {
      setProgress('Extracting text from PDF...');
      try {
        const extracted = await extractPdfText(file);
        setText(extracted);
        setProgress('');
      } catch {
        setError('Could not extract text from this PDF. Try pasting the text instead.');
        setProgress('');
      }
    } else if (file.type.startsWith('text/')) {
      const t = await file.text();
      setText(t);
    } else {
      setError('Please upload a PDF or text file.');
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
    if (!text.trim() || text.trim().length < 50) {
      return setError('Please upload a document or paste document text (at least 50 characters).');
    }

    setLoading(true);
    setProgress('Analysing your document with Klaro...');

    try {
      const data = await api.analyze.create({ text, filename, language });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Analyse a document</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload a PDF or paste your document text below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${mode === 'upload' ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-700 border-gray-200'}`}
            >
              Upload PDF
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
              <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleFile} />
              <p className="text-4xl mb-3">{dragging ? '📥' : '📂'}</p>
              {filename ? (
                <p className="font-medium text-gray-900">{filename}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">
                    {dragging ? 'Drop it here' : 'Tap to choose or drag a PDF/text file'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF or TXT · Max 50MB</p>
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
                { v: 'en',  l: 'English' },
                { v: 'tw',  l: 'Twi' },
                { v: 'ga',  l: 'Ga' },
                { v: 'ewe', l: 'Ewe' },
                { v: 'dag', l: 'Dagbani' },
                { v: 'ha',  l: 'Hausa' },
                { v: 'fan', l: 'Fante' },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLanguage(v)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    language === v
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            {language !== 'en' && (
              <p className="text-xs text-amber-600 mt-1">Local language explanations available on Individual plan and above.</p>
            )}
          </div>

          {progress && (
            <div className="flex items-center gap-3 text-sm text-brand-600">
              <Spinner className="w-4 h-4" /> {progress}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn-primary w-full text-base py-4" disabled={loading || !text.trim()}>
            {loading ? 'Analysing...' : 'Analyse document'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Klaro explains documents. It does not give legal advice. Consult a qualified Ghana lawyer for advice on what to do.
        </p>
      </main>
    </div>
  );
}
