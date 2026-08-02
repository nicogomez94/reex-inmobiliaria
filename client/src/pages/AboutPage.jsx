import { BRAND } from "../config/brand";

const METRICS = [
  { value: "4", label: "Servicios integrales" },
  { value: "1 a 1", label: "Atención personalizada" },
  { value: "360°", label: "Acompañamiento integral" }
];

const VALUES = [
  {
    title: "Trato cercano y directo",
    text: "Cada cliente recibe atención directa, seguimiento cercano y respuestas concretas durante toda la operación."
  },
  {
    title: "Conocimiento real del mercado",
    text: "Trabajar desde Villa Urquiza nos permite entender los valores, los tiempos y las oportunidades reales de la zona."
  },
  {
    title: "Acompañamiento hasta el final",
    text: "Desde la primera consulta hasta la firma de escritura. Gestionamos reservas, boletos y trámites notariales sin que tengas que preocuparte."
  }
];

export default function AboutPage() {
  return (
    <main className="page container info-page">
      <header className="info-hero">
        <p className="section-kicker">NOSOTROS</p>
        <h1 className="page-title">Una inmobiliaria local, profesional y cercana</h1>
        <p className="page-text">
          {BRAND.fullName} trabaja con una convicción simple: una operación
          inmobiliaria debe sentirse clara, segura y bien acompañada desde la
          primera consulta hasta la firma.
        </p>
      </header>

      <section className="metrics-grid">
        {METRICS.map((metric) => (
          <article key={metric.label} className="metric-card">
            <h3>{metric.value}</h3>
            <p>{metric.label}</p>
          </article>
        ))}
      </section>

      <section className="info-section">
        <h2 className="section-title">Quiénes somos</h2>
        <p className="page-text">
          Somos una inmobiliaria con base en Villa Urquiza. Trabajamos en
          ventas, alquileres, tasaciones y administración de alquileres con
          atención personalizada y conocimiento concreto del mercado local.
        </p>
        <p className="page-text" style={{ marginTop: "1rem" }}>
          Lo que nos diferencia es la dedicación. Cada propiedad recibe una
          estrategia de comercialización a medida, una presentación cuidada y
          seguimiento activo de cada interesado. Nuestro objetivo es que tomes
          decisiones con información, previsibilidad y confianza.
        </p>
      </section>

      <section className="info-grid">
        {VALUES.map((value) => (
          <article key={value.title} className="info-card">
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
