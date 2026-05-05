import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    // Only consider logged in if BOTH user data and token exist
    if (!savedUser || !token) return null;

    try {
      return JSON.parse(savedUser);
    } catch (e) {
      return null;
    }
  });

  const login = (token, userData, role) => {
    localStorage.setItem("token", token);
    const userWithRole = {
      ...(userData.student || userData.admin || userData.teacher || userData),
      role,
    };
    localStorage.setItem("user", JSON.stringify(userWithRole));
    setUser(userWithRole);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
