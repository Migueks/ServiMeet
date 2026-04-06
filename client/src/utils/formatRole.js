const ROLE_LABELS = {
  CLIENT: "Cliente",
  PRO: "Profesional",
  ADMIN: "Administrador",
};

export function formatRole(role) {
  return ROLE_LABELS[role] || role || "Sin rol";
}
