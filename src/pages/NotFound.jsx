import Button from '../components/Button.jsx'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container notfound">
        <h1>404</h1>
        <p>We couldn’t find that page — but there’s plenty more to explore.</p>
        <Button to="/" variant="primary" size="lg">Back to home</Button>
      </div>
    </section>
  )
}
