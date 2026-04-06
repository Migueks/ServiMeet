import styles from "./ServicesFilters.module.css";

function ServicesFilters({
  search,
  selectedCategory,
  selectedCity,
  categories,
  cities,
  isLoading,
  hasError,
  onSearchChange,
  onCategoryChange,
  onCityChange,
  onClear,
}) {
  return (
    <div className={styles.filtersBox}>
      <div className={styles.field}>
        <label htmlFor="search">Buscar</label>
        <input
          id="search"
          type="text"
          placeholder="Ej. clases, limpieza, informática..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="category">Categoría</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
          disabled={isLoading || hasError}
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="city">Ciudad</label>
        <select
          id="city"
          value={selectedCity}
          onChange={(event) => onCityChange(event.target.value)}
          disabled={isLoading || hasError}
        >
          <option value="">Todas las ciudades</option>
          {cities.map((city) => (
            <option key={city.id} value={String(city.id)}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.resultsHeader}>
        <button type="button" className={styles.clearButton} onClick={onClear}>
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

export default ServicesFilters;
