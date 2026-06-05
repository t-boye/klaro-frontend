import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] || '');
  useEffect(() => {
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting entry
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActive(top.target.id);
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []); // eslint-disable-line
  return [active, setActive];
}

const SECTIONS = [
  { id: 'collect',    title: '1. Information We Collect' },
  { id: 'use',        title: '2. How We Use Your Information' },
  { id: 'ai',         title: '3. Document Processing and AI' },
  { id: 'sharing',    title: '4. Data Sharing' },
  { id: 'security',   title: '5. Data Security' },
  { id: 'rights',     title: '6. Your Rights' },
  { id: 'storage',    title: '7. Cookies and Local Storage' },
  { id: 'children',   title: '8. Children\'s Privacy' },
  { id: 'changes',    title: '9. Changes to This Policy' },
  { id: 'contact',    title: '10. Contact Us' },
];

function SideNav({ active, onNav }) {
  return (
    <nav className="hidden lg:block sticky top-24 self-start w-52 flex-shrink-0">
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-3">On this page</p>
      {/* Progress bar */}
      <div className="relative">
        {/* Track line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
        {/* Active dot indicator */}
        <ul className="space-y-0.5 relative">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => onNav(s.id)}
                  className={`flex items-center gap-2.5 py-1.5 pr-2 rounded-r-lg transition-all group ${
                    isActive
                      ? 'text-brand-700 dark:text-brand-400'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {/* Dot on the track line */}
                  <span className={`relative z-10 w-2 h-2 rounded-full flex-shrink-0 ml-2.5 transition-all ${
                    isActive
                      ? 'bg-brand-600 scale-125 shadow-sm shadow-brand-300'
                      : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400'
                  }`} />
                  <span className={`text-xs leading-tight transition-all ${isActive ? 'font-semibold' : 'font-normal'}`}>
                    {s.title.replace(/^\d+\.\s/, '')}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function Section({ id, icon, title, children }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-base">
          {icon}
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-11">
        {children}
      </div>
    </section>
  );
}

function Highlight({ children }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-amber-800 dark:text-amber-300">
      {children}
    </div>
  );
}

export default function PrivacyPolicy() {
  const sectionIds = SECTIONS.map(s => s.id);
  const [active, setActive] = useActiveSection(sectionIds);

  return (
    <div className="min-h-screen bg-[#F8FAF7] dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link to="/">
            <img src="/assets/logos/logo.png" alt="Klaro" className="h-9 object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Terms</Link>
            <Link to="/" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
              Back to Klaro
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-12 flex gap-12">
        <SideNav active={active} onNav={setActive} />

        <main className="flex-1 min-w-0">
          {/* Hero */}
          <div className="mb-10">
            <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full mb-4">
              Legal
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Privacy Policy</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Last updated: June 2026</p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              This Privacy Policy explains how Klaro collects, uses, and protects your personal information.
              We are committed to your privacy in accordance with the{' '}
              <strong className="text-gray-800 dark:text-gray-200">Ghana Data Protection Act 2012 (Act 843)</strong>.
              By using Klaro, you agree to the practices described here.
            </div>
          </div>

          <Section id="collect" icon="📋" title="1. Information We Collect">
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Account information:</strong>{' '}
              When you register, we collect your email address, full name (optional), and a securely hashed password.
              We never store your password in plain text.
            </p>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Document content:</strong>{' '}
              When you submit a document for analysis, the text content is processed by AI language models to generate your analysis.
              We store a hash of the document text and the resulting analysis for up to 30 days to improve response times.
              We do not retain the original document file; text is processed in memory and not written to permanent storage.
            </p>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Usage data:</strong>{' '}
              We log events such as logins, analyses performed, and payments made for security, audit, and service improvement.
              These logs include your IP address and timestamp.
            </p>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Payment information:</strong>{' '}
              Payments are processed by our payment provider. We do not store your card number or bank details.
              We only store the payment reference and status.
            </p>
          </Section>

          <Section id="use" icon="⚙️" title="2. How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Provide and improve the Klaro document analysis service</li>
              <li>Authenticate your identity and secure your account</li>
              <li>Process payments and manage your subscription plan</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations under Ghana law</li>
              <li>Send important service communications, not marketing without your consent</li>
            </ul>
            <p>
              We do <strong className="text-gray-800 dark:text-gray-200">not</strong> sell, rent, or trade your
              personal information to third parties for marketing purposes.
            </p>
          </Section>

          <Section id="ai" icon="🤖" title="3. Document Processing and AI">
            <p>
              When you submit a document, the text is processed by AI language models to generate your clause-by-clause breakdown.
              By submitting a document, you confirm that you have the right to share its contents for analysis purposes.
            </p>
            <Highlight>
              <p className="font-semibold text-sm mb-1">Important: Sensitive information</p>
              <p className="text-sm">
                Do not submit documents containing highly sensitive personal information such as national ID numbers,
                bank account details, or medical records unless absolutely necessary.
                Where possible, redact or remove sensitive identifiers before uploading.
              </p>
            </Highlight>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Data minimisation:</strong>{' '}
              We do not store the original document file. Only the extracted text and the resulting analysis are retained,
              and both are automatically deleted after 30 days. Analysis results are cached using a hash of the document text
              to improve response times for identical documents.
            </p>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Prompt security:</strong>{' '}
              Document text is passed to AI models in a structured, isolated format. Our system is designed to prevent
              document content from being interpreted as instructions by the AI, reducing the risk of prompt injection attacks.
            </p>
          </Section>

          <Section id="sharing" icon="🔗" title="4. Data Sharing">
            <p>
              We share data only with trusted third-party service providers strictly necessary to operate Klaro,
              including providers that handle AI processing, cloud infrastructure, database hosting, and payment processing.
              All providers are bound by their own data protection policies and applicable data protection law.
            </p>
            <p>
              We do <strong className="text-gray-800 dark:text-gray-200">not</strong> sell, rent, or trade your data.
              We do not share your documents or personal information with advertisers, data brokers, or any party not
              directly involved in operating the service.
            </p>
            <p>
              We may disclose information if required by law, court order, or a lawful request by Ghanaian authorities.
            </p>
          </Section>

          <Section id="security" icon="🔒" title="5. Data Security">
            <p>We implement appropriate technical and organisational measures to protect your data, including:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Passwords hashed using bcrypt (industry-standard, irreversible)</li>
              <li>All data in transit encrypted via TLS/HTTPS</li>
              <li>JWT tokens with short expiry for authentication</li>
              <li>Database access restricted to authenticated server processes</li>
              <li>Audit logs for all sensitive operations</li>
              <li>Document text wrapped in isolation to prevent AI prompt injection</li>
            </ul>
            <p>
              No method of transmission over the internet is 100% secure. While we take strong precautions,
              we cannot guarantee absolute security. If you believe your account has been compromised,
              contact us immediately at{' '}
              <a href="mailto:privacy@klarogh.com" className="text-brand-600 dark:text-brand-400 hover:underline">privacy@klarogh.com</a>.
            </p>
          </Section>

          <Section id="rights" icon="⚖️" title="6. Your Rights (Ghana Data Protection Act 2012)">
            <p>Under the Ghana Data Protection Act 2012 (Act 843), you have the right to:</p>
            <div className="grid gap-3">
              {[
                { right: 'Access', desc: 'Request a copy of the personal data we hold about you.' },
                { right: 'Correction', desc: 'Request correction of inaccurate or incomplete data.' },
                { right: 'Deletion', desc: 'Request deletion of your account and associated data.' },
                { right: 'Objection', desc: 'Object to how we process your data in certain circumstances.' },
              ].map(({ right, desc }) => (
                <div key={right} className="flex gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{right}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p>
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@klarogh.com" className="text-brand-600 dark:text-brand-400 hover:underline">privacy@klarogh.com</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section id="storage" icon="💾" title="7. Cookies and Local Storage">
            <p>
              Klaro uses browser <strong className="text-gray-800 dark:text-gray-200">localStorage</strong> (not cookies)
              to store your login session token and display preferences such as your theme setting.
              No third-party tracking cookies are used. We do not use advertising networks or analytics pixels.
            </p>
          </Section>

          <Section id="children" icon="👨‍👩‍👧" title="8. Children's Privacy">
            <p>
              Klaro is intended for users aged 18 and above, or minors acting with the express consent and supervision
              of a parent or legal guardian. We do not knowingly collect data from children under 13.
              If you believe a child has submitted data without consent, contact us immediately.
            </p>
          </Section>

          <Section id="changes" icon="📣" title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of material changes
              by email or in-app notification. The "Last updated" date at the top of this page reflects the most recent revision.
            </p>
          </Section>

          <Section id="contact" icon="✉️" title="10. Contact Us">
            <p>For privacy-related questions or requests:</p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-1">
              <p className="font-bold text-gray-900 dark:text-white">Klaro Data Protection</p>
              <p>
                Email:{' '}
                <a href="mailto:privacy@klarogh.com" className="text-brand-600 dark:text-brand-400 hover:underline">
                  privacy@klarogh.com
                </a>
              </p>
              <p className="text-gray-400 dark:text-gray-500">Accra, Ghana</p>
            </div>
          </Section>

          {/* Footer nav */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-4 flex flex-wrap gap-4 text-sm text-gray-400 dark:text-gray-500">
            <Link to="/terms" className="hover:text-brand-600 dark:hover:text-brand-400">Terms of Service</Link>
            <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400">Back to Klaro</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
