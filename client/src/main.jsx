// Importo React para poder usar JSX en la aplicación.
import React from "react";
// Importo ReactDOM para renderizar la app dentro del DOM real del navegador.
import ReactDOM from "react-dom/client";
// Importo el componente principal de la aplicación.
import App from "./App";
// Importo el provider de autenticación para que toda la app tenga acceso al contexto del usuario autenticado.
import { AuthProvider } from "./context/AuthContext";
// Importo los estilos globales de la aplicación.
import "./styles/globals.css";

// Busco en el HTML el elemento con id "root", creo la raíz de React y renderizo ahí toda la aplicación.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Envuelvo la aplicación con AuthProvider para el estado de autenticación en todos los componentes */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
