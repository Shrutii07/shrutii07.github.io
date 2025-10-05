// Theme utility functions for client-side theme management

export type Theme = 'light' | 'dark' | 'system';

export function getStoredTheme(): Theme | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('theme') as Theme | null;
}

export function setStoredTheme(theme: Theme): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('theme', theme);
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  const html = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    html.classList.toggle('dark', systemTheme === 'dark');
  } else {
    html.classList.toggle('dark', theme === 'dark');
  }
}

export function initializeTheme(): void {
  const storedTheme = getStoredTheme();
  const theme = storedTheme || 'system';
  applyTheme(theme);
}

export function toggleTheme(): void {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  
  setStoredTheme(newTheme);
  applyTheme(newTheme);
}