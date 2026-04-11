// src/components/screens/WordDetail.jsx — Item 27 (word/vocab detail bottom sheet)

import { useState } from 'react';
import { BottomSheet } from '../shared/BottomSheet';
import styles from './WordDetail.module.css';

const TONE_COLORS = { '1': '#2A5A10', '2': '#8BB82B', '3': '#E8A030', '4': '#D04040', '5': '#7A5A2A', '6': '#9A9A9A' };

/**
 * @param {{ phrase: object, onClose: Function, onSave: Function, onPlay: Function }} props
 */
export function WordDetail({ phrase, onClose, onSave, onPlay }) {
  const [tab, setTab] = useState('overview');

  if (!phrase) return null;

  const tones = (phrase.romanization || '').match(/[1-6]/g) || [];

  return (
    <BottomSheet title={phrase.english || phrase.romanization} onClose={onClose}>
      <div className={styles.phonetic}>
        {(phrase.romanization || '').split('').map((char, i) => (
          <span
            key={i}
            className={styles.phoneticChar}
            style={{ color: /[1-6]/.test(char) ? TONE_COLORS[char] : 'inherit' }}
          >
            {char}
          </span>
        ))}
      </div>

      {phrase.chinese && (
        <p className={styles.chinese} lang="yue">{phrase.chinese}</p>
      )}

      {phrase.english && (
        <p className={styles.english}>{phrase.english}</p>
      )}

      <div className={styles.actions}>
        <button className={styles.playBtn} onClick={() => onPlay?.(phrase)}>
          <PlayIcon /> Play
        </button>
        <button className={styles.saveBtn} onClick={() => onSave?.(phrase)}>
          + Save
        </button>
      </div>

      {phrase.examples && phrase.examples.length > 0 && (
        <div className={styles.examplesSection}>
          <p className={styles.examplesLabel}>EXAMPLES</p>
          {phrase.examples.map((ex, i) => (
            <div key={i} className={styles.exampleRow}>
              <p className={styles.exChinese}>{ex.chinese}</p>
              <p className={styles.exRoman}>{ex.romanization}</p>
              <p className={styles.exEnglish}>{ex.english}</p>
            </div>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
