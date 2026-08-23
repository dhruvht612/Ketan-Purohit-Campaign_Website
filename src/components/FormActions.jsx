import Button from './Button.jsx'

/**
 * The Clear / Submit pair at the foot of every Connect form.
 *
 * Clear is a plain button, not a native <input type="reset">: reset restores
 * the browser's idea of the initial values, which after a failed submit is not
 * the same thing as an empty form, and it would leave the human-check sum
 * answered. It is also the destructive one of the two, so it is given the
 * quieter treatment and sits to the left of Submit, out of the thumb's path on
 * a phone.
 */
export default function FormActions({
  submitLabel,
  submittingLabel = 'Sending…',
  submitting = false,
  onClear,
  note,
}) {
  return (
    <div className="form-actions">
      <div className="form-actions__row">
        <Button
          type="button"
          /* `secondary`, not `ghost`: ghost is the white-on-navy variant and
             would be all but invisible on the white form card. */
          variant="secondary"
          size="lg"
          onClick={onClear}
          className="form-actions__clear"
        >
          Clear
        </Button>
        <Button variant="primary" size="lg" disabled={submitting} className="form-actions__submit">
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
      {note && <p className="form-note">{note}</p>}
    </div>
  )
}
