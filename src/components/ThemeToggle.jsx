import Icon from './Icon.jsx'
import { useTheme } from '../lib/theme.js'
import './ThemeToggle.css'

/**
 * Light/dark switch. Both icons are always in the DOM and cross-fade through
 * a short arc, so the swap reads as one object turning rather than two icons
 * blinking — and there is no layout shift to animate around.
 *
 * It is a toggle button, so `aria-pressed` carries the state and the label
 * stays constant ("Toggle dark mode"). Announcing a label that changes with
 * the state ("Switch to light mode") on top of aria-pressed makes screen
 * readers read the two against each other.
 */
export default function ThemeToggle({ className = '' }) {
  const { toggle, isDark } = useTheme()

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-pressed={isDark}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <span className="theme-toggle__icons" aria-hidden="true">
        <Icon name="moon" size={17} strokeWidth={2} className="theme-toggle__moon" />
        <Icon name="sun" size={17} strokeWidth={2} className="theme-toggle__sun" />
      </span>
    </button>
  )
}
