// Importo Link para permitir volver a la página de inicio
// y Outlet para renderizar la página hija correspondiente a la ruta actual.
import { Link, Outlet } from "react-router-dom";

// Importo los estilos del layout.
import styles from "./AuthLayout.module.css";

// Este layout se usa en las páginas de autenticación, como login y registro.
function AuthLayout() {
  return (
    <div className={styles.authLayout}>
      {/* Barra superior con el logo para poder volver al inicio */}
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          <img src="/image/logo.webp" alt="Logo ServiMeet" />
        </Link>
      </div>
      {/* Aquí se renderiza la página hija activa,
          por ejemplo Login o Register */}
      <Outlet />
    </div>
  );
}

// Exporto el layout para poder usarlo en el router.
export default AuthLayout;
