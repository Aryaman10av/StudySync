import { useState } from "react";
import { ArrowUpRight, BookOpenCheck, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link aria-label="StudySync home" className="brand" to="/">
        <span className="brand-mark"><BookOpenCheck aria-hidden="true" /></span>
        <span>studysync</span>
      </Link>
      <nav aria-label="Main navigation" className={`site-nav${menuOpen ? " is-open" : ""}`}>
        <a href="#why-studysync" onClick={closeMenu}>Why StudySync</a>
        <a href="#how-it-helps" onClick={closeMenu}>How it helps</a>
        <Link className="mobile-auth-link" onClick={closeMenu} to="/login">Sign in</Link>
        <Link className="mobile-auth-link mobile-auth-primary" onClick={closeMenu} to="/register">Get started</Link>
      </nav>
      <div className="site-actions">
        <Link className="text-link" to="/login">Sign in</Link>
        <Link className="button button-primary" to="/register">
          Get started <ArrowUpRight aria-hidden="true" />
        </Link>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="mobile-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}