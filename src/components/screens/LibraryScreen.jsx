// src/components/screens/LibraryScreen.jsx — Redesigned for clarity and quick action

import { useState, useEffect, useCallback } from 'react';
import { getAllLibraryEntries } from '../../services/storage';
import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import { ROUTES } from '../../utils/constants';
import PhraseCard from '../cards/PhraseCard';
import styles from './LibraryScreen.module.css';

export default function LibraryScreen({ onNavigate, showToast }) {
  const { settings } = useAppContext();
  const { loadQueue, play } = useAudio();
  const [entries, setEntries] = useState([]);
  const [phrases, setPhrases] = useState({});
  const [phraseTopics, setPhraseTopics] = useState({});
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = useState('phrases');

  const loadEntries = useCallback(async () => {
    const all = await getAllLibraryEntries();
    setEntries(all);
  }, []);

  useEffect(() => {
    async function load() {
      await loadEntries();
      const modules = import.meta.glob('../../data/topics/cantonese/*.json', { eager: true });
      const phraseMap = {};
      const topicMap = {};
      for (const mod of Object.values(modules)) {
        const raw = mod.default || mod;
        const topicList = Array.isArray(raw) ? raw : [raw];
        for (const topic of topicList) {
          for (const p of topic.phrases) {
            phraseMap[p.id] = p;
            topicMap[p.id] = topic.name;
          }
        }
      }
      setPhrases(phraseMap);
      setPhraseTopics(topicMap);
    }
    load();
  }, []);

  const now = new Date();
  const sorted = [...entries].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
  const byMode = sorted.filter(e => mode === 'phrases' ? e.type !== 'vocab' : e.type === 'vocab');

  const learningCount = byMode.filter(e => e.status === 'learning').length;
  const masteredCount = byMode.filter(e => e.status === 'mastered').length;
  const dueCount = byMode.filter(e => (e.practiceCount ?? 0) > 0 && e.nextReviewAt && new Date(e.nextReviewAt) <= now).length;

  const filtered = filter === 'all'
    ? byMode
    : filter === 'due'
      ? byMode.filter(e => (e.practiceCount ?? 0) > 0 && e.nextReviewAt && new Date(e.nextReviewAt) <= now)
      : byMode.filter(e => e.status === filter);

  const handlePlayAll = useCallback(async () => {
    const playable = filtered.map(entry => phrases[entry.phraseId]).filter(Boolean);
    if (playable.length > 0) {
      await loadQueue(playable, settings.currentLanguage);
      await play();
    }
  }, [filtered, phrases, loadQueue, play, settings.currentLanguage]);

  const handleReviewDue = useCallback(() => {
    onNavigate?.('practice');
  }, [onNavigate]);

  const progressPercent = byMode.length > 0
    ? Math.round((masteredCount / byMode.length) * 100)
    : 0;

  return (
    <div className={styles.screen}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>My Library</h1>
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeBtn} ${mode === 'phrases' ? styles.modeActive : ''}`}
              onClick={() => setMode('phrases')}
            >
              Phrases
            </button>
            <button
              className={`${styles.modeBtn} ${mode === 'vocab' ? styles.modeActive : ''}`}
              onClick={() => setMode('vocab')}
            >
              Vocab
            </button>
          </div>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => onNavigate?.(ROUTES.CUSTOM_PHRASE)}
          aria-label="Add a phrase"
        >
          <span className={styles.addBtnPlus}>+</span>
        </button>
      </div>

      {/* ── Stats row ── */}
      {byMode.length > 0 && (
        <div className={styles.statsRow}>
          <button className={styles.statBlock} onClick={() => setFilter('all')}>
            <span className={styles.statNum}>{byMode.length}</span>
            <span className={styles.statLabel}>Saved</span>
          </button>
          <div className={styles.statDivider} />
          <button className={styles.statBlock} onClick={() => setFilter('learning')}>
            <span className={`${styles.statNum} ${styles.statNumLearning}`}>{learningCount}</span>
            <span className={styles.statLabel}>Learning</span>
          </button>
          <div className={styles.statDivider} />
          <button className={styles.statBlock} onClick={() => setFilter('mastered')}>
            <span className={`${styles.statNum} ${styles.statNumMastered}`}>{masteredCount}</span>
            <span className={styles.statLabel}>Mastered</span>
          </button>
        </div>
      )}

      {/* ── Progress bar ── */}
      {byMode.length > 0 && (
        <div className={styles.progressBarWrap}>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <span className={styles.progressBarLabel}>{progressPercent}% mastered</span>
        </div>
      )}

      {/* ── Due-now CTA ── */}
      {dueCount > 0 && (
        <button className={styles.dueCard} onClick={handleReviewDue}>
          <div className={styles.dueDot} />
          <div className={styles.dueText}>
            <span className={styles.dueTitle}>{dueCount} phrase{dueCount !== 1 ? 's' : ''} ready for review</span>
            <span className={styles.dueSubtitle}>Practice now to lock them in</span>
          </div>
          <span className={styles.dueArrow}>›</span>
        </button>
      )}

      {/* ── Filter + Play row ── */}
      <div className={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'learning', label: 'Learning' },
          { key: 'mastered', label: 'Mastered' },
          { key: 'due', label: `Due${dueCount > 0 ? ` · ${dueCount}` : ''}` },
        ].map(f => (
          <button
            key={f.key}
            className={`${styles.filterButton} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Play all ── */}
      {filtered.length > 0 && mode === 'phrases' && (
        <button className={styles.playAllBtn} onClick={handlePlayAll}>
          <PlayIcon />
          Play {filtered.length} phrase{filtered.length !== 1 ? 's' : ''}
        </button>
      )}

      {/* ── Phrase list ── */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          {byMode.length === 0 ? (
            <>
              <div className={styles.emptyIcon}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <p className={styles.emptyTitle}>Nothing saved yet</p>
              <p className={styles.emptyText}>Browse topics and tap the bookmark on any phrase to save it here.</p>
              <button className={styles.emptyAction} onClick={() => onNavigate?.('home')}>
                Explore topics
              </button>
            </>
          ) : (
            <p className={styles.emptyText}>No phrases match this filter.</p>
          )}
        </div>
      ) : (
        <div className={styles.phraseList}>
          {filtered.map(entry => (
            <div key={entry.phraseId} className={styles.cardWrap}>
              {phraseTopics[entry.phraseId] && (
                <span className={styles.topicPill}>{phraseTopics[entry.phraseId]}</span>
              )}
              <PhraseCard
                phrase={phrases[entry.phraseId] || null}
                libraryEntry={entry}
                language={settings.currentLanguage}
                onSaved={loadEntries}
                showToast={showToast}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const PlayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
