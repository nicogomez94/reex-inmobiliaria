import { NavLink } from "react-router-dom";

const SERVICES = [
  {
    title: "Ventas",
    text: "Gestionamos la venta de tu propiedad con estrategia de pricing, fotografía profesional, pauta digital y seguimiento personalizado en cada etapa del proceso.",
    icon: "fa-house"
  },
  {
    title: "Alquileres",
    text: "Administramos contratos de alquiler, negociamos con inquilinos calificados y acompañamos al propietario durante toda la duración del contrato.",
    icon: "fa-key"
  },
  {
    title: "Tasaciones",
    text: "Valuación profesional con análisis comparativo de zona, absorción de mercado y un rango de precio óptimo para acelerar la colocación.",
    icon: "fa-chart-column"
  },
  {
    title: "Administración de alquileres",
    text: "Acompañamos a propietarios e inquilinos con seguimiento de contratos, vencimientos, cobros y atención durante toda la relación locativa.",
    icon: "fa-file-signature"
  }
];

const PROCESS = [
  { step: "01", title: "Consulta inicial", text: "Te escuchamos y entendemos tu objetivo, ya sea vender, alquilar, comprar o invertir." },
  { step: "02", title: "Tasación y estrategia", text: "Valuamos tu propiedad y definimos el plan comercial más adecuado al mercado actual." },
  { step: "03", title: "Publicación y difusión", text: "Activamos la campaña con fotografía profesional y publicación en todos los canales." },
  { step: "04", title: "Cierre y escritura", text: "Acompañamos cada instancia legal hasta que la operación quede definitivamente cerrada." }
];

export default function ServicesPage() {
  return (
    <main className="page container info-page">
      <header className="info-hero">
        <p className="section-kicker">SERVICIOS</p>
        <h1 className="page-title">Todo lo que necesitás en una sola inmobiliaria</h1>
        <p className="page-text">
          Desde la tasación hasta la escritura, ofrecemos un servicio integral para
          propietarios, inquilinos y compradores en Villa Urquiza y alrededores.
        </p>
      </header>

      <section className="info-grid" style={{ "--cols": 4 }}>
        {SERVICES.map((service) => (
          <article key={service.title} className="info-card">
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.75rem" }}>
              <i className={`fa-solid ${service.icon}`} aria-hidden="true" />
            </span>
            <h3>{service.title}</h3>
            <p>{service.text}</p>
          </article>
        ))}
      </section>

      <section style={{ marginTop: "4rem" }}>
        <p className="section-kicker" style={{ textAlign: "center" }}>NUESTRO PROCESO</p>
        <h2 className="page-title" style={{ textAlign: "center", marginBottom: "2.5rem", fontSize: "1.8rem" }}>
          Así trabajamos con vos
        </h2>
        <div className="metrics-grid">
          {PROCESS.map((item) => (
            <article key={item.step} className="metric-card">
              <h3 style={{ color: "var(--accent)" }}>{item.step}</h3>
              <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-main)", fontSize: "1rem" }}>
                {item.title}
              </strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "4rem", textAlign: "center", padding: "3rem 2rem", background: "var(--bg-panel)", borderRadius: "12px", border: "1px solid var(--line)" }}>
        <p className="section-kicker">¿LISTO PARA EMPEZAR?</p>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>Consultanos sin compromiso</h2>
        <p style={{ color: "var(--text-dim)", maxWidth: "560px", margin: "0 auto 2rem" }}>
          Nuestros asesores están disponibles para ayudarte a tomar la mejor decisión inmobiliaria.
          Contactanos hoy y comenzá el proceso.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <NavLink to="/contacto" className="cta-small" style={{ padding: "0.75rem 2rem", fontSize: "0.9rem" }}>
            CONTACTAR UN ASESOR
          </NavLink>
          <NavLink to="/tasaciones" className="cta-small" style={{ padding: "0.75rem 2rem", fontSize: "0.9rem", background: "transparent", border: "1px solid var(--accent)", color: "var(--accent)" }}>
            TASAR MI PROPIEDAD
          </NavLink>
        </div>
      </section>
    </main>
  );
}
