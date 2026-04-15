// Importo Link para poder volver al listado de servicios sin recargar la página.
import { Link } from "react-router-dom";

// Importo la utilidad para formatear la valoración media.
import formatRating from "../../../utils/formatRating";

// Importo los estilos del componente.
import styles from "./ServiceDetailHeader.module.css";

// Componente que muestra la cabecera principal del detalle del servicio.
function ServiceDetailHeader({
  service,
  categoryName,
  cityName,
  professionalName,
}) {
  return (
    <>
      {/* Enlace para volver al listado general de servicios */}
      <Link to="/services" className={styles.backLink}>
        ← Volver a servicios
      </Link>

      <div className={styles.header}>
        {/* Badges con categoría y ciudad del servicio */}
        <div className={styles.badges}>
          <span className={styles.category}>{categoryName}</span>
          <span className={styles.city}>{cityName}</span>
        </div>

        {/* Título del servicio */}
        <h1 className={styles.title}>{service.title}</h1>

        {/* Información resumida del profesional y de las reseñas */}
        <div className={styles.meta}>
          <p>Por {professionalName}</p>
          <p>
            ⭐ {formatRating(service.averageRating)} ·{" "}
            {service.reviewsCount ?? 0} reseñas
          </p>
        </div>
      </div>

      {/* Si el servicio tiene imagen, la muestro debajo de la cabecera */}
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

// Exporto el componente para usarlo dentro de la página de detalle.
export default ServiceDetailHeader;
