// Importo los estilos del componente.
import styles from "./ServicesFilters.module.css";

// Componente que muestra los filtros del listado de servicios.
// Recibe los valores actuales, las listas disponibles
// y las funciones para actualizar cada filtro.
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
        {/* Campo de texto para filtrar servicios por búsqueda */}
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
        {/* Selector de categoría */}
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
        {/* Selector de ciudad */}
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
        {/* Botón para reiniciar todos los filtros */}
        <button type="button" className={styles.clearButton} onClick={onClear}>
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

// Exporto el componente para usarlo dentro de la página Services.
export default ServicesFilters;
