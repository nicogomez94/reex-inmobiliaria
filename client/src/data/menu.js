export const menuStructure = [
  {
    title: "PROPIEDADES",
    items: [
      {
        label: "En venta",
        to: "/propiedades/en-venta"
      },
      {
        label: "En alquiler",
        to: "/propiedades/en-alquiler"
      },
      {
        label: "Alquiler temporario",
        to: "/propiedades/alquiler-temporario"
      }
    ]
  },
  {
    title: "EMPRENDIMIENTOS",
    items: [
      {
        label: "En construccion",
        to: "/emprendimientos/en-construccion"
      },
      {
        label: "En pozo",
        to: "/emprendimientos/en-pozo"
      },
      {
        label: "Listos para vivir",
        to: "/emprendimientos/listos-para-vivir"
      }
    ]
  },
  {
    title: "SUCURSALES",
    items: [
      {
        label: "Capital Federal",
        to: "/sucursales"
      }
    ]
  },
  {
    title: "TASACIONES",
    items: [{ label: "Tasaciones", to: "/tasaciones" }]
  },
  {
    title: "NOSOTROS",
    items: [{ label: "Nosotros", to: "/nosotros" }]
  },
  {
    title: "CONTACTO",
    items: [{ label: "Contacto", to: "/contacto" }]
  }
];

export const listingFilters = {
  "propiedades/en-venta": {
    category: "PROPIEDADES",
    operationStatus: "EN_VENTA",
    title: "Propiedades en venta"
  },
  "propiedades/en-alquiler": {
    category: "PROPIEDADES",
    operationStatus: "EN_ALQUILER",
    title: "Propiedades en alquiler"
  },
  "propiedades/alquiler-temporario": {
    category: "PROPIEDADES",
    operationStatus: "ALQUILER_TEMPORARIO",
    title: "Alquiler temporario"
  },
  "emprendimientos/en-construccion": {
    category: "EMPRENDIMIENTOS",
    operationStatus: "EN_CONSTRUCCION",
    title: "Emprendimientos en construccion"
  },
  "emprendimientos/en-pozo": {
    category: "EMPRENDIMIENTOS",
    operationStatus: "EN_POZO",
    title: "Emprendimientos en pozo"
  },
  "emprendimientos/listos-para-vivir": {
    category: "EMPRENDIMIENTOS",
    operationStatus: "LISTO_PARA_VIVIR",
    title: "Listos para vivir"
  }
};

export const categories = [
  { value: "PROPIEDADES", label: "Propiedades" },
  { value: "EMPRENDIMIENTOS", label: "Emprendimientos" }
];

export const operationStatuses = [
  { value: "EN_VENTA", label: "En venta" },
  { value: "EN_ALQUILER", label: "En alquiler" },
  { value: "ALQUILER_TEMPORARIO", label: "Alquiler temporario" },
  { value: "EN_CONSTRUCCION", label: "En construccion" },
  { value: "EN_POZO", label: "En pozo" },
  { value: "LISTO_PARA_VIVIR", label: "Listo para vivir" }
];
