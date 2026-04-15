// Importo la utilidad para formatear la puntuación de cada reseña.
import formatRating from "../../../utils/formatRating";

// Importo los estilos del componente.
import styles from "./ServiceReviewsCard.module.css";

// Componente que muestra la lista de reseñas del servicio.
function ServiceReviewsCard({ reviews }) {
  return (
    <div className={styles.card}>
      <h2>Reseñas</h2>

      {reviews.length > 0 ? (
        // Si hay reseñas, las muestro en una lista
        <ul className={styles.reviewsList}>
          {reviews.map((review) => (
            <li key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                {/* Nombre del cliente que dejó la reseña */}
                <strong>{review.client?.name || "Cliente"}</strong>

                {/* Puntuación de la reseña */}
                <span>⭐ {formatRating(review.rating)}/5</span>
              </div>

              {/* Comentario escrito de la reseña */}
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        // Si no hay reseñas, muestro un mensaje informativo
        <p>Todavía no hay reseñas para este servicio.</p>
      )}
    </div>
  );
}

// Exporto el componente para usarlo dentro del detalle del servicio.
export default ServiceReviewsCard;
