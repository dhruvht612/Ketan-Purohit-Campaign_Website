import { Link } from 'react-router-dom'
import './Button.css'

/**
 * One button, three surfaces: internal route (`to`), external/anchor (`href`),
 * or a real <button> (default). Variants: primary | secondary | ghost | accent.
 */
export default function Button({
  to,
  href,
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  ...rest
}) {
  const cls = `btn btn--${variant} btn--${size} ${full ? 'btn--full' : ''} ${className}`

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}
