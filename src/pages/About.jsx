import React from 'react';
import { Link } from 'react-router-dom';
import { isLoggedIn } from '../lib/auth';
import { useLang } from '../context/LangContext';

const COUNTRIES = [
  { code: 'GH', iso: 'gh', name: 'Ghana' },
  { code: 'NG', iso: 'ng', name: 'Nigeria' },
  { code: 'ZA', iso: 'za', name: 'South Africa' },
  { code: 'KE', iso: 'ke', name: 'Kenya' },
  { code: 'RW', iso: 'rw', name: 'Rwanda' },
  { code: 'CI', iso: 'ci', name: "Côte d'Ivoire" },
  { code: 'SN', iso: 'sn', name: 'Senegal' },
  { code: 'EG', iso: 'eg', name: 'Egypt' },
  { code: 'TZ', iso: 'tz', name: 'Tanzania' },
];

const VALUE_ICONS = [
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
];

const TR = {
  en: {
    navHome: 'Home', navPrivacy: 'Privacy',
    navDashboard: 'Dashboard →', navTry: 'Try Klaro free →',
    heroLabel: 'About Klaro',
    heroH1a: 'Built to protect Africans',
    heroH1b: "from documents they shouldn't sign",
    heroSub: "Klaro started with a simple observation: millions of Africans sign contracts, loan forms, and tenancy agreements they don't fully understand, not because they aren't careful, but because legal language is designed to be hard to read.",
    heroStat1: '9 countries', heroStat2: '10 languages', heroStat3: '40+ document types', heroStat4: '<30s analysis',
    probLabel: 'The problem',
    probH2: "Most people sign documents they don't understand",
    probBody1: "Millions of Africans sign contracts they don't fully understand, not out of carelessness, but because legal language is designed to be hard to read. Hidden penalty clauses, waived rights, compounding interest buried in the fine print.",
    probBody2: 'Legal clarity has always existed, just only for those who can afford a lawyer. Klaro changes that.',
    doLabel: 'What we do',
    doH2: "An AI that reads the fine print so you don't have to",
    doSub: "Upload any contract, agreement, or legal document. Klaro reads every clause, checks it against your country's actual laws, and explains it in plain language in seconds.",
    ratings: [
      { label: 'RED — Danger',       desc: 'Clauses that are potentially harmful, unlawful, or that strip your rights. These need attention before you sign.' },
      { label: 'BLUE — Your rights', desc: "Clauses that specifically protect you or grant you a legal right under your country's law." },
      { label: 'GREEN — Standard',   desc: 'Normal and fair clauses. Common across the industry and consistent with local law.' },
      { label: 'YELLOW — Attention', desc: "Unusual or one-sided terms that aren't necessarily illegal but deserve a closer look." },
      { label: 'GREY — Boilerplate', desc: 'Standard legal filler: definitions, jurisdiction clauses, standard notices. Safe to skim.' },
    ],
    valLabel: 'Our values',
    valH2: 'What drives every decision we make',
    values: [
      { title: 'Access for everyone',  body: 'Legal clarity should not depend on what you earn. Anyone with a phone can now get the same document protection that was previously only available to those who could afford a lawyer.' },
      { title: 'Built for African law', body: 'Every analysis references the actual statutes of your country, not generic templates. We cover 9 African jurisdictions with real-time legal search, not outdated cached data.' },
      { title: 'Your language',         body: 'Contracts are written in the language of whoever drafted them. Klaro explains what they mean in yours, across 10 languages including Twi, Hausa, Swahili, Arabic, and French.' },
      { title: 'Privacy by design',     body: 'Your documents are processed for analysis and nothing is retained without your consent. We do not sell your data or use your files to train AI models.' },
    ],
    storyLabel: 'Our story',
    storyH2: 'From a frustration to a platform',
    timeline: [
      { year: '2024', label: 'Problem identified', detail: 'Founder Emmanuel Tete Boye observes that clients and colleagues routinely sign employment and tenancy contracts without understanding critical clauses, not from carelessness, but because legal language is deliberately opaque.' },
      { year: '2025', label: 'Okyeame is born',    detail: "The first version launches as Okyeame, named after the traditional Ghanaian royal spokesperson who translates the chief's words into language the people understand." },
      { year: '2026', label: 'Becomes Klaro',      detail: 'The product is renamed Klaro, from the Portuguese and Spanish word for "clear", as coverage expands beyond Ghana to serve 9 African countries in 10 languages.' },
    ],
    covLabel: 'Coverage', covH2: '9 African countries',
    covSub: "Each country's analysis is grounded in that country's specific legislation, not a generic interpretation. More countries are on the roadmap.",
    langLabel: 'Languages',
    langH2: "10 languages, including the ones your contract won't be written in",
    langBody: "Legal documents rarely come in Twi, Hausa, or Ga. Klaro's explanations do. We built multilingual support from day one because access to justice means access in the language you actually think in.",
    devLabel: 'The developer', devH2: 'Made in Ghana, built for Africa',
    devTagline: 'ELEVATE. BUILD. INSPIRE.',
    devRole: 'Software Developer & Content Creator',
    devBio1: 'Passionate about technology, innovation, and digital growth. Emmanuel built Klaro to bridge the gap between complex legal language and the everyday African, solving a problem he witnessed firsthand in his own community.',
    devBio2: 'Klaro is built and maintained by Tboye Creative Solutions, based in Accra, Ghana, building digital products designed specifically for African needs.',
    devDM: 'Give a DM',
    disclaimer: 'Klaro explains documents and provides general legal information. It does not give legal advice and is not a substitute for a qualified lawyer. For important matters, always consult a licensed legal practitioner in your country.',
    disclaimerLabel: 'Legal notice:',
    ctaH2: 'Know before you sign.',
    ctaSub: '3 free analyses. No credit card. Understand your document in under 30 seconds.',
    ctaBtn: 'Analyse a document free →',
  },
  fr: {
    navHome: 'Accueil', navPrivacy: 'Confidentialité',
    navDashboard: 'Tableau de bord →', navTry: 'Essayer gratuitement →',
    heroLabel: 'À propos de Klaro',
    heroH1a: 'Conçu pour protéger les Africains',
    heroH1b: 'des documents qu\'ils ne devraient pas signer',
    heroSub: "Klaro est né d'une observation simple : des millions d'Africains signent des contrats, des formulaires de prêt et des baux sans les comprendre pleinement, non par négligence, mais parce que le langage juridique est conçu pour être difficile à lire.",
    heroStat1: '9 pays', heroStat2: '10 langues', heroStat3: '40+ types de documents', heroStat4: 'Analyse en <30s',
    probLabel: 'Le problème',
    probH2: 'La plupart des gens signent des documents sans les comprendre',
    probBody1: "Des millions d'Africains signent des contrats sans les comprendre pleinement, non par négligence, mais parce que le langage juridique est délibérément complexe. Clauses pénales cachées, droits abandonnés, intérêts composés enfouis dans les petits caractères.",
    probBody2: 'La clarté juridique a toujours existé, mais seulement pour ceux qui peuvent se payer un avocat. Klaro change cela.',
    doLabel: 'Ce que nous faisons',
    doH2: 'Une IA qui lit les petits caractères à votre place',
    doSub: "Importez n'importe quel contrat, accord ou document juridique. Klaro analyse chaque clause, la vérifie par rapport aux lois de votre pays et l'explique en langage clair en quelques secondes.",
    ratings: [
      { label: 'ROUGE — Danger',       desc: 'Clauses potentiellement dangereuses, illégales ou qui suppriment vos droits. À examiner avant de signer.' },
      { label: 'BLEU — Vos droits',    desc: 'Clauses qui vous protègent spécifiquement ou vous accordent un droit légal selon la loi de votre pays.' },
      { label: 'VERT — Standard',      desc: 'Clauses normales et équitables, courantes dans le secteur et conformes à la loi locale.' },
      { label: 'JAUNE — Attention',    desc: "Termes inhabituels ou unilatéraux qui ne sont pas nécessairement illégaux mais méritent un examen plus attentif." },
      { label: 'GRIS — Boilerplate',   desc: 'Texte juridique standard : définitions, clauses de juridiction, avis standard. Peut être survolé.' },
    ],
    valLabel: 'Nos valeurs',
    valH2: 'Ce qui guide chacune de nos décisions',
    values: [
      { title: 'Accès pour tous',          body: "La clarté juridique ne devrait pas dépendre de vos revenus. N'importe qui avec un téléphone peut désormais bénéficier de la même protection documentaire que ceux qui pouvaient se payer un avocat." },
      { title: 'Conçu pour le droit africain', body: "Chaque analyse référence les statuts réels de votre pays, pas des modèles génériques. Nous couvrons 9 juridictions africaines avec une recherche juridique en temps réel." },
      { title: 'Votre langue',             body: "Les contrats sont rédigés dans la langue de celui qui les a rédigés. Klaro explique ce qu'ils signifient dans la vôtre, en 10 langues dont le Twi, le Haoussa, le Swahili, l'arabe et le français." },
      { title: 'Confidentialité par défaut', body: "Vos documents sont traités pour analyse et rien n'est conservé sans votre consentement. Nous ne vendons pas vos données ni n'utilisons vos fichiers pour entraîner des modèles d'IA." },
    ],
    storyLabel: 'Notre histoire',
    storyH2: "D'une frustration à une plateforme",
    timeline: [
      { year: '2024', label: 'Problème identifié', detail: "Le fondateur Emmanuel Tete Boye observe que des clients et collègues signent régulièrement des contrats de travail et de location sans comprendre les clauses importantes, non par négligence, mais parce que le langage juridique est délibérément opaque." },
      { year: '2025', label: 'Naissance d\'Okyeame', detail: "La première version est lancée sous le nom d'Okyeame, en référence au porte-parole royal ghanéen traditionnel qui traduit les paroles du chef en langage compréhensible pour le peuple." },
      { year: '2026', label: 'Devient Klaro',      detail: 'Le produit est renommé Klaro, du mot portugais et espagnol signifiant "clair", alors que la couverture s\'étend au-delà du Ghana pour servir 9 pays africains en 10 langues.' },
    ],
    covLabel: 'Couverture', covH2: '9 pays africains',
    covSub: "L'analyse de chaque pays est fondée sur la législation spécifique de ce pays, pas une interprétation générique. D'autres pays sont en cours d'ajout.",
    langLabel: 'Langues',
    langH2: "10 langues, dont celles dans lesquelles votre contrat ne sera pas rédigé",
    langBody: "Les documents juridiques viennent rarement en Twi, Haoussa ou Ga. Les explications de Klaro, oui. Nous avons intégré le support multilingue dès le premier jour car l'accès à la justice signifie l'accès dans la langue dans laquelle vous pensez réellement.",
    devLabel: 'Le développeur', devH2: 'Fait au Ghana, conçu pour l\'Afrique',
    devTagline: 'ÉLEVER. CONSTRUIRE. INSPIRER.',
    devRole: 'Développeur & Créateur de Contenu',
    devBio1: "Passionné par la technologie, l'innovation et la croissance numérique. Emmanuel a construit Klaro pour combler le fossé entre le langage juridique complexe et l'Africain ordinaire, résolvant un problème qu'il a été témoin dans sa propre communauté.",
    devBio2: 'Klaro est développé et maintenu par Tboye Creative Solutions, basée à Accra, au Ghana, créant des produits numériques conçus spécifiquement pour les besoins africains.',
    devDM: 'Envoyer un message',
    disclaimer: "Klaro explique les documents et fournit des informations juridiques générales. Il ne donne pas de conseils juridiques et ne remplace pas un avocat qualifié. Pour les questions importantes, consultez toujours un praticien juridique agréé dans votre pays.",
    disclaimerLabel: 'Avis juridique :',
    ctaH2: 'Sachez avant de signer.',
    ctaSub: '3 analyses gratuites. Sans carte de crédit. Comprenez votre document en moins de 30 secondes.',
    ctaBtn: 'Analyser un document gratuitement →',
  },
};

export default function About() {
  const loggedIn = isLoggedIn();
  const { lang } = useLang();
  const tr = TR[lang] || TR.en;

  return (
    <div style={{ background: '#070f0a', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif' }}>

      <style>{`
        .abt-link { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 14px; font-weight: 500; padding: 6px 12px; border-radius: 9px; transition: all 0.15s; }
        .abt-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .abt-section { padding: 80px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .abt-section-sm { padding: 56px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .abt-inner { max-width: 900px; margin: 0 auto; }
        .abt-label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #52B788; margin-bottom: 16px; }
        .abt-h2 { font-size: clamp(26px, 3.5vw, 40px); font-weight: 900; line-height: 1.15; letter-spacing: -0.025em; color: #fff; margin: 0 0 16px; }
        .abt-body { font-size: 16px; line-height: 1.75; color: rgba(255,255,255,0.55); margin: 0; }
        .abt-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 24px; }
        .abt-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(82,183,136,0.18); transition: all 0.2s; }
        .abt-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .abt-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .abt-split { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        @media (max-width: 768px) {
          .abt-section { padding: 56px 20px; }
          .abt-grid-2 { grid-template-columns: 1fr; }
          .abt-grid-3 { grid-template-columns: 1fr 1fr; }
          .abt-split { grid-template-columns: 1fr !important; gap: 24px !important; }
          .abt-split > div:first-child { text-align: center; }
          .abt-hero-text { font-size: clamp(32px, 8vw, 52px) !important; }
          .abt-team-wrap { grid-template-columns: 1fr !important; }
          .abt-rating-card .abt-rating-dot-row { justify-content: center !important; }
          .abt-body { text-align: justify !important; }
          .abt-card p { text-align: justify !important; }
          .abt-card h3 { text-align: center !important; }
          .abt-card > div:first-child { margin-left: auto !important; margin-right: auto !important; }
          .abt-rating-card p { text-align: justify !important; }
        }
        @media (max-width: 480px) {
          .abt-grid-3 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(7,15,10,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/">
            <img src="/assets/logos/logo.png" alt="Klaro" style={{ height: 36, objectFit: 'contain' }} />
          </Link>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Link to="/" className="abt-link">{tr.navHome}</Link>
            <Link to="/privacy" className="abt-link">{tr.navPrivacy}</Link>
            <Link to={loggedIn ? '/upload' : '/auth'} style={{
              display: 'inline-flex', alignItems: 'center', padding: '8px 18px',
              borderRadius: 11, fontSize: 13, fontWeight: 600, textDecoration: 'none',
              background: '#1B4332', color: '#fff',
              boxShadow: '0 0 0 1px rgba(82,183,136,0.3), 0 2px 10px rgba(27,67,50,0.4)',
            }}>
              {loggedIn ? tr.navDashboard : tr.navTry}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(27,67,50,0.5) 0%, rgba(82,183,136,0.08) 50%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div className="abt-label" style={{ marginBottom: 20 }}>{tr.heroLabel}</div>
          <h1 className="abt-hero-text" style={{ fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', marginBottom: 24 }}>
            {tr.heroH1a}<br />
            <span style={{ color: '#52B788' }}>{tr.heroH1b}</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.52)', maxWidth: 600, margin: '0 auto 40px' }}>
            {tr.heroSub}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{tr.heroStat1}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{tr.heroStat2}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{tr.heroStat3}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{tr.heroStat4}</span>
          </div>
        </div>
      </section>

      {/* ── The problem ──────────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div className="abt-split">
            <div>
              <p className="abt-label">{tr.probLabel}</p>
              <h2 className="abt-h2">{tr.probH2}</h2>
            </div>
            <div style={{ paddingTop: 8 }}>
              <p className="abt-body" style={{ marginBottom: 20 }}>{tr.probBody1}</p>
              <p className="abt-body">{tr.probBody2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Klaro does ──────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="abt-label">{tr.doLabel}</p>
            <h2 className="abt-h2">{tr.doH2}</h2>
            <p className="abt-body" style={{ maxWidth: 560, margin: '0 auto' }}>{tr.doSub}</p>
          </div>
          <div className="abt-grid-3" style={{ gap: 12, marginBottom: 12 }}>
            {[
              { color: '#ef4444', ...tr.ratings[0] },
              { color: '#3b82f6', ...tr.ratings[1] },
              { color: '#22c55e', ...tr.ratings[2] },
              { color: '#eab308', ...tr.ratings[3] },
              { color: '#9ca3af', ...tr.ratings[4] },
            ].map((r) => (
              <div key={r.label} className="abt-card abt-rating-card" style={{ background: 'transparent', border: `1px solid ${r.color}25` }}>
                <div className="abt-rating-dot-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: r.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: r.color, letterSpacing: '0.06em' }}>{r.label}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', lineHeight: 1.6, margin: 0 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="abt-label">{tr.valLabel}</p>
            <h2 className="abt-h2">{tr.valH2}</h2>
          </div>
          <div className="abt-grid-2">
            {tr.values.map((v, i) => (
              <div key={v.title} className="abt-card">
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(27,67,50,0.4)', border: '1px solid rgba(82,183,136,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {VALUE_ICONS[i]}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, margin: 0 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story / Timeline ─────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="abt-label">{tr.storyLabel}</p>
            <h2 className="abt-h2">{tr.storyH2}</h2>
          </div>
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: 'rgba(82,183,136,0.2)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {tr.timeline.map((item, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -29, top: 4, width: 15, height: 15, borderRadius: '50%', background: i === tr.timeline.length - 1 ? '#52B788' : 'rgba(82,183,136,0.25)', border: `1px solid ${i === tr.timeline.length - 1 ? '#52B788' : 'rgba(82,183,136,0.4)'}` }} />
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#52B788', letterSpacing: '0.1em' }}>{item.year}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{item.label}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, margin: 0 }}>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Countries ────────────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="abt-label">{tr.covLabel}</p>
            <h2 className="abt-h2">{tr.covH2}</h2>
            <p className="abt-body" style={{ maxWidth: 480, margin: '0 auto' }}>{tr.covSub}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {COUNTRIES.map(({ iso, name }) => (
              <div key={iso} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 16px' }}>
                <img src={`https://flagcdn.com/32x24/${iso}.png`} width="28" height="21" alt={name} style={{ borderRadius: 4, display: 'block' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Languages ────────────────────────────────────────────────────── */}
      <section className="abt-section-sm">
        <div className="abt-inner">
          <div className="abt-split" style={{ alignItems: 'center' }}>
            <div>
              <p className="abt-label">{tr.langLabel}</p>
              <h2 className="abt-h2" style={{ fontSize: 'clamp(22px, 3vw, 34px)' }}>{tr.langH2}</h2>
              <p className="abt-body">{tr.langBody}</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'English',   flag: 'gb' },
                { label: 'Français',  flag: 'fr' },
                { label: 'العربية',   flag: 'eg' },
                { label: 'Kiswahili', flag: 'tz' },
                { label: 'Twi',       flag: 'gh' },
                { label: 'Hausa',     flag: 'ng' },
                { label: 'Ga',        flag: 'gh' },
                { label: 'Ewe',       flag: 'gh' },
                { label: 'Dagbani',   flag: 'gh' },
                { label: 'Fante',     flag: 'gh' },
              ].map(({ label, flag }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '7px 12px' }}>
                  <img src={`https://flagcdn.com/20x15/${flag}.png`} width="18" height="13" alt={label} style={{ borderRadius: 2, display: 'block' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.70)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="abt-section">
        <div className="abt-inner">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p className="abt-label">{tr.devLabel}</p>
            <h2 className="abt-h2">{tr.devH2}</h2>
          </div>
          <div className="abt-team-wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            {/* Left — founder photo */}
            <div style={{ position: 'relative' }}>
              <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(82,183,136,0.18)', boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 80px rgba(0,0,0,0.55)' }}>
                <img
                  src="/assets/img/dm-me.jpeg"
                  alt="Emmanuel Tete Boye"
                  style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '4/5' }}
                />
              </div>
              {/* Floating tag */}
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, background: 'rgba(7,15,10,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(82,183,136,0.2)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Emmanuel Tete Boye</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>Founder · Tboye Creative Solutions</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="https://flagcdn.com/24x18/gh.png" width="20" height="15" alt="Ghana" style={{ borderRadius: 2, display: 'block' }} />
                </div>
              </div>
            </div>

            {/* Right — bio */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#52B788', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
                {tr.devTagline}
              </p>
              <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
                {tr.devRole}
              </h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 16px' }}>
                {tr.devBio1}
              </p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 28px' }}>
                {tr.devBio2}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a
                  href="https://wa.me/233593501488"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 12, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', textDecoration: 'none' }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#25D366' }}>{tr.devDM}</span>
                  <span style={{ fontSize: 12, color: 'rgba(37,211,102,0.55)', borderLeft: '1px solid rgba(37,211,102,0.2)', paddingLeft: 10 }}>+233 59 350 1488</span>
                </a>

                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ padding: '10px 16px', borderRadius: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                    📍 Accra, Ghana
                  </div>
                  <div style={{ padding: '10px 16px', borderRadius: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                    🛠 Tboye Creative Solutions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer ───────────────────────────────────────────────────── */}
      <section className="abt-section-sm">
        <div className="abt-inner">
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px 28px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>{tr.disclaimerLabel}</strong> {tr.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(27,67,50,0.45) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.025em', color: '#fff', marginBottom: 14, lineHeight: 1.15 }}>
            {tr.ctaH2}
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', marginBottom: 36 }}>
            {tr.ctaSub}
          </p>
          <Link to={loggedIn ? '/upload' : '/auth'} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#1B4332', color: '#fff', fontWeight: 700, fontSize: 15,
            padding: '16px 32px', borderRadius: 14, textDecoration: 'none',
            boxShadow: '0 0 0 1px rgba(82,183,136,0.3), 0 6px 24px rgba(27,67,50,0.5)',
          }}>
            {tr.ctaBtn}
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ color: 'rgba(255,255,255,0.20)', fontSize: 13, margin: 0 }}>
            © {new Date().getFullYear()}{' '}
            <a href="https://wa.me/233542510400" target="_blank" rel="noopener noreferrer" style={{ color: '#52B788', fontWeight: 700, textDecoration: 'none' }}>
              Tboye Creative Solutions
            </a>
          </p>
          <div style={{ display: 'flex', gap: 4 }}>
            <Link to="/"        className="abt-link">{tr.navHome}</Link>
            <Link to="/privacy" className="abt-link">{tr.navPrivacy}</Link>
            <Link to="/terms"   className="abt-link">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
