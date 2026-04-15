// Importo hooks de React para guardar estado local
// y memorizar los servicios paginados.
import { useMemo, useState } from "react";

// Importo el componente reutilizable de paginación.
import Pagination from "../../common/Pagination/Pagination";

// Importo la utilidad para formatear el precio del servicio.
import formatPrice from "../../../utils/formatPrice";

// Importo los estilos del componente.
import styles from "./AdminServicesSection.module.css";

// Defino cuántos servicios se mostrarán por página.
const ITEMS_PER_PAGE = 10;

// Componente que muestra al admin el listado de servicios
// y permite activarlos o desactivarlos.
function AdminServicesSection({
  adminServices,
  isAdminTogglingServiceId,
  handleAdminToggleService,
}) {
  // Estado local para controlar la página actual de la paginación.
  const [currentPage, setCurrentPage] = useState(1);

  // Calculo el número total de páginas.
  // Como mínimo habrá 1 para evitar problemas en la paginación.
  const totalPages = Math.max(
    1,
    Math.ceil(adminServices.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Calculo qué servicios se mostrarán en la página actual.
  // Uso useMemo para no recalcular el slice en cada render sin necesidad.
  const paginatedServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminServices.slice(start, end);
  }, [adminServices, safeCurrentPage]);

  // Cambia la página actual si el valor recibido es válido.
  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        {/* Título principal de la sección */}
        <h2 className={styles.sectionTitle}>Servicios</h2>

        {/* Texto resumen con el número total de servicios */}
        <p className={styles.infoText}>
          {adminServices.length}{" "}
          {adminServices.length === 1
            ? "servicio registrado"
            : "servicios registrados"}
        </p>
      </div>

      {adminServices.length === 0 ? (
        // Si no hay servicios, muestro un mensaje vacío.
        <p className={styles.infoText}>No hay servicios disponibles.</p>
      ) : (
        <>
          {/* Listado de tarjetas de servicios */}
          <div className={styles.cardsColumn}>
            {paginatedServices.map((service) => (
              <article key={service.id} className={styles.card}>
                {/* Título del servicio */}
                <h3 className={styles.cardTitle}>{service.title}</h3>

                {/* Profesional propietario del servicio */}
                <p className={styles.cardText}>
                  <strong>Profesional:</strong>{" "}
                  {service.pro?.name || "No disponible"}
                </p>

                {/* Categoría del servicio */}
                <p className={styles.cardText}>
                  <strong>Categoría:</strong>{" "}
                  {service.category?.name || "Sin categoría"}
                </p>

                {/* Ciudad del servicio */}
                <p className={styles.cardText}>
                  <strong>Ciudad:</strong> {service.city?.name || "Sin ciudad"}
                </p>

                {/* Precio formateado */}
                <p className={styles.cardText}>
                  <strong>Precio:</strong> {formatPrice(service.price)}
                </p>

                {/* Estado actual del servicio */}
                <p className={styles.cardText}>
                  <strong>Estado:</strong>{" "}
                  {service.isActive ? "Activo" : "Inactivo"}
                </p>

                <div className={styles.actionsRow}>
                  {/* Botón para activar o desactivar el servicio */}
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => handleAdminToggleService(service)}
                    disabled={isAdminTogglingServiceId === service.id}
                  >
                    {isAdminTogglingServiceId === service.id
                      ? "Guardando..."
                      : service.isActive
                        ? "Desactivar"
                        : "Activar"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Paginación del listado de servicios */}
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
export default AdminServicesSection;
