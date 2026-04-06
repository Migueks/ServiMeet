import styles from "./DashboardHero.module.css";

function DashboardHero({ user }) {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`Avatar de ${user?.name || "usuario"}`}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <h1 className={styles.title}>Hola, {user?.name || "usuario"}</h1>
          <p className={styles.text}>
            Rol: {user?.role || "Sin rol"} · Ciudad:{" "}
            {user?.city || "No indicada"}
          </p>
        </div>
      </div>
    </section>
  );
}

export default DashboardHero;
