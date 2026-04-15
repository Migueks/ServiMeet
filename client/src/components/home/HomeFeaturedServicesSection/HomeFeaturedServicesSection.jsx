// Importo la tarjeta reutilizable que muestra la información de cada servicio.
import ServiceCard from "../../services/ServiceCard/ServiceCard";

// Importo los estilos del componente.
import styles from "./HomeFeaturedServicesSection.module.css";

// Componente que muestra una selección de servicios destacados en la home.
function HomeFeaturedServicesSection({ featuredServices }) {
  return (
    <section id="servicios" className={styles.sectionAlt}>
      <div className="container">
        <div className={styles.sectionHeading}>
          {/* Encabezado de la sección */}
          <span className={styles.sectionEyebrow}>Destacados</span>
          <h2>Servicios recomendados</h2>
          <p>
            Algunos ejemplos reales de publicaciones que aparecen en la
            plataforma.
          </p>
        </div>

        {/* Si no hay servicios destacados, muestro un mensaje vacío */}
        {featuredServices.length === 0 ? (
          <p className={styles.emptyText}>
            Todavía no hay servicios destacados para mostrar.
          </p>
        ) : (
          // Si sí hay servicios, los muestro en una cuadrícula
          <div className={styles.servicesGrid}>
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Exporto el componente para usarlo dentro de la página Home.
export default HomeFeaturedServicesSection;
