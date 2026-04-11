// src/components/shared/BottomSheet.jsx — Reusable slide-up bottom sheet

import { useEffect, useRef } from 'react';
import styles from './BottomSheet.module.css';

/**
 * @param {{ title: string, onClose: Function, children: React.ReactNode, showConfirm?: boolean, confirmLabel?: string, onConfirm?: Function }} props
 */
export function BottomSheet({ title, onClose, children, showConfirm, confirmLabel = 'Save', onConfirm }) {
  const sheetRef = useRef(null);
  const startY = useRef(null);
  const currentY = useRef(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleDragStart = (e) => {
    startY.current = e.touches ? e.touches[0].clientY : e.clientY;
  };
  const handleDragMove = (e) => {
    if (startY.current === null) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = y - startY.current;
    if (delta > 0 && sheetRef.current) {
      currentY.current = delta;
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  };
  const handleDragEnd = () => {
    if (currentY.current > 80) onClose();
    else if (sheetRef.current) sheetRef.current.style.transform = '';
    startY.current = null;
    currentY.current = 0;
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        ref={sheetRef}
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          className={styles.handle}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        />
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={styles.divider} />
        <div className={styles.content}>{children}</div>
        {showConfirm && (
          <button className={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
        )}
      </div>
    </div>
  );
}
