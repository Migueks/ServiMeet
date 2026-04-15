// Importo los estilos del componente.
import styles from "./HomeStepsSection.module.css";

// Componente que explica de forma visual
// cómo funciona la plataforma en tres pasos.
function HomeStepsSection() {
  // Defino los tres pasos principales que seguirá el usuario.
  // Cada paso incluye número, título, texto e imagen.
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
          {/* Encabezado de la sección */}
          <span className={styles.sectionEyebrow}>Cómo funciona</span>
          <h2>Empieza en tres pasos</h2>
          <p>Un flujo simple para que la experiencia sea clara y rápida.</p>
        </div>

        {/* Cuadrícula con los tres pasos principales */}
        <div className={styles.stepsGrid}>
          {steps.map((step) => (
            <article key={step.number} className={styles.stepCard}>
              <div className={styles.cardTop}>
                {/* Número visual del paso */}
                <span className={styles.stepNumber}>{step.number}</span>
              </div>

              <div className={styles.cardContent}>
                {/* Título y descripción del paso */}
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>

              <div className={styles.imageWrapper}>
                {/* Imagen decorativa que acompaña cada paso */}
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

// Exporto el componente para usarlo dentro de la página Home.
export default HomeStepsSection;
