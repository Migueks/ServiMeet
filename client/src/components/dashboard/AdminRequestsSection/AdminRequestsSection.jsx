// Importo hooks de React para guardar estado local
// y memorizar las solicitudes paginadas.
import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";

// Importo la utilidad que transforma el estado técnico
// en un texto más claro para la interfaz.
import formatStatus from "../../../utils/formatStatus";

// Importo los estilos del componente.
import styles from "./AdminRequestsSection.module.css";

// Defino cuántas solicitudes se mostrarán por página.
const ITEMS_PER_PAGE = 10;

// Componente que muestra al admin todas las solicitudes registradas.
function AdminRequestsSection({ adminRequests }) {
  // Estado local para controlar la página actual de la paginación.
  const [currentPage, setCurrentPage] = useState(1);

  // Calculo el número total de páginas.
  // Como mínimo habrá 1 para evitar problemas en la paginación.
  const totalPages = Math.max(
    1,
    Math.ceil(adminRequests.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Calculo qué solicitudes se mostrarán en la página actual.
  // Uso useMemo para no recalcular el slice en cada render sin necesidad.
  const paginatedRequests = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminRequests.slice(start, end);
  }, [adminRequests, safeCurrentPage]);

  // Cambia la página actual si el valor recibido es válido.
  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        {/* Título principal de la sección */}
        <h2 className={styles.sectionTitle}>Solicitudes</h2>

        {/* Texto resumen con el número total de solicitudes */}
        <p className={styles.infoText}>
          {adminRequests.length}{" "}
          {adminRequests.length === 1
            ? "solicitud registrada"
            : "solicitudes registradas"}
        </p>
      </div>

      {adminRequests.length === 0 ? (
        // Si no hay solicitudes, muestro un mensaje vacío.
        <p className={styles.infoText}>No hay solicitudes registradas.</p>
      ) : (
        <>
          {/* Listado de tarjetas de solicitudes */}
          <div className={styles.cardsColumn}>
            {paginatedRequests.map((request) => (
              <article key={request.id} className={styles.card}>
                {/* Título del servicio relacionado con la solicitud */}
                <h3 className={styles.cardTitle}>
                  {request.service?.title || "Servicio"}
                </h3>

                {/* Cliente que envió la solicitud */}
                <p className={styles.cardText}>
                  <strong>Cliente:</strong>{" "}
                  {request.client?.name || "No disponible"}
                </p>

                {/* Profesional que recibió la solicitud */}
                <p className={styles.cardText}>
                  <strong>Profesional:</strong>{" "}
                  {request.pro?.name || "No disponible"}
                </p>

                {/* Estado actual de la solicitud */}
                <p className={styles.cardText}>
                  <strong>Estado:</strong> {formatStatus(request.status)}
                </p>

                {/* Mensaje incluido en la solicitud */}
                <p className={styles.cardText}>
                  <strong>Mensaje:</strong> {request.message}
                </p>
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

// Exporto el componente para usarlo dentro del dashboard.
export default AdminRequestsSection;
