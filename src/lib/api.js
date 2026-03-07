import { getToken } from './auth';

const BASE = '/api';

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({ error: 'Invalid server response' }));

  if (!res.ok) {
    const message = data.error || `Request failed (${res.status})`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return data;
}

// Auth
export const api = {
  auth: {
    register:   (email, password, full_name) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name }) }),
    login:      (email, password) =>
      request('/auth/login',    { method: 'POST', body: JSON.stringify({ email, password }) }),
  },

  analyze: {
    create: (payload) =>
      request('/analyze', { method: 'POST', body: JSON.stringify(payload) }),
    getById: (id) =>
      request(`/analyze/${id}`),
    list: (page = 1) =>
      request(`/analyses?page=${page}`),
    remove: (id) =>
      request(`/analyze/${id}`, { method: 'DELETE' }),
  },

  ask: (analysis_id, question, language = 'en') =>
    request('/ask', { method: 'POST', body: JSON.stringify({ analysis_id, question, language }) }),

  payment: {
    initiate: (plan_type, callback_url) =>
      request('/payment/initiate', { method: 'POST', body: JSON.stringify({ plan_type, callback_url }) }),
    verify: (reference) =>
      request(`/payment/verify?reference=${reference}`),
  },

  license: () => request('/license'),

  profile: {
    update: (data) =>
      request('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  lawyers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/lawyers${qs ? '?' + qs : ''}`);
  },
};
