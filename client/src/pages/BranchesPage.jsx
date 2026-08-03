import { BRAND } from "../config/brand";

const BRANCHES = [
  {
    name: "Oficina Villa Urquiza",
    address: `${BRAND.address}, ${BRAND.neighborhood}`,
    phone: `${BRAND.phoneDisplay} · WhatsApp ${BRAND.whatsappDisplay}`,
    hours: "Consultanos para coordinar una visita",
    focus: "Ventas, alquileres, tasaciones y administración de alquileres"
  }
];

export default function BranchesPage() {
  return (
    <main className="page container info-page">
      <header className="info-hero">
        <p className="section-kicker">SUCURSALES</p>
        <h1 className="page-title">Encontranos en la Ciudad de Buenos Aires</h1>
        <p className="page-text">
          Te recibimos para conversar sobre tu próxima operación y darte una
          orientación profesional, clara y personalizada.
        </p>
      </header>

      <section className="info-grid">
        {BRANCHES.map((branch) => (
          <article key={branch.name} className="info-card">
            <h3>{branch.name}</h3>
            <p><strong>Direccion:</strong> {branch.address}</p>
            <p><strong>WhatsApp:</strong> {branch.phone}</p>
            <p><strong>Horario:</strong> {branch.hours}</p>
            <p><strong>Especialidad:</strong> {branch.focus}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
