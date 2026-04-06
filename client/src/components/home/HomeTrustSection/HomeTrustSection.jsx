// export default HomeTrustSection;
import styles from "./HomeTrustSection.module.css";

function HomeTrustSection() {
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
            <span className={styles.sectionEyebrow}>Confianza</span>

            <h2>Una experiencia pensada para clientes y profesionales</h2>

            <p className={styles.description}>
              ServiMeet organiza la relación entre cliente y profesional de
              forma clara, visual y sencilla para que todo el proceso resulte
              más cómodo.
            </p>

            <div className={styles.miniHighlights}>
              <span>Proceso claro</span>
              <span>Datos ordenados</span>
              <span>Más confianza</span>
            </div>
          </div>

          <div className={styles.trustItems}>
            {trustItems.map((item) => (
              <article key={item.title} className={styles.trustCard}>
                <div className={styles.iconWrap}>
                  <img src={item.icon} alt="" aria-hidden="true" />
                </div>

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

export default HomeTrustSection;
