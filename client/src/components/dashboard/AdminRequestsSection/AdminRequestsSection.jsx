import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";
import formatStatus from "../../../utils/formatStatus";
import styles from "./AdminRequestsSection.module.css";

const ITEMS_PER_PAGE = 10;

function AdminRequestsSection({ adminRequests }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(adminRequests.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRequests = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminRequests.slice(start, end);
  }, [adminRequests, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Solicitudes</h2>
        <p className={styles.infoText}>
          {adminRequests.length}{" "}
          {adminRequests.length === 1
            ? "solicitud registrada"
            : "solicitudes registradas"}
        </p>
      </div>

      {adminRequests.length === 0 ? (
        <p className={styles.infoText}>No hay solicitudes registradas.</p>
      ) : (
        <>
          <div className={styles.cardsColumn}>
            {paginatedRequests.map((request) => (
              <article key={request.id} className={styles.card}>
                <h3 className={styles.cardTitle}>
                  {request.service?.title || "Servicio"}
                </h3>

                <p className={styles.cardText}>
                  <strong>Cliente:</strong>{" "}
                  {request.client?.name || "No disponible"}
                </p>

                <p className={styles.cardText}>
                  <strong>Profesional:</strong>{" "}
                  {request.pro?.name || "No disponible"}
                </p>

                <p className={styles.cardText}>
                  <strong>Estado:</strong> {formatStatus(request.status)}
                </p>

                <p className={styles.cardText}>
                  <strong>Mensaje:</strong> {request.message}
                </p>
              </article>
            ))}
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

export default AdminRequestsSection;
