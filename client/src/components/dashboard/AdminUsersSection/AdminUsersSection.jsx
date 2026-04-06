import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";
import { formatRole } from "../../../utils/formatRole";
import styles from "./AdminUsersSection.module.css";

const ITEMS_PER_PAGE = 10;

function AdminUsersSection({
  adminUsers,
  currentAdminUserId,
  isAdminTogglingUserId,
  handleAdminToggleUserBlocked,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(adminUsers.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminUsers.slice(start, end);
  }, [adminUsers, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Usuarios</h2>
        <p className={styles.infoText}>
          {adminUsers.length}{" "}
          {adminUsers.length === 1
            ? "usuario registrado"
            : "usuarios registrados"}
        </p>
      </div>

      {adminUsers.length === 0 ? (
        <p className={styles.infoText}>No hay usuarios disponibles.</p>
      ) : (
        <>
          <div className={styles.cardsColumn}>
            {paginatedUsers.map((adminUser) => {
              const isOwnAccount = adminUser.id === currentAdminUserId;

              return (
                <article key={adminUser.id} className={styles.card}>
                  <h3 className={styles.cardTitle}>{adminUser.name}</h3>

                  <p className={styles.cardText}>
                    <strong>Email:</strong> {adminUser.email}
                  </p>

                  <p className={styles.cardText}>
                    <strong>Rol:</strong> {formatRole(adminUser.role)}
                  </p>

                  <p className={styles.cardText}>
                    <strong>Ciudad:</strong> {adminUser.city || "No indicada"}
                  </p>

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

export default AdminUsersSection;
