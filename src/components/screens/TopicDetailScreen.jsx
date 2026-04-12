// src/components/screens/TopicDetailScreen.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { useAppContext } from '../../contexts/AppContext';
import { getLibraryEntry, saveLibraryEntry } from '../../services/storage';
import { cacheAudioForPhrase } from '../../services/audio';
import { SRS_INITIAL_EASE } from '../../utils/constants';
import { loadDialoguesForTopic } from '../../services/dialogueLoader';
import styles from './TopicDetailScreen.module.css';

/**
 * Topic detail screen showing all phrases with play + save.
 * @param {{ topicId: string, onBack: Function, showToast: Function, onStartScene: Function }} props
 */
export default function TopicDetailScreen({ topicId, onBack, showToast, onStartScene }) {
  const { settings } = useAppContext();
  const { loadQueue, play, currentPhrase, isPlaying, pause } = useAudio();
  const [topic, setTopic] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [dialogues, setDialogues] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState(null); // null | {done, total}
  const [downloadDone, setDownloadDone] = useState(false);
  const [expandedPhraseId, setExpandedPhraseId] = useState(null);
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
        for (const phrase of found.phrases) {
          const entry = await getLibraryEntry(phrase.id);
          if (entry) saved.add(phrase.id);
        }
        setSavedIds(saved);
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
    if (isPlaying) {
      pause();
      return;
    }
    await loadQueue(topic.phrases, settings.currentLanguage);
    await play();
  }, [topic, loadQueue, play, pause, isPlaying, settings.currentLanguage]);

  const handlePlayPhrase = useCallback(async (phrase) => {
    if (!topic) return;
    await loadQueue([phrase], settings.currentLanguage);
    await play();
  }, [topic, loadQueue, play, settings.currentLanguage]);

  const handlePlayWord = useCallback((e, chinese) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chinese);
      utterance.lang = 'zh-HK';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleSave = useCallback(async (phrase) => {
    try {
      await saveLibraryEntry({
        phraseId: phrase.id,
        type: 'phrase',
        addedAt: Date.now(),
        source: 'browse',
        customData: null,
        interval: 0,
        easeFactor: SRS_INITIAL_EASE,
        nextReviewAt: Date.now(),
        lastPracticedAt: null,
        practiceCount: 0,
        status: 'learning',
        bestScore: null,
        lastScore: null,
        scoreHistory: [],
      });
      setSavedIds(prev => new Set([...prev, phrase.id]));
      showToast?.('Saved to library', 'success');
      cacheAudioForPhrase(phrase, settings.currentLanguage).catch(() => {});
    } catch (error) {
      showToast?.('Failed to save', 'error');
    }
  }, [showToast, settings.currentLanguage]);

  if (!topic) {
    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
            <BackIcon />
          </button>
        </div>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  const savedCount = topic.phrases.filter(p => savedIds.has(p.id)).length;
  const progressPercent = topic.phrases.length > 0
    ? (savedCount / topic.phrases.length) * 100
    : 0;

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <BackIcon />
        </button>
        <h1 className={styles.title}>{topic.name}</h1>
        <div style={{ width: 44 }} />
      </div>

      <div className={styles.hero} style={{
        background: topic.imageUrl
          ? `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.5) 100%), url(${topic.imageUrl}) center/cover`
          : topic.imageGradient
      }}>
        <h2 className={styles.heroTitle}>{topic.name}</h2>
        <p className={styles.heroCount}>{topic.phraseCount} phrases</p>
        <div className={styles.progressRow}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <span className={styles.progressLabel}>{savedCount}/{topic.phrases.length}</span>
        </div>
      </div>

      {topic.description && (
        <p className={styles.description}>{topic.description}</p>
      )}

      {/* Download progress banner */}
      {downloadProgress && (
        <div className={styles.downloadBanner}>
          <p className={styles.downloadTitle}>Downloading audio for offline...</p>
          <p className={styles.downloadMeta}>{downloadProgress.done} of {downloadProgress.total} phrases</p>
          <div className={styles.downloadBarTrack}>
            <div className={styles.downloadBarFill} style={{ width: `${(downloadProgress.done / downloadProgress.total) * 100}%` }} />
          </div>
          <button className={styles.cancelDownload} onClick={handleDownloadTopic}>Cancel download</button>
        </div>
      )}

      {downloadDone && !downloadProgress && (
        <div className={styles.downloadDone}>
          <span>✓</span> Downloaded for offline use
        </div>
      )}

      <div className={styles.topicActions}>
        <button className={styles.downloadBtn} onClick={handleDownloadTopic}>
          {downloadProgress ? `↓ ${downloadProgress.done}/${downloadProgress.total}` : downloadDone ? '✓ Downloaded' : '↓ Download offline'}
        </button>
        <button className={styles.startBtn} onClick={handlePlayTopic}>
          {isPlaying ? '⏸ Pause' : '▶ Play all phrases'}
        </button>
      </div>

      <div className={styles.phraseList}>
        {topic.phrases.map(phrase => {
          const isSaved = savedIds.has(phrase.id);
          const isActive = currentPhrase?.id === phrase.id;

          const isExpanded = expandedPhraseId === phrase.id;
          return (
            <div key={phrase.id} className={`${styles.phraseRow} ${isActive ? styles.active : ''}`}
              style={{ flexWrap: 'wrap' }}>
              <button
                className={styles.playBtn}
                onClick={() => isActive && isPlaying ? pause() : handlePlayPhrase(phrase)}
                aria-label={isActive && isPlaying ? 'Pause' : `Play ${phrase.english}`}
              >
                {isActive && isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </button>

              <button className={styles.phraseInfo} onClick={() => setExpandedPhraseId(isExpanded ? null : phrase.id)}
                style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', flex: 1, padding: 0, minWidth: 0 }}>
                <span className={styles.romanization}>{phrase.romanization}</span>
                <span className={styles.chinese} lang="yue">{phrase.chinese}</span>
                <span className={styles.english}>{phrase.english}</span>
              </button>

              <button
                className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
                onClick={() => !isSaved && handleSave(phrase)}
                disabled={isSaved}
                aria-label={isSaved ? 'Already saved' : 'Save to library'}
              >
                {isSaved ? (
                  <CheckIcon />
                ) : (
                  <PlusIcon />
                )}
              </button>

              {isExpanded && phrase.words && phrase.words.length > 0 && (
                <div style={{ flexBasis: '100%', display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 0 4px', marginTop: '8px', borderTop: '0.5px solid var(--color-border)' }}>
                  {phrase.words.map((word, i) => (
                    <button key={i} onClick={(e) => handlePlayWord(e, word.chinese)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '10px 14px', background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: '10px', cursor: 'pointer', minWidth: '60px' }}>
                      <span style={{ fontSize: '18px' }} lang="yue">{word.chinese}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-jyutping, #6b8f5e)' }}>{word.jyutping}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{word.english}</span>
                      <span style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>🔊</span>
                    </button>
                  ))}
                  {phrase.context && (
                    <p style={{ flexBasis: '100%', fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: '4px 0 0' }}>{phrase.context}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {dialogues.length > 0 && (
        <div className={styles.dialogueSection}>
          <h3 className={styles.dialogueTitle}>Dialogue Scenes</h3>
          {dialogues.map(scene => (
            <button key={scene.id} className={styles.sceneCard}
              onClick={() => onStartScene?.(scene)}>
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
const PlayIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-brand-dark)"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const PauseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-brand-dark)"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>;
