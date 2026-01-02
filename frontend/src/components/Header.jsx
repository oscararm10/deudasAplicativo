import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import styles from './Header.module.css';
import { MdLogout } from 'react-icons/md';

export function Header({ title, subtitle }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className={styles.userInfo}>
          <span>Hola, {user?.name || 'Usuario'}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <MdLogout size={20} /> Salir
          </button>
        </div>
      </div>
    </header>
  );
}
