import formatRating from "../../../utils/formatRating";
import styles from "./ServiceReviewsCard.module.css";

function ServiceReviewsCard({ reviews }) {
  return (
    <div className={styles.card}>
      <h2>Reseñas</h2>

      {reviews.length > 0 ? (
        <ul className={styles.reviewsList}>
          {reviews.map((review) => (
            <li key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <strong>{review.client?.name || "Cliente"}</strong>
                <span>⭐ {formatRating(review.rating)}/5</span>
              </div>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Todavía no hay reseñas para este servicio.</p>
      )}
    </div>
  );
}

export default ServiceReviewsCard;
