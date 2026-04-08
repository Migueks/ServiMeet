// Defino las etiquetas legibles que usaré para cada rol del sistema.
const ROLE_LABELS = {
  CLIENT: "Cliente",
  PRO: "Profesional",
  ADMIN: "Administrador",
};

// Esta función transforma el rol técnico guardado en la base de datos
// en un texto más claro para mostrar en la interfaz.
export function formatRole(role) {
  return ROLE_LABELS[role] || role || "Sin rol";
}
