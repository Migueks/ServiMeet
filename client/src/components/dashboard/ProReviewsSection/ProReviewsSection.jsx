// Importo hooks de React para guardar estado local
// y memorizar cálculos derivados.
import { useMemo, useState } from "react";

// Importo el componente reutilizable de paginación.
import Pagination from "../../common/Pagination/Pagination";

// Importo la utilidad para formatear la puntuación de cada reseña.
import formatRating from "../../../utils/formatRating";

// Importo los estilos del componente.
import styles from "./ProReviewsSection.module.css";

// Defino cuántas reseñas mostraré por página.
const ITEMS_PER_PAGE = 10;

// Componente que muestra las reseñas recibidas por el profesional.
function ProReviewsSection({ myReviews }) {
  // Estado local para controlar la página actual de la paginación.
  const [currentPage, setCurrentPage] = useState(1);

  // Calculo el número total de páginas.
  // Como mínimo habrá 1 para evitar problemas en la paginación.
  const totalPages = Math.max(1, Math.ceil(myReviews.length / ITEMS_PER_PAGE));

  // Ajusto la página actual para que nunca supere el total de páginas disponibles.
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Calculo qué reseñas se mostrarán en la página actual.
  // Uso useMemo para no recalcular el slice en cada render sin necesidad.
  const paginatedReviews = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return myReviews.slice(start, end);
  }, [myReviews, safeCurrentPage]);

  // Cambia la página actual si el número recibido es válido.
  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        {/* Título principal de la sección */}
        <h2 className={styles.sectionTitle}>Reseñas recibidas</h2>

        {/* Texto resumen con el número total de reseñas recibidas */}
        <p className={styles.infoText}>
          {myReviews.length}{" "}
          {myReviews.length === 1 ? "reseña recibida" : "reseñas recibidas"}
        </p>
      </div>

      {myReviews.length === 0 ? (
        // Si el profesional todavía no ha recibido reseñas,
        // muestro un mensaje vacío.
        <p className={styles.infoText}>Aún no has recibido reseñas.</p>
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

                {/* Nombre del cliente que dejó la reseña */}
                <p className={styles.cardText}>
                  <strong>Cliente:</strong>{" "}
                  {review.client?.name || "No disponible"}
                </p>

                {/* Puntuación de la reseña */}
                <p className={styles.cardText}>
                  <strong>Valoración:</strong> ⭐ {formatRating(review.rating)}
                  /5
                </p>

                {/* Comentario escrito por el cliente */}
                <p className={styles.cardText}>
                  <strong>Comentario:</strong> {review.comment}
                </p>
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

// Exporto el componente para usarlo dentro del Dashboard.
export default ProReviewsSection;
