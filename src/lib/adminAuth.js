const KEY_TOKEN = 'klaro_admin_token';
const KEY_ADMIN = 'klaro_admin_user';

export function getAdminToken()  { return localStorage.getItem(KEY_TOKEN); }
export function getAdmin()       { try { return JSON.parse(localStorage.getItem(KEY_ADMIN)); } catch { return null; } }
export function isAdminLoggedIn(){ return !!getAdminToken(); }

export function setAdminSession(token, admin) {
  localStorage.setItem(KEY_TOKEN, token);
  localStorage.setItem(KEY_ADMIN, JSON.stringify(admin));
}

export function clearAdminSession() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_ADMIN);
}
