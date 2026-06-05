import { getAdminToken } from './adminAuth';

const BASE = '/api';

async function request(path, options = {}) {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res  = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({ error: 'Invalid server response' }));
  if (!res.ok) throw Object.assign(new Error(data.error || `Error ${res.status}`), { status: res.status });
  return data;
}

export const adminApi = {
  login:         (email, password)    => request('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  stats:         ()                   => request('/admin/stats'),
  users:         (params = {})        => request('/admin/users?' + new URLSearchParams(params).toString()),
  auditLogs:     (params = {})        => request('/admin/audit?' + new URLSearchParams(params).toString()),
  updatePlan:    (userId, plan)       => request(`/admin/users/${userId}/plan`,        { method: 'PATCH', body: JSON.stringify({ plan }) }),
  resetUsage:    (userId)             => request(`/admin/users/${userId}/reset-usage`,  { method: 'POST' }),
  getUserDetail: (userId)             => request(`/admin/users/${userId}/analyses`),
  // Lawyers
  getLawyers:    ()                   => request('/admin/lawyers'),
  createLawyer:  (data)               => request('/admin/lawyers', { method: 'POST', body: JSON.stringify(data) }),
  updateLawyer:  (id, data)           => request(`/admin/lawyers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLawyer:  (id)                 => request(`/admin/lawyers/${id}`, { method: 'DELETE' }),
  // Lawyer applications
  getLawyerApplications: (status = 'pending') => request(`/admin/lawyer-applications?status=${status}`),
  reviewLawyerApplication: (id, action, admin_notes) =>
    request(`/admin/lawyer-applications/${id}`, { method: 'PATCH', body: JSON.stringify({ action, admin_notes }) }),
};
