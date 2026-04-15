// Importo hooks de React para guardar estado local
// y memorizar los usuarios paginados.
import { useMemo, useState } from "react";

// Importo el componente reutilizable de paginación.
import Pagination from "../../common/Pagination/Pagination";

// Importo la utilidad que transforma el rol técnico
// en un texto más claro para mostrar en la interfaz.
import { formatRole } from "../../../utils/formatRole";

// Importo los estilos del componente.
import styles from "./AdminUsersSection.module.css";

// Defino cuántos usuarios se mostrarán por página.
const ITEMS_PER_PAGE = 10;

// Componente que muestra al admin el listado de usuarios
// y permite bloquearlos o desbloquearlos.
function AdminUsersSection({
  adminUsers,
  currentAdminUserId,
  isAdminTogglingUserId,
  handleAdminToggleUserBlocked,
}) {
  // Estado local para controlar la página actual de la paginación.
  const [currentPage, setCurrentPage] = useState(1);

  // Calculo el número total de páginas.
  // Como mínimo habrá 1 para evitar problemas en la paginación.
  const totalPages = Math.max(1, Math.ceil(adminUsers.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Calculo qué usuarios se mostrarán en la página actual.
  // Uso useMemo para no recalcular el slice en cada render sin necesidad.
  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminUsers.slice(start, end);
  }, [adminUsers, safeCurrentPage]);

  // Cambia la página actual si el valor recibido es válido.
  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        {/* Título principal de la sección */}
        <h2 className={styles.sectionTitle}>Usuarios</h2>

        {/* Texto resumen con el número total de usuarios */}
        <p className={styles.infoText}>
          {adminUsers.length}{" "}
          {adminUsers.length === 1
            ? "usuario registrado"
            : "usuarios registrados"}
        </p>
      </div>

      {adminUsers.length === 0 ? (
        // Si no hay usuarios, muestro un mensaje vacío.
        <p className={styles.infoText}>No hay usuarios disponibles.</p>
      ) : (
        <>
          {/* Listado de tarjetas de usuarios */}
          <div className={styles.cardsColumn}>
            {paginatedUsers.map((adminUser) => {
              // Compruebo si el usuario listado es el propio admin autenticado.
              const isOwnAccount = adminUser.id === currentAdminUserId;

              return (
                <article key={adminUser.id} className={styles.card}>
                  {/* Nombre del usuario */}
                  <h3 className={styles.cardTitle}>{adminUser.name}</h3>

                  {/* Email del usuario */}
                  <p className={styles.cardText}>
                    <strong>Email:</strong> {adminUser.email}
                  </p>

                  {/* Rol del usuario formateado para que sea más legible */}
                  <p className={styles.cardText}>
                    <strong>Rol:</strong> {formatRole(adminUser.role)}
                  </p>

                  {/* Ciudad del usuario */}
                  <p className={styles.cardText}>
                    <strong>Ciudad:</strong> {adminUser.city || "No indicada"}
                  </p>

                  {/* Estado actual del usuario: activo o bloqueado */}
                  <p className={styles.cardText}>
                    <strong>Estado:</strong>{" "}
                    <span
                      className={
                        adminUser.isBlocked
                          ? styles.statusBlocked
                          : styles.statusActive
                      }
                    >
                      {adminUser.isBlocked ? "Bloqueado" : "Activo"}
                    </span>
                  </p>

                  <div className={styles.actionsRow}>
                    {/* Botón para bloquear o desbloquear usuarios.
                        Si es la cuenta del propio admin, el botón se desactiva. */}
                    <button
                      type="button"
                      className={
                        adminUser.isBlocked
                          ? styles.primaryButton
                          : styles.dangerButton
                      }
                      onClick={() => handleAdminToggleUserBlocked(adminUser)}
                      disabled={
                        isOwnAccount || isAdminTogglingUserId === adminUser.id
                      }
                    >
                      {isOwnAccount
                        ? "Tu cuenta"
                        : isAdminTogglingUserId === adminUser.id
                          ? "Guardando..."
                          : adminUser.isBlocked
                            ? "Desbloquear"
                            : "Bloquear"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Paginación del listado de usuarios */}
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}

// Exporto el componente para usarlo dentro del dashboard.
export default AdminUsersSection;
