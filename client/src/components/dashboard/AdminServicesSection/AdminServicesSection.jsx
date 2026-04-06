import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";
import formatPrice from "../../../utils/formatPrice";
import styles from "./AdminServicesSection.module.css";

const ITEMS_PER_PAGE = 10;

function AdminServicesSection({
  adminServices,
  isAdminTogglingServiceId,
  handleAdminToggleService,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(adminServices.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminServices.slice(start, end);
  }, [adminServices, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Servicios</h2>
        <p className={styles.infoText}>
          {adminServices.length}{" "}
          {adminServices.length === 1
            ? "servicio registrado"
            : "servicios registrados"}
        </p>
      </div>

      {adminServices.length === 0 ? (
        <p className={styles.infoText}>No hay servicios disponibles.</p>
      ) : (
        <>
          <div className={styles.cardsColumn}>
            {paginatedServices.map((service) => (
              <article key={service.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{service.title}</h3>

                <p className={styles.cardText}>
                  <strong>Profesional:</strong>{" "}
                  {service.pro?.name || "No disponible"}
                </p>

                <p className={styles.cardText}>
                  <strong>Categoría:</strong>{" "}
                  {service.category?.name || "Sin categoría"}
                </p>

                <p className={styles.cardText}>
                  <strong>Ciudad:</strong> {service.city?.name || "Sin ciudad"}
                </p>

                <p className={styles.cardText}>
                  <strong>Precio:</strong> {formatPrice(service.price)}
                </p>

                <p className={styles.cardText}>
                  <strong>Estado:</strong>{" "}
                  {service.isActive ? "Activo" : "Inactivo"}
                </p>

                <div className={styles.actionsRow}>
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

export default AdminServicesSection;
