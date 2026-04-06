import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";
import formatRating from "../../../utils/formatRating";
import styles from "./AdminReviewsSection.module.css";

const ITEMS_PER_PAGE = 10;

function AdminReviewsSection({
  adminReviews,
  isAdminTogglingReviewId,
  handleAdminToggleReviewVisibility,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(adminReviews.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedReviews = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminReviews.slice(start, end);
  }, [adminReviews, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Reseñas</h2>
        <p className={styles.infoText}>
          {adminReviews.length}{" "}
          {adminReviews.length === 1
            ? "reseña registrada"
            : "reseñas registradas"}
        </p>
      </div>

      {adminReviews.length === 0 ? (
        <p className={styles.infoText}>No hay reseñas registradas.</p>
      ) : (
        <>
          <div className={styles.cardsColumn}>
            {paginatedReviews.map((review) => (
              <article key={review.id} className={styles.card}>
                <h3 className={styles.cardTitle}>
                  {review.service?.title || "Servicio"}
                </h3>

                <p className={styles.cardText}>
                  <strong>Cliente:</strong>{" "}
                  {review.client?.name || "No disponible"}
                </p>

                <p className={styles.cardText}>
                  <strong>Profesional:</strong>{" "}
                  {review.pro?.name || "No disponible"}
                </p>

                <p className={styles.cardText}>
                  <strong>Valoración:</strong> ⭐ {formatRating(review.rating)}{" "}
                  /5
                </p>

                <p className={styles.cardText}>
                  <strong>Estado:</strong>{" "}
                  <span
                    className={
                      review.isVisible
                        ? styles.statusVisible
                        : styles.statusHidden
                    }
                  >
                    {review.isVisible ? "Visible" : "Oculta"}
                  </span>
                </p>

                <p className={styles.cardText}>
                  <strong>Comentario:</strong> {review.comment}
                </p>

                <div className={styles.actionsRow}>
                  <button
                    type="button"
                    className={
                      review.isVisible
                        ? styles.dangerButton
                        : styles.primaryButton
                    }
                    onClick={() => handleAdminToggleReviewVisibility(review)}
                    disabled={isAdminTogglingReviewId === review.id}
                  >
                    {isAdminTogglingReviewId === review.id
                      ? "Guardando..."
                      : review.isVisible
                        ? "Ocultar reseña"
                        : "Mostrar reseña"}
                  </button>
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

export default AdminReviewsSection;
