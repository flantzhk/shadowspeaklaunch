// src/components/screens/TopicDetailScreen.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import { getLibraryEntry, saveLibraryEntry } from '../../services/storage';
import { cacheAudioForPhrase } from '../../services/audio';
import { SRS_INITIAL_EASE } from '../../utils/constants';
import { loadDialoguesForTopic } from '../../services/dialogueLoader';
import PhraseCard from '../cards/PhraseCard';
import styles from './TopicDetailScreen.module.css';

/**
 * Topic detail screen showing all phrases with play + save.
 * @param {{ topicId: string, onBack: Function, showToast: Function, onStartScene: Function }} props
 */
export default function TopicDetailScreen({ topicId, onBack, showToast, onStartScene }) {
  const { settings } = useAppContext();
  const { loadQueue, play, isPlaying, pause } = useAudio();
  const [topic, setTopic] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [libraryEntries, setLibraryEntries] = useState({});
  const [dialogues, setDialogues] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [downloadDone, setDownloadDone] = useState(false);
  const cancelRef = useRef({ cancelled: false });

  useEffect(() => {
    async function load() {
      const modules = import.meta.glob('../../data/topics/cantonese/*.json', { eager: true });
      const found = Object.values(modules)
        .flatMap(m => m.default || m)
        .find(t => t.id === topicId);
      if (found) {
        setTopic(found);
        const saved = new Set();
        const entries = {};
        for (const phrase of found.phrases) {
          const entry = await getLibraryEntry(phrase.id);
          if (entry) { saved.add(phrase.id); entries[phrase.id] = entry; }
        }
        setSavedIds(saved);
        setLibraryEntries(entries);
        loadDialoguesForTopic(topicId).then(setDialogues);
      }
    }
    load();
  }, [topicId]);

  const handleDownloadTopic = useCallback(async () => {
    if (!topic) return;
    if (downloadProgress) {
      cancelRef.current.cancelled = true;
      setDownloadProgress(null);
      return;
    }
    cancelRef.current = { cancelled: false };
    const total = topic.phrases.length;
    setDownloadProgress({ done: 0, total });
    for (let i = 0; i < topic.phrases.length; i++) {
      if (cancelRef.current.cancelled) break;
      await cacheAudioForPhrase(topic.phrases[i], settings.currentLanguage).catch(() => {});
      setDownloadProgress({ done: i + 1, total });
    }
    if (!cancelRef.current.cancelled) setDownloadDone(true);
    setDownloadProgress(null);
  }, [topic, downloadProgress, settings.currentLanguage]);

  const handlePlayTopic = useCallback(async () => {
    if (!topic) return;
    if (isPlaying) { pause(); return; }
    const topicMeta = { name: topic.name, imageUrl: topic.imageUrl, imageGradient: topic.imageGradient };
    await loadQueue(topic.phrases, settings.currentLanguage, null, topicMeta);
    await play();
  }, [topic, loadQueue, play, pause, isPlaying, settings.currentLanguage]);

  const handleSave = useCallback(async (phrase) => {
    try {
      await saveLibraryEntry({
        phraseId: phrase.id, type: 'phrase', addedAt: Date.now(), source: 'browse',
        customData: null, interval: 0, easeFactor: SRS_INITIAL_EASE,
        nextReviewAt: Date.now(), lastPracticedAt: null, practiceCount: 0,
        status: 'learning', bestScore: null, lastScore: null, scoreHistory: [],
      });
      setSavedIds(prev => new Set([...prev, phrase.id]));
      showToast?.('Saved to library', 'success');
      cacheAudioForPhrase(phrase, settings.currentLanguage).catch(() => {});
    } catch {
      showToast?.('Failed to save', 'error');
    }
  }, [showToast, settings.currentLanguage]);

  if (!topic) {
    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack} aria-label="Go back"><BackIcon /></button>
        </div>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  const savedCount = topic.phrases.filter(p => savedIds.has(p.id)).length;
  const masteredCount = topic.phrases.filter(p => libraryEntries[p.id]?.status === 'mastered').length;
  const progressPercent = topic.phrases.length > 0 ? (masteredCount / topic.phrases.length) * 100 : 0;

  return (
    <div className={styles.screen}>
      {/* Header — back left, download icon right, NO title (hero carries it) */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back"><BackIcon /></button>
        <button
          className={`${styles.downloadIconBtn} ${downloadDone ? styles.downloadIconBtnDone : ''}`}
          onClick={handleDownloadTopic}
          aria-label={downloadDone ? 'Downloaded' : 'Download for offline'}
          title={downloadDone ? 'Downloaded' : 'Download for offline'}
        >
          {downloadProgress
            ? <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-brand-lime)' }}>{downloadProgress.done}/{downloadProgress.total}</span>
            : downloadDone
              ? <DownloadDoneIcon />
              : <DownloadIcon />
          }
        </button>
      </div>

      {/* Hero — full bleed image with title + progress overlaid */}
      <div
        className={styles.hero}
        style={{
          background: topic.imageUrl
            ? `linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.65) 100%), url(${topic.imageUrl}) center/cover`
            : topic.imageGradient,
        }}
      >
        <h1 className={styles.heroTitle}>{topic.name}</h1>
        <div className={styles.heroMeta}>
          <span className={styles.heroCount}>{topic.phraseCount} phrases</span>
          {topic.description && (
            <>
              <span className={styles.heroDot} />
              <span className={styles.heroDesc}>{topic.description}</span>
            </>
          )}
        </div>
        <div className={styles.progressRow}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <span className={styles.progressLabel}>{masteredCount}/{topic.phrases.length} mastered</span>
        </div>
      </div>

      {/* Download progress (compact inline banner) */}
      {downloadProgress && (
        <div className={styles.downloadBanner}>
          <div className={styles.downloadBannerText}>
            <p className={styles.downloadTitle}>Saving audio for offline…</p>
            <p className={styles.downloadMeta}>{downloadProgress.done} of {downloadProgress.total} phrases</p>
            <div className={styles.downloadBarTrack}>
              <div className={styles.downloadBarFill} style={{ width: `${(downloadProgress.done / downloadProgress.total) * 100}%` }} />
            </div>
          </div>
          <button className={styles.cancelDownload} onClick={handleDownloadTopic}>Cancel</button>
        </div>
      )}

      {downloadDone && !downloadProgress && (
        <div className={styles.downloadDone}>
          <span>✓</span> Available offline
        </div>
      )}

      {/* Primary CTA */}
      <button className={styles.playAllBtn} onClick={handlePlayTopic}>
        {isPlaying
          ? <><PauseShape />Pause</>
          : <><span className={styles.playAllIcon} />Play all phrases</>
        }
      </button>

      {/* Phrase list */}
      <div className={styles.phraseListHeader}>
        <span className={styles.phraseListTitle}>Phrases</span>
        <span className={styles.phraseListCount}>{savedCount} saved</span>
      </div>

      <div className={styles.phraseList}>
        {topic.phrases.map(phrase => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            libraryEntry={libraryEntries[phrase.id] || null}
            onPlay={(chinese) => {
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(chinese);
                u.lang = 'zh-HK'; u.rate = 0.8;
                window.speechSynthesis.speak(u);
              }
            }}
            onSaved={async (id) => {
              setSavedIds(prev => new Set([...prev, id]));
              // Refresh entry so mastered count updates live
              const refreshed = await getLibraryEntry(id);
              if (refreshed) setLibraryEntries(prev => ({ ...prev, [id]: refreshed }));
            }}
            showToast={showToast}
          />
        ))}
      </div>

      {dialogues.length > 0 && (
        <div className={styles.dialogueSection}>
          <h3 className={styles.dialogueTitle}>Dialogue Scenes</h3>
          {dialogues.map(scene => (
            <button key={scene.id} className={styles.sceneCard} onClick={() => onStartScene?.(scene)}>
              <span className={styles.sceneTitle}>{scene.title}</span>
              <span className={styles.sceneDesc}>{scene.description}</span>
              <span className={styles.sceneTurns}>{scene.turns.length} turns</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>;
const DownloadIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const DownloadDoneIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const PauseShape = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:8}}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
