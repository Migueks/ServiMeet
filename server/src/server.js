// src/server.js
// Punto de entrada: cargo variables de entorno y arranco el servidor HTTP.

require("dotenv").config(); // Carga variables desde .env
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ ServiMeet corriendo en http://localhost:${PORT}`);
});
