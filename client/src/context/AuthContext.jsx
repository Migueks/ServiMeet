/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getMyProfile,
  loginUser,
  registerUser,
} from "../services/auth.service";

const AuthContext = createContext();

const TOKEN_KEY = "servimeet_token";
const USER_KEY = "servimeet_user";

function getStoredUser() {
  try {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

function persistUser(nextUser) {
  if (nextUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(getStoredUser);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    async function syncAuthState() {
      if (!token) {
        setUser(null);
        setIsLoadingAuth(false);
        return;
      }

      try {
        const data = await getMyProfile(token);
        const userData = data.user || data;

        setUser(userData);
        persistUser(userData);
      } catch {
        setToken("");
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    syncAuthState();
  }, [token]);

  async function login(credentials) {
    const data = await loginUser(credentials);
    const authToken = data.token;
    const authUser = data.user || data;

    localStorage.setItem(TOKEN_KEY, authToken);
    persistUser(authUser);

    setToken(authToken);
    setUser(authUser);

    return data;
  }

  async function register(userData) {
    return registerUser(userData);
  }

  function setAuthUser(nextUser) {
    setUser(nextUser);
    persistUser(nextUser);
  }

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setAuthUser(null);
      return null;
    }

    const data = await getMyProfile(token);
    const refreshedUser = data.user || data;

    setAuthUser(refreshedUser);
    return refreshedUser;
  }, [token]);

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!(token && user),
      isLoadingAuth,
      login,
      register,
      logout,
      setAuthUser,
      refreshProfile,
    }),
    [token, user, isLoadingAuth, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
