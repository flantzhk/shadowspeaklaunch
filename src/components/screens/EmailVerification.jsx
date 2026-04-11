// src/components/screens/EmailVerification.jsx — Item 6

import { useState, useEffect } from 'react';
import { fbAuth } from '../../services/firebase';
import styles from './EmailVerification.module.css';

export default function EmailVerification({ onVerified, onBack }) {
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const user = fbAuth.currentUser;
  const email = user?.email || '';

  // Auto-poll every 10 seconds
  useEffect(() => {
    const timer = setInterval(async () => {
      if (!fbAuth.currentUser) return;
      await fbAuth.currentUser.reload();
      if (fbAuth.currentUser.emailVerified) {
        clearInterval(timer);
        onVerified?.();
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [onVerified]);

  const handleResend = async () => {
    if (!fbAuth.currentUser) return;
    try {
      await fbAuth.currentUser.sendEmailVerification();
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch {}
  };

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await fbAuth.currentUser?.reload();
      if (fbAuth.currentUser?.emailVerified) onVerified?.();
    } finally {
      setChecking(false);
    }
  };

  const handleOpenEmail = () => {
    window.location.href = 'mailto:';
  };

  return (
    <div className={styles.screen}>
      <button className={styles.closeBtn} onClick={onBack}>✕</button>

      <div className={styles.iconWrap}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-dark)" strokeWidth="2.5">
          <rect x="2" y="4" width="20" height="16" rx="3" />
          <polyline points="2,4 12,13 22,4" />
        </svg>
      </div>

      <h1 className={styles.title}>Check your email</h1>
      <p className={styles.body}>We sent a verification link to</p>
      <p className={styles.email}>{email}</p>
      <p className={styles.body2}>Tap the link in the email to activate your account.</p>

      <button className={styles.primaryBtn} onClick={handleOpenEmail}>Open email app</button>

      <div className={styles.linksSection}>
        <p className={styles.linkLabel}>Didn't get it?</p>
        <button className={styles.link} onClick={handleResend}>
          {resent ? 'Email sent!' : 'Resend verification email'}
        </button>

        <p className={styles.linkLabel} style={{ marginTop: 16 }}>Wrong email?</p>
        <button className={styles.link} onClick={onBack}>Change email</button>
      </div>

      <button className={styles.refreshBtn} onClick={handleRefresh} disabled={checking}>
        Already verified?{' '}
        <span className={styles.refreshLink}>{checking ? 'Checking...' : 'Refresh'}</span>
      </button>
    </div>
  );
}
