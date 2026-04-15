// Importo Link para navegar entre rutas internas sin recargar la página.
import { Link } from "react-router-dom";

// Importo los estilos del componente.
import styles from "./ForProfessionals.module.css";

// Importo los iconos que se mostrarán en las tarjetas de ventajas.
import visibilityIcon from "/svg/visibility.svg";
import requestsIcon from "/svg/requests.svg";
import trustIcon from "/svg/trust.svg";

// Array con las ventajas que se mostrarán en la página para profesionales.
const benefits = [
  {
    title: "Consigue más visibilidad",
    text: "Publica tus servicios y aparece ante clientes que ya están buscando ayuda en tu zona.",
    icon: "visibility",
  },
  {
    title: "Recibe solicitudes claras",
    text: "Los clientes pueden enviarte peticiones directamente para que valores si encajan contigo.",
    icon: "requests",
  },
  {
    title: "Genera confianza",
    text: "Las reseñas y valoraciones ayudan a reforzar tu perfil y transmitir seguridad a nuevos clientes.",
    icon: "trust",
  },
];

// Array con los pasos principales del flujo para profesionales.
const professionalSteps = [
  {
    number: "1",
    text: "Crea tu perfil profesional y presenta tus servicios de forma clara y atractiva.",
  },
  {
    number: "2",
    text: "Define categoría, zona y precio orientativo para llegar a clientes que encajen contigo.",
  },
  {
    number: "3",
    text: "Recibe solicitudes y empieza a generar confianza con reseñas reales de tu trabajo.",
  },
];

// Función auxiliar que decide qué icono mostrar
// según el tipo de ventaja recibida.
function renderBenefitIcon(icon) {
  switch (icon) {
    case "visibility":
      return <img src={visibilityIcon} alt="" aria-hidden="true" />;

    case "requests":
      return <img src={requestsIcon} alt="" aria-hidden="true" />;

    case "trust":
      return <img src={trustIcon} alt="" aria-hidden="true" />;

    default:
      return null;
  }
}

// Página informativa orientada a profesionales.
function ForProfessionals() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            {/* Etiqueta superior de la página */}
            <span className={styles.eyebrow}>Para profesionales</span>

            {/* Título principal */}
            <h1 className={styles.title}>
              Haz crecer tu actividad con una presencia más clara y profesional
            </h1>

            {/* Texto descriptivo de apoyo */}
            <p className={styles.subtitle}>
              ServiMeet te ayuda a mostrar tus servicios, ganar visibilidad y
              conectar con clientes que buscan ayuda real en su día a día.
            </p>

            <div className={styles.actions}>
              {/* Botón para ir al registro */}
              <Link to="/register" className={styles.primaryButton}>
                Crear cuenta
              </Link>

              {/* Botón para ver servicios ya publicados */}
              <Link to="/services" className={styles.secondaryButton}>
                Ver servicios publicados
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeading}>
            {/* Encabezado de la sección de ventajas */}
            <span className={styles.sectionEyebrow}>Ventajas</span>
            <h2>Una página sencilla, pero útil de verdad</h2>
            <p>
              Publica tus servicios y conecta con clientes que ya están buscando
              ayuda en ServiMeet.
            </p>
          </div>

          <div className={styles.benefitsGrid}>
            {/* Pinto una tarjeta por cada ventaja */}
            {benefits.map((benefit) => (
              <article key={benefit.title} className={styles.benefitCard}>
                <div className={styles.benefitAccent} />

                <div className={styles.benefitTop}>
                  <span className={styles.benefitIcon}>
                    {renderBenefitIcon(benefit.icon)}
                  </span>
                  <h3>{benefit.title}</h3>
                </div>

                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.visualSection}>
        <div className="container">
          <div className={styles.visualWrapper}>
            <div className={styles.visualTextCard}>
              {/* Bloque explicando cómo funciona */}
              <h2>Cómo funciona</h2>

              <div className={styles.stepsList}>
                {/* Pinto la lista de pasos para profesionales */}
                {professionalSteps.map((step, index) => (
                  <div key={step.number} className={styles.stepItem}>
                    <span
                      className={`${styles.stepCircle} ${
                        styles[`stepCircle${index + 1}`]
                      }`}
                    >
                      {step.number}
                    </span>
                    <p>{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.visualImageBox}>
              {/* Imagen decorativa de apoyo */}
              <img
                src="/image/profesional.webp"
                alt="Profesional realizando un servicio"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Exporto la página para usarla en el router.
export default ForProfessionals;
