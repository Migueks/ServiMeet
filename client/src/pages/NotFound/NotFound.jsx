import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.card}>
          <h1 className={styles.title}>Página no encontrada</h1>
          <p className={styles.text}>La ruta que buscas no existe.</p>
          <Link to="/" className={styles.link}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
