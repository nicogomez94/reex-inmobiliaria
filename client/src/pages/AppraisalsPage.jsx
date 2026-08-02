import { useState } from "react";
import {
  isValidEmail,
  submitContactForm,
  trimFormValues
} from "../lib/contactForm";

const INITIAL_FORM = {
  fullName: "",
  phone: "",
  email: "",
  operationType: "venta",
  propertyType: "departamento",
  neighborhood: "",
  estimatedM2: "",
  message: ""
};

export default function AppraisalsPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setFeedback("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedForm = trimFormValues(form);
    const name = trimmedForm.fullName;
    const email = trimmedForm.email;
    const message = trimmedForm.message;

    setForm(trimmedForm);

    if (!name || !email || !message) {
      setStatus("error");
      setFeedback("Completá nombre, email y mensaje.");
      return;
    }

    if (!isValidEmail(email)) {
      setStatus("error");
      setFeedback("Ingresá un email válido.");
      return;
    }

    setStatus("loading");
    setFeedback("");

    try {
      const operationLabels = {
        venta: "Venta",
        alquiler: "Alquiler"
      };
      const propertyLabels = {
        departamento: "Departamento",
        casa: "Casa",
        ph: "PH",
        lote: "Lote"
      };

      const composedMessage = [
        message,
        "",
        `Operacion: ${operationLabels[trimmedForm.operationType] || trimmedForm.operationType}`,
        `Tipo de propiedad: ${propertyLabels[trimmedForm.propertyType] || trimmedForm.propertyType}`,
        `Barrio / zona: ${trimmedForm.neighborhood || "-"}`,
        `Metros cuadrados estimados: ${trimmedForm.estimatedM2 || "-"}`,
        `WhatsApp: ${trimmedForm.phone || "-"}`
      ].join("\n");

      await submitContactForm({
        name,
        email,
        message: composedMessage
      });

      setStatus("success");
      setFeedback("Solicitud enviada. Te contactamos a la brevedad.");
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatus("error");
      setFeedback(error.message || "No se pudo enviar la solicitud.");
    }
  }

  return (
    <main className="page container info-page">
      <header className="info-hero">
        <p className="section-kicker">TASACIONES</p>
        <h1 className="page-title">Conocé el valor real de tu propiedad</h1>
        <p className="page-text">
          Recibí una valuación profesional con análisis comparativo de la zona,
          una recomendación clara y una estrategia de comercialización.
        </p>
      </header>

      <section className="split-section">
        <article className="info-card">
          <h3>Qué incluye la tasación</h3>
          <ul className="feature-list">
            <li>Relevamiento comercial y estado general del inmueble.</li>
            <li>Analisis de propiedades comparables publicadas y vendidas.</li>
            <li>Rango de valor sugerido para publicar.</li>
            <li>Plan comercial para acelerar la colocacion.</li>
          </ul>
        </article>

        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Solicitar tasación</h2>
          <div className="form-grid">
            <label>
              Nombre y apellido
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              WhatsApp
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Operacion
              <select
                name="operationType"
                value={form.operationType}
                onChange={handleChange}
              >
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </label>
            <label>
              Tipo de propiedad
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
              >
                <option value="departamento">Departamento</option>
                <option value="casa">Casa</option>
                <option value="ph">PH</option>
                <option value="lote">Lote</option>
              </select>
            </label>
            <label>
              Barrio / zona
              <input
                name="neighborhood"
                value={form.neighborhood}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Metros cuadrados estimados
              <input
                type="number"
                min="1"
                name="estimatedM2"
                value={form.estimatedM2}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <label>
            Comentarios
            <textarea
              name="message"
              rows="4"
              value={form.message}
              onChange={handleChange}
              placeholder="Ej: piso alto, estado general, amenities, cochera..."
              required
            />
          </label>
          <button
            type="submit"
            className="btn-primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? "ENVIANDO..." : "Enviar solicitud"}
          </button>
          {status === "loading" ? <p aria-live="polite">Enviando solicitud...</p> : null}
          {status === "success" ? <p className="success-text">{feedback}</p> : null}
          {status === "error" ? <p className="error-text">{feedback}</p> : null}
        </form>
      </section>
    </main>
  );
}
