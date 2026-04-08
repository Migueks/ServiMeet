// Importo Link para navegar entre rutas internas sin recargar
// y useLocation para saber en qué página se encuentra el usuario.
import { Link, useLocation } from "react-router-dom";

// Importo los estilos del componente.
import styles from "./Footer.module.css";

// Componente del pie de página de la aplicación.
function Footer() {
  // Obtengo la ruta actual para poder hacer lógica
  // cuando el usuario pulse en el enlace de inicio.
  const location = useLocation();

  // Si el usuario pulsa el logo o el enlace de inicio estando ya en la home,
  // evito una navegación innecesaria y hago scroll suave hacia arriba.
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
          {/* Zona izquierda del footer con logo y dirección */}
          <div className={styles.left}>
            <Link to="/" className={styles.logo} onClick={handleHomeClick}>
              <img src="/image/logo.webp" alt="Logo ServiMeet" />
            </Link>

            {/* Dirección mostrada como información de contacto */}
            <address className={styles.address}>
              Calle Larios 12
              <br />
              29005, Málaga
              <br />
              España
            </address>
          </div>

          {/* Zona derecha del footer con enlaces internos y redes sociales */}
          <div className={styles.right}>
            <div className={styles.linksColumn}>
              <h3>Páginas</h3>

              {/* Enlaces internos de navegación */}
              <Link to="/" onClick={handleHomeClick}>
                Inicio
              </Link>
              <Link to="/services">Servicios</Link>
              <Link to="/profesionales">Para profesionales</Link>
              <Link to="/contacto">Contacto</Link>
            </div>

            <div className={styles.linksColumn}>
              <h3>Redes</h3>

              {/* Enlaces externos a redes sociales.
                  Se abren en una pestaña nueva por seguridad y usabilidad */}
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

        {/* Línea divisoria visual entre la parte superior e inferior del footer */}
        <hr className={styles.divider} />

        <div className={styles.bottom}>
          {/* Texto de copyright */}
          <p className={styles.copy}>
            © 2026 ServiMeet. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Exporto el componente para usarlo en el layout principal.
export default Footer;
