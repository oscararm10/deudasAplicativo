import React, { useEffect, useState } from 'react';
import { debtService } from '../services/api';
import { useAuthStore, useDebtStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { DebtForm } from '../components/DebtForm';
import { DebtList } from '../components/DebtList';
import { formatCurrency } from '../utils/helpers';
import { MdLogout, MdDownload } from 'react-icons/md';
import styles from './DebtsPage.module.css';

export function DebtsPage() {
  const [aggregations, setAggregations] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const debts = useDebtStore((state) => state.debts);
  const setDebts = useDebtStore((state) => state.setDebts);
  const filter = useDebtStore((state) => state.filter);
  const setFilter = useDebtStore((state) => state.setFilter);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDebts();
    fetchAggregations();
  }, [user, filter, navigate]);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await debtService.getDebts(filter);
      setDebts(response.data.debts);
    } catch (err) {
      console.error('Error fetching debts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAggregations = async () => {
    try {
      const response = await debtService.getAggregations();
      setAggregations(response.data.aggregations);
    } catch (err) {
      console.error('Error fetching aggregations:', err);
    }
  };

  const handleExport = async (format) => {
    try {
      if (format === 'json') {
        const response = await debtService.exportJSON();
        const element = document.createElement('a');
        element.href = URL.createObjectURL(
          new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        );
        element.download = 'deudas.json';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else if (format === 'csv') {
        const response = await debtService.exportCSV();
        const element = document.createElement('a');
        element.href = URL.createObjectURL(
          new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
        );
        element.download = 'deudas.csv';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (err) {
      alert('Error al exportar');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredDebts = debts.filter((debt) => {
    if (filter === true) return debt.is_paid;
    if (filter === false) return !debt.is_paid;
    return true;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Gestor de Deudas</h1>
          <p>Hola, {user?.name}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.exportButtons}>
            <button
              className={styles.exportBtn}
              onClick={() => handleExport('json')}
              title="Descargar JSON"
            >
              <MdDownload size={20} /> JSON
            </button>
            <button
              className={styles.exportBtn}
              onClick={() => handleExport('csv')}
              title="Descargar CSV"
            >
              <MdDownload size={20} /> CSV
            </button>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <MdLogout size={20} /> Salir
          </button>
        </div>
      </header>

      {aggregations && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Total Deudas</h3>
            <p className={styles.statValue}>{aggregations.total_debts}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pendientes</h3>
            <p className={styles.statValue}>{aggregations.pending_count}</p>
            <p className={styles.statAmount}>{formatCurrency(aggregations.pending_total || 0)}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pagadas</h3>
            <p className={styles.statValue}>{aggregations.paid_count}</p>
            <p className={styles.statAmount}>{formatCurrency(aggregations.paid_total || 0)}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total</h3>
            <p className={styles.statAmount}>{formatCurrency(aggregations.total_amount || 0)}</p>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <DebtForm onSuccess={fetchDebts} />
        </div>

        <div className={styles.main}>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${filter === null ? styles.active : ''}`}
              onClick={() => setFilter(null)}
            >
              Todas
            </button>
            <button
              className={`${styles.filterBtn} ${filter === false ? styles.active : ''}`}
              onClick={() => setFilter(false)}
            >
              Pendientes
            </button>
            <button
              className={`${styles.filterBtn} ${filter === true ? styles.active : ''}`}
              onClick={() => setFilter(true)}
            >
              Pagadas
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>Cargando deudas...</div>
          ) : (
            <DebtList debts={filteredDebts} onRefresh={fetchDebts} />
          )}
        </div>
      </div>
    </div>
  );
}
