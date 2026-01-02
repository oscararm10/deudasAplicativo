import React from 'react';
import styles from './Loading.module.css';

export function Loading({ message = 'Cargando...' }) {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner}></div>
      <p>{message}</p>
    </div>
  );
}
