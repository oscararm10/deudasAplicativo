import React, { useState } from 'react';
import { debtService } from '../services/api';
import { useDebtStore } from '../store';
import { formatCurrency, formatDate } from '../utils/helpers';
import { MdEdit, MdDelete, MdCheckCircle } from 'react-icons/md';
import styles from './DebtList.module.css';

export function DebtList({ debts, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const removeDebt = useDebtStore((state) => state.removeDebt);
  const updateDebtInStore = useDebtStore((state) => state.updateDebtInStore);

  const handleDelete = async (debtId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta deuda?')) {
      try {
        await debtService.deleteDebt(debtId);
        removeDebt(debtId);
      } catch (err) {
        alert('Error al eliminar deuda');
      }
    }
  };

  const handleMarkPaid = async (debtId) => {
    try {
      const response = await debtService.markAsPaid(debtId);
      updateDebtInStore(response.data.debt);
    } catch (err) {
      alert('Error al marcar como pagada');
    }
  };

  const handleEditStart = (debt) => {
    setEditingId(debt.id);
    setEditData({
      description: debt.description,
      amount: debt.amount,
      dueDate: debt.due_date || '',
    });
  };

  const handleEditSave = async (debtId) => {
    try {
      const response = await debtService.updateDebt(
        debtId,
        editData.description,
        parseFloat(editData.amount),
        editData.dueDate || null
      );
      updateDebtInStore(response.data.debt);
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar deuda');
    }
  };

  if (debts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay deudas registradas</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {debts.map((debt) => (
        <div key={debt.id} className={`${styles.item} ${debt.is_paid ? styles.paid : ''}`}>
          {editingId === debt.id ? (
            <div className={styles.editForm}>
              <input
                type="text"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
              <input
                type="number"
                step="0.01"
                value={editData.amount}
                onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
              />
              <input
                type="date"
                value={editData.dueDate}
                onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
              />
              <div className={styles.editButtons}>
                <button
                  className={styles.saveBtn}
                  onClick={() => handleEditSave(debt.id)}
                >
                  Guardar
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setEditingId(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.content}>
                <h3 className={styles.description}>{debt.description}</h3>
                <p className={styles.amount}>{formatCurrency(debt.amount)}</p>
                {debt.due_date && (
                  <p className={styles.dueDate}>Vence: {formatDate(debt.due_date)}</p>
                )}
                <p className={styles.status}>
                  {debt.is_paid ? '✓ Pagada' : 'Pendiente'}
                </p>
              </div>
              <div className={styles.actions}>
                {!debt.is_paid && (
                  <>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleMarkPaid(debt.id)}
                      title="Marcar como pagada"
                    >
                      <MdCheckCircle size={20} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditStart(debt)}
                      title="Editar"
                    >
                      <MdEdit size={20} />
                    </button>
                  </>
                )}
                <button
                  className={styles.actionBtn}
                  onClick={() => handleDelete(debt.id)}
                  title="Eliminar"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
