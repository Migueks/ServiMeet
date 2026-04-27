# ServiMeet

**ServiMeet** es una aplicación web full stack desarrollada como Trabajo de Fin de Grado del ciclo de **Desarrollo de Aplicaciones Web**. El proyecto plantea un marketplace de servicios locales inspirado en plataformas como TaskRabbit, donde los clientes pueden buscar profesionales, enviar solicitudes y valorar los trabajos realizados, mientras que los profesionales pueden publicar servicios, gestionar peticiones y construir reputación dentro de la plataforma.

El objetivo principal del proyecto es demostrar la integración completa entre frontend, backend, base de datos, autenticación, autorización por roles, subida de imágenes, validación de datos, paneles diferenciados y administración de contenidos.

---

## Índice

1. [Descripción general](#descripción-general)
2. [Funcionalidades principales](#funcionalidades-principales)
3. [Roles de usuario](#roles-de-usuario)
4. [Tecnologías utilizadas](#tecnologías-utilizadas)
5. [Arquitectura del proyecto](#arquitectura-del-proyecto)
6. [Modelo de datos](#modelo-de-datos)
7. [Instalación y ejecución local](#instalación-y-ejecución-local)
8. [Variables de entorno](#variables-de-entorno)
9. [Scripts disponibles](#scripts-disponibles)
10. [Seed y datos de demostración](#seed-y-datos-de-demostración)
11. [Rutas principales del frontend](#rutas-principales-del-frontend)
12. [Endpoints principales de la API](#endpoints-principales-de-la-api)
13. [Seguridad y validaciones](#seguridad-y-validaciones)
14. [Estructura de carpetas](#estructura-de-carpetas)
15. [Flujo básico de uso](#flujo-básico-de-uso)
16. [Despliegue](#despliegue)
17. [Mejoras futuras](#mejoras-futuras)
18. [Autor](#autor)

---

## Descripción general

ServiMeet permite conectar a personas que necesitan resolver tareas concretas con profesionales que ofrecen servicios en distintas categorías y ciudades. La aplicación está pensada para centralizar el proceso completo: búsqueda del servicio, consulta del detalle, envío de solicitud, gestión del estado, finalización del trabajo y creación de reseñas.

El proyecto está dividido en dos aplicaciones independientes:

- **Frontend:** aplicación React creada con Vite.
- **Backend:** API REST desarrollada con Node.js, Express, Prisma y MySQL.

La comunicación entre ambas partes se realiza mediante peticiones HTTP a una API REST protegida con JWT en las rutas privadas.

---

## Funcionalidades principales

### Funcionalidades públicas

- Página de inicio con presentación de la plataforma.
- Buscador principal de servicios.
- Listado de servicios activos.
- Filtros por texto, categoría y ciudad.
- Paginación de resultados.
- Página de detalle de cada servicio.
- Visualización de información del profesional.
- Visualización de reseñas visibles.
- Página informativa para profesionales.
- Página de contacto.
- Registro e inicio de sesión.

### Funcionalidades de cliente

- Registro con rol de cliente.
- Inicio de sesión mediante JWT.
- Consulta de servicios publicados.
- Envío de solicitudes a profesionales.
- Seguimiento de solicitudes realizadas.
- Cancelación de solicitudes cuando corresponde.
- Creación de reseñas sobre solicitudes completadas.
- Edición del perfil personal.
- Subida y eliminación de avatar.

### Funcionalidades de profesional

- Registro con rol de profesional.
- Creación de servicios.
- Edición de servicios publicados.
- Activación y desactivación de servicios.
- Subida de imagen para servicios.
- Consulta de solicitudes recibidas.
- Cambio de estado de solicitudes.
- Consulta de reseñas recibidas.
- Estadísticas del panel profesional.
- Edición del perfil personal.

### Funcionalidades de administración

- Panel exclusivo para usuarios con rol `ADMIN`.
- Consulta global de usuarios.
- Bloqueo y desbloqueo de usuarios.
- Consulta global de servicios.
- Activación y desactivación de servicios.
- Consulta global de solicitudes.
- Consulta global de reseñas.
- Ocultación o restauración de reseñas.
- Consulta de mensajes enviados desde el formulario de contacto.
- Estadísticas generales de la plataforma.

---

## Roles de usuario

La aplicación utiliza tres roles principales:

| Rol      | Descripción                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------- |
| `CLIENT` | Usuario que busca servicios, envía solicitudes y publica reseñas cuando un trabajo se completa. |
| `PRO`    | Usuario profesional que publica servicios, recibe solicitudes y gestiona su actividad.          |
| `ADMIN`  | Usuario administrador con acceso al panel de moderación y control global de la plataforma.      |

La autorización se controla en backend mediante middlewares de autenticación y comprobación de rol.

---

## Tecnologías utilizadas

### Frontend

- **React**
- **Vite**
- **React Router DOM**
- **CSS Modules**
- **CSS personalizado**
- **Fetch API**
- **LocalStorage** para persistencia de sesión

### Backend

- **Node.js**
- **Express 5**
- **Prisma 7**
- **MySQL**
- **Prisma MariaDB Adapter**
- **JWT** para autenticación
- **bcrypt** para hash de contraseñas
- **Zod** para validación de datos
- **Multer** para subida de archivos
- **Cloudinary** para almacenamiento de imágenes
- **Helmet** para cabeceras de seguridad
- **CORS** para control de origen
- **express-rate-limit** para limitar peticiones
- **Morgan** para logs en desarrollo

### Base de datos

- **MySQL**
- Gestión mediante **Prisma ORM**
- Migraciones incluidas en `server/prisma/migrations`
- Script de seed incluido en `server/prisma/seed.js`

---

## Arquitectura del proyecto

ServiMeet sigue una arquitectura separada por capas:

```txt
Cliente React
    |
    | Peticiones HTTP / Fetch
    v
API REST Express
    |
    | Prisma Client
    v
Base de datos MySQL
    |
    | Relaciones entre usuarios, servicios, solicitudes y reseñas
    v
Persistencia de datos
```

El frontend consume los endpoints del backend mediante servicios JavaScript ubicados en `client/src/services`.  
El backend organiza la lógica en rutas, controladores, middlewares, esquemas de validación y utilidades.

---

## Modelo de datos

El modelo de datos principal está definido en `server/prisma/schema.prisma`.

### Entidades principales

| Modelo           | Descripción                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `User`           | Usuarios de la plataforma. Puede tener rol `CLIENT`, `PRO` o `ADMIN`.                                    |
| `Service`        | Servicios publicados por profesionales. Incluye título, descripción, precio, imagen, categoría y ciudad. |
| `Request`        | Solicitudes enviadas por clientes a profesionales sobre un servicio concreto.                            |
| `Review`         | Reseñas creadas por clientes cuando una solicitud ha sido completada.                                    |
| `Category`       | Categorías disponibles para clasificar servicios.                                                        |
| `City`           | Ciudades disponibles para ubicar servicios.                                                              |
| `ContactMessage` | Mensajes enviados desde el formulario de contacto.                                                       |

### Relaciones principales

- Un usuario profesional puede publicar muchos servicios.
- Un cliente puede enviar muchas solicitudes.
- Un profesional puede recibir muchas solicitudes.
- Un servicio puede tener muchas solicitudes.
- Una solicitud completada puede tener una única reseña.
- Una reseña pertenece a un cliente, a un profesional, a un servicio y a una solicitud.
- Un servicio pertenece a una categoría y a una ciudad.
- Una categoría puede agrupar muchos servicios.
- Una ciudad puede tener muchos servicios.

### Estados de solicitud

Las solicitudes usan el enum `RequestStatus`:

| Estado      | Significado                            |
| ----------- | -------------------------------------- |
| `PENDING`   | Solicitud pendiente de respuesta.      |
| `ACCEPTED`  | Solicitud aceptada por el profesional. |
| `REJECTED`  | Solicitud rechazada.                   |
| `DONE`      | Trabajo completado.                    |
| `CANCELLED` | Solicitud cancelada.                   |

---

## Instalación y ejecución local

### Requisitos previos

Antes de ejecutar el proyecto es necesario tener instalado:

- Node.js 20 o superior.
- npm.
- MySQL o MariaDB.
- Una base de datos creada para el proyecto.
- Cuenta de Cloudinary si se quieren probar las subidas de imágenes.

---

### 1. Clonar el repositorio

```bash
git clone https://github.com/Migueks/ServiMeet.git
cd ServiMeet
```

---

### 2. Configurar la base de datos

Crear una base de datos MySQL, por ejemplo:

```sql
CREATE DATABASE servimeet_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Después, configurar la variable `DATABASE_URL` en el archivo `.env` del backend.

---

### 3. Configurar el backend

Entrar en la carpeta del servidor:

```bash
cd server
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

Configurar las variables necesarias en `server/.env`.

Generar Prisma Client:

```bash
npm run db:generate
```

Ejecutar migraciones:

```bash
npm run db:migrate
```

Cargar datos de demostración:

```bash
npm run db:seed
```

Arrancar el backend en desarrollo:

```bash
npm run dev
```

Por defecto, la API queda disponible en:

```txt
http://localhost:3000
```

Comprobación rápida:

```txt
GET http://localhost:3000/health
```

---

### 4. Configurar el frontend

En una terminal distinta, entrar en la carpeta del cliente:

```bash
cd client
```

Instalar dependencias:

```bash
npm install
```

Crear el archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

Configurar la URL del backend:

```env
VITE_API_URL=http://localhost:3000
```

Arrancar el frontend:

```bash
npm run dev
```

Por defecto, la aplicación queda disponible en:

```txt
http://localhost:5173
```

---

## Variables de entorno

### Backend

Archivo: `server/.env`

```env
PORT=3000
CLIENT_URL=http://localhost:5173

DATABASE_URL="mysql://usuario:contraseña@localhost:3306/servimeet_dev"
JWT_SECRET="frase_secreta_segura"

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

NODE_ENV=development
ENABLE_DB_HEALTHCHECK=false
```

| Variable                | Descripción                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| `PORT`                  | Puerto donde se ejecuta la API.                                        |
| `CLIENT_URL`            | URL del frontend permitida por CORS.                                   |
| `DATABASE_URL`          | Cadena de conexión a MySQL.                                            |
| `JWT_SECRET`            | Clave secreta para firmar tokens JWT.                                  |
| `CLOUDINARY_CLOUD_NAME` | Nombre de la cuenta de Cloudinary.                                     |
| `CLOUDINARY_API_KEY`    | API key de Cloudinary.                                                 |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary.                                              |
| `NODE_ENV`              | Entorno de ejecución.                                                  |
| `ENABLE_DB_HEALTHCHECK` | Permite activar o desactivar la comprobación pública de base de datos. |

> Importante: el archivo `.env` no debe subirse al repositorio.

---

### Frontend

Archivo: `client/.env`

```env
VITE_API_URL=http://localhost:3000
```

| Variable       | Descripción                                   |
| -------------- | --------------------------------------------- |
| `VITE_API_URL` | URL base de la API que consumirá el frontend. |

---

## Scripts disponibles

### Backend

Desde la carpeta `server`:

| Comando               | Descripción                                        |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Inicia el servidor con Nodemon en modo desarrollo. |
| `npm start`           | Inicia el servidor con Node.                       |
| `npm run db:generate` | Genera Prisma Client.                              |
| `npm run db:migrate`  | Ejecuta migraciones de Prisma en desarrollo.       |
| `npm run db:seed`     | Inserta datos de demostración.                     |
| `npm run prisma`      | Ejecuta comandos de Prisma.                        |
| `npm run postinstall` | Genera Prisma Client tras instalar dependencias.   |

### Frontend

Desde la carpeta `client`:

| Comando           | Descripción                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Inicia Vite en modo desarrollo.      |
| `npm run build`   | Genera la versión de producción.     |
| `npm run preview` | Previsualiza la build de producción. |
| `npm run lint`    | Ejecuta ESLint.                      |

---

## Seed y datos de demostración

El proyecto incluye un seed completo para trabajar con datos realistas durante la presentación y las pruebas.

El script se encuentra en:

```txt
server/prisma/seed.js
```

Ejecutar:

```bash
cd server
npm run db:seed
```

El seed genera:

- 20 categorías de servicios.
- 52 ciudades.
- 520 usuarios demo repartidos entre clientes y profesionales.
- 1 usuario administrador.
- 440 servicios demo.
- 230 solicitudes demo.
- 141 reseñas demo aproximadamente, asociadas a solicitudes completadas.

### Credenciales demo

Usuario administrador:

```txt
Email: admin@servimeet.com
Password: Admin1234!
```

Usuarios demo generados:

```txt
Password común: Demo1234!
```

Los correos de usuarios demo siguen un patrón similar a:

```txt
nombre.apellido.apellido.ciudad.numero@servimeetdemo.com
```

> Estas credenciales son únicamente para entorno local o demostración académica. No deben usarse en producción.

---

## Rutas principales del frontend

| Ruta             | Descripción                            |
| ---------------- | -------------------------------------- |
| `/`              | Página de inicio.                      |
| `/services`      | Listado de servicios.                  |
| `/services/:id`  | Detalle de un servicio.                |
| `/profesionales` | Página informativa para profesionales. |
| `/contacto`      | Formulario de contacto.                |
| `/login`         | Inicio de sesión.                      |
| `/register`      | Registro de usuario.                   |
| `/dashboard`     | Panel privado según rol del usuario.   |
| `*`              | Página 404.                            |

---

## Endpoints principales de la API

La API se ejecuta por defecto en:

```txt
http://localhost:3000
```

### Health

| Método | Endpoint     | Descripción                           | Acceso                      |
| ------ | ------------ | ------------------------------------- | --------------------------- |
| `GET`  | `/health`    | Comprueba que la API está activa.     | Público                     |
| `GET`  | `/health/db` | Comprueba conexión con base de datos. | Según entorno/configuración |

### Autenticación

| Método | Endpoint         | Descripción                   | Acceso  |
| ------ | ---------------- | ----------------------------- | ------- |
| `POST` | `/auth/register` | Registra un nuevo usuario.    | Público |
| `POST` | `/auth/login`    | Inicia sesión y devuelve JWT. | Público |

### Usuarios

| Método   | Endpoint              | Descripción                                    | Acceso                   |
| -------- | --------------------- | ---------------------------------------------- | ------------------------ |
| `GET`    | `/users/me`           | Obtiene el perfil del usuario autenticado.     | Usuario autenticado      |
| `PUT`    | `/users/me`           | Actualiza el perfil del usuario autenticado.   | Usuario autenticado      |
| `DELETE` | `/users/me/avatar`    | Elimina el avatar del usuario autenticado.     | Usuario autenticado      |
| `GET`    | `/users/me/services`  | Obtiene servicios del profesional autenticado. | `PRO`, `ADMIN`           |
| `GET`    | `/users/me/dashboard` | Obtiene estadísticas del panel privado.        | `CLIENT`, `PRO`, `ADMIN` |

### Servicios

| Método   | Endpoint        | Descripción                      | Acceso                |
| -------- | --------------- | -------------------------------- | --------------------- |
| `GET`    | `/services`     | Lista servicios activos.         | Público               |
| `GET`    | `/services/:id` | Obtiene detalle de un servicio.  | Público / contextual  |
| `POST`   | `/services`     | Crea un nuevo servicio.          | `PRO`, `ADMIN`        |
| `PUT`    | `/services/:id` | Actualiza un servicio.           | Propietario o `ADMIN` |
| `DELETE` | `/services/:id` | Elimina o desactiva un servicio. | Propietario o `ADMIN` |

### Solicitudes

| Método  | Endpoint                       | Descripción                                     | Acceso                   |
| ------- | ------------------------------ | ----------------------------------------------- | ------------------------ |
| `POST`  | `/requests`                    | Crea una solicitud sobre un servicio.           | `CLIENT`                 |
| `GET`   | `/requests/my-client-requests` | Lista solicitudes realizadas por el cliente.    | `CLIENT`                 |
| `GET`   | `/requests/my-pro-requests`    | Lista solicitudes recibidas por el profesional. | `PRO`, `ADMIN`           |
| `PATCH` | `/requests/:id/status`         | Actualiza el estado de una solicitud.           | `CLIENT`, `PRO`, `ADMIN` |

### Reseñas

| Método | Endpoint                      | Descripción                                     | Acceso                   |
| ------ | ----------------------------- | ----------------------------------------------- | ------------------------ |
| `POST` | `/reviews`                    | Crea una reseña sobre una solicitud completada. | `CLIENT`                 |
| `GET`  | `/reviews/home`               | Obtiene reseñas destacadas para la home.        | Público                  |
| `GET`  | `/reviews/service/:serviceId` | Obtiene reseñas visibles de un servicio.        | Público                  |
| `GET`  | `/reviews/my-reviews`         | Obtiene reseñas del usuario autenticado.        | `CLIENT`, `PRO`, `ADMIN` |

### Metadatos

| Método | Endpoint               | Descripción                     | Acceso  |
| ------ | ---------------------- | ------------------------------- | ------- |
| `GET`  | `/meta/categories`     | Lista todas las categorías.     | Público |
| `GET`  | `/meta/categories/:id` | Obtiene una categoría concreta. | Público |
| `GET`  | `/meta/cities`         | Lista todas las ciudades.       | Público |
| `GET`  | `/meta/cities/:id`     | Obtiene una ciudad concreta.    | Público |

### Contacto

| Método | Endpoint   | Descripción                                       | Acceso  |
| ------ | ---------- | ------------------------------------------------- | ------- |
| `POST` | `/contact` | Envía un mensaje desde el formulario de contacto. | Público |

### Administración

Todas las rutas de administración requieren autenticación y rol `ADMIN`.

| Método  | Endpoint                               | Descripción                    |
| ------- | -------------------------------------- | ------------------------------ |
| `GET`   | `/admin/users`                         | Lista usuarios.                |
| `PATCH` | `/admin/users/:id/toggle-block`        | Bloquea o desbloquea usuarios. |
| `GET`   | `/admin/services`                      | Lista servicios.               |
| `PATCH` | `/admin/services/:id/toggle-active`    | Activa o desactiva servicios.  |
| `GET`   | `/admin/requests`                      | Lista solicitudes.             |
| `GET`   | `/admin/reviews`                       | Lista reseñas.                 |
| `PATCH` | `/admin/reviews/:id/toggle-visibility` | Oculta o muestra reseñas.      |
| `GET`   | `/admin/contact-messages`              | Lista mensajes de contacto.    |

---

## Seguridad y validaciones

El proyecto incorpora varias medidas de seguridad y control:

- Contraseñas hasheadas con `bcrypt`.
- Autenticación mediante JWT.
- Tokens con expiración.
- Middlewares de autenticación (`isAuth`) y autorización por rol (`hasRole`).
- Middleware `optionalAuth` para rutas públicas que pueden adaptar su respuesta si hay usuario autenticado.
- Validación de datos con Zod en backend.
- Validación de imágenes mediante Multer.
- Límite de tamaño de archivo de 5 MB.
- Comprobación real del tipo de archivo subido.
- Subida de imágenes a Cloudinary.
- Eliminación de imágenes antiguas en Cloudinary cuando se reemplazan.
- Cabeceras de seguridad con Helmet.
- Configuración CORS restringida al frontend configurado.
- Límite de peticiones con `express-rate-limit`.
- Manejador global de errores.
- Respuestas 404 personalizadas.
- Bloqueo de usuarios desde administración.
- Ocultación de reseñas desde administración.
- Desactivación de servicios desde administración.

---

## Estructura de carpetas

```txt
ServiMeet/
├── client/
│   ├── public/
│   │   ├── image/
│   │   └── svg/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── home/
│   │   │   ├── serviceDetail/
│   │   │   └── services/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── prisma.config.ts
│
└── README.md
```

---

## Flujo básico de uso

### Flujo de cliente

1. El usuario se registra como cliente.
2. Inicia sesión.
3. Busca servicios por texto, categoría o ciudad.
4. Accede al detalle de un servicio.
5. Envía una solicitud al profesional.
6. Consulta el estado de sus solicitudes desde el dashboard.
7. Cuando el trabajo se marca como completado, puede dejar una reseña.

### Flujo de profesional

1. El usuario se registra como profesional.
2. Inicia sesión.
3. Crea servicios desde el dashboard.
4. Recibe solicitudes de clientes.
5. Acepta, rechaza, completa o gestiona solicitudes.
6. Consulta sus reseñas y estadísticas.

### Flujo de administrador

1. El administrador inicia sesión.
2. Accede al dashboard.
3. Revisa usuarios, servicios, solicitudes, reseñas y mensajes de contacto.
4. Puede bloquear usuarios, desactivar servicios y ocultar reseñas.

---

## Despliegue

Para desplegar ServiMeet en producción hay que desplegar por separado el frontend y el backend.

### Backend

1. Configurar variables de entorno en el proveedor de hosting.
2. Configurar una base de datos MySQL accesible desde el servidor.
3. Ejecutar migraciones de Prisma.
4. Generar Prisma Client.
5. Arrancar la API con:

```bash
npm start
```

### Frontend

Generar la build de producción:

```bash
cd client
npm run build
```

La carpeta resultante `dist` puede subirse a un servicio de hosting estático.

### Consideraciones de producción

- Usar una `JWT_SECRET` segura.
- No subir archivos `.env`.
- Configurar correctamente `CLIENT_URL`.
- Configurar correctamente `VITE_API_URL`.
- Activar HTTPS.
- Revisar límites de CORS.
- Usar credenciales reales de Cloudinary.
- No usar credenciales demo en producción.

---

## Mejoras futuras

Algunas mejoras que podrían incorporarse en futuras versiones:

- Sistema de mensajería interna entre cliente y profesional.
- Notificaciones por email.
- Recuperación de contraseña.
- Geolocalización avanzada.
- Buscador con filtros aplicados directamente en backend.
- Sistema de favoritos.
- Pasarela de pago.
- Calendario de disponibilidad.
- Tests automatizados de frontend y backend.
- Panel de analítica más avanzado.
- Despliegue completo con CI/CD.

---

## Autor

Proyecto desarrollado por **Miguel López-Herrero López** como Trabajo de Fin de Grado de **Desarrollo de Aplicaciones Web**.

---

## Estado del proyecto

Proyecto finalizado como aplicación full stack funcional para demostración académica, con frontend, backend, base de datos, autenticación, roles, paneles privados, administración, subida de imágenes y datos de demostración.
