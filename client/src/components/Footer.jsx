import { Link } from "react-router-dom";
import { BRAND } from "../config/brand";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <span className="brand-wordmark footer-wordmark" aria-label={BRAND.fullName}>
            <strong>REEX</strong>
            <small>INMOBILIARIA</small>
          </span>
          <p className="footer-text">
            Ventas, alquileres, tasaciones y administración de alquileres en
            Villa Urquiza y alrededores.
          </p>
          <p className="footer-registration">
            {BRAND.descriptor}<br />
            {BRAND.slogan}
          </p>
        </div>

        <div>
          <p className="footer-title">Navegacion</p>
          <div className="footer-links">
            <Link to="/">Inicio</Link>
            <Link to="/propiedades/en-venta">Propiedades</Link>
            <Link to="/tasaciones">Tasaciones</Link>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>

        <div>
          <p className="footer-title">Contacto</p>
          <p className="footer-text">{BRAND.address}<br />{BRAND.neighborhood}</p>
          <a className="footer-contact-link" href={BRAND.phoneHref}>{BRAND.phoneDisplay}</a>
          <a className="footer-contact-link" href={BRAND.whatsappHref} target="_blank" rel="noreferrer">WhatsApp {BRAND.whatsappDisplay}</a>
          <a className="footer-contact-link" href={BRAND.emailHref}>{BRAND.email}</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} {BRAND.fullName}. Todos los derechos reservados.</p>
          <p className="footer-credit">
            Hecho por{" "}
            <a href="https://zigodev.com.ar" target="_blank" rel="noopener noreferrer">
              zigodev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
