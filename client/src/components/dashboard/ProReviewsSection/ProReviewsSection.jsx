import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";
import formatRating from "../../../utils/formatRating";
import styles from "./ProReviewsSection.module.css";

const ITEMS_PER_PAGE = 10;

function ProReviewsSection({ myReviews }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(myReviews.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedReviews = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return myReviews.slice(start, end);
  }, [myReviews, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Reseñas recibidas</h2>
        <p className={styles.infoText}>
          {myReviews.length}{" "}
          {myReviews.length === 1 ? "reseña recibida" : "reseñas recibidas"}
        </p>
      </div>

      {myReviews.length === 0 ? (
        <p className={styles.infoText}>Aún no has recibido reseñas.</p>
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
                  <strong>Valoración:</strong> ⭐ {formatRating(review.rating)}
                  /5
                </p>

                <p className={styles.cardText}>
                  <strong>Comentario:</strong> {review.comment}
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

export default ProReviewsSection;
