// Importo Link para permitir volver a una ruta válida sin recargar la página.
import { Link } from "react-router-dom";

// Importo los estilos del componente.
import styles from "./NotFound.module.css";

// Página que se muestra cuando la ruta no existe.
function NotFound() {
  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          {/* Título principal del error 404 */}
          <h1 className={styles.title}>Página no encontrada</h1>

          {/* Texto informativo para el usuario */}
          <p className={styles.text}>La ruta que buscas no existe.</p>

          {/* Enlace para volver al inicio */}
          <Link to="/" className={styles.link}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

// Exporto la página para usarla en el router.
export default NotFound;
