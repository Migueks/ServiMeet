import ServiceCard from "../ServiceCard/ServiceCard";
import styles from "./ServicesResults.module.css";

function ServicesResults({ isLoading, error, filteredServices }) {
  if (error) {
    return (
      <div className={styles.emptyState}>
        <h2>No se pudieron cargar los servicios</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <h2>Cargando catálogo</h2>
        <p>Estamos recuperando los servicios disponibles.</p>
      </div>
    );
  }

  if (filteredServices.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No hay resultados</h2>
        <p>Prueba a cambiar la búsqueda o los filtros para ver más servicios.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {filteredServices.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

export default ServicesResults;
