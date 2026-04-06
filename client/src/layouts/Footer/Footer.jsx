import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.css";

function Footer() {
  const location = useLocation();

  function handleHomeClick(event) {
    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <div className={styles.left}>
            <Link to="/" className={styles.logo} onClick={handleHomeClick}>
              <img src="/image/logo.webp" alt="Logo ServiMeet" />
            </Link>

            <address className={styles.address}>
              Calle Larios 12
              <br />
              29005, Málaga
              <br />
              España
            </address>
          </div>

          <div className={styles.right}>
            <div className={styles.linksColumn}>
              <h3>Páginas</h3>
              <Link to="/" onClick={handleHomeClick}>
                Inicio
              </Link>
              <Link to="/services">Servicios</Link>
              <Link to="/profesionales">Para profesionales</Link>
              <Link to="/contacto">Contacto</Link>
            </div>

            <div className={styles.linksColumn}>
              <h3>Redes</h3>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer">
                X / Twitter
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © 2026 ServiMeet. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
