import { getToken } from './auth';

// In production, set VITE_API_BASE_URL=https://api.klarogh.com in Netlify env vars.
// In local dev, the Vite proxy forwards /api → localhost:8787 (wrangler dev).
const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({
    error: res.status >= 500
      ? 'Service temporarily unavailable. Please try again in a moment.'
      : res.status === 429
      ? 'Too many requests. Please slow down and try again.'
      : 'Something went wrong. Please try again.',
  }));

  if (!res.ok) {
    const message = data.error || (
      res.status >= 500
        ? 'Service temporarily unavailable. Please try again.'
        : 'Something went wrong. Please try again.'
    );
    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return data;
}

export const api = {
  auth: {
    register:       (email, password, full_name) =>
      request('/auth/register',        { method: 'POST', body: JSON.stringify({ email, password, full_name }) }),
    login:          (email, password) =>
      request('/auth/login',           { method: 'POST', body: JSON.stringify({ email, password }) }),
    googleAuth:     (id_token) =>
      request('/auth/google',          { method: 'POST', body: JSON.stringify({ id_token }) }),
    forgotPassword: (email) =>
      request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword:  (token, password) =>
      request('/auth/reset-password',  { method: 'POST', body: JSON.stringify({ token, password }) }),
  },

  analyze: {
    create:  (payload) =>
      request('/analyze',              { method: 'POST', body: JSON.stringify(payload) }),
    getById: (id) =>
      request(`/analyze/${id}`),
    list:    (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/analyses${qs ? '?' + qs : ''}`);
    },
    remove:  (id) =>
      request(`/analyze/${id}`,        { method: 'DELETE' }),
    rename:  (id, name) =>
      request(`/analyze/${id}`,        { method: 'PATCH', body: JSON.stringify({ name }) }),
    share:   (id) =>
      request(`/analyze/${id}/share`,  { method: 'POST' }),
  },

  shared: (token) => request(`/shared/${token}`),

  ask: (analysis_id, question, language = 'en') =>
    request('/ask', { method: 'POST', body: JSON.stringify({ analysis_id, question, language }) }),

  payment: {
    initiate: (plan_type, callback_url) =>
      request('/payment/initiate', { method: 'POST', body: JSON.stringify({ plan_type, callback_url }) }),
    verify:   (reference) => request(`/payment/verify?reference=${reference}`),
    history:  ()          => request('/payment/history'),
  },

  license: () => request('/license'),

  profile: {
    update: (data) => request('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    get:    ()     => request('/license'),
  },

  legalChat: (question, language = 'en') =>
    request('/legal-chat', { method: 'POST', body: JSON.stringify({ question, language }) }),

  tts: (text, language) =>
    request('/tts', { method: 'POST', body: JSON.stringify({ text, language }) }),

  lawyers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/lawyers${qs ? '?' + qs : ''}`);
  },

  lawyerApplication: {
    submit: (data) => request('/lawyer-applications', { method: 'POST', body: JSON.stringify(data) }),
  },
};
