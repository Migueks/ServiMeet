// Desactivo esta regla de ESLint porque en este archivo exporto tanto el provider como el hook personalizado del contexto.
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Importo las funciones del servicio de autenticación que se encargan
// de hablar con el backend para login, registro y obtención del perfil.
import {
  getMyProfile,
  loginUser,
  registerUser,
} from "../services/auth.service";

// Creo el contexto de autenticación.
// Aquí se compartirán token, usuario y funciones relacionadas
// con la sesión entre todos los componentes de la app.
const AuthContext = createContext();

// Defino las claves que usaré en localStorage.
// Una para guardar el token JWT y otra para guardar los datos del usuario.
const TOKEN_KEY = "servimeet_token";
const USER_KEY = "servimeet_user";

// Función auxiliar para recuperar el usuario guardado en localStorage.
function getStoredUser() {
  try {
    // Intento leer el usuario guardado en localStorage.
    const savedUser = localStorage.getItem(USER_KEY);
    // Si existe, lo convierto de JSON a objeto.
    // Si no existe, devuelvo null.
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    // Si el JSON estuviera corrupto o no fuese válido,
    // elimino la clave para evitar errores futuros.
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

// Función auxiliar para guardar o eliminar el usuario en localStorage.
function persistUser(nextUser) {
  if (nextUser) {
    // Si recibo un usuario válido, lo guardo serializado en localStorage.
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  } else {
    // Si no hay usuario, elimino la clave.
    localStorage.removeItem(USER_KEY);
  }
}

// Provider del contexto de autenticación.
// Envuelve la app y permite que todos los componentes hijos accedan al estado y funciones de autenticación.
export function AuthProvider({ children }) {
  // Estado para guardar el token.
  // Lo inicializo leyendo el token guardado en localStorage, si existe.
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");

  // Estado para guardar el usuario autenticado.
  // Uso getStoredUser como función inicializadora para leerlo una sola vez.
  const [user, setUser] = useState(getStoredUser);

  // Estado para controlar si todavía se está comprobando la sesión.
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Este efecto se ejecuta cada vez que cambia el token.
  // Sirve para sincronizar el estado local con el backend.
  useEffect(() => {
    async function syncAuthState() {
      if (!token) {
        // Si no hay token, significa que no hay sesión iniciada.
        setUser(null);
        setIsLoadingAuth(false);
        return;
      }

      try {
        // Si hay token, pido al backend el perfil del usuario autenticado.
        const data = await getMyProfile(token);

        // Algunos endpoints podrían devolver { user: ... }
        // y otros directamente el usuario, así que cubro ambos casos.
        const userData = data.user || data;

        // Guardo el usuario en el estado y también en localStorage.
        setUser(userData);
        persistUser(userData);
      } catch {
        // Si el token falla (caducado, inválido, usuario bloqueado, etc.), limpio completamente la sesión.
        setToken("");
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        // Tanto si va bien como si va mal, termino la carga de autenticación.
        setIsLoadingAuth(false);
      }
    }

    // Lanzo la comprobación de la sesión.
    syncAuthState();
  }, [token]);

  // Función para iniciar sesión.
  async function login(credentials) {
    // Envío email/contraseña al backend.
    const data = await loginUser(credentials);

    // Extraigo token y usuario de la respuesta.
    const authToken = data.token;
    const authUser = data.user || data;

    // Guardo token y usuario en localStorage para mantener la sesión.
    localStorage.setItem(TOKEN_KEY, authToken);
    persistUser(authUser);

    // Actualizo también el estado global del contexto.
    setToken(authToken);
    setUser(authUser);

    // Devuelvo la respuesta completa por si el componente que llama necesita usarla después.
    return data;
  }

  // Función para registrar un nuevo usuario.
  // Aquí no inicia sesión automáticamente; simplemente devuelve lo que responda el backend.
  async function register(userData) {
    return registerUser(userData);
  }

  // Función para actualizar manualmente el usuario autenticado tanto en el estado como en localStorage.
  function setAuthUser(nextUser) {
    setUser(nextUser);
    persistUser(nextUser);
  }

  // Función para volver a pedir al backend el perfil actual del usuario.
  // La memorizo con useCallback para no recrearla innecesariamente en cada render.
  const refreshProfile = useCallback(async () => {
    // Si no hay token, limpio el usuario autenticado.
    if (!token) {
      setAuthUser(null);
      return null;
    }

    // Pido al backend los datos actualizados del perfil.
    const data = await getMyProfile(token);
    const refreshedUser = data.user || data;

    // Guardo el usuario actualizado.
    setAuthUser(refreshedUser);

    // Lo devuelvo por si el componente que llama quiere usarlo.
    return refreshedUser;
  }, [token]);

  // Función para cerrar sesión.
  function logout() {
    // Limpio token y usuario del estado.
    setToken("");
    setUser(null);

    // Limpio también localStorage.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Memorizo el valor del contexto para evitar renders innecesarios
  // en los componentes consumidores cuando no cambian sus dependencias.
  const value = useMemo(
    () => ({
      token,
      user,
      // Indica si el usuario está autenticado.
      // Solo será true si existe token y existe usuario.
      isAuthenticated: !!(token && user),
      // Indica si todavía se está verificando la sesión.
      isLoadingAuth,
      // Funciones públicas del contexto.
      login,
      register,
      logout,
      setAuthUser,
      refreshProfile,
    }),
    [token, user, isLoadingAuth, refreshProfile],
  );

  // Devuelvo el provider envolviendo a los componentes hijos para que todos puedan acceder al contexto.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para consumir el contexto de autenticación
// de forma más cómoda.
export function useAuth() {
  const context = useContext(AuthContext);

  // Si alguien intenta usar este hook fuera de AuthProvider,
  // lanzo un error para avisar del mal uso.
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  // Devuelvo el contexto disponible.
  return context;
}
