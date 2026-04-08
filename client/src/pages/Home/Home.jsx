// Importo hooks de React para guardar estado, ejecutar efectos
// y memorizar cálculos derivados.
import { useEffect, useMemo, useState } from "react";

// Importo useNavigate para cambiar de ruta por código.
import { useNavigate } from "react-router-dom";

// Importo las secciones que forman la página de inicio.
import HomeHero from "../../components/home/HomeHero/HomeHero";
import HomeCategoriesSection from "../../components/home/HomeCategoriesSection/HomeCategoriesSection";
import HomeFeaturedServicesSection from "../../components/home/HomeFeaturedServicesSection/HomeFeaturedServicesSection";
import HomeReviewsSection from "../../components/home/HomeReviewsSection/HomeReviewsSection";
import HomeTrustSection from "../../components/home/HomeTrustSection/HomeTrustSection";
import HomeStepsSection from "../../components/home/HomeStepsSection/HomeStepsSection";

// Importo los servicios que obtienen datos del backend.
import { getCategories, getCities } from "../../services/meta.service";
import { getAllServices } from "../../services/services.service";
import { getHomeReviews } from "../../services/reviews.service";

// Importo los estilos de la página.
import styles from "./Home.module.css";

// Esta función ordena los servicios destacados.
// Primero prioriza los que tienen más reseñas,
// después los que tienen mejor valoración media
// y, si siguen empatados, los más recientes.
function sortFeaturedServices(services = []) {
  return [...services].sort((a, b) => {
    if ((b.reviewsCount || 0) !== (a.reviewsCount || 0)) {
      return (b.reviewsCount || 0) - (a.reviewsCount || 0);
    }

    if ((b.averageRating || 0) !== (a.averageRating || 0)) {
      return (b.averageRating || 0) - (a.averageRating || 0);
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

// Componente principal de la página de inicio.
function Home() {
  // Hook para navegar a otras páginas desde el código.
  const navigate = useNavigate();

  // Estado del buscador principal.
  const [search, setSearch] = useState("");

  // Estado de la categoría seleccionada en los filtros de la home.
  const [selectedCategory, setSelectedCategory] = useState("");

  // Estado de la ciudad seleccionada en los filtros de la home.
  const [selectedCity, setSelectedCity] = useState("");

  // Estado con la lista de categorías disponibles.
  const [categories, setCategories] = useState([]);

  // Estado con la lista de ciudades disponibles.
  const [cities, setCities] = useState([]);

  // Estado con todos los servicios cargados para la home.
  const [allServices, setAllServices] = useState([]);

  // Estado con los servicios destacados que se mostrarán en portada.
  const [featuredServices, setFeaturedServices] = useState([]);

  // Estado con las reseñas visibles en la home.
  const [homeReviews, setHomeReviews] = useState([]);

  // Estado para saber si la home sigue cargando datos.
  const [isLoading, setIsLoading] = useState(true);

  // Este efecto carga todos los datos necesarios para la home
  // cuando el componente se monta por primera vez.
  useEffect(() => {
    async function loadHomeData() {
      try {
        // Activo el estado de carga antes de empezar.
        setIsLoading(true);

        // Lanzo varias peticiones en paralelo para cargar antes la home.
        const [categoriesData, citiesData, servicesData, homeReviewsData] =
          await Promise.all([
            getCategories(),
            getCities(),
            getAllServices(),
            getHomeReviews(),
          ]);

        // Extraigo la lista de servicios de la respuesta.
        const services = servicesData?.services || [];

        // Ordeno los servicios y me quedo solo con los 3 mejores para destacados.
        const sortedFeaturedServices = sortFeaturedServices(services).slice(
          0,
          3,
        );

        // Guardo en estado todos los datos recibidos.
        setCategories(categoriesData?.categories || []);
        setCities(citiesData?.cities || []);
        setAllServices(services);
        setFeaturedServices(sortedFeaturedServices);
        setHomeReviews(homeReviewsData?.reviews || []);
      } catch (error) {
        // Si algo falla, muestro el error en consola y reinicio los estados
        // para evitar que la interfaz use datos inconsistentes.
        console.error("Error cargando la home:", error);
        setCategories([]);
        setCities([]);
        setAllServices([]);
        setFeaturedServices([]);
        setHomeReviews([]);
      } finally {
        // Desactivo el estado de carga al terminar.
        setIsLoading(false);
      }
    }

    loadHomeData();
  }, []);

  // Guardo como servicio destacado principal el primero del array,
  // o null si todavía no hay ninguno.
  const highlightedService = featuredServices[0] || null;

  // Calculo estadísticas globales para mostrarlas en la home.
  // Uso useMemo para no recalcularlas en cada render si allServices no cambia.
  const stats = useMemo(() => {
    // Número total de servicios disponibles.
    const totalServices = allServices.length;

    // Número de profesionales únicos que publican servicios.
    const professionals = new Set(
      allServices.map((service) => service.pro?.id).filter(Boolean),
    ).size;

    // Suma total de reseñas de todos los servicios.
    const totalReviews = allServices.reduce(
      (acc, service) => acc + (service.reviewsCount || 0),
      0,
    );

    // Suma ponderada para calcular la valoración media global
    // teniendo en cuenta cuántas reseñas tiene cada servicio.
    const weightedScore = allServices.reduce(
      (acc, service) =>
        acc + (service.averageRating || 0) * (service.reviewsCount || 0),
      0,
    );

    // Calculo la valoración media global.
    const averageRating =
      totalReviews > 0 ? Number((weightedScore / totalReviews).toFixed(1)) : 0;

    // Devuelvo el objeto final con las estadísticas.
    return {
      totalServices,
      professionals,
      averageRating,
    };
  }, [allServices]);

  // Esta función construye los parámetros de búsqueda
  // y navega a la página de servicios.
  function navigateToServices(extraParams = {}) {
    const params = new URLSearchParams();

    // Limpio el texto de búsqueda para evitar espacios sobrantes.
    const trimmedSearch = search.trim();

    // Si hay texto de búsqueda, lo añado a la URL.
    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    // Si hay categoría seleccionada, la añado a la URL.
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    // Si hay ciudad seleccionada, la añado a la URL.
    if (selectedCity) {
      params.set("city", selectedCity);
    }

    // Añado parámetros extra si se reciben,
    // por ejemplo al pulsar en una categoría concreta.
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      }
    });

    // Construyo la query final y navego a la página de servicios.
    const query = params.toString();
    navigate(query ? `/services?${query}` : "/services");
  }

  // Maneja el envío del formulario de búsqueda principal.
  function handleSearchSubmit(event) {
    event.preventDefault();
    navigateToServices();
  }

  // Maneja el clic sobre el servicio destacado principal.
  function handleFeaturedClick() {
    if (!highlightedService?.id) return;
    navigate(`/services/${highlightedService.id}`);
  }

  // Maneja el clic sobre una reseña de la home.
  // Lleva al usuario a la página de servicios filtrando
  // por la categoría y el título del servicio relacionado.
  function handleReviewCategoryClick(review) {
    const params = new URLSearchParams();

    if (review?.service?.category?.id) {
      params.set("category", String(review.service.category.id));
    }

    if (review?.service?.title) {
      params.set("search", review.service.title);
    }

    navigate(`/services?${params.toString()}`);
  }

  return (
    <main className={styles.home}>
      {/* Hero principal con buscador, estadísticas y servicio destacado */}
      <HomeHero
        search={search}
        selectedCategory={selectedCategory}
        selectedCity={selectedCity}
        categories={categories}
        cities={cities}
        isLoading={isLoading}
        stats={stats}
        highlightedService={highlightedService}
        onSearchChange={setSearch}
        onCategoryChange={setSelectedCategory}
        onCityChange={setSelectedCity}
        onSubmit={handleSearchSubmit}
        onExplore={() => navigateToServices()}
        onFeaturedClick={handleFeaturedClick}
      />

      {/* Sección de categorías destacadas */}
      <HomeCategoriesSection
        categories={categories}
        services={allServices}
        onSelectCategory={(categoryId) =>
          navigateToServices({ category: categoryId })
        }
      />

      {/* Sección de reseñas visibles en la home */}
      <HomeReviewsSection
        reviews={homeReviews}
        isLoading={isLoading}
        onSelectReviewCategory={handleReviewCategoryClick}
      />

      {/* Sección de servicios destacados */}
      <HomeFeaturedServicesSection featuredServices={featuredServices} />

      {/* Sección de confianza */}
      <HomeTrustSection />

      {/* Sección explicando cómo funciona la plataforma */}
      <HomeStepsSection />
    </main>
  );
}

// Exporto la página para usarla en el router.
export default Home;
