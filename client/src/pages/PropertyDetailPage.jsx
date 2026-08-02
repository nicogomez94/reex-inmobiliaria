import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API_BASE_URL } from "../lib/api";

function formatCurrency(value, currency) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function listingPath(property) {
  const section = property.category === "EMPRENDIMIENTOS"
    ? "emprendimientos"
    : "propiedades";

  const statusMap = {
    EN_VENTA: "en-venta",
    EN_ALQUILER: "en-alquiler",
    ALQUILER_TEMPORARIO: "alquiler-temporario",
    EN_CONSTRUCCION: "en-construccion",
    EN_POZO: "en-pozo",
    LISTO_PARA_VIVIR: "listos-para-vivir"
  };

  return `/${section}/${statusMap[property.operationStatus] || "en-venta"}`;
}

function imageUrl(image) {
  if (!image?.url) {
    return "";
  }
  return image.url.startsWith("http") ? image.url : `${API_BASE_URL}${image.url}`;
}

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.getPublicProperty(slug);
        setProperty(response);
        setActiveImage(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug]);

  const gallery = useMemo(() => property?.images || [], [property?.images]);
  const mainImage = gallery[activeImage] || null;
  const hasGalleryControls = gallery.length > 1;
  const qrUrl = property ? `${API_BASE_URL}/api/properties/${property.slug}/qr` : "";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    if (!shareStatus) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setShareStatus(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [shareStatus]);

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Mira esta propiedad: ${property.title}`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Listo para compartir.");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Link copiado.");
    } catch (err) {
      if (err.name !== "AbortError") {
        setShareStatus("No se pudo compartir.");
      }
    }
  };

  const showPreviousImage = () => {
    setActiveImage((current) => (current === 0 ? gallery.length - 1 : current - 1));
  };

  const showNextImage = () => {
    setActiveImage((current) => (current === gallery.length - 1 ? 0 : current + 1));
  };

  if (loading) {
    return (
      <main className="page container">
        <p>Cargando propiedad...</p>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="page container">
        <h1 className="page-title">Propiedad no encontrada</h1>
        <p className="error-text">{error || "No se encontro la propiedad solicitada."}</p>
      </main>
    );
  }

  return (
    <main className="page container detail-page">
      <div className="detail-topbar">
        <Link to={listingPath(property)} className="detail-back">
          ← Volver al listado
        </Link>
      </div>

      <section className="detail-grid">
        <div className="detail-gallery">
          <div className="detail-main-image-frame">
            {mainImage ? (
              <img
                className="detail-main-image"
                src={imageUrl(mainImage)}
                alt={mainImage.alt || property.title}
              />
            ) : (
              <div className="detail-main-image img-placeholder">Sin imagen</div>
            )}

            {hasGalleryControls ? (
              <>
                <button
                  type="button"
                  className="detail-gallery-control detail-gallery-control-prev"
                  onClick={showPreviousImage}
                  aria-label="Ver imagen anterior"
                >
                  <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="detail-gallery-control detail-gallery-control-next"
                  onClick={showNextImage}
                  aria-label="Ver imagen siguiente"
                >
                  <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
                <span className="detail-gallery-count">
                  {activeImage + 1} / {gallery.length}
                </span>
              </>
            ) : null}
          </div>

          {hasGalleryControls ? (
            <div className="detail-thumbs">
              {gallery.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  className={`detail-thumb${index === activeImage ? " active" : ""}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={imageUrl(image)} alt={image.alt || `${property.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="detail-summary">
          <h1>{property.title}</h1>
          <p className="price">{formatCurrency(property.price, property.currency)}</p>
          <p className="detail-location">
            {property.address}, {property.neighborhood}, {property.city}
          </p>

          <div className="detail-actions">
            <button type="button" className="detail-share-button" onClick={handleShare}>
              <i className="fa-solid fa-share-nodes" aria-hidden="true" />
              Compartir
            </button>
            {shareStatus ? <span className="detail-share-status">{shareStatus}</span> : null}
          </div>

          <div className="detail-tags">
            <span>{property.category}</span>
            <span>{property.operationStatus.replaceAll("_", " ")}</span>
            <span>Sucursal: {property.branch}</span>
          </div>

          <div className="detail-specs">
            <p><strong>{property.totalM2} m²</strong> totales</p>
            <p><strong>{property.coveredM2} m²</strong> cubiertos</p>
            <p><strong>{property.rooms}</strong> ambientes</p>
            <p><strong>{property.bathrooms}</strong> baños</p>
            <p><strong>{property.garageSpots}</strong> cocheras</p>
          </div>

          <div className="detail-qr">
            <p className="detail-qr-title">QR de esta propiedad</p>
            <img
              src={qrUrl}
              alt={`Codigo QR de ${property.title}`}
              className="detail-qr-image"
            />
            <p className="detail-qr-hint">Escanealo para abrir esta ficha desde el celular.</p>
            <a href={qrUrl} target="_blank" rel="noreferrer" className="detail-qr-link">
              Abrir QR
            </a>
          </div>
        </aside>
      </section>

      <section className="detail-description">
        <h2>Descripción</h2>
        <p>{property.description}</p>
      </section>
    </main>
  );
}
