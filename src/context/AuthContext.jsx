import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const authReducer = (state, action) => {
  console.log("Auth action:", action);
  try {
    switch (action.type) {
      case "LOGIN_SUCCESS":
      case "REGISTER_SUCCESS":
        localStorage.setItem("token", action.payload.token);
        sessionStorage.setItem("username", action.payload.user.username);
        sessionStorage.setItem("email", action.payload.user.email);
        return { ...state, isAuthenticated: true, token: action.payload.token };
      case "SET_AUTHENTICATED":
        return { ...state, isAuthenticated: true, token: action.payload.token };
      case "LOGOUT":
        localStorage.removeItem("token");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("email");
        return { ...state, isAuthenticated: false, token: null };
      default:
        throw new Error(`Unknown action: ${action.type}`);
    }
  } catch (e) {
    return { ...state, isAuthenticated: false, token: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: null,
    token: localStorage.getItem("token"),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch({ type: "SET_AUTHENTICATED", payload: { token } });
    } else {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const register = async (formData) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
    if (res.status !== 200) {
      throw new Error(res.data?.msg || "Registration failed");
    }
    dispatch({ type: "REGISTER_SUCCESS", payload: res.data });
  };

  const login = async (formData) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
    if (res.status !== 200) {
      throw new Error(res.data?.msg || "Login failed");
    }
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
  };

  const logout = () => dispatch({ type: "LOGOUT" });

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={{ register, login, logout }}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (context === undefined) throw new Error("useAuthDispatch must be used within an AuthProvider");
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) throw new Error("useAuthState must be used within an AuthProvider");
  return context;
};