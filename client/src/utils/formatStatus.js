const STATUS_LABELS = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
  DONE: "Completada",
  CANCELLED: "Cancelada",
};

export default function formatStatus(status) {
  return STATUS_LABELS[status] || status || "Sin estado";
}
