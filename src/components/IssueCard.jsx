import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import './IssueCard.css'

export default function IssueCard({ issue }) {
  return (
    <article className="card card--hover issue-card">
      <span className="issue-card__icon">
        <Icon name={issue.icon} size={26} strokeWidth={1.8} />
      </span>
      <h3 className="issue-card__title">{issue.title}</h3>
      <p className="issue-card__summary">{issue.summary}</p>
      <Link to="/issues" className="issue-card__more">
        Learn more <Icon name="arrow" size={16} />
      </Link>
    </article>
  )
}
