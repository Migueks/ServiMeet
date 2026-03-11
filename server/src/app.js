// App.js
// Documento con la configuración de la app de Express (middlewares y rutas).
// Lo separo de server.js para poder testear y reutilizar sin arrancar el servidor.
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const servicesRoutes = require("./routes/services.routes");
const requestsRoutes = require("./routes/requests.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const usersRoutes = require("./routes/users.routes");
const adminRoutes = require("./routes/admin.routes");
const metaRoutes = require("./routes/meta.routes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Configuro cabeceras HTTP de seguridad con Helmet, reduciendo riesgos comunes.
app.use(helmet());

// Configuro CORS con el middleware cors(), controlando qué orígenes pueden acceder a la API.
app.use(cors());

// Parseo de JSON en el body (POST/PUT/PATCH)
app.use(express.json());

// Registro en consola las peticiones HTTP (método, ruta, estado y tiempo) con morgan en modo "dev".
app.use(morgan("dev"));

// Limito el número de peticiones por IP para prevenir abusos (300 cada 15 minutos).
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Creo un endpoint de salud en /health para comprobar que la API está operativa.
app.use("/health", healthRoutes);

// Creo el endpoint /auth y agrupo aquí las rutas de autenticación: registro, login y obtener el usuario autenticado.
app.use("/auth", authRoutes);

// Creo el endpoint /services para gestionar el catálogo de servicios publicados por los profesionales.
app.use("/services", servicesRoutes);

// Creo el endpoint /requests para gestionar las solicitudes entre clientes y profesionales.
app.use("/requests", requestsRoutes);

// Creo el endpoint /reviews para gestionar las reseñas de servicios completados.
app.use("/reviews", reviewsRoutes);

// Creo el endpoint /users para gestionar perfil y panel del usuario autenticado.
app.use("/users", usersRoutes);

// Creo el endpoint /admin para la gestión global de la plataforma por parte del administrador.
app.use("/admin", adminRoutes);

// Creo el endpoint /meta para exponer catálogos auxiliares como categorías y ciudades.
app.use("/meta", metaRoutes);

// Gestiono los errores 404 de forma genérica (ruta no encontrada)
app.use((req, res) => {
  res
    .status(404)
    .json({
      message: `Recurso no encontrado: ${req.method} ${req.originalUrl}`,
    });
});

// Manejador global de errores
app.use(errorHandler);

module.exports = app;
