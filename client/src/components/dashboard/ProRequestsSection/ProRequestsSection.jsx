import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";
import formatStatus from "../../../utils/formatStatus";
import styles from "./ProRequestsSection.module.css";

const ITEMS_PER_PAGE = 10;

function ProRequestsSection({
  requests,
  isUpdatingRequestId,
  handleUpdateRequestStatus,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(requests.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRequests = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return requests.slice(start, end);
  }, [requests, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Solicitudes recibidas</h2>
        <p className={styles.infoText}>
          {requests.length}{" "}
          {requests.length === 1
            ? "solicitud recibida"
            : "solicitudes recibidas"}
        </p>
      </div>

      {requests.length === 0 ? (
        <p className={styles.infoText}>Aún no has recibido solicitudes.</p>
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
                  <strong>Estado:</strong> {formatStatus(request.status)}
                </p>

                <p className={styles.cardText}>
                  <strong>Mensaje:</strong> {request.message}
                </p>

                <div className={styles.actionsRow}>
                  {request.status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() =>
                          handleUpdateRequestStatus(request.id, "ACCEPTED")
                        }
                        disabled={isUpdatingRequestId === request.id}
                      >
                        {isUpdatingRequestId === request.id
                          ? "Actualizando..."
                          : "Aceptar"}
                      </button>

                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() =>
                          handleUpdateRequestStatus(request.id, "REJECTED")
                        }
                        disabled={isUpdatingRequestId === request.id}
                      >
                        {isUpdatingRequestId === request.id
                          ? "Actualizando..."
                          : "Rechazar"}
                      </button>
                    </>
                  ) : null}

                  {request.status === "ACCEPTED" ? (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() =>
                        handleUpdateRequestStatus(request.id, "DONE")
                      }
                      disabled={isUpdatingRequestId === request.id}
                    >
                      {isUpdatingRequestId === request.id
                        ? "Actualizando..."
                        : "Marcar como completada"}
                    </button>
                  ) : null}
                </div>
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

export default ProRequestsSection;
