import { useMemo, useState } from "react";
import Pagination from "../../common/Pagination/Pagination";
import styles from "./AdminContactMessagesSection.module.css";

const ITEMS_PER_PAGE = 10;

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function AdminContactMessagesSection({ adminContactMessages }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(adminContactMessages.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedMessages = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return adminContactMessages.slice(start, end);
  }, [adminContactMessages, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Mensajes de contacto</h2>
        <p className={styles.infoText}>
          {adminContactMessages.length}{" "}
          {adminContactMessages.length === 1
            ? "mensaje registrado"
            : "mensajes registrados"}
        </p>
      </div>

      {adminContactMessages.length === 0 ? (
        <p className={styles.infoText}>
          No hay mensajes de contacto registrados.
        </p>
      ) : (
        <>
          <div className={styles.cardsColumn}>
            {paginatedMessages.map((message) => (
              <article key={message.id} className={styles.card}>
                <h3 className={styles.cardTitle}>{message.name}</h3>

                <p className={styles.cardText}>
                  <strong>Email:</strong> {message.email}
                </p>

                <p className={styles.cardText}>
                  <strong>Ciudad:</strong> {message.city}
                </p>

                <p className={styles.cardText}>
                  <strong>Fecha:</strong> {formatDate(message.createdAt)}
                </p>

                <p className={styles.cardText}>
                  <strong>Mensaje:</strong> {message.message}
                </p>
              </article>
            ))}
          </div>

          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}

export default AdminContactMessagesSection;
