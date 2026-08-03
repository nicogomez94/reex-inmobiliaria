import { useState } from "react";
import {
  isValidEmail,
  submitContactForm,
  trimFormValues
} from "../lib/contactForm";
import { BRAND } from "../config/brand";

const INITIAL_FORM = {
  fullName: "",
  phone: "",
  email: "",
  reason: "compra",
  message: ""
};

export default function ContactPage() {
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
      const reasonLabels = {
        compra: "Comprar",
        venta: "Vender",
        alquiler: "Alquilar",
        tasacion: "Tasar",
        administracion: "Administrar un alquiler"
      };

      const composedMessage = [
        message,
        "",
        `Motivo: ${reasonLabels[trimmedForm.reason] || trimmedForm.reason}`,
        `WhatsApp: ${trimmedForm.phone || "-"}`
      ].join("\n");

      await submitContactForm({
        name,
        email,
        message: composedMessage
      });

      setStatus("success");
      setFeedback("Consulta enviada. Te respondemos a la brevedad.");
      setForm(INITIAL_FORM);
    } catch (error) {
      setStatus("error");
      setFeedback(error.message || "No se pudo enviar la consulta.");
    }
  }

  return (
    <main className="page container info-page">
      <header className="info-hero">
        <p className="section-kicker">CONTACTO</p>
        <h1 className="page-title">Hablemos de tu próxima operación</h1>
        <p className="page-text">
          Estamos para ayudarte a comprar, vender, alquilar o conocer el valor
          de una propiedad en la Ciudad de Buenos Aires y alrededores.
        </p>
      </header>

      <section className="split-section">
        <article className="info-card">
          <span className="contact-card-icon"><i className="fa-solid fa-location-dot" /></span>
          <h3>{BRAND.fullName}</h3>
          <p><strong>Dirección:</strong> {BRAND.address}, {BRAND.neighborhood}</p>
          <p><strong>Teléfono:</strong> <a href={BRAND.phoneHref}>{BRAND.phoneDisplay}</a></p>
          <p><strong>WhatsApp:</strong> <a href={BRAND.whatsappHref} target="_blank" rel="noreferrer">{BRAND.whatsappDisplay}</a></p>
          <p><strong>Email:</strong> <a href={BRAND.emailHref}>{BRAND.email}</a></p>
        </article>

        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Enviar consulta</h2>
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
              Motivo
              <select
                name="reason"
                value={form.reason}
                onChange={handleChange}
              >
                <option value="compra">Comprar</option>
                <option value="venta">Vender</option>
                <option value="alquiler">Alquilar</option>
                <option value="tasacion">Tasar</option>
                <option value="administracion">Administrar un alquiler</option>
              </select>
            </label>
          </div>
          <label>
            Mensaje
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              placeholder="Contanos qué propiedad buscás o qué operación querés realizar."
              required
            />
          </label>
          <button
            type="submit"
            className="btn-primary"
            disabled={status === "loading"}
          >
            {status === "loading" ? "ENVIANDO..." : "Enviar mensaje"}
          </button>
          {status === "loading" ? <p aria-live="polite">Enviando consulta...</p> : null}
          {status === "success" ? <p className="success-text">{feedback}</p> : null}
          {status === "error" ? <p className="error-text">{feedback}</p> : null}
        </form>
      </section>
    </main>
  );
}
