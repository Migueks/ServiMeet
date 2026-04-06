import styles from "./HomeStepsSection.module.css";

function HomeStepsSection() {
  const steps = [
    {
      number: "01",
      title: "Busca el servicio",
      text: "Explora categorías y encuentra el profesional que mejor encaja contigo.",
      img: "/image/buscar.webp",
    },
    {
      number: "02",
      title: "Envía tu solicitud",
      text: "Contacta de forma sencilla y gestiona el estado de la solicitud desde tu cuenta.",
      img: "/image/enviar.webp",
    },
    {
      number: "03",
      title: "Recibe ayuda y valora",
      text: "Cuando termine el trabajo, deja tu reseña y ayuda a otros usuarios.",
      img: "/image/ayuda.webp",
    },
  ];

  return (
    <section id="como-funciona" className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionEyebrow}>Cómo funciona</span>
          <h2>Empieza en tres pasos</h2>
          <p>Un flujo simple para que la experiencia sea clara y rápida.</p>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step) => (
            <article key={step.number} className={styles.stepCard}>
              <div className={styles.cardTop}>
                <span className={styles.stepNumber}>{step.number}</span>
              </div>

              <div className={styles.cardContent}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>

              <div className={styles.imageWrapper}>
                <img
                  src={step.img}
                  alt={step.title}
                  className={styles.stepImage}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeStepsSection;
