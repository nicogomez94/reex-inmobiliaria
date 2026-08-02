import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { categories, operationStatuses } from "../data/menu";
import { api, API_BASE_URL, IMAGE_UPLOAD_MAX_MB } from "../lib/api";
import { clearSession, getUser, isLoggedIn } from "../lib/auth";
import { getDebugPropertyDraft } from "../lib/debugPrefill";

const emptyProperty = {
  title: "",
  description: "",
  category: "PROPIEDADES",
  operationStatus: "EN_VENTA",
  price: 0,
  currency: "USD",
  totalM2: 0,
  coveredM2: 0,
  rooms: 0,
  bathrooms: 0,
  garageSpots: 0,
  address: "",
  neighborhood: "",
  city: "Ciudad de Buenos Aires",
  branch: "Villa Urquiza",
  published: true,
  images: []
};

function mapFormData(form) {
  return {
    ...form,
    price: Number(form.price),
    totalM2: Number(form.totalM2),
    coveredM2: Number(form.coveredM2),
    rooms: Number(form.rooms),
    bathrooms: Number(form.bathrooms),
    garageSpots: Number(form.garageSpots)
  };
}

const STATUS_LABELS = {
  EN_VENTA: "En venta",
  EN_ALQUILER: "Alquiler",
  EN_POZO: "En pozo",
  VENDIDA: "Vendida",
  ALQUILADA: "Alquilada"
};

const CATEGORY_LABELS = {
  PROPIEDADES: "Propiedad",
  EMPRENDIMIENTOS: "Emprendimiento",
  LOCALES: "Local",
  TERRENOS: "Terreno"
};

function normalizeImageOrder(images) {
  return images.map((image, index) => ({ ...image, sortOrder: index }));
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const debugMode = String(import.meta.env.VITE_DEBUG_MODE).toLowerCase() === "true";
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyProperty);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [qrItem, setQrItem] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);

  const user = useMemo(() => getUser(), []);

  useEffect(() => {
    if (!isLoggedIn()) {
      return;
    }

    const run = async () => {
      setLoadingList(true);
      try {
        const data = await api.listAdminProperties();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingList(false);
      }
    };
    run();
  }, []);

  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startCreate() {
    setSelectedId(null);
    setForm(emptyProperty);
    setError("");
    setShowFormModal(true);
  }

  function startEdit(item) {
    setSelectedId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      operationStatus: item.operationStatus,
      price: Number(item.price),
      currency: item.currency,
      totalM2: item.totalM2,
      coveredM2: item.coveredM2,
      rooms: item.rooms,
      bathrooms: item.bathrooms,
      garageSpots: item.garageSpots,
      address: item.address,
      neighborhood: item.neighborhood,
      city: item.city,
      branch: item.branch,
      published: item.published,
      images: item.images || []
    });
    setError("");
    setShowFormModal(true);
  }

  function closeFormModal() {
    setShowFormModal(false);
    setSelectedId(null);
    setForm(emptyProperty);
    setError("");
    setDraggedImageIndex(null);
  }

  function requestCloseFormModal() {
    const shouldClose = window.confirm(
      "¿Estás seguro de que querés cerrarlo? Se va a borrar todo lo cargado."
    );

    if (shouldClose) {
      closeFormModal();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = mapFormData(form);
      if (selectedId) {
        await api.updateProperty(selectedId, payload);
      } else {
        await api.createProperty(payload);
      }
      const data = await api.listAdminProperties();
      setItems(data);
      closeFormModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Eliminar propiedad?")) {
      return;
    }
    try {
      await api.deleteProperty(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function addImageFromUrl() {
    if (!imageUrl.trim()) {
      return;
    }
    setForm((current) => ({
      ...current,
      images: normalizeImageOrder([
        ...current.images,
        {
          url: imageUrl.trim(),
          alt: current.title || "Foto propiedad",
          sortOrder: current.images.length
        }
      ])
    }));
    setImageUrl("");
  }

  async function uploadFile(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    setError("");
    setUploading(true);
    try {
      const uploads = await Promise.allSettled(
        files.map(async (file) => {
          const result = await api.uploadImage(file);
          return {
            url: `${API_BASE_URL}${result.url}`,
            alt: file.name
          };
        })
      );
      const uploadedImages = uploads
        .filter((upload) => upload.status === "fulfilled")
        .map((upload) => upload.value);

      if (uploadedImages.length > 0) {
        setForm((current) => ({
          ...current,
          images: normalizeImageOrder([
            ...current.images,
            ...uploadedImages.map((image, index) => ({
              url: image.url,
              alt: current.title || image.alt,
              sortOrder: current.images.length + index
            }))
          ])
        }));
      }

      const failedUploads = uploads.filter((upload) => upload.status === "rejected");
      if (failedUploads.length > 0) {
        const firstError = failedUploads[0].reason?.message || "No se pudieron subir algunas imagenes.";
        setError(
          failedUploads.length === files.length
            ? firstError
            : `${failedUploads.length} imagen(es) no se pudieron subir. ${firstError}`
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      event.target.value = "";
      setUploading(false);
    }
  }

  function removeImage(indexToRemove) {
    setForm((current) => ({
      ...current,
      images: normalizeImageOrder(
        current.images.filter((_, index) => index !== indexToRemove)
      )
    }));
  }

  function reorderImages(fromIndex, toIndex) {
    if (fromIndex === toIndex) {
      return;
    }

    setForm((current) => {
      if (
        fromIndex < 0 ||
        fromIndex >= current.images.length ||
        toIndex < 0 ||
        toIndex >= current.images.length
      ) {
        return current;
      }

      const nextImages = [...current.images];
      const [movedImage] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, movedImage);

      return {
        ...current,
        images: normalizeImageOrder(nextImages)
      };
    });
  }

  function handleImageDrop(event, dropIndex) {
    event.preventDefault();
    const draggedData = event.dataTransfer.getData("text/plain");
    const fromIndex = draggedData === "" ? null : Number(draggedData);
    const resolvedIndex = Number.isInteger(fromIndex) ? fromIndex : draggedImageIndex;

    if (Number.isInteger(resolvedIndex)) {
      reorderImages(resolvedIndex, dropIndex);
    }

    setDraggedImageIndex(null);
  }

  return (
    <>
    <main className="page container admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Panel de propiedades</h1>
          <span className="admin-count">{items.length} propiedades</span>
        </div>
        <div className="admin-header-actions">
          <span className="admin-user">
            <i className="ph ph-user-circle" />
            {user?.username || "admin"}
          </span>
          <button
            className="btn-secondary"
            onClick={() => {
              clearSession();
              navigate("/admin/login");
            }}
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="admin-toolbar">
        <button className="btn-main admin-new-btn" onClick={startCreate} type="button">
          <i className="ph ph-plus" /> Nueva propiedad
        </button>
      </div>

      {loadingList ? (
        <div className="admin-loading">Cargando propiedades...</div>
      ) : (
        <div className="admin-cards">
          {items.length === 0 ? (
            <div className="admin-empty">No hay propiedades. Creá la primera.</div>
          ) : null}
          {items.map((item) => {
            const thumb = item.images?.[0]?.url;
            return (
              <div key={item.id} className="admin-card">
                <div className="admin-card-thumb">
                  {thumb ? (
                    <img src={thumb} alt={item.title} />
                  ) : (
                    <div className="admin-card-no-img">
                      <i className="ph ph-image" />
                    </div>
                  )}
                </div>
                <div className="admin-card-body">
                  <div className="admin-card-info">
                    <p className="admin-card-title">{item.title}</p>
                    <div className="admin-card-badges">
                      <span className="badge badge-cat">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </span>
                      <span className="badge badge-status">
                        {STATUS_LABELS[item.operationStatus] ?? item.operationStatus}
                      </span>
                      {!item.published && (
                        <span className="badge badge-unpublished">Oculta</span>
                      )}
                    </div>
                    <p className="admin-card-location">
                      {[item.neighborhood, item.city].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div className="admin-card-actions">
                    <button
                      type="button"
                      className="admin-action-btn"
                      title="Editar"
                      onClick={() => startEdit(item)}
                    >
                      <i className="ph ph-pencil-simple" />
                      Editar
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn"
                      title="Ver QR"
                      onClick={() => setQrItem(item)}
                    >
                      <i className="ph ph-qr-code" />
                      QR
                    </button>
                    <button
                      type="button"
                      className="admin-action-btn admin-action-danger"
                      title="Eliminar"
                      onClick={() => handleDelete(item.id)}
                    >
                      <i className="ph ph-trash" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>

    {showFormModal ? (
      <div className="form-modal-overlay">
        <div className="form-modal" role="dialog" aria-modal="true">
          <div className="form-modal-header">
            <h2>{selectedId ? "Editar propiedad" : "Nueva propiedad"}</h2>
            <div className="form-modal-header-actions">
              {debugMode ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setForm(getDebugPropertyDraft())}
                >
                  Prefill debug
                </button>
              ) : null}
              <button
                type="button"
                className="form-modal-close"
                onClick={requestCloseFormModal}
                aria-label="Cerrar"
              >
                X
              </button>
            </div>
          </div>

          <div className="form-modal-body">
            <form className="admin-form" onSubmit={handleSubmit}>
              <label>
                Titulo
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  required
                />
              </label>
              <label>
                Descripcion
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  rows={4}
                  required
                />
              </label>
              <div className="inline-fields">
                <label>
                  Categoria
                  <select
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                  >
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Estado
                  <select
                    value={form.operationStatus}
                    onChange={(event) =>
                      updateField("operationStatus", event.target.value)
                    }
                  >
                    {operationStatuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="inline-fields">
                <label>
                  Precio
                  <input
                    type="number"
                    value={form.price}
                    onChange={(event) => updateField("price", event.target.value)}
                    min="0"
                    required
                  />
                </label>
                <label>
                  Moneda
                  <select
                    value={form.currency}
                    onChange={(event) => updateField("currency", event.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </label>
              </div>
              <div className="inline-fields">
                <label>
                  m2 total
                  <input
                    type="number"
                    value={form.totalM2}
                    onChange={(event) => updateField("totalM2", event.target.value)}
                    min="0"
                    required
                  />
                </label>
                <label>
                  m2 cubiertos
                  <input
                    type="number"
                    value={form.coveredM2}
                    onChange={(event) => updateField("coveredM2", event.target.value)}
                    min="0"
                    required
                  />
                </label>
              </div>
              <div className="inline-fields">
                <label>
                  Ambientes
                  <input
                    type="number"
                    value={form.rooms}
                    onChange={(event) => updateField("rooms", event.target.value)}
                    min="0"
                    required
                  />
                </label>
                <label>
                  Baños
                  <input
                    type="number"
                    value={form.bathrooms}
                    onChange={(event) => updateField("bathrooms", event.target.value)}
                    min="0"
                    required
                  />
                </label>
                <label>
                  Cocheras
                  <input
                    type="number"
                    value={form.garageSpots}
                    onChange={(event) => updateField("garageSpots", event.target.value)}
                    min="0"
                    required
                  />
                </label>
              </div>
              <label>
                Dirección
                <input
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  required
                />
              </label>
              <div className="inline-fields">
                <label>
                  Barrio
                  <input
                    value={form.neighborhood}
                    onChange={(event) =>
                      updateField("neighborhood", event.target.value)
                    }
                    required
                  />
                </label>
                <label>
                  Ciudad
                  <input
                    value={form.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    required
                  />
                </label>
                <label>
                  Sucursal
                  <input
                    value={form.branch}
                    onChange={(event) => updateField("branch", event.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => updateField("published", event.target.checked)}
                />
                Publicada
              </label>

              <div className="images-box">
                <h3>Fotos</h3>
                <div className="inline-fields">
                  <input
                    value={imageUrl}
                    placeholder="https://..."
                    onChange={(event) => setImageUrl(event.target.value)}
                  />
                  <button type="button" onClick={addImageFromUrl}>
                    Agregar URL
                  </button>
                  <label className="upload-button">
                    {uploading ? "Subiendo..." : "Subir archivo"}
                    <input
                      type="file"
                      onChange={uploadFile}
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                    />
                  </label>
                </div>
                <p className="field-help">
                  Acepta PNG, JPG y WEBP de hasta {IMAGE_UPLOAD_MAX_MB} MB. La primera foto
                  se muestra como destacada.
                </p>
                <div className="image-preview-grid">
                  {form.images.map((image, index) => (
                    <div
                      key={`${image.url}-${index}`}
                      className={`image-preview-item${
                        draggedImageIndex === index ? " dragging" : ""
                      }${index === 0 ? " featured" : ""}`}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", String(index));
                        setDraggedImageIndex(index);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleImageDrop(event, index)}
                      onDragEnd={() => setDraggedImageIndex(null)}
                    >
                      {index === 0 ? (
                        <span className="image-featured-badge">Destacada</span>
                      ) : null}
                      <img src={image.url} alt={image.alt || "Imagen"} />
                      <div className="image-preview-actions">
                        <button
                          type="button"
                          className="image-order-button"
                          onClick={() => reorderImages(index, index - 1)}
                          disabled={index === 0}
                          aria-label="Mover foto a la izquierda"
                          title="Mover a la izquierda"
                        >
                          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="image-order-button"
                          onClick={() => reorderImages(index, index + 1)}
                          disabled={index === form.images.length - 1}
                          aria-label="Mover foto a la derecha"
                          title="Mover a la derecha"
                        >
                          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="image-remove-button"
                          onClick={() => removeImage(index)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error ? <p className="error-text">{error}</p> : null}
              <div className="form-modal-footer">
                <button type="submit" className="btn-main" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    ) : null}

    {qrItem ? (
      <div className="qr-modal-overlay" onClick={() => setQrItem(null)}>
        <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
          <h3>{qrItem.title}</h3>
          <img
            src={`${API_BASE_URL}/api/properties/${qrItem.slug}/qr`}
            alt={`Codigo QR de ${qrItem.title}`}
            className="qr-modal-image"
          />
          <p className="qr-modal-hint">Escaneá para abrir la ficha de la propiedad</p>
          <div className="qr-modal-actions">
            <button
              type="button"
              className="btn-main"
              onClick={async () => {
                const response = await fetch(`${API_BASE_URL}/api/properties/${qrItem.slug}/qr`);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `qr-${qrItem.slug}.png`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Descargar PNG
            </button>
            <button type="button" className="btn-secondary" onClick={() => setQrItem(null)}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
