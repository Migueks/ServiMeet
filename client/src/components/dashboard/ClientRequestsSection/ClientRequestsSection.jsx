import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../common/Pagination/Pagination";
import formatPrice from "../../../utils/formatPrice";
import formatRating from "../../../utils/formatRating";
import formatStatus from "../../../utils/formatStatus";
import { getReviewForRequest } from "../../../utils/reviewHelpers";
import styles from "./ClientRequestsSection.module.css";

const ITEMS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(requests.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRequests = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return requests.slice(start, end);
  }, [requests, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Mis solicitudes</h2>
          <p className={styles.infoText}>
            {requests.length}{" "}
            {requests.length === 1
              ? "solicitud enviada"
              : "solicitudes enviadas"}
          </p>
        </div>

        <Link to="/services" className={styles.linkAction}>
          Buscar más servicios
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className={styles.infoText}>Aún no has enviado ninguna solicitud.</p>
      ) : (
        <>
          <div className={styles.cardsColumn}>
            {paginatedRequests.map((request) => {
              const existingReview = getReviewForRequest(myReviews, request.id);
              const isReviewOpen = reviewForm.requestId === request.id;

              return (
                <article key={request.id} className={styles.card}>
                  <h3 className={styles.cardTitle}>
                    {request.service?.title || "Servicio"}
                  </h3>

                  <p className={styles.cardText}>
                    <strong>Profesional:</strong>{" "}
                    {request.pro?.name || "No disponible"}
                  </p>

                  <p className={styles.cardText}>
                    <strong>Estado:</strong> {formatStatus(request.status)}
                  </p>

                  <p className={styles.cardText}>
                    <strong>Precio:</strong>{" "}
                    {formatPrice(request.service?.price)}
                  </p>

                  <p className={styles.cardText}>
                    <strong>Mensaje:</strong> {request.message}
                  </p>

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

                  {request.status === "DONE" && !existingReview ? (
                    <div className={styles.reviewBlock}>
                      {!isReviewOpen ? (
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={() => handleOpenReviewForm(request.id)}
                        >
                          Dejar reseña
                        </button>
                      ) : (
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
                            <button
                              type="submit"
                              className={styles.primaryButton}
                              disabled={isSubmittingReview}
                            >
                              {isSubmittingReview
                                ? "Enviando..."
                                : "Enviar reseña"}
                            </button>

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

                          {reviewError && isReviewOpen ? (
                            <p className={styles.errorText}>{reviewError}</p>
                          ) : null}

                          {reviewSuccess ? (
                            <p className={styles.successText}>
                              {reviewSuccess}
                            </p>
                          ) : null}
                        </form>
                      )}
                    </div>
                  ) : null}

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

export default ClientRequestsSection;
