import Placeholder from './Placeholder.jsx'
import Icon from './Icon.jsx'

/**
 * One campaign board in the homepage carousel.
 *
 * The artwork is the card. Each board is a finished design that already carries
 * its own headline and its four supporting lines, so nothing is re-typed over
 * or under it — a second copy of the same words in HTML would read as a caption
 * arguing with the picture.
 *
 * Two consequences of that, both deliberate:
 *
 *   · the words live in `image.alt`, which is the only copy a screen reader or
 *     a visitor with images off will ever get — so the alt is written as the
 *     full readout of the board, not as a description of it;
 *   · the boards are dense, and at card width their supporting lines are too
 *     small to read, so every card carries an explicit way to open it full
 *     size. The topic name is repeated as real text in the foot for the same
 *     reason: it stays legible at any width, and it labels the button.
 */
export default function QuoteCard({ card, position, total, isActive = false, onOpen }) {
  return (
    <article
      className={`qcard qcard--${card.tone || 'navy'} ${isActive ? 'is-active' : ''}`}
      aria-roledescription="slide"
      aria-label={`${position} of ${total}: ${card.category}`}
    >
      <button
        type="button"
        className="qcard__media"
        onClick={onOpen}
        /* The image's own alt is the long readout; this button needs a short
           name, so the image is hidden from the button's name computation and
           announced separately below it. */
        aria-label={`View the ${card.category} campaign board full size`}
      >
        <Placeholder
          src={card.image?.src}
          alt=""
          ratio="3 / 2"
          rounded="0"
          /* Not lazy: the track moves by transform, which does not reliably
             bring lazy images into loading range, and a blank card drifting
             into view is worse than the bytes. Six images, each shown many
             times over — the browser fetches them once. */
          loading="eager"
        />
        <span className="qcard__zoom" aria-hidden="true">
          <Icon name="expand" size={17} />
        </span>
      </button>

      {/* The board's own words, for anyone not reading the picture. */}
      <p className="visually-hidden">{card.image?.alt}</p>

      <div className="qcard__foot">
        <span className="qcard__topic">{card.category}</span>
      </div>
    </article>
  )
}
