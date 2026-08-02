export function getDebugPropertyDraft() {
  return {
    title: "Departamento luminoso en Villa Urquiza",
    description:
      "Propiedad con ambientes amplios, patio, cocina integrada y excelente luminosidad.",
    category: "PROPIEDADES",
    operationStatus: "EN_VENTA",
    price: 245000,
    currency: "USD",
    totalM2: 124,
    coveredM2: 108,
    rooms: 4,
    bathrooms: 2,
    garageSpots: 1,
    address: "Ubicación reservada",
    neighborhood: "Villa Urquiza",
    city: "Ciudad de Buenos Aires",
    branch: "Villa Urquiza",
    published: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=80",
        alt: "Living principal",
        sortOrder: 0
      },
      {
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        alt: "Dormitorio principal",
        sortOrder: 1
      }
    ]
  };
}
