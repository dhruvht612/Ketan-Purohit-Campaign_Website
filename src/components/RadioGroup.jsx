/**
 * Accessible radio group in a fieldset/legend, styled as large tap targets.
 * Used for the volunteer form's two-ward selection — with only two choices a
 * radio pair is faster and clearer than a dropdown, and both options stay
 * visible without opening anything.
 */
export default function RadioGroup({
  name,
  legend,
  hint,
  options = [],
  value,
  onChange,
  error,
  required = false,
  columns = 2,
}) {
  const describedBy = [hint ? `${name}-hint` : null, error ? `${name}-error` : null]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <fieldset className="radio-group" aria-describedby={describedBy} aria-required={required || undefined}>
      <legend className="form-legend">
        {legend} {required && <span className="field__req" aria-hidden="true">*</span>}
      </legend>
      {hint && <p id={`${name}-hint`} className="field__hint radio-group__hint">{hint}</p>}

      <div className={`radio-group__options ${columns === 1 ? 'is-stacked' : ''}`}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`radio ${value === opt.value ? 'is-selected' : ''} ${error ? 'has-error' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <span className="radio__label">{opt.label}</span>
          </label>
        ))}
      </div>

      {error && <p id={`${name}-error`} className="field__error" role="alert">{error}</p>}
    </fieldset>
  )
}
