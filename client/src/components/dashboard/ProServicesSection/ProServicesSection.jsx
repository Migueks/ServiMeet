import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";
import styles from "./ProServicesSection.module.css";

const ITEMS_PER_PAGE = 10;

function ProServicesSection({
  myServices,
  isTogglingServiceId,
  handleEditService,
  handleToggleService,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(myServices.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return myServices.slice(start, end);
  }, [myServices, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Mis servicios</h2>
          <p className={styles.sectionSubtitle}>
            Gestiona tus servicios, edítalos o cambia su visibilidad.
          </p>
        </div>

        <p className={styles.sectionText}>
          {myServices.length}{" "}
          {myServices.length === 1
            ? "servicio registrado"
            : "servicios registrados"}
        </p>
      </div>

      {myServices.length === 0 ? (
        <p className={styles.emptyText}>Todavía no has creado servicios.</p>
      ) : (
        <>
          <div className={styles.servicesGrid}>
            {paginatedServices.map((service) => (
              <article key={service.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardTopContent}>
                    <h3 className={styles.cardTitle}>{service.title}</h3>
                    <p className={styles.cardDescription}>
                      {service.description}
                    </p>
                  </div>

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

export default ProServicesSection;
