// Defino las etiquetas legibles que usaré para cada estado de solicitud.
const STATUS_LABELS = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  DONE: "Completada",
  CANCELLED: "Cancelada",
};

// Esta función transforma el estado técnico en un texto más clara para mostrarlo en la interfaz.
export default function formatStatus(status) {
  return STATUS_LABELS[status] || status || "Sin estado";
}
