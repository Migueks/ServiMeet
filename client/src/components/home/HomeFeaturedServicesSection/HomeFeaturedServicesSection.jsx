import ServiceCard from "../../services/ServiceCard/ServiceCard";
import styles from "./HomeFeaturedServicesSection.module.css";

function HomeFeaturedServicesSection({ featuredServices }) {
  return (
    <section id="servicios" className={styles.sectionAlt}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionEyebrow}>Destacados</span>
          <h2>Servicios recomendados</h2>
          <p>
            Algunos ejemplos reales de publicaciones que aparecen en la
            plataforma.
          </p>
        </div>

        {featuredServices.length === 0 ? (
          <p className={styles.emptyText}>Todavía no hay servicios destacados para mostrar.</p>
        ) : (
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

export default HomeFeaturedServicesSection;
