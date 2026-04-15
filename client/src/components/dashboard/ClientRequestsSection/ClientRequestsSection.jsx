// Importo hooks de React para guardar estado local
// y memorizar cálculos derivados.
import { useMemo, useState } from "react";

// Importo Link para navegar al listado de servicios sin recargar la página.
import { Link } from "react-router-dom";

// Importo el componente reutilizable de paginación.
import Pagination from "../../common/Pagination/Pagination";

// Importo utilidades para formatear precio, valoración y estado.
import formatPrice from "../../../utils/formatPrice";
import formatRating from "../../../utils/formatRating";
import formatStatus from "../../../utils/formatStatus";

// Importo la utilidad que comprueba si una solicitud
// ya tiene una reseña asociada.
import { getReviewForRequest } from "../../../utils/reviewHelpers";

// Importo los estilos del componente.
import styles from "./ClientRequestsSection.module.css";

// Defino cuántas solicitudes mostraré por página.
const ITEMS_PER_PAGE = 10;

// Componente que muestra las solicitudes del cliente,
// permite cancelarlas y, si procede, crear reseñas.
function ClientRequestsSection({
  requests,
  myReviews,
  reviewForm,
  reviewError,
  reviewSuccess,
  isSubmittingReview,
  isUpdatingRequestId,
  handleUpdateRequestStatus,
  handleOpenReviewForm,
  handleReviewChange,
  handleReviewSubmit,
  setReviewForm,
}) {
  // Estado local para controlar la página actual de la paginación.
  const [currentPage, setCurrentPage] = useState(1);

  // Calculo el número total de páginas.
  // Como mínimo habrá 1 para evitar problemas en la paginación.
  const totalPages = Math.max(1, Math.ceil(requests.length / ITEMS_PER_PAGE));

  // Ajusto la página actual para que nunca supere el total de páginas disponibles.
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Calculo qué solicitudes se mostrarán en la página actual.
  // Uso useMemo para no recalcular el slice en cada render sin necesidad.
  const paginatedRequests = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return requests.slice(start, end);
  }, [requests, safeCurrentPage]);

  // Cambia la página actual si el número recibido es válido.
  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          {/* Título principal de la sección */}
          <h2 className={styles.sectionTitle}>Mis solicitudes</h2>

          {/* Texto resumen con el número total de solicitudes enviadas */}
          <p className={styles.infoText}>
            {requests.length}{" "}
            {requests.length === 1
              ? "solicitud enviada"
              : "solicitudes enviadas"}
          </p>
        </div>

        {/* Enlace para volver al catálogo y buscar más servicios */}
        <Link to="/services" className={styles.linkAction}>
          Buscar más servicios
        </Link>
      </div>

      {requests.length === 0 ? (
        // Si el cliente aún no ha enviado solicitudes, muestro un mensaje vacío.
        <p className={styles.infoText}>Aún no has enviado ninguna solicitud.</p>
      ) : (
        <>
          {/* Listado de tarjetas de solicitudes */}
          <div className={styles.cardsColumn}>
            {paginatedRequests.map((request) => {
              // Busco si esta solicitud ya tiene una reseña creada.
              const existingReview = getReviewForRequest(myReviews, request.id);

              // Compruebo si el formulario de reseña abierto
              // corresponde a esta solicitud concreta.
              const isReviewOpen = reviewForm.requestId === request.id;

              return (
                <article key={request.id} className={styles.card}>
                  {/* Título del servicio solicitado */}
                  <h3 className={styles.cardTitle}>
                    {request.service?.title || "Servicio"}
                  </h3>

                  {/* Nombre del profesional asociado a la solicitud */}
                  <p className={styles.cardText}>
                    <strong>Profesional:</strong>{" "}
                    {request.pro?.name || "No disponible"}
                  </p>

                  {/* Estado actual de la solicitud */}
                  <p className={styles.cardText}>
                    <strong>Estado:</strong> {formatStatus(request.status)}
                  </p>

                  {/* Precio del servicio relacionado */}
                  <p className={styles.cardText}>
                    <strong>Precio:</strong>{" "}
                    {formatPrice(request.service?.price)}
                  </p>

                  {/* Mensaje que escribió el cliente al crear la solicitud */}
                  <p className={styles.cardText}>
                    <strong>Mensaje:</strong> {request.message}
                  </p>

                  {/* Si la solicitud sigue pendiente o aceptada,
                      permito cancelarla */}
                  {["PENDING", "ACCEPTED"].includes(request.status) ? (
                    <div className={styles.actionsRow}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() =>
                          handleUpdateRequestStatus(request.id, "CANCELLED")
                        }
                        disabled={isUpdatingRequestId === request.id}
                      >
                        {isUpdatingRequestId === request.id
                          ? "Cancelando..."
                          : "Cancelar solicitud"}
                      </button>
                    </div>
                  ) : null}

                  {/* Si la solicitud está completada y todavía no tiene reseña,
                      permito abrir el formulario para valorarla */}
                  {request.status === "DONE" && !existingReview ? (
                    <div className={styles.reviewBlock}>
                      {!isReviewOpen ? (
                        // Si el formulario aún no está abierto,
                        // muestro el botón para abrirlo.
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={() => handleOpenReviewForm(request.id)}
                        >
                          Dejar reseña
                        </button>
                      ) : (
                        // Si el formulario está abierto,
                        // permito enviar la reseña del servicio.
                        <form
                          className={styles.reviewForm}
                          onSubmit={handleReviewSubmit}
                        >
                          <div className={styles.field}>
                            <label htmlFor={`rating-${request.id}`}>
                              Puntuación
                            </label>
                            <select
                              id={`rating-${request.id}`}
                              name="rating"
                              value={reviewForm.rating}
                              onChange={handleReviewChange}
                            >
                              <option value="5">5 - Excelente</option>
                              <option value="4">4 - Muy bien</option>
                              <option value="3">3 - Bien</option>
                              <option value="2">2 - Regular</option>
                              <option value="1">1 - Mal</option>
                            </select>
                          </div>

                          <div className={styles.field}>
                            <label htmlFor={`comment-${request.id}`}>
                              Comentario
                            </label>
                            <textarea
                              id={`comment-${request.id}`}
                              name="comment"
                              rows="4"
                              value={reviewForm.comment}
                              onChange={handleReviewChange}
                              placeholder="Cuenta tu experiencia con este servicio..."
                            />
                          </div>

                          <div className={styles.actionsRow}>
                            {/* Botón para enviar la reseña */}
                            <button
                              type="submit"
                              className={styles.primaryButton}
                              disabled={isSubmittingReview}
                            >
                              {isSubmittingReview
                                ? "Enviando..."
                                : "Enviar reseña"}
                            </button>

                            {/* Botón para cerrar el formulario
                                y resetear el estado de la reseña */}
                            <button
                              type="button"
                              className={styles.secondaryButton}
                              onClick={() =>
                                setReviewForm({
                                  requestId: null,
                                  rating: "5",
                                  comment: "",
                                })
                              }
                            >
                              Cancelar
                            </button>
                          </div>

                          {/* Error al enviar la reseña */}
                          {reviewError && isReviewOpen ? (
                            <p className={styles.errorText}>{reviewError}</p>
                          ) : null}

                          {/* Mensaje de éxito tras enviar la reseña */}
                          {reviewSuccess ? (
                            <p className={styles.successText}>
                              {reviewSuccess}
                            </p>
                          ) : null}
                        </form>
                      )}
                    </div>
                  ) : null}

                  {/* Si ya existe una reseña para esta solicitud,
                      la muestro al cliente */}
                  {existingReview ? (
                    <div className={styles.reviewBlock}>
                      <p className={styles.cardText}>
                        <strong>Tu valoración:</strong> ⭐{" "}
                        {formatRating(existingReview.rating)}/5
                      </p>
                      <p className={styles.cardText}>
                        <strong>Tu comentario:</strong> {existingReview.comment}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {/* Paginación del listado de solicitudes */}
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
export default ClientRequestsSection;
