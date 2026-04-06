import { Link } from "react-router-dom";
import formatRating from "../../../utils/formatRating";
import styles from "./ServiceDetailHeader.module.css";

function ServiceDetailHeader({
  service,
  categoryName,
  cityName,
  professionalName,
}) {
  return (
    <>
      <Link to="/services" className={styles.backLink}>
        ← Volver a servicios
      </Link>

      <div className={styles.header}>
        <div className={styles.badges}>
          <span className={styles.category}>{categoryName}</span>
          <span className={styles.city}>{cityName}</span>
        </div>

        <h1 className={styles.title}>{service.title}</h1>

        <div className={styles.meta}>
          <p>Por {professionalName}</p>
          <p>
            ⭐ {formatRating(service.averageRating)} ·{" "}
            {service.reviewsCount ?? 0} reseñas
          </p>
        </div>
      </div>

      {service.imageUrl ? (
        <div className={styles.imageCard}>
          <img
            src={service.imageUrl}
            alt={service.title}
            className={styles.image}
          />
        </div>
      ) : null}
    </>
  );
}

export default ServiceDetailHeader;
