// Importo hooks de React para guardar estado local
// y memorizar cálculos derivados.
import { useMemo, useState } from "react";

// Importo el componente reutilizable de paginación.
import Pagination from "../../common/Pagination/Pagination";

// Importo la utilidad para mostrar el estado de la solicitud
// con un texto más claro para el usuario.
import formatStatus from "../../../utils/formatStatus";

// Importo los estilos del componente.
import styles from "./ProRequestsSection.module.css";

// Defino cuántas solicitudes mostraré por página.
const ITEMS_PER_PAGE = 10;

// Componente que muestra las solicitudes recibidas por el profesional
// y permite aceptar, rechazar o completar trabajos.
function ProRequestsSection({
  requests,
  isUpdatingRequestId,
  handleUpdateRequestStatus,
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
        {/* Título principal de la sección */}
        <h2 className={styles.sectionTitle}>Solicitudes recibidas</h2>

        {/* Texto resumen con el número total de solicitudes recibidas */}
        <p className={styles.infoText}>
          {requests.length}{" "}
          {requests.length === 1
            ? "solicitud recibida"
            : "solicitudes recibidas"}
        </p>
      </div>

      {requests.length === 0 ? (
        // Si el profesional aún no ha recibido solicitudes,
        // muestro un mensaje vacío.
        <p className={styles.infoText}>Aún no has recibido solicitudes.</p>
      ) : (
        <>
          {/* Listado de tarjetas de solicitudes recibidas */}
          <div className={styles.cardsColumn}>
            {paginatedRequests.map((request) => (
              <article key={request.id} className={styles.card}>
                {/* Título del servicio al que pertenece la solicitud */}
                <h3 className={styles.cardTitle}>
                  {request.service?.title || "Servicio"}
                </h3>

                {/* Nombre del cliente que envió la solicitud */}
                <p className={styles.cardText}>
                  <strong>Cliente:</strong>{" "}
                  {request.client?.name || "No disponible"}
                </p>

                {/* Estado actual de la solicitud */}
                <p className={styles.cardText}>
                  <strong>Estado:</strong> {formatStatus(request.status)}
                </p>

                {/* Mensaje que escribió el cliente al enviar la solicitud */}
                <p className={styles.cardText}>
                  <strong>Mensaje:</strong> {request.message}
                </p>

                <div className={styles.actionsRow}>
                  {/* Si la solicitud está pendiente,
                      permito aceptarla o rechazarla */}
                  {request.status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() =>
                          handleUpdateRequestStatus(request.id, "ACCEPTED")
                        }
                        disabled={isUpdatingRequestId === request.id}
                      >
                        {isUpdatingRequestId === request.id
                          ? "Actualizando..."
                          : "Aceptar"}
                      </button>

                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() =>
                          handleUpdateRequestStatus(request.id, "REJECTED")
                        }
                        disabled={isUpdatingRequestId === request.id}
                      >
                        {isUpdatingRequestId === request.id
                          ? "Actualizando..."
                          : "Rechazar"}
                      </button>
                    </>
                  ) : null}

                  {/* Si la solicitud ya fue aceptada,
                      permito marcarla como completada */}
                  {request.status === "ACCEPTED" ? (
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() =>
                        handleUpdateRequestStatus(request.id, "DONE")
                      }
                      disabled={isUpdatingRequestId === request.id}
                    >
                      {isUpdatingRequestId === request.id
                        ? "Actualizando..."
                        : "Marcar como completada"}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
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
export default ProRequestsSection;
