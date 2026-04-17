import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const DEMO_USERS_KEY = 'shophub_demo_users';

const defaultDemoUsers = [
  {
    id: 'demo-user-1',
    name: 'Krish Patel',
    email: 'krish@student.edu',
    password: '123456',
    role: 'customer'
  },
  {
    id: 'demo-admin-1',
    name: 'ShopHub Admin',
    email: 'admin@shophub.demo',
    password: '123456',
    role: 'admin'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [demoUsers, setDemoUsers] = useState(defaultDemoUsers);

  useEffect(() => {
    const storedUser = localStorage.getItem('shophub_user');
    const storedToken = localStorage.getItem('shophub_token');
    const storedDemoUsers = localStorage.getItem(DEMO_USERS_KEY);

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }

    if (storedDemoUsers) {
      setDemoUsers(JSON.parse(storedDemoUsers));
    } else {
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(defaultDemoUsers));
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

  const registerDemoUser = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedName || !normalizedEmail || password.trim().length < 6) {
      throw new Error('Name, email, and a 6 character password are required');
    }

    if (demoUsers.some((item) => item.email === normalizedEmail)) {
      throw new Error('That email is already registered in the demo app');
    }

    const nextUser = {
      id: `demo-user-${Date.now()}`,
      name: normalizedName,
      email: normalizedEmail,
      password: password.trim(),
      role: 'customer'
    };

    const nextUsers = [...demoUsers, nextUser];
    setDemoUsers(nextUsers);
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(nextUsers));

    login({
      token: `demo-token-${nextUser.id}`,
      user: {
        id: nextUser.id,
        name: nextUser.name,
        email: nextUser.email,
        role: nextUser.role
      }
    });
  };

  const loginDemoUser = ({ emailOrName, password }) => {
    const normalizedValue = emailOrName.trim().toLowerCase();

    const matchedUser = demoUsers.find(
      (item) => item.email.toLowerCase() === normalizedValue || item.name.toLowerCase() === normalizedValue
    );

    if (!matchedUser) {
      throw new Error('Demo user not found. Please register first.');
    }

    if (password.trim() && matchedUser.password !== password.trim()) {
      throw new Error('Incorrect demo password');
    }

    login({
      token: `demo-token-${matchedUser.id}`,
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, demoUsers, login, logout, loginDemoUser, registerDemoUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
