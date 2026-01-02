import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { Register, Login } from './components/Auth';
import { DebtsPage } from './pages/DebtsPage';
import './App.css';

function App() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Recuperar usuario del localStorage si existe token
    if (token && !user) {
      // En una aplicación real, aquí validarías el token con el servidor
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser), token);
      }
    }
  }, [token, user, setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/debts"
          element={token ? <DebtsPage /> : <Navigate to="/login" />}
        />
        <Route path="/" element={token ? <Navigate to="/debts" /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
