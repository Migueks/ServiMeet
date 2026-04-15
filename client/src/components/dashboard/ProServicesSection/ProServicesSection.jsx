// Importo hooks de React para guardar estado local
// y memorizar cálculos derivados.
import { useMemo, useState } from "react";

// Importo el componente reutilizable de paginación.
import Pagination from "../../common/Pagination/Pagination";

// Importo los estilos del componente.
import styles from "./ProServicesSection.module.css";

// Defino cuántos servicios mostraré por página.
const ITEMS_PER_PAGE = 10;

// Componente que muestra los servicios del profesional,
// permitiendo editarlos y activar o desactivar su visibilidad.
function ProServicesSection({
  myServices,
  isTogglingServiceId,
  handleEditService,
  handleToggleService,
}) {
  // Estado local para controlar la página actual de la paginación.
  const [currentPage, setCurrentPage] = useState(1);

  // Calculo el número total de páginas.
  // Como mínimo habrá 1 para evitar problemas en la paginación.
  const totalPages = Math.max(1, Math.ceil(myServices.length / ITEMS_PER_PAGE));

  // Ajusto la página actual para que nunca supere el total de páginas disponibles.
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Calculo qué servicios se mostrarán en la página actual.
  // Uso useMemo para no recalcular el slice en cada render sin necesidad.
  const paginatedServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return myServices.slice(start, end);
  }, [myServices, safeCurrentPage]);

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
          <h2 className={styles.sectionTitle}>Mis servicios</h2>

          {/* Texto descriptivo de apoyo */}
          <p className={styles.sectionSubtitle}>
            Gestiona tus servicios, edítalos o cambia su visibilidad.
          </p>
        </div>

        {/* Resumen con el número total de servicios del profesional */}
        <p className={styles.sectionText}>
          {myServices.length}{" "}
          {myServices.length === 1
            ? "servicio registrado"
            : "servicios registrados"}
        </p>
      </div>

      {myServices.length === 0 ? (
        // Si el profesional todavía no ha creado servicios,
        // muestro un mensaje vacío.
        <p className={styles.emptyText}>Todavía no has creado servicios.</p>
      ) : (
        <>
          {/* Cuadrícula de servicios del profesional */}
          <div className={styles.servicesGrid}>
            {paginatedServices.map((service) => (
              <article key={service.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardTopContent}>
                    {/* Título y descripción del servicio */}
                    <h3 className={styles.cardTitle}>{service.title}</h3>
                    <p className={styles.cardDescription}>
                      {service.description}
                    </p>
                  </div>

                  {/* Estado visual del servicio: activo o inactivo */}
                  <span
                    className={`${styles.statusBadge} ${
                      service.isActive
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    {service.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>

                {/* Bloque con los datos principales del servicio */}
                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Precio</span>
                    <strong className={styles.metaValue}>
                      {service.price} €
                    </strong>
                  </div>

                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Categoría</span>
                    <strong className={styles.metaValue}>
                      {service.category?.name || "-"}
                    </strong>
                  </div>

                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Ciudad</span>
                    <strong className={styles.metaValue}>
                      {service.city?.name || "-"}
                    </strong>
                  </div>
                </div>

                {/* Acciones disponibles sobre el servicio */}
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => handleEditService(service)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className={
                      service.isActive
                        ? styles.warningButton
                        : styles.primaryButton
                    }
                    onClick={() => handleToggleService(service)}
                    disabled={isTogglingServiceId === service.id}
                  >
                    {isTogglingServiceId === service.id
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

// Exporto el componente para usarlo dentro del Dashboard.
export default ProServicesSection;
