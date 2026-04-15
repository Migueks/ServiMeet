// Importo los estilos del componente.
import styles from "./DashboardHero.module.css";

// Componente que muestra la cabecera de bienvenida del dashboard.
// Recibe el usuario actual para pintar su avatar y sus datos básicos.
function DashboardHero({ user }) {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        {user?.avatarUrl ? (
          // Si el usuario tiene avatar, muestro su imagen de perfil.
          <img
            src={user.avatarUrl}
            alt={`Avatar de ${user?.name || "usuario"}`}
            className={styles.avatar}
          />
        ) : (
          // Si no tiene avatar, muestro un placeholder
          // con la inicial de su nombre.
          <div className={styles.avatarPlaceholder}>
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          {/* Saludo principal del dashboard */}
          <h1 className={styles.title}>Hola, {user?.name || "usuario"}</h1>

          {/* Información básica del usuario autenticado */}
          <p className={styles.text}>
            Rol: {user?.role || "Sin rol"} · Ciudad:{" "}
            {user?.city || "No indicada"}
          </p>
        </div>
      </div>
    </section>
  );
}

// Exporto el componente para usarlo dentro de la página Dashboard.
export default DashboardHero;
