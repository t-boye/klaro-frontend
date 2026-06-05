import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] || '');
  useEffect(() => {
    const els = ids.map(id => document.getElementById(id)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
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
  { id: 'about',      title: '1. About Klaro' },
  { id: 'eligibility', title: '2. Eligibility' },
  { id: 'account',   title: '3. Account Responsibilities' },
  { id: 'notadvice', title: '4. Not Legal Advice' },
  { id: 'payments',  title: '5. Plans, Payments and Refunds' },
  { id: 'ip',        title: '6. Intellectual Property' },
  { id: 'warranties', title: '7. Disclaimer of Warranties' },
  { id: 'liability', title: '8. Limitation of Liability' },
  { id: 'termination', title: '9. Termination' },
  { id: 'governing', title: '10. Governing Law and Disputes' },
  { id: 'changes',   title: '11. Changes to Terms' },
  { id: 'contact',   title: '12. Contact' },
];

function SideNav({ active, onNav }) {
  return (
    <nav className="hidden lg:block sticky top-24 self-start w-52 flex-shrink-0">
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-3">On this page</p>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
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

export default function Terms() {
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
            <Link to="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</Link>
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
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Terms of Service</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Last updated: June 2026</p>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Please read these Terms of Service carefully before using Klaro. By creating an account or using our service,
              you agree to be bound by these terms. If you do not agree, do not use Klaro.
            </div>
          </div>

          {/* Important notice banner */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 mb-10">
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">Klaro is not a law firm</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Klaro is an AI-powered document explanation tool and does not provide legal advice.
                  Nothing on this platform constitutes legal advice. Always consult a qualified Ghanaian lawyer
                  before making legal or financial decisions based on any document.
                </p>
              </div>
            </div>
          </div>

          <Section id="about" icon="ℹ️" title="1. About Klaro">
            <p>
              Klaro is an AI-powered service that helps users understand the content of legal documents written under Ghana law.
              Klaro reads document text, explains its meaning in plain language, and colour-codes clauses based on potential risk.
            </p>
            <p>
              Klaro is operated by Klaro Technologies, based in Accra, Ghana.
              The service is governed by the laws of the Republic of Ghana.
            </p>
          </Section>

          <Section id="eligibility" icon="👤" title="2. Eligibility">
            <p>
              You must be at least 18 years of age to use Klaro independently. If you are under 18, you may only use Klaro
              under the direct supervision of a parent or legal guardian who agrees to these terms on your behalf.
            </p>
            <p>
              By using Klaro, you confirm that the information you provide during registration is accurate and that you have
              the legal capacity to enter into this agreement.
            </p>
          </Section>

          <Section id="account" icon="🔑" title="3. Account Responsibilities">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              Do not share your password with others. You are responsible for all activity that occurs under your account.
            </p>
            <p>You agree not to use Klaro to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Upload documents you do not have the right to share</li>
              <li>Circumvent plan limits through automated or manual abuse</li>
              <li>Engage in any activity that disrupts or harms the service</li>
              <li>Impersonate another person or entity</li>
              <li>Use the service for any unlawful purpose under Ghana law</li>
              <li>Attempt to extract other users' data or manipulate the AI through malicious document content</li>
            </ul>
          </Section>

          <Section id="notadvice" icon="⚖️" title="4. Not Legal Advice">
            <p>
              Klaro provides <strong className="text-gray-800 dark:text-gray-200">document explanations</strong>, not legal advice.
              Our AI analyses document text and highlights potential risks based on common Ghana legal standards. However:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>AI analysis may contain errors or miss context-specific nuances</li>
              <li>Ghana law changes over time. Klaro's knowledge may not reflect the most current legislation</li>
              <li>Klaro does not review the actual circumstances of your situation</li>
              <li>No lawyer-client relationship is created by using Klaro</li>
            </ul>
            <p>
              For any important legal matter, you must consult a qualified Ghana lawyer.
              We list verified lawyers at{' '}
              <Link to="/lawyers" className="text-brand-600 dark:text-brand-400 hover:underline">klarogh.com/lawyers</Link>.
            </p>
          </Section>

          <Section id="payments" icon="💳" title="5. Plans, Payments and Refunds">
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Free Trial:</strong>{' '}
              All new accounts receive 3 free analyses. No credit card is required.
            </p>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Paid Plans:</strong>{' '}
              Monthly subscription plans and pay-per-document purchases are billed in Ghanaian Cedis (GHS).
              Prices are displayed at checkout and are inclusive of any applicable taxes.
            </p>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Refunds:</strong>{' '}
              Due to the nature of AI analysis (results are delivered immediately upon request), we generally do not offer
              refunds for completed analyses. If you experience a technical failure that prevented delivery, contact us
              within 7 days at{' '}
              <a href="mailto:support@klarogh.com" className="text-brand-600 dark:text-brand-400 hover:underline">support@klarogh.com</a>{' '}
              for a credit or refund review.
            </p>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Monthly subscriptions</strong>{' '}
              can be cancelled at any time. Your access continues until the end of the paid period;
              no partial refunds are issued for unused days.
            </p>
          </Section>

          <Section id="ip" icon="🎨" title="6. Intellectual Property">
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Your content:</strong>{' '}
              You retain ownership of all documents you submit. By submitting, you grant Klaro a limited licence
              to process the text solely for the purpose of generating your analysis.
            </p>
            <p>
              <strong className="text-gray-800 dark:text-gray-200">Klaro's platform:</strong>{' '}
              All software, design, branding, and analysis outputs generated by Klaro belong to Klaro Technologies.
              You may not reproduce, copy, or resell any part of the Klaro platform without written permission.
            </p>
          </Section>

          <Section id="warranties" icon="🛡️" title="7. Disclaimer of Warranties">
            <p>
              Klaro is provided "as is" without any warranty of any kind, either express or implied.
              We do not warrant that the service will be uninterrupted, error-free, or that analysis results
              will be accurate, complete, or up to date.
            </p>
            <p>
              To the maximum extent permitted by Ghana law, we disclaim all implied warranties including
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </Section>

          <Section id="liability" icon="📊" title="8. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Klaro Technologies shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of the service, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Decisions made in reliance on Klaro's analysis</li>
              <li>Loss of data, profit, or business opportunity</li>
              <li>Errors or omissions in AI-generated content</li>
            </ul>
            <p>
              Our total liability for any claim arising from use of Klaro shall not exceed the amount you paid us
              in the 30 days preceding the event giving rise to the claim.
            </p>
          </Section>

          <Section id="termination" icon="🚫" title="9. Termination">
            <p>
              We may suspend or terminate your account if you violate these Terms, engage in abusive behaviour,
              or if we are required to do so by law. You may delete your account at any time by contacting us.
            </p>
            <p>
              Upon termination, your access to the service ceases and your data will be deleted in accordance
              with our Privacy Policy.
            </p>
          </Section>

          <Section id="governing" icon="🏛️" title="10. Governing Law and Disputes">
            <p>
              These Terms are governed by the laws of the Republic of Ghana. Any disputes arising from these Terms
              or your use of Klaro shall be subject to the exclusive jurisdiction of the courts of Ghana.
            </p>
            <p>
              We encourage you to contact us first at{' '}
              <a href="mailto:legal@klarogh.com" className="text-brand-600 dark:text-brand-400 hover:underline">legal@klarogh.com</a>{' '}
              to resolve any dispute amicably before initiating formal proceedings.
            </p>
          </Section>

          <Section id="changes" icon="📣" title="11. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify you of material changes via email or
              in-app notice at least 14 days before they take effect. Continued use of Klaro after changes take
              effect constitutes acceptance of the new Terms.
            </p>
          </Section>

          <Section id="contact" icon="✉️" title="12. Contact">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-1.5">
              <p className="font-bold text-gray-900 dark:text-white">Klaro Technologies</p>
              <p>General: <a href="mailto:hello@klarogh.com" className="text-brand-600 dark:text-brand-400 hover:underline">hello@klarogh.com</a></p>
              <p>Support: <a href="mailto:support@klarogh.com" className="text-brand-600 dark:text-brand-400 hover:underline">support@klarogh.com</a></p>
              <p>Legal: <a href="mailto:legal@klarogh.com" className="text-brand-600 dark:text-brand-400 hover:underline">legal@klarogh.com</a></p>
              <p className="text-gray-400 dark:text-gray-500 pt-1">Accra, Ghana</p>
            </div>
          </Section>

          {/* Footer nav */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-4 flex flex-wrap gap-4 text-sm text-gray-400 dark:text-gray-500">
            <Link to="/privacy" className="hover:text-brand-600 dark:hover:text-brand-400">Privacy Policy</Link>
            <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400">Back to Klaro</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
