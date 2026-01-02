import React, { useState } from 'react';
import { debtService } from '../services/api';
import { useDebtStore } from '../store';
import styles from './DebtForm.module.css';

export function DebtForm({ onSuccess }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const addDebt = useDebtStore((state) => state.addDebt);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description || !amount) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    setLoading(true);

    try {
      const response = await debtService.createDebt(
        description,
        parseFloat(amount),
        dueDate || null
      );
      const { debt } = response.data;
      addDebt(debt);
      setDescription('');
      setAmount('');
      setDueDate('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear deuda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Nueva Deuda</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="description">Descripción</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Préstamo de Juan"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="amount">Monto</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="dueDate">Fecha de Vencimiento (opcional)</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Creando...' : 'Crear Deuda'}
        </button>
      </form>
    </div>
  );
}
