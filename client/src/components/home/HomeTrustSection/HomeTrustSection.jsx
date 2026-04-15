// Importo los estilos del componente.
import styles from "./HomeTrustSection.module.css";

// Componente que muestra una sección de confianza
// con varias ventajas destacadas de la plataforma.
function HomeTrustSection() {
  // Defino las tarjetas informativas que se mostrarán en la sección.
  // Cada una incluye título, texto descriptivo e icono.
  const trustItems = [
    {
      title: "Perfiles claros",
      text: "Información ordenada, fácil de consultar y pensada para comparar servicios sin complicaciones.",
      icon: "/svg/perfil.svg",
    },
    {
      title: "Solicitudes con estado",
      text: "Sigue el proceso desde el primer contacto hasta la finalización del trabajo con total claridad.",
      icon: "/svg/ok.svg",
    },
    {
      title: "Reseñas reales",
      text: "Opiniones de clientes tras completar el servicio para elegir con más seguridad y confianza.",
      icon: "/svg/star.svg",
    },
  ];

  return (
    <section className={styles.trustSection}>
      <div className="container">
        <div className={styles.trustBox}>
          <div className={styles.content}>
            {/* Pequeña etiqueta superior de la sección */}
            <span className={styles.sectionEyebrow}>Confianza</span>

            {/* Título principal del bloque */}
            <h2>Una experiencia pensada para clientes y profesionales</h2>

            {/* Texto descriptivo de apoyo */}
            <p className={styles.description}>
              ServiMeet organiza la relación entre cliente y profesional de
              forma clara, visual y sencilla para que todo el proceso resulte
              más cómodo.
            </p>

            {/* Mini puntos destacados de la propuesta de valor */}
            <div className={styles.miniHighlights}>
              <span>Proceso claro</span>
              <span>Datos ordenados</span>
              <span>Más confianza</span>
            </div>
          </div>

          {/* Tarjetas con ventajas clave de la plataforma */}
          <div className={styles.trustItems}>
            {trustItems.map((item) => (
              <article key={item.title} className={styles.trustCard}>
                {/* Icono decorativo de la tarjeta */}
                <div className={styles.iconWrap}>
                  <img src={item.icon} alt="" aria-hidden="true" />
                </div>

                {/* Contenido textual de la tarjeta */}
                <div className={styles.cardContent}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Exporto el componente para usarlo dentro de la página Home.
export default HomeTrustSection;
