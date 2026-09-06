import { useCallback, useEffect, useSyncExternalStore } from 'react'

/**
 * Light/dark theme, stored on <html data-theme> so the whole design system
 * re-grounds from one attribute (see the dark-theme block in global.css).
 *
 * Three states, not two: "light", "dark", or *no stored choice*, in which
 * case the visitor's OS preference wins and keeps winning if they change it
 * mid-session. Only an explicit toggle writes to storage — that is what makes
 * a stored value mean "the visitor decided", and it is why the system-change
 * listener below bails out when one exists.
 *
 * The very first paint is handled by the inline script in index.html, which
 * runs this same resolution before React mounts. Without it the page would
 * flash cream before the effect could set the attribute.
 */

export const THEME_KEY = 'kp-theme'

/** Meta theme-color, so mobile browser chrome matches the paper. */
const BAR_COLOR = { light: '#f4f1ea', dark: '#0a1120' }

function storedTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    // Private mode / storage disabled — fall through to the OS preference.
    return null
  }
}

function systemTheme() {
  return typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function resolveTheme() {
  return storedTheme() ?? systemTheme()
}

export function applyTheme(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', BAR_COLOR[theme] ?? BAR_COLOR.light)
}

/* --------------------------------------------------------------------
   One store, not per-component state. The switch is rendered twice — in
   the masthead bar and, on narrow screens where the bar has no room for
   it, inside the mobile panel — and two copies of useState would drift
   apart the moment either one was used. The <html> attribute is the
   single source of truth; this just lets React subscribe to it.
   -------------------------------------------------------------------- */
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The attribute is already correct on first paint (see index.html), so it
    is read back rather than re-derived — the hook and the DOM cannot
    disagree, and the snapshot stays referentially stable between renders. */
function getSnapshot() {
  return document.documentElement.dataset.theme || 'light'
}

export function setTheme(theme) {
  if (getSnapshot() === theme) return
  applyTheme(theme)
  emit()
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light')

  // Follow the OS while the visitor has not made a choice of their own.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const onChange = (e) => {
      if (storedTheme()) return
      setTheme(e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next = getSnapshot() === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* Not being able to remember the choice must not block making it. */
    }
    setTheme(next)
  }, [])

  return { theme, toggle, isDark: theme === 'dark' }
}
