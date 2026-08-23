import Field from './Field.jsx'

/**
 * The five details every Connect form asks for, in one place: name, email,
 * phone and residential address.
 *
 * The honeypot rides along here rather than in each page — it belongs to the
 * same block of inputs, and putting it anywhere else means remembering it
 * three times. It is hidden from sight, from assistive tech and from tab
 * order; only a script filling every input it can find will touch it, and
 * /api rejects anything that arrives with it set.
 */
export default function ContactFields({ form, errors, set }) {
  return (
    <>
      <div className="form-row">
        <Field
          id="firstName"
          label="First name"
          required
          value={form.firstName}
          onChange={set('firstName')}
          error={errors.firstName}
          autoComplete="given-name"
        />
        <Field
          id="lastName"
          label="Last name"
          required
          value={form.lastName}
          onChange={set('lastName')}
          error={errors.lastName}
          autoComplete="family-name"
        />
      </div>

      <div className="form-row">
        <Field
          id="email"
          type="email"
          label="Email address"
          required
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
        />
        <Field
          id="phone"
          type="tel"
          label="Phone"
          value={form.phone}
          onChange={set('phone')}
          error={errors.phone}
          hint="Optional"
          autoComplete="tel"
        />
      </div>

      <Field
        id="address"
        label="Residential address"
        value={form.address}
        onChange={set('address')}
        error={errors.address}
        hint="Optional — it tells us which school community you are in"
        autoComplete="street-address"
      />

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={set('website')}
        />
      </div>
    </>
  )
}
