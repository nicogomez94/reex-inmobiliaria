const CONTACT_FORM_URL = "https://contact-form-service-e8aa.onrender.com/api/contact";

export const CONTACT_TO =
  import.meta.env.VITE_CONTACT_TO?.trim() || "reex.urquiza@gmail.com";
export const CONTACT_SITE =
  import.meta.env.VITE_CONTACT_SITE?.trim() || "REEX Inmobiliaria";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function trimFormValues(values) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value
    ])
  );
}

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

export async function submitContactForm({ name, email, message }) {
  if (!CONTACT_TO) {
    throw new Error("El canal de email todavía no está configurado. Escribinos por WhatsApp.");
  }

  const response = await fetch(CONTACT_FORM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      email,
      to: CONTACT_TO,
      message,
      site: CONTACT_SITE,
      company: ""
    })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "No se pudo enviar el formulario.");
  }

  return data;
}
