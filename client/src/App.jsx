// Importo el router principal de la aplicación.
// Este componente se encarga de definir qué página se muestra según la URL.
import AppRouter from "./router/AppRouter";

// Componente raíz de la aplicación.
// Su única responsabilidad aquí es renderizar el sistema de rutas.
function App() {
  return (
    <>
      {/* Pinto el router principal para que gestione toda la navegación */}
      <AppRouter />
    </>
  );
}

// Exporto el componente para poder usarlo en main.jsx.
export default App;
