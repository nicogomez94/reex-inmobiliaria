import { CATEGORIES, CURRENCIES, OPERATION_STATUSES } from "./constants.js";

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

export function validatePropertyPayload(payload) {
  const requiredStrings = [
    "title",
    "description",
    "address",
    "neighborhood",
    "city",
    "branch"
  ];

  for (const field of requiredStrings) {
    if (!payload[field] || typeof payload[field] !== "string") {
      return `Campo invalido: ${field}`;
    }
  }

  if (!CATEGORIES.includes(payload.category)) {
    return "Categoria invalida.";
  }

  if (!OPERATION_STATUSES.includes(payload.operationStatus)) {
    return "Estado de operacion invalido.";
  }

  if (!CURRENCIES.includes(payload.currency)) {
    return "Moneda invalida.";
  }

  if (Number.isNaN(Number(payload.price))) {
    return "Precio invalido.";
  }

  const integerFields = [
    "totalM2",
    "coveredM2",
    "rooms",
    "bathrooms",
    "garageSpots"
  ];

  for (const field of integerFields) {
    if (!isPositiveInteger(payload[field])) {
      return `Campo invalido: ${field}`;
    }
  }

  if (!Array.isArray(payload.images)) {
    return "El campo images debe ser un arreglo.";
  }

  return null;
}
