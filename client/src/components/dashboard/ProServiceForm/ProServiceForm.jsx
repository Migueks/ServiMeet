import styles from "./ProServiceForm.module.css";

function ProServiceForm({
  editingServiceId,
  serviceForm,
  categories,
  cities,
  serviceFormError,
  serviceFormSuccess,
  isSavingService,
  handleServiceFormChange,
  handleServiceSubmit,
  resetServiceForm,
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {editingServiceId ? "Editar servicio" : "Crear servicio"}
        </h2>

        {editingServiceId ? (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => resetServiceForm()}
          >
            Cancelar edición
          </button>
        ) : null}
      </div>

      <form className={styles.formCard} onSubmit={handleServiceSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="title">Título</label>
            <input
              id="title"
              name="title"
              type="text"
              value={serviceForm.title}
              onChange={handleServiceFormChange}
              placeholder="Ej. Clases particulares de inglés"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="price">Precio (€)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="1"
              step="0.01"
              value={serviceForm.price}
              onChange={handleServiceFormChange}
              placeholder="25"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="categoryId">Categoría</label>
            <select
              id="categoryId"
              name="categoryId"
              value={serviceForm.categoryId}
              onChange={handleServiceFormChange}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="cityId">Ciudad</label>
            <select
              id="cityId"
              name="cityId"
              value={serviceForm.cityId}
              onChange={handleServiceFormChange}
            >
              <option value="">Selecciona una ciudad</option>
              {cities.map((city) => (
                <option key={city.id} value={String(city.id)}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="image">Imagen (opcional)</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleServiceFormChange}
            />
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              value={serviceForm.description}
              onChange={handleServiceFormChange}
              placeholder="Describe tu servicio, experiencia y condiciones..."
            />
          </div>
        </div>

        <div className={styles.actionsRow}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isSavingService}
          >
            {isSavingService
              ? "Guardando..."
              : editingServiceId
                ? "Guardar cambios"
                : "Crear servicio"}
          </button>
        </div>
      </form>

      {serviceFormError ? (
        <p className={styles.errorText}>{serviceFormError}</p>
      ) : null}

      {serviceFormSuccess ? (
        <p className={styles.successText}>{serviceFormSuccess}</p>
      ) : null}
    </section>
  );
}

export default ProServiceForm;
