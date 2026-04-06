import { Link } from "react-router-dom";
import formatPrice from "../../../utils/formatPrice";
import formatRating from "../../../utils/formatRating";
import styles from "./ServiceCard.module.css";

function ServiceCard({ service }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.category}>
          {service.category?.name || "Sin categoría"}
        </span>
        <span className={styles.city}>
          {service.city?.name || "Sin ciudad"}
        </span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{service.title}</h3>

        <p className={styles.description}>{service.description}</p>

        <div className={styles.meta}>
          <p className={styles.professional}>
            Por {service.pro?.name || "Profesional"}
          </p>
          <p className={styles.rating}>
            ⭐ {formatRating(service.averageRating)} · {service.reviewsCount ?? 0}{" "}
            reseñas
          </p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.price}>Desde {formatPrice(service.price)}</p>

        <Link to={`/services/${service.id}`} className={styles.button}>
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

export default ServiceCard;
