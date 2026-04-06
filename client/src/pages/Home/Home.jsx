import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHero from "../../components/home/HomeHero/HomeHero";
import HomeCategoriesSection from "../../components/home/HomeCategoriesSection/HomeCategoriesSection";
import HomeFeaturedServicesSection from "../../components/home/HomeFeaturedServicesSection/HomeFeaturedServicesSection";
import HomeReviewsSection from "../../components/home/HomeReviewsSection/HomeReviewsSection";
import HomeTrustSection from "../../components/home/HomeTrustSection/HomeTrustSection";
import HomeStepsSection from "../../components/home/HomeStepsSection/HomeStepsSection";
import { getCategories, getCities } from "../../services/meta.service";
import { getAllServices } from "../../services/services.service";
import { getHomeReviews } from "../../services/reviews.service";
import styles from "./Home.module.css";

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

function Home() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [homeReviews, setHomeReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);

        const [categoriesData, citiesData, servicesData, homeReviewsData] =
          await Promise.all([
            getCategories(),
            getCities(),
            getAllServices(),
            getHomeReviews(),
          ]);

        const services = servicesData?.services || [];
        const sortedFeaturedServices = sortFeaturedServices(services).slice(
          0,
          3,
        );

        setCategories(categoriesData?.categories || []);
        setCities(citiesData?.cities || []);
        setAllServices(services);
        setFeaturedServices(sortedFeaturedServices);

        setHomeReviews(homeReviewsData?.reviews || []);
      } catch (error) {
        console.error("Error cargando la home:", error);
        setCategories([]);
        setCities([]);
        setAllServices([]);
        setFeaturedServices([]);
        setHomeReviews([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const highlightedService = featuredServices[0] || null;

  const stats = useMemo(() => {
    const totalServices = allServices.length;

    const professionals = new Set(
      allServices.map((service) => service.pro?.id).filter(Boolean),
    ).size;

    const totalReviews = allServices.reduce(
      (acc, service) => acc + (service.reviewsCount || 0),
      0,
    );

    const weightedScore = allServices.reduce(
      (acc, service) =>
        acc + (service.averageRating || 0) * (service.reviewsCount || 0),
      0,
    );

    const averageRating =
      totalReviews > 0 ? Number((weightedScore / totalReviews).toFixed(1)) : 0;

    return {
      totalServices,
      professionals,
      averageRating,
    };
  }, [allServices]);

  function navigateToServices(extraParams = {}) {
    const params = new URLSearchParams();
    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    if (selectedCity) {
      params.set("city", selectedCity);
    }

    Object.entries(extraParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    navigate(query ? `/services?${query}` : "/services");
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    navigateToServices();
  }

  function handleFeaturedClick() {
    if (!highlightedService?.id) return;
    navigate(`/services/${highlightedService.id}`);
  }

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

      <HomeCategoriesSection
        categories={categories}
        services={allServices}
        onSelectCategory={(categoryId) =>
          navigateToServices({ category: categoryId })
        }
      />

      <HomeReviewsSection
        reviews={homeReviews}
        isLoading={isLoading}
        onSelectReviewCategory={handleReviewCategoryClick}
      />

      <HomeFeaturedServicesSection featuredServices={featuredServices} />

      <HomeTrustSection />
      <HomeStepsSection />
    </main>
  );
}

export default Home;
