// Importo los estilos del componente.
import styles from "./ServicesHero.module.css";

// Componente que muestra el encabezado principal de la página de servicios.
function ServicesHero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          {/* Pequeña etiqueta superior para identificar la sección */}
          <span className={styles.badge}>Servicios</span>

          {/* Título principal de la página */}
          <h1 className={styles.title}>Encuentra el servicio que necesitas</h1>

          {/* Texto descriptivo de apoyo */}
          <p className={styles.subtitle}>
            Explora categorías, filtra por ciudad y descubre profesionales
            preparados para ayudarte.
          </p>
        </div>
      </div>
    </section>
  );
}

// Exporto el componente para usarlo dentro de la página Services.
export default ServicesHero;
