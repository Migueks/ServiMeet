import styles from "./ServicesHero.module.css";

function ServicesHero() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <span className={styles.badge}>Servicios</span>

          <h1 className={styles.title}>Encuentra el servicio que necesitas</h1>

          <p className={styles.subtitle}>
            Explora categorías, filtra por ciudad y descubre profesionales
            preparados para ayudarte.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ServicesHero;
