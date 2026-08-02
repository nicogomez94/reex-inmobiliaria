import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams, useSearchParams } from "react-router-dom";
import { api, API_BASE_URL } from "../lib/api";
import { listingFilters } from "../data/menu";

function formatCurrency(value, currency) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

export default function ListingsPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const key = `${params.section}/${params.status}`;
  const filterConfig = listingFilters[key];
  const query = searchParams.get("q")?.trim() || "";
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!filterConfig) {
      setLoading(false);
      setError("Seccion no encontrada");
      return;
    }

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.listPublicProperties({
          category: filterConfig.category,
          operationStatus: filterConfig.operationStatus
        });
        setProperties(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [filterConfig]);

  const normalizedQuery = normalizeSearchText(query);
  const visibleProperties = normalizedQuery
    ? properties.filter((property) => {
        const searchableText = [
          property.title,
          property.description,
          property.address,
          property.neighborhood,
          property.city
        ]
          .filter(Boolean)
          .join(" ");

        return normalizeSearchText(searchableText).includes(normalizedQuery);
      })
    : properties;

  return (
    <main className="page container">
      <p className="section-kicker">REEX INMOBILIARIA</p>
      <h1 className="page-title">{filterConfig?.title || "Listado"}</h1>
      <p className="page-text listing-intro">
        Explorá las oportunidades disponibles y consultanos para coordinar una visita.
      </p>
      {query ? (
        <div className="listing-search-summary">
          <span>Resultados para “{query}”</span>
          <Link to={`/${params.section}/${params.status}`}>Limpiar búsqueda</Link>
        </div>
      ) : null}

      {loading ? <p>Cargando...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {!loading && !error && visibleProperties.length === 0 ? (
        <div className="listing-empty-search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <p>No encontramos propiedades que coincidan con tu búsqueda.</p>
          <Link to="/contacto">Contanos qué necesitás</Link>
        </div>
      ) : null}

      <section className="listing-grid">
        {visibleProperties.map((property) => {
          const image = property.images?.[0];
          const imageUrl = image?.url?.startsWith("http")
            ? image.url
            : `${API_BASE_URL}${image?.url || ""}`;

          return (
            <article key={property.id} className="property-card">
              {image ? (
                <img src={imageUrl} alt={image.alt || property.title} />
              ) : (
                <div className="img-placeholder">Sin imagen</div>
              )}
              <div className="property-card-content">
                <h3>{property.title}</h3>
                <p>{property.neighborhood}</p>
                <p className="price">
                  {formatCurrency(property.price, property.currency)}
                </p>
                <p className="specs">
                  {property.coveredM2} m² cubiertos · {property.rooms} amb. ·{" "}
                  {property.bathrooms} baños
                </p>
                <Link to={`/propiedades/ficha/${property.slug}`} className="card-link">
                  VER PROPIEDAD <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
