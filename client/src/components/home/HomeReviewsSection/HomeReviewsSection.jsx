import styles from "./HomeReviewsSection.module.css";

function formatReviewerName(fullName) {
  if (!fullName?.trim()) return "Cliente";

  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "Cliente";
  const secondInitial = parts[1]?.charAt(0)?.toUpperCase();

  return secondInitial ? `${firstName} ${secondInitial}.` : firstName;
}

function renderStars(rating = 0) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={styles.star}>
      {index < safeRating ? "★" : "☆"}
    </span>
  ));
}

function HomeReviewsSection({
  reviews = [],
  isLoading = false,
  onSelectReviewCategory,
}) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionEyebrow}>Reseñas</span>
          <h2>Lo que opinan los clientes</h2>
          <p>
            Opiniones reales de usuarios que ya han contratado servicios en la
            plataforma.
          </p>
        </div>

        {isLoading ? (
          <p className={styles.emptyText}>Cargando reseñas reales...</p>
        ) : reviews.length === 0 ? (
          <p className={styles.emptyText}>
            Todavía no hay reseñas suficientes para mostrar en la home.
          </p>
        ) : (
          <div className={styles.reviewsGrid}>
            {reviews.map((review) => (
              <article key={review.id} className={styles.reviewCard}>
                <header className={styles.reviewHeader}>
                  <div className={styles.nameRow}>
                    <strong>{formatReviewerName(review.client?.name)}</strong>
                    <div
                      className={styles.stars}
                      aria-label={`${review.rating} de 5`}
                    >
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </header>

                <p className={styles.comment}>{review.comment}</p>

                <button
                  type="button"
                  className={styles.categoryButton}
                  onClick={() => onSelectReviewCategory(review)}
                  title={
                    review.service?.title || review.service?.category?.name
                  }
                >
                  {review.service?.category?.name || "Ver servicio"}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeReviewsSection;
