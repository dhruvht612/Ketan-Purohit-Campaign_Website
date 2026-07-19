/**
 * Labelled form control with inline validation messaging.
 * Renders input | select | textarea based on `as`.
 */
export default function Field({
  as = 'input',
  id,
  label,
  required = false,
  error,
  hint,
  options = [],
  children,
  ...rest
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const common = {
    id,
    name: id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': required || undefined,
    className: `field__control ${error ? 'has-error' : ''}`,
    ...rest,
  }

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label} {required && <span className="field__req" aria-hidden="true">*</span>}
      </label>

      {as === 'select' ? (
        <select {...common}>{children ?? options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
      ) : as === 'textarea' ? (
        <textarea {...common} rows={rest.rows || 5} />
      ) : (
        <input {...common} />
      )}

      {hint && !error && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field__error" role="alert">{error}</p>}
    </div>
  )
}
