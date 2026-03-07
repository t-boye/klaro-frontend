import React from 'react';
import { Link } from 'react-router-dom';

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-page dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/">
            <img src="/assets/logos/logo.png" alt="Klaro" className="h-9 object-contain" />
          </Link>
          <Link to="/" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">
            &larr; Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">
        <div className="mb-10">
          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: March 2025</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            This Privacy Policy describes how Klaro ("we", "our", or "us") collects, uses, and protects your personal
            information when you use our service. We are committed to protecting your privacy in accordance with the
            <strong className="text-gray-800 dark:text-gray-200"> Ghana Data Protection Act 2012 (Act 843)</strong>.
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p><strong className="text-gray-800 dark:text-gray-200">Account information:</strong> When you register, we collect your email address, full name (optional), and a securely hashed password. We never store your password in plain text.</p>
          <p><strong className="text-gray-800 dark:text-gray-200">Document content:</strong> When you submit a document for analysis, the text content is processed by our AI service (Anthropic Claude). We store a hash of the document text and the resulting analysis for up to 30 days to improve response times. We do not retain the original document file — text is processed in memory and not written to permanent storage.</p>
          <p><strong className="text-gray-800 dark:text-gray-200">Usage data:</strong> We log events such as logins, analyses performed, and payments made for security, audit, and service improvement purposes. These logs include your IP address and timestamp.</p>
          <p><strong className="text-gray-800 dark:text-gray-200">Payment information:</strong> Payments are processed by Paystack. We do not store your card number or bank details. We only store the payment reference and status.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Provide and improve the Klaro document analysis service</li>
            <li>Authenticate your identity and secure your account</li>
            <li>Process payments and manage your subscription plan</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations under Ghana law</li>
            <li>Send important service communications (not marketing without consent)</li>
          </ul>
          <p>We do <strong className="text-gray-800 dark:text-gray-200">not</strong> sell, rent, or trade your personal information to third parties for marketing purposes.</p>
        </Section>

        <Section title="3. Document Processing & AI">
          <p>When you submit a document for analysis, the text is sent to Anthropic's Claude AI API for processing. By submitting a document, you confirm that you have the right to share its contents for analysis purposes.</p>
          <p><strong className="text-gray-800 dark:text-gray-200">Important:</strong> Do not submit documents containing highly sensitive personal information (e.g., national ID numbers, bank account details, medical records) unless necessary. The analysis engine reads document text — remove or redact sensitive identifiers before uploading where possible.</p>
          <p>Analysis results are cached for 30 days using a hash of the document text. After 30 days, cached analyses are automatically deleted from our database.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p>We share data only with the following trusted service providers, strictly for operating the service:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-gray-800 dark:text-gray-200">Anthropic</strong> — AI processing of document text</li>
            <li><strong className="text-gray-800 dark:text-gray-200">Neon (PostgreSQL)</strong> — Secure database hosting</li>
            <li><strong className="text-gray-800 dark:text-gray-200">Netlify</strong> — Cloud hosting and deployment</li>
            <li><strong className="text-gray-800 dark:text-gray-200">Paystack</strong> — Payment processing</li>
          </ul>
          <p>We may disclose information if required by law, court order, or a lawful request by Ghanaian authorities.</p>
        </Section>

        <Section title="5. Data Security">
          <p>We implement appropriate technical and organisational measures to protect your data, including:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Passwords hashed using bcrypt (industry-standard, irreversible)</li>
            <li>All data in transit encrypted via TLS/HTTPS</li>
            <li>JWT tokens with short expiry for authentication</li>
            <li>Database access restricted to authenticated server processes</li>
            <li>Audit logs for all sensitive operations</li>
          </ul>
        </Section>

        <Section title="6. Your Rights (Ghana Data Protection Act 2012)">
          <p>Under the Ghana Data Protection Act 2012 (Act 843), you have the right to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-gray-800 dark:text-gray-200">Access</strong> — Request a copy of the personal data we hold about you</li>
            <li><strong className="text-gray-800 dark:text-gray-200">Correction</strong> — Request correction of inaccurate or incomplete data</li>
            <li><strong className="text-gray-800 dark:text-gray-200">Deletion</strong> — Request deletion of your account and associated data</li>
            <li><strong className="text-gray-800 dark:text-gray-200">Objection</strong> — Object to how we process your data in certain circumstances</li>
          </ul>
          <p>To exercise any of these rights, contact us at <a href="mailto:privacy@klaro.app" className="text-brand-600 dark:text-brand-400 hover:underline">privacy@klaro.app</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="7. Cookies & Local Storage">
          <p>Klaro uses browser <strong className="text-gray-800 dark:text-gray-200">localStorage</strong> (not cookies) to store your login session token and display preferences. No third-party tracking cookies are used. We do not use advertising networks or analytics pixels.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>Klaro is intended for users aged 18 and above, or minors acting with the express consent and supervision of a parent or legal guardian. We do not knowingly collect data from children under 13. If you believe a child has submitted data without consent, contact us immediately.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify registered users of material changes by email or in-app notification. The "Last updated" date at the top of this page reflects the most recent revision.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>For privacy-related questions or requests:</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-2">
            <p className="font-semibold text-gray-800 dark:text-gray-200">Klaro Data Protection</p>
            <p>Email: <a href="mailto:privacy@klaro.app" className="text-brand-600 dark:text-brand-400 hover:underline">privacy@klaro.app</a></p>
            <p>Accra, Ghana</p>
          </div>
        </Section>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/terms" className="hover:text-brand-600 dark:hover:text-brand-400">Terms of Service</Link>
          <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400">Back to Klaro</Link>
        </div>
      </main>
    </div>
  );
}
