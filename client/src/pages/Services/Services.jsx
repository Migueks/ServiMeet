// Importo hooks de React para ejecutar efectos, memorizar cálculos
// y guardar el estado local de la página.
import { useEffect, useMemo, useState } from "react";

// Importo useSearchParams para leer y actualizar
// los parámetros de la URL.
import { useSearchParams } from "react-router-dom";

// Importo los componentes que forman la página de servicios.
import ServicesHero from "../../components/services/ServicesHero/ServicesHero";
import ServicesFilters from "../../components/services/ServicesFilters/ServicesFilters";
import ServicesResults from "../../components/services/ServicesResults/ServicesResults";
import Pagination from "../../components/common/Pagination/Pagination";

// Importo los servicios que obtienen datos del backend.
import { getCategories, getCities } from "../../services/meta.service";
import { getAllServices } from "../../services/services.service";

// Importo los estilos de la página.
import styles from "./Services.module.css";

// Defino cuántos servicios se mostrarán por página.
const ITEMS_PER_PAGE = 10;

// Componente principal de la página de listado de servicios.
function Services() {
  // Obtengo los parámetros actuales de la URL
  // y la función para actualizarlos.
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado del texto de búsqueda.
  // Lo inicializo con el valor que venga en la URL.
  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Estado de la categoría seleccionada.
  // También se inicializa desde la URL.
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );

  // Estado de la ciudad seleccionada.
  // También se inicializa desde la URL.
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") || "",
  );

  // Estado con todos los servicios cargados desde el backend.
  const [services, setServices] = useState([]);

  // Estado con la lista de categorías disponibles.
  const [categories, setCategories] = useState([]);

  // Estado con la lista de ciudades disponibles.
  const [cities, setCities] = useState([]);

  // Estado para indicar si la página sigue cargando datos.
  const [isLoading, setIsLoading] = useState(true);

  // Estado para guardar un posible mensaje de error.
  const [error, setError] = useState("");

  // Estado con la página actual de la paginación.
  const [currentPage, setCurrentPage] = useState(1);

  // Este efecto sincroniza el estado interno con la URL.
  // Si cambian los searchParams, actualizo los filtros locales.
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedCity(searchParams.get("city") || "");
  }, [searchParams]);

  // Este efecto carga los datos necesarios para la página
  // la primera vez que se monta.
  useEffect(() => {
    async function loadPageData() {
      try {
        // Activo el estado de carga y limpio posibles errores previos.
        setIsLoading(true);
        setError("");

        // Cargo servicios, categorías y ciudades en paralelo
        // para mejorar el rendimiento.
        const [servicesData, categoriesData, citiesData] = await Promise.all([
          getAllServices(),
          getCategories(),
          getCities(),
        ]);

        // Guardo en estado los datos recibidos.
        setServices(servicesData?.services || []);
        setCategories(categoriesData?.categories || []);
        setCities(citiesData?.cities || []);
      } catch (loadError) {
        // Si falla alguna petición, guardo un mensaje de error.
        setError(loadError.message || "No se pudieron cargar los servicios.");
      } finally {
        // Desactivo la carga al terminar.
        setIsLoading(false);
      }
    }

    loadPageData();
  }, []);

  // Este efecto actualiza la URL cuando cambian los filtros.
  // Así la búsqueda se puede compartir o recargar manteniendo el estado.
  useEffect(() => {
    const nextParams = new URLSearchParams();

    // Si hay texto de búsqueda, lo añado a la URL.
    if (search.trim()) {
      nextParams.set("search", search.trim());
    }

    // Si hay categoría seleccionada, la añado a la URL.
    if (selectedCategory) {
      nextParams.set("category", selectedCategory);
    }

    // Si hay ciudad seleccionada, la añado a la URL.
    if (selectedCity) {
      nextParams.set("city", selectedCity);
    }

    // Comparo la URL actual con la nueva para evitar actualizaciones innecesarias.
    const current = searchParams.toString();
    const next = nextParams.toString();

    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [search, selectedCategory, selectedCity, searchParams, setSearchParams]);

  // Filtro los servicios en función del texto de búsqueda,
  // la categoría seleccionada y la ciudad seleccionada.
  // Uso useMemo para no recalcular el filtro en cada render sin necesidad.
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Normalizo el texto de búsqueda para comparar en minúsculas.
      const normalizedSearch = search.trim().toLowerCase();

      // Compruebo si el servicio coincide con la búsqueda
      // por título, descripción o nombre del profesional.
      const matchesSearch = normalizedSearch
        ? service.title.toLowerCase().includes(normalizedSearch) ||
          service.description.toLowerCase().includes(normalizedSearch) ||
          service.pro?.name?.toLowerCase().includes(normalizedSearch)
        : true;

      // Compruebo si coincide con la categoría seleccionada.
      const matchesCategory = selectedCategory
        ? String(service.category?.id) === selectedCategory
        : true;

      // Compruebo si coincide con la ciudad seleccionada.
      const matchesCity = selectedCity
        ? String(service.city?.id) === selectedCity
        : true;

      // Solo mantengo los servicios que cumplan todos los filtros.
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [search, selectedCategory, selectedCity, services]);

  // Calculo el número total de páginas.
  // Como mínimo habrá 1 para evitar problemas en la paginación.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / ITEMS_PER_PAGE),
  );

  // Ajusto la página actual para que nunca supere el total de páginas disponibles.
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Calculo qué servicios se mostrarán en la página actual.
  const paginatedServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredServices.slice(start, end);
  }, [filteredServices, safeCurrentPage]);

  // Cambia la página actual si el número recibido es válido.
  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  // Limpia todos los filtros y vuelve a la primera página.
  function handleClearFilters() {
    setSearch("");
    setSelectedCategory("");
    setSelectedCity("");
    setCurrentPage(1);
  }

  return (
    <main className={styles.servicesPage}>
      {/* Hero superior de la página de servicios */}
      <ServicesHero />

      <section className={styles.filtersSection}>
        <div className="container">
          {/* Bloque de filtros de búsqueda */}
          <ServicesFilters
            search={search}
            selectedCategory={selectedCategory}
            selectedCity={selectedCity}
            categories={categories}
            cities={cities}
            isLoading={isLoading}
            hasError={Boolean(error)}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            onCategoryChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            onCityChange={(value) => {
              setSelectedCity(value);
              setCurrentPage(1);
            }}
            onClear={handleClearFilters}
          />

          {/* Texto resumen con el número de resultados encontrados */}
          <div className={styles.resultsHeader}>
            <p className={styles.resultsText}>
              {isLoading
                ? "Cargando servicios..."
                : `${filteredServices.length} ${
                    filteredServices.length === 1
                      ? "servicio encontrado"
                      : "servicios encontrados"
                  }`}
            </p>
          </div>

          {/* Listado de resultados ya filtrados y paginados */}
          <ServicesResults
            isLoading={isLoading}
            error={error}
            filteredServices={paginatedServices}
          />

          {/* Muestro la paginación solo si no está cargando y no hay error */}
          {!isLoading && !error ? (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

// Exporto la página para usarla en el router.
export default Services;
