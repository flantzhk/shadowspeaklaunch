// src/components/shared/ConfirmModal.jsx — Generic confirmation/info modal

import styles from './ConfirmModal.module.css';

/**
 * @param {{ title: string, body: string, confirmLabel?: string, cancelLabel?: string, destructive?: boolean, onConfirm: Function, onCancel: Function }} props
 */
export function ConfirmModal({ title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false, onConfirm, onCancel }) {
  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>
        {body && <p className={styles.body}>{body}</p>}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
          <button
            className={`${styles.confirmBtn} ${destructive ? styles.destructive : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
