const KEY = 'klaro_theme';

export function getTheme() {
  return localStorage.getItem(KEY) || 'light';
}

export function setTheme(t) {
  localStorage.setItem(KEY, t);
}

export function applyTheme(t) {
  if (t === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

export function initTheme() {
  applyTheme(getTheme());
}
