// Importo la utilidad para formatear la valoración media
// cuando alguna estadística llegue como número decimal.
import formatRating from "../../../utils/formatRating";

// Importo los estilos del componente.
import styles from "./DashboardStats.module.css";

// Componente que muestra las tarjetas resumen del dashboard.
// Recibe un array de estadísticas ya preparadas para pintar.
function DashboardStats({ statsEntries = [] }) {
  return (
    <section className={styles.statsSection}>
      <div className={styles.grid}>
        {statsEntries.map((item) => {
          // Compruebo si la tarjeta corresponde a una valoración media
          // para mostrarla formateada con un decimal.
          const isAverageRating = item.label
            ?.toLowerCase()
            .includes("valoración");

          return (
            <article key={item.label} className={styles.card}>
              {/* Título o nombre de la estadística */}
              <p className={styles.label}>{item.label}</p>

              {/* Valor principal de la tarjeta */}
              <strong className={styles.value}>
                {isAverageRating ? formatRating(item.value) : item.value}
              </strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// Exporto el componente para usarlo dentro del Dashboard.
export default DashboardStats;
