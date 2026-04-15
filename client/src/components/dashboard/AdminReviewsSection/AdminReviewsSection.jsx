// Importo hooks de React para guardar estado local
// y memorizar las reseñas paginadas.
import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";

// Importo la utilidad para formatear la valoración de cada reseña.
import formatRating from "../../../utils/formatRating";

// Importo los estilos del componente.
import styles from "./AdminReviewsSection.module.css";

// Defino cuántas reseñas se mostrarán por página.
const ITEMS_PER_PAGE = 10;

// Componente que muestra al admin todas las reseñas
// y permite ocultarlas o volver a mostrarlas.
function AdminReviewsSection({
  adminReviews,
  isAdminTogglingReviewId,
  handleAdminToggleReviewVisibility,
}) {
  // Estado local para controlar la página actual de la paginación.
  const [currentPage, setCurrentPage] = useState(1);

  // Calculo el número total de páginas.
  // Como mínimo habrá 1 para evitar problemas en la paginación.
  const totalPages = Math.max(
    1,
    Math.ceil(adminReviews.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Calculo qué reseñas se mostrarán en la página actual.
  // Uso useMemo para no recalcular el slice en cada render sin necesidad.
  const paginatedReviews = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminReviews.slice(start, end);
  }, [adminReviews, safeCurrentPage]);

  // Cambia la página actual si el valor recibido es válido.
  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        {/* Título principal de la sección */}
        <h2 className={styles.sectionTitle}>Reseñas</h2>

        {/* Texto resumen con el número total de reseñas */}
        <p className={styles.infoText}>
          {adminReviews.length}{" "}
          {adminReviews.length === 1
            ? "reseña registrada"
            : "reseñas registradas"}
        </p>
      </div>

      {adminReviews.length === 0 ? (
        // Si no hay reseñas, muestro un mensaje vacío.
        <p className={styles.infoText}>No hay reseñas registradas.</p>
      ) : (
        <>
          {/* Listado de tarjetas de reseñas */}
          <div className={styles.cardsColumn}>
            {paginatedReviews.map((review) => (
              <article key={review.id} className={styles.card}>
                {/* Título del servicio al que pertenece la reseña */}
                <h3 className={styles.cardTitle}>
                  {review.service?.title || "Servicio"}
                </h3>

                {/* Cliente que escribió la reseña */}
                <p className={styles.cardText}>
                  <strong>Cliente:</strong>{" "}
                  {review.client?.name || "No disponible"}
                </p>

                {/* Profesional que recibió la reseña */}
                <p className={styles.cardText}>
                  <strong>Profesional:</strong>{" "}
                  {review.pro?.name || "No disponible"}
                </p>

                {/* Valoración de la reseña formateada */}
                <p className={styles.cardText}>
                  <strong>Valoración:</strong> ⭐ {formatRating(review.rating)}{" "}
                  /5
                </p>

                {/* Estado de visibilidad de la reseña */}
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

                {/* Comentario de la reseña */}
                <p className={styles.cardText}>
                  <strong>Comentario:</strong> {review.comment}
                </p>

                <div className={styles.actionsRow}>
                  {/* Botón para ocultar o mostrar la reseña */}
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

          {/* Paginación del listado de reseñas */}
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

// Exporto el componente para usarlo dentro del dashboard.
export default AdminReviewsSection;
