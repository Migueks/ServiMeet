import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ServicesHero from "../../components/services/ServicesHero/ServicesHero";
import ServicesFilters from "../../components/services/ServicesFilters/ServicesFilters";
import ServicesResults from "../../components/services/ServicesResults/ServicesResults";
import Pagination from "../../components/common/Pagination/Pagination";
import { getCategories, getCities } from "../../services/meta.service";
import { getAllServices } from "../../services/services.service";
import styles from "./Services.module.css";

const ITEMS_PER_PAGE = 10;

function Services() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get("city") || "",
  );
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedCity(searchParams.get("city") || "");
  }, [searchParams]);

  useEffect(() => {
    async function loadPageData() {
      try {
        setIsLoading(true);
        setError("");

        const [servicesData, categoriesData, citiesData] = await Promise.all([
          getAllServices(),
          getCategories(),
          getCities(),
        ]);

        setServices(servicesData?.services || []);
        setCategories(categoriesData?.categories || []);
        setCities(citiesData?.cities || []);
      } catch (loadError) {
        setError(loadError.message || "No se pudieron cargar los servicios.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
  }, []);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (search.trim()) {
      nextParams.set("search", search.trim());
    }

    if (selectedCategory) {
      nextParams.set("category", selectedCategory);
    }

    if (selectedCity) {
      nextParams.set("city", selectedCity);
    }

    const current = searchParams.toString();
    const next = nextParams.toString();

    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [search, selectedCategory, selectedCity, searchParams, setSearchParams]);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch = normalizedSearch
        ? service.title.toLowerCase().includes(normalizedSearch) ||
          service.description.toLowerCase().includes(normalizedSearch) ||
          service.pro?.name?.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesCategory = selectedCategory
        ? String(service.category?.id) === selectedCategory
        : true;

      const matchesCity = selectedCity
        ? String(service.city?.id) === selectedCity
        : true;

      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [search, selectedCategory, selectedCity, services]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredServices.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedServices = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredServices.slice(start, end);
  }, [filteredServices, safeCurrentPage]);

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  function handleClearFilters() {
    setSearch("");
    setSelectedCategory("");
    setSelectedCity("");
    setCurrentPage(1);
  }

  return (
    <main className={styles.servicesPage}>
      <ServicesHero />

      <section className={styles.filtersSection}>
        <div className="container">
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

          <ServicesResults
            isLoading={isLoading}
            error={error}
            filteredServices={paginatedServices}
          />

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

export default Services;
