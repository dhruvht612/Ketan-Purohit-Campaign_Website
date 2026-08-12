import Placeholder from './Placeholder.jsx'
import Icon from './Icon.jsx'
import { Text, isPlaceholder } from './Editable.jsx'
import './MediaCard.css'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * One media item — an appearance, a piece of coverage, an article, a video, or
 * anything else the campaign publishes.
 *
 *   layout="article"  image + outlet + date + title + summary
 *   layout="video"    16:9 thumbnail with a play affordance and duration
 *
 * The whole card becomes a link once `url` is filled in; until then it stays
 * inert so an empty slot can't be clicked into nothing.
 */
export default function MediaCard({ item, layout = 'article' }) {
  const external = /^https?:\/\//i.test(item.url || '')
  const hasLink = Boolean(item.url)
  const Wrapper = hasLink ? 'a' : 'div'
  const linkProps = hasLink
    ? {
        href: item.url,
        ...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {}),
      }
    : {}

  const date = formatDate(item.date)

  if (layout === 'video') {
    return (
      <Wrapper className={`media-card media-card--video ${hasLink ? 'is-linked' : ''}`} {...linkProps}>
        <div className="media-card__media">
          <Placeholder
            src={item.image?.src}
            alt={item.image?.alt || item.title}
            ratio="16 / 9"
            rounded="0"
          />
          <span className="media-card__play" aria-hidden="true">
            <Icon name="play" size={26} />
          </span>
          {item.duration && <span className="media-card__dur">{item.duration}</span>}
        </div>
        <div className="media-card__body">
          <Text as="h3" value={item.title} className="media-card__title" />
          {hasLink && (
            <span className="media-card__more">
              Watch <Icon name={external ? 'external' : 'arrow'} size={15} />
            </span>
          )}
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper className={`media-card ${hasLink ? 'is-linked' : ''}`} {...linkProps}>
      <div className="media-card__media">
        <Placeholder
          src={item.image?.src}
          alt={item.image?.alt || item.title}
          ratio="16 / 10"
          rounded="0"
        />
        {item.outlet && (
          <span className={`media-card__outlet ${isPlaceholder(item.outlet) ? 'is-pending' : ''}`}>
            {item.outlet}
          </span>
        )}
      </div>
      <div className="media-card__body">
        {date && <span className="media-card__date">{date}</span>}
        <Text as="h3" value={item.title} className="media-card__title" />
        {item.summary && <Text as="p" value={item.summary} className="media-card__summary" />}
        {hasLink && (
          <span className="media-card__more">
            {external ? 'Read at source' : 'View'} <Icon name={external ? 'external' : 'arrow'} size={15} />
          </span>
        )}
      </div>
    </Wrapper>
  )
}
