/**
 * Theme Store for SwitchyAlpha
 *
 * Svelte 5 reactive store for managing theme (light/dark/system).
 */

export type ThemeMode = 'light' | 'dark' | 'system';

// Store state
let mode = $state<ThemeMode>('system');
let resolvedTheme = $state<'light' | 'dark'>('light');

// Storage key
const STORAGE_KEY = '-themeMode';

/**
 * Get system preference
 */
function getSystemPreference(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Apply theme to document
 */
function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

/**
 * Update resolved theme based on mode
 */
function updateResolvedTheme(): void {
  if (mode === 'system') {
    resolvedTheme = getSystemPreference();
  } else {
    resolvedTheme = mode;
  }
  applyTheme(resolvedTheme);
}

/**
 * Initialize theme store
 */
async function init(): Promise<void> {
  // Load saved preference
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        mode = result[STORAGE_KEY] as ThemeMode;
      }
    } else if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        mode = saved as ThemeMode;
      }
    }
  } catch (e) {
    console.warn('Failed to load theme preference:', e);
  }

  updateResolvedTheme();

  // Listen for system preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (mode === 'system') {
        updateResolvedTheme();
      }
    });
  }
}

/**
 * Set theme mode
 */
async function setMode(newMode: ThemeMode): Promise<void> {
  mode = newMode;
  updateResolvedTheme();

  // Save preference
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ [STORAGE_KEY]: newMode });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
  } catch (e) {
    console.warn('Failed to save theme preference:', e);
  }
}

/**
 * Toggle between light and dark (skipping system)
 */
function toggle(): void {
  if (resolvedTheme === 'light') {
    setMode('dark');
  } else {
    setMode('light');
  }
}

/**
 * Cycle through all modes: light -> dark -> system -> light
 */
function cycle(): void {
  if (mode === 'light') {
    setMode('dark');
  } else if (mode === 'dark') {
    setMode('system');
  } else {
    setMode('light');
  }
}

// Export store
const themeStore = {
  get mode() { return mode; },
  get resolvedTheme() { return resolvedTheme; },
  get isDark() { return resolvedTheme === 'dark'; },
  init,
  setMode,
  toggle,
  cycle,
};

export default themeStore;
