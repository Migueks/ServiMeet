// Importo los estilos del componente.
import styles from "./HomeReviewsSection.module.css";

// Esta función formatea el nombre del cliente
// para mostrarlo de forma más corta y limpia.
function formatReviewerName(fullName) {
  // Si no llega nombre válido, muestro un texto por defecto.
  if (!fullName?.trim()) return "Cliente";

  // Separo el nombre completo por palabras.
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  // Cojo el primer nombre.
  const firstName = parts[0] || "Cliente";

  // Si existe un segundo nombre o apellido, guardo su inicial.
  const secondInitial = parts[1]?.charAt(0)?.toUpperCase();

  // Si hay inicial, la añado al nombre.
  // Si no, muestro solo el primer nombre.
  return secondInitial ? `${firstName} ${secondInitial}.` : firstName;
}

// Esta función genera visualmente las estrellas de la reseña.
function renderStars(rating = 0) {
  // Aseguro que la puntuación esté entre 0 y 5
  // y la redondeo al entero más cercano.
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));

  // Creo un array de 5 posiciones para pintar estrellas llenas o vacías.
  return Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={styles.star}>
      {index < safeRating ? "★" : "☆"}
    </span>
  ));
}

// Componente que muestra las reseñas visibles en la home.
function HomeReviewsSection({
  reviews = [],
  isLoading = false,
  onSelectReviewCategory,
}) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeading}>
          {/* Encabezado de la sección */}
          <span className={styles.sectionEyebrow}>Reseñas</span>
          <h2>Lo que opinan los clientes</h2>
          <p>
            Opiniones reales de usuarios que ya han contratado servicios en la
            plataforma.
          </p>
        </div>

        {isLoading ? (
          // Si la home sigue cargando, muestro un mensaje temporal.
          <p className={styles.emptyText}>Cargando reseñas reales...</p>
        ) : reviews.length === 0 ? (
          // Si no hay reseñas para mostrar, enseño un mensaje vacío.
          <p className={styles.emptyText}>
            Todavía no hay reseñas suficientes para mostrar en la home.
          </p>
        ) : (
          // Si sí hay reseñas, las muestro en formato de tarjetas.
          <div className={styles.reviewsGrid}>
            {reviews.map((review) => (
              <article key={review.id} className={styles.reviewCard}>
                <header className={styles.reviewHeader}>
                  <div className={styles.nameRow}>
                    {/* Muestro el nombre formateado del cliente */}
                    <strong>{formatReviewerName(review.client?.name)}</strong>

                    {/* Muestro la puntuación visual con estrellas */}
                    <div
                      className={styles.stars}
                      aria-label={`${review.rating} de 5`}
                    >
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </header>

                {/* Comentario escrito por el cliente */}
                <p className={styles.comment}>{review.comment}</p>

                {/* Botón para navegar a servicios relacionados con la reseña */}
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

// Exporto el componente para usarlo dentro de la página Home.
export default HomeReviewsSection;
