import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { menuStructure } from "../data/menu";
import { BRAND } from "../config/brand";
import Footer from "./Footer";

const propertyMenuItems = menuStructure
  .filter((section) => ["PROPIEDADES", "EMPRENDIMIENTOS"].includes(section.title))
  .flatMap((section) => section.items);

function MobileMenu({ onClose }) {
  const links = [
    { to: "/", label: "Inicio" },
    { to: "/servicios", label: "Servicios" },
    { to: "/nosotros", label: "Nosotros" },
    { to: "/contacto", label: "Contacto" },
  ];
  return (
    <div className="mobile-overlay">
      <button type="button" className="mobile-overlay-close" onClick={onClose} aria-label="Cerrar menú">
        <i className="fa-solid fa-xmark" aria-hidden="true" />
      </button>
      <nav className="mobile-overlay-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="mobile-overlay-link" onClick={onClose}>
            {link.label}
          </NavLink>
        ))}
        <div className="mobile-overlay-group">
          <NavLink to="/propiedades/en-venta" className="mobile-overlay-link" onClick={onClose}>
            Propiedades
          </NavLink>
          <div className="mobile-overlay-sublinks">
            {propertyMenuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="mobile-overlay-sublink"
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <NavLink to="/tasaciones" className="mobile-overlay-cta" onClick={onClose}>
        SOLICITAR TASACIÓN
      </NavLink>
    </div>
  );
}

function NavContent({ mobileOpen, setMobileOpen }) {
  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {BRAND.address} · {BRAND.neighborhood}</span>
          </div>
          <div className="topbar-right">
            <a href={BRAND.phoneHref}><i className="fa-solid fa-phone" aria-hidden="true" /> {BRAND.phoneDisplay}</a>
            <span className="topbar-separator">·</span>
            <a href={BRAND.whatsappHref} target="_blank" rel="noreferrer">WhatsApp {BRAND.whatsappDisplay}</a>
          </div>
        </div>
      </div>

      <div className="nav-shell">
        <nav className="navbar container">
          <Link to="/" className="brand">
            <span className="brand-wordmark" aria-label={BRAND.fullName}>
              <strong>REEX</strong>
              <small>INMOBILIARIA</small>
            </span>
          </Link>

          <ul className="nav-links">
            <li><NavLink to="/">Inicio</NavLink></li>
            <li className="nav-dropdown">
              <NavLink to="/propiedades/en-venta" className="nav-dropdown-trigger">
                Propiedades
              </NavLink>
              <div className="nav-dropdown-menu" aria-label="Tipos de propiedades">
                <span className="nav-dropdown-label">Encontrá tu próximo lugar</span>
                <div className="nav-dropdown-links">
                  {propertyMenuItems.map((item) => (
                    <NavLink key={item.to} to={item.to} className="nav-dropdown-link">
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </li>
            <li><NavLink to="/servicios">Servicios</NavLink></li>
            <li><NavLink to="/nosotros">Nosotros</NavLink></li>
            <li><NavLink to="/contacto">Contacto</NavLink></li>
          </ul>

          <NavLink to="/tasaciones" id="tasar" className="cta-small">TASAR PROPIEDAD</NavLink>

          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <i className="fa-solid fa-bars" aria-hidden="true" />
          </button>
        </nav>
      </div>

      {mobileOpen ? (
        <MobileMenu onClose={() => setMobileOpen(false)} />
      ) : null}
    </>
  );
}

/** Used as layout route for the home page — hero background wraps nav + page content */
export function HeroNavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <div className="hero">
        <div className="hero-overlay" />
        <NavContent mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

/** Used as layout route for all other pages — plain dark header */
export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <header className="site-header">
        <NavContent mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      </header>
      <Outlet />
      <Footer />
    </>
  );
}
