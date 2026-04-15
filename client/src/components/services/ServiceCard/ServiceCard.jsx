// Importo Link para navegar al detalle del servicio sin recargar la página.
import { Link } from "react-router-dom";

// Importo utilidades para formatear el precio y la valoración
// antes de mostrarlos en pantalla.
import formatPrice from "../../../utils/formatPrice";
import formatRating from "../../../utils/formatRating";

// Importo los estilos del componente.
import styles from "./ServiceCard.module.css";

// Tarjeta reutilizable para mostrar la información resumida de un servicio.
function ServiceCard({ service }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        {/* Muestro la categoría del servicio o un texto por defecto */}
        <span className={styles.category}>
          {service.category?.name || "Sin categoría"}
        </span>

        {/* Muestro la ciudad del servicio o un texto por defecto */}
        <span className={styles.city}>
          {service.city?.name || "Sin ciudad"}
        </span>
      </div>

      <div className={styles.content}>
        {/* Título principal del servicio */}
        <h3 className={styles.title}>{service.title}</h3>

        {/* Descripción breve del servicio */}
        <p className={styles.description}>{service.description}</p>

        <div className={styles.meta}>
          {/* Nombre del profesional que publica el servicio */}
          <p className={styles.professional}>
            Por {service.pro?.name || "Profesional"}
          </p>

          {/* Valoración media y número de reseñas */}
          <p className={styles.rating}>
            ⭐ {formatRating(service.averageRating)} ·{" "}
            {service.reviewsCount ?? 0} reseñas
          </p>
        </div>
      </div>

      <div className={styles.bottom}>
        {/* Precio base del servicio formateado */}
        <p className={styles.price}>Desde {formatPrice(service.price)}</p>

        {/* Enlace al detalle completo del servicio */}
        <Link to={`/services/${service.id}`} className={styles.button}>
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

// Exporto el componente para reutilizarlo en listados y secciones destacadas.
export default ServiceCard;
