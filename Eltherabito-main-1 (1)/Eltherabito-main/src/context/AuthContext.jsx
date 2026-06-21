import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Decodes the role claim out of the JWT so we always know who the current user is,
// without depending on the login response shape (which doesn't include role).
export function getRoleFromToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return (
      payload.role ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      null
    );
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('eltherabito-user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  function login(userData, token) {
    const data = { ...userData, token };
    setUser(data);
    localStorage.setItem('eltherabito-user', JSON.stringify(data));
    localStorage.setItem('eltherabito-token', token);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('eltherabito-user');
    localStorage.removeItem('eltherabito-token');
  }

  const role = getRoleFromToken(user?.token);

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}