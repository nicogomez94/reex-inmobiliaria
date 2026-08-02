import { getToken, clearSession } from "./auth";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "";
const API_BASE_URL = rawApiBaseUrl
  ? (
      /^https?:\/\//i.test(rawApiBaseUrl)
        ? rawApiBaseUrl
        : `https://${rawApiBaseUrl}`
    ).replace(/\/+$/, "")
  : "";
const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_UPLOAD_MAX_MB = IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024);
const IMAGE_UPLOAD_TOO_LARGE_MESSAGE = `La imagen supera el tamano permitido de ${IMAGE_UPLOAD_MAX_MB} MB. Elegi un archivo mas liviano.`;

function getErrorMessage(response, errorBody) {
  if (response.status === 413) {
    return errorBody.message || IMAGE_UPLOAD_TOO_LARGE_MESSAGE;
  }

  return errorBody.message || "Error de servidor";
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.append(key, value);
    }
  }
  const result = query.toString();
  return result ? `?${result}` : "";
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error(
      `No se pudo conectar con la API local${API_BASE_URL ? ` en ${API_BASE_URL}` : ""}.`
    );
  }

  if (response.status === 401) {
    clearSession();
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(getErrorMessage(response, errorBody));
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `La API no devolvió JSON. Revisá que el backend local esté corriendo${API_BASE_URL ? ` en ${API_BASE_URL}` : ""}.`
    );
  }

  return response.json();
}

export const api = {
  login(payload) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getHealth() {
    return request("/health");
  },
  listPublicProperties(filters) {
    return request(`/api/properties${buildQuery(filters)}`);
  },
  getPublicProperty(slug) {
    return request(`/api/properties/${slug}`);
  },
  listAdminProperties() {
    return request("/api/admin/properties");
  },
  createProperty(payload) {
    return request("/api/admin/properties", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateProperty(id, payload) {
    return request(`/api/admin/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  deleteProperty(id) {
    return request(`/api/admin/properties/${id}`, {
      method: "DELETE"
    });
  },
  uploadImage(file) {
    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
      return Promise.reject(new Error(IMAGE_UPLOAD_TOO_LARGE_MESSAGE));
    }

    const formData = new FormData();
    formData.append("file", file);
    return request("/api/admin/upload", {
      method: "POST",
      body: formData
    });
  }
};

export { API_BASE_URL, IMAGE_UPLOAD_MAX_MB };
