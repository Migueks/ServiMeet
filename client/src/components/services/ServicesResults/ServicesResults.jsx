// Importo la tarjeta reutilizable que muestra la información de cada servicio.
import ServiceCard from "../ServiceCard/ServiceCard";

// Importo los estilos del componente.
import styles from "./ServicesResults.module.css";

// Componente que se encarga de mostrar el resultado final del listado.
// Según el estado, puede enseñar error, carga, vacío o la cuadrícula de servicios.
function ServicesResults({ isLoading, error, filteredServices }) {
  // Si ha ocurrido un error al cargar los servicios,
  // muestro un mensaje informativo al usuario.
  if (error) {
    return (
      <div className={styles.emptyState}>
        <h2>No se pudieron cargar los servicios</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Si la página todavía está cargando datos,
  // muestro un estado temporal de carga.
  if (isLoading) {
    return (
      <div className={styles.emptyState}>
        <h2>Cargando catálogo</h2>
        <p>Estamos recuperando los servicios disponibles.</p>
      </div>
    );
  }

  // Si no hay servicios tras aplicar los filtros,
  // muestro un mensaje para orientar al usuario.
  if (filteredServices.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>No hay resultados</h2>
        <p>
          Prueba a cambiar la búsqueda o los filtros para ver más servicios.
        </p>
      </div>
    );
  }

  // Si todo ha ido bien y hay resultados,
  // renderizo la cuadrícula de tarjetas de servicios.
  return (
    <div className={styles.grid}>
      {filteredServices.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

// Exporto el componente para usarlo dentro de la página Services.
export default ServicesResults;
