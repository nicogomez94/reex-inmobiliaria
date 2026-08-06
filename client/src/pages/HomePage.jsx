import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  isValidEmail,
  submitContactForm,
  trimFormValues
} from "../lib/contactForm";
import { api, API_BASE_URL } from "../lib/api";
import { BRAND } from "../config/brand";

const SEARCH_TABS = ["Comprar", "Alquilar"];

const PROPERTY_TYPES = [
  {
    title: "Casas",
    subtitle: "Hogares para disfrutar",
    to: "/propiedades/en-venta",
    icon: "fa-house"
  },
  {
    title: "Alquileres",
    subtitle: "Opciones para mudarte",
    to: "/propiedades/en-alquiler",
    icon: "fa-key"
  },
  {
    title: "Locales",
    subtitle: "Espacios para crecer",
    to: "/propiedades/en-venta",
    icon: "fa-shop"
  },
  {
    title: "Lotes",
    subtitle: "Tu proyecto desde cero",
    to: "/propiedades/en-venta",
    icon: "fa-ruler-combined"
  }
];

const PILLARS = [
  {
    number: "01",
    title: "Conocimiento local",
    text: "Conocemos la Ciudad de Buenos Aires y su entorno para orientar cada decisión con información concreta."
  },
  {
    number: "02",
    title: "Atención personal",
    text: "Cada operación tiene seguimiento cercano, respuestas claras y un único equipo de referencia."
  },
  {
    number: "03",
    title: "Gestión segura",
    text: "Acompañamos la documentación, la negociación y el cierre para que avances con tranquilidad."
  },
  {
    number: "04",
    title: "Gestión integral",
    text: "Integramos ventas, alquileres, tasaciones y administración para acompañarte en cada etapa."
  }
];

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  message: "",
  consent: false
};

function formatCurrency(value, currency) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function getImageUrl(image) {
  if (!image?.url) return "";
  return image.url.startsWith("http") ? image.url : `${API_BASE_URL}${image.url}`;
}

function HeroContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();

    const path = activeTab === 0
      ? "/propiedades/en-venta"
      : "/propiedades/en-alquiler";
    const search = query.trim()
      ? `?q=${encodeURIComponent(query.trim())}`
      : "";

    navigate(`${path}${search}`);
  }

  return (
    <section className="hero-content container">
      <div className="hero-copy">
        <p className="hero-kicker">REEX INMOBILIARIA · CIUDAD DE BUENOS AIRES</p>
        <h1>
          <span>Encontrá el lugar</span>
          <span className="hero-title-accent">para tu próxima historia</span>
        </h1>
        <p className="hero-sub">
          Ventas, alquileres, tasaciones y administración con un equipo
          profesional que construye confianza.
        </p>
      </div>

      <form className="hero-search" onSubmit={handleSearch}>
        <div className="hero-search-tabs" aria-label="Tipo de operación">
          {SEARCH_TABS.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`hero-search-tab${activeTab === index ? " active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="hero-search-row">
          <label className="hero-search-field">
            <span>Palabra clave o ubicación</span>
            <div>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                placeholder="Ej: Belgrano, departamento, PH..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </label>

          <div className="hero-search-operation" aria-hidden="true">
            <span>Operación</span>
            <strong>{SEARCH_TABS[activeTab]}</strong>
          </div>

          <button type="submit" className="hero-search-btn">
            <span>BUSCAR</span>
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}

function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.listPublicProperties()
      .then((result) => {
        if (active) setProperties(result.slice(0, 3));
      })
      .catch(() => {
        if (active) setProperties([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="featured-section">
      <div className="container section-heading-center">
        <p className="section-kicker">OPORTUNIDADES DESTACADAS</p>
        <h2>Propiedades para descubrir</h2>
        <p>Una selección actualizada desde nuestro catálogo.</p>
      </div>

      <div className="container featured-grid">
        {loading ? (
          <p className="featured-status">Cargando propiedades...</p>
        ) : null}

        {!loading && properties.length === 0 ? (
          <div className="featured-empty">
            <i className="fa-regular fa-building" aria-hidden="true" />
            <p>Estamos preparando nuevas oportunidades.</p>
            <Link to="/contacto">CONTANOS QUÉ ESTÁS BUSCANDO</Link>
          </div>
        ) : null}

        {properties.map((property) => {
          const image = property.images?.[0];

          return (
            <article className="featured-property-card" key={property.id}>
              <Link
                className="featured-property-media"
                to={`/propiedades/ficha/${property.slug}`}
              >
                {image ? (
                  <img src={getImageUrl(image)} alt={image.alt || property.title} />
                ) : (
                  <span className="featured-property-placeholder">
                    <i className="fa-regular fa-image" aria-hidden="true" />
                  </span>
                )}
                <span className="featured-property-badge">
                  {property.operationStatus === "EN_ALQUILER" ? "ALQUILER" : "VENTA"}
                </span>
              </Link>
              <div className="featured-property-copy">
                <p>{property.neighborhood} · {property.city}</p>
                <h3>{property.title}</h3>
                <div>
                  <strong>{formatCurrency(property.price, property.currency)}</strong>
                  <span>{property.rooms} amb. · {property.coveredM2} m²</span>
                </div>
                <Link to={`/propiedades/ficha/${property.slug}`}>
                  VER PROPIEDAD <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {properties.length > 0 ? (
        <div className="featured-all-link">
          <Link to="/propiedades/en-venta">
            VER TODAS LAS PROPIEDADES <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function ContactCta() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
    if (status !== "idle") {
      setStatus("idle");
      setFeedback("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const values = trimFormValues(form);
    setForm(values);

    if (!values.fullName || !values.email || !values.message) {
      setStatus("error");
      setFeedback("Completá nombre, email y mensaje.");
      return;
    }

    if (!isValidEmail(values.email)) {
      setStatus("error");
      setFeedback("Ingresá un email válido.");
      return;
    }

    setStatus("loading");
    setFeedback("");

    try {
      await submitContactForm({
        name: values.fullName,
        email: values.email,
        message: `${values.message}\n\nTeléfono: ${values.phone || "-"}`
      });
      setStatus("success");
      setFeedback("Recibimos tu consulta. Nos comunicaremos a la brevedad.");
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatus("error");
      setFeedback(error.message || "No se pudo enviar la consulta.");
    }
  }

  return (
    <section className="home-contact-cta">
      <div className="container home-contact-shell">
        <div className="home-contact-cta-head">
          <p className="section-kicker">HABLEMOS</p>
          <h2>Tu próxima decisión inmobiliaria empieza con una conversación.</h2>
          <p>
            Contanos qué necesitás. Te vamos a orientar con información clara y
            atención personalizada.
          </p>

          <div className="home-contact-data">
            <p><strong>{BRAND.fullName}</strong></p>
            <p>{BRAND.address} · {BRAND.neighborhood}</p>
            <a href={BRAND.phoneHref}>{BRAND.phoneDisplay}</a>
            <a href={BRAND.whatsappHref} target="_blank" rel="noreferrer">WhatsApp {BRAND.whatsappDisplay}</a>
            <a href={BRAND.emailHref}>{BRAND.email}</a>
          </div>
        </div>

        <form className="form-card home-contact-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Nombre y apellido
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Teléfono
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label>
              ¿Cómo podemos ayudarte?
              <input
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Quiero vender, comprar, alquilar..."
                required
              />
            </label>
          </div>
          <label className="consent-row">
            <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} required />
            <span>Acepto ser contactado por {BRAND.fullName}.</span>
          </label>
          <button type="submit" className="btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "ENVIANDO..." : "ENVIAR CONSULTA"}
          </button>
          {status === "success" ? <p className="success-text">{feedback}</p> : null}
          {status === "error" ? <p className="error-text">{feedback}</p> : null}
        </form>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroContent />
      <main className="dark-block">
        <FeaturedProperties />

        <section className="property-types-section">
          <div className="container section-heading-center">
            <p className="section-kicker">¿QUÉ ESTÁS BUSCANDO?</p>
            <h2>Un lugar para cada proyecto</h2>
          </div>
          <div className="container property-types-grid">
            {PROPERTY_TYPES.map((type) => (
              <Link key={type.title} to={type.to} className="property-type-card">
                <span><i className={`fa-solid ${type.icon}`} aria-hidden="true" /></span>
                <h3>{type.title}</h3>
                <p>{type.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-manifesto">
          <div className="container home-manifesto-grid">
            <div className="home-manifesto-mark" aria-hidden="true">“</div>
            <blockquote>
              <p>
                En los negocios no se consigue lo que se merece,
                <strong> se consigue lo que se negocia.</strong>
              </p>
              <footer>
                <cite>{BRAND.fullName} · {BRAND.slogan}</cite>
              </footer>
            </blockquote>
          </div>
        </section>

        <section className="why-choose">
          <div className="container">
            <div className="why-heading">
              <p className="section-kicker">POR QUÉ ELEGIRNOS</p>
              <h2>Una forma clara y cercana de hacer negocios inmobiliarios.</h2>
            </div>
            <div className="why-grid">
              {PILLARS.map((pillar) => (
                <article key={pillar.number} className="why-item">
                  <span className="why-number">{pillar.number}</span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ContactCta />
      </main>
    </>
  );
}
