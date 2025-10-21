import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload.token);
      return { ...state, isAuthenticated: true, token: action.payload.token };
    case "LOGOUT":
      localStorage.removeItem("token");
      return { ...state, isAuthenticated: false, token: null };
    default:
      throw new Error(`Unknown action: ${action.type}`);
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
      dispatch({ type: "LOGIN_SUCCESS", payload: { token } });
    } else {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const register = async (formData) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
    dispatch({ type: "REGISTER_SUCCESS", payload: res.data });
  };

  const login = async (formData) => {
    console.log(`${import.meta.env.VITE_API_URL}/auth/login`);
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
    console.log(`${import.meta.env.VITE_API_URL}/auth/login`);
    console.log(res);
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