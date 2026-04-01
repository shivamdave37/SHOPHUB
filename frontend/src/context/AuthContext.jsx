import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('shophub_user');
    const storedToken = localStorage.getItem('shophub_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (payload) => {
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem('shophub_user', JSON.stringify(payload.user));
    localStorage.setItem('shophub_token', payload.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('shophub_user');
    localStorage.removeItem('shophub_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
