import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-mark">
        <Link to="/">
          <img src="/assets/persist-p-mark.png" alt="" />
          <span>Persist Foundry</span>
        </Link>
      </div>
      <div>© 2026 / Forged in persistence</div>
    </footer>
  )
}
