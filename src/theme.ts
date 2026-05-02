export type Theme = 'dark' | 'light' | 'system';

export function loadTheme(): Theme {
  const saved = localStorage.getItem('mrob_theme') as Theme | null;
  return saved && ['dark', 'light', 'system'].includes(saved) ? saved : 'system';
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem('mrob_theme', theme);
}

export function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function applyTheme(resolved: 'dark' | 'light'): void {
  const html = document.documentElement;
  html.setAttribute('data-theme', resolved);
  if (resolved === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}



