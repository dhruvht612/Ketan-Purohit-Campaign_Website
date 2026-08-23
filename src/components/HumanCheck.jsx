import { useCallback, useEffect, useState } from 'react'

/**
 * Simple human check.
 * ------------------
 * A one-step addition the visitor answers in a text box — "What is 4 + 3?".
 * Chosen over a click-the-red-objects puzzle on purpose: it works for someone
 * using a screen reader, someone who cannot distinguish red, and someone on a
 * phone with one thumb, none of which is true of an image puzzle.
 *
 * Deliberately modest about what it is for. It turns away the naive bots that
 * post at any form they find; it is not a defence against anyone who has
 * looked at the page. The real barrier belongs on the server — see the
 * honeypot and validation in /api — and if this form ever draws targeted
 * spam, swap this for a real challenge (Turnstile, hCaptcha) rather than
 * making the sum harder.
 *
 * Sums stay inside 2..9 + 2..9, so the answer is never negative, never
 * involves zero or one (which look like typos), and always fits in one box.
 */

/** A fresh challenge. Exported so a form can reset it after a submit. */
export function newChallenge() {
  const a = 2 + Math.floor(Math.random() * 8)
  const b = 2 + Math.floor(Math.random() * 8)
  return { a, b, answer: a + b }
}

export default function HumanCheck({
  id = 'humanCheck',
  challenge,
  value,
  onChange,
  error,
  /* Bumped by the parent to mint a new sum — after a successful submit, or
     when the form is cleared. */
  resetKey = 0,
  onNewChallenge,
}) {
  const [local, setLocal] = useState(() => challenge ?? newChallenge())
  const active = challenge ?? local

  const regenerate = useCallback(() => {
    const next = newChallenge()
    setLocal(next)
    onNewChallenge?.(next)
  }, [onNewChallenge])

  useEffect(() => {
    if (resetKey === 0) return
    regenerate()
    // Only when the parent asks: regenerating on every render would change the
    // sum under the visitor mid-answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const describedBy = error ? `${id}-error` : `${id}-hint`

  return (
    <div className="field human-check">
      <label htmlFor={id} className="field__label">
        {/* The sum is the label. Spelled out with words rather than symbols so
            it is read the same way aloud as it is on screen. */}
        Just checking you are human: what is {active.a} + {active.b}?{' '}
        <span className="field__req" aria-hidden="true">*</span>
      </label>

      <div className="human-check__row">
        <input
          id={id}
          name={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={`field__control human-check__input ${error ? 'has-error' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required="true"
        />
        <button
          type="button"
          className="human-check__new"
          onClick={regenerate}
        >
          Give me a different sum
        </button>
      </div>

      {!error && (
        <p id={`${id}-hint`} className="field__hint">
          Type the answer as a number, for example 12.
        </p>
      )}
      {error && <p id={`${id}-error`} className="field__error" role="alert">{error}</p>}
    </div>
  )
}
