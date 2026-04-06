import styles from "./DashboardStats.module.css";

function DashboardStats({ statsEntries }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Resumen</h2>

      <div className={styles.statsGrid}>
        {statsEntries.map((item) => (
          <article key={item.label} className={styles.statCard}>
            <p className={styles.statLabel}>{item.label}</p>
            <strong className={styles.statValue}>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DashboardStats;
