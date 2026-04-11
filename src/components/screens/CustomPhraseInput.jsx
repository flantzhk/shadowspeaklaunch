// src/components/screens/CustomPhraseInput.jsx — Add a custom phrase

import { useState, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { textToJyutping, textToSpeech } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { saveLibraryEntry } from '../../services/storage';
import { cacheAudioBlob } from '../../services/audio';
import { SRS_INITIAL_EASE } from '../../utils/constants';
import { sanitizeInput } from '../../utils/validators';
import { jyutpingToDisplay } from '../../utils/jyutping';
import styles from './CustomPhraseInput.module.css';

/**
 * @param {{ onBack: Function, showToast: Function }} props
 */
export default function CustomPhraseInput({ onBack, showToast }) {
  const { settings } = useAppContext();
  const isOnline = useOnlineStatus();
  const [chinese, setChinese] = useState('');
  const [english, setEnglish] = useState('');
  const [jyutping, setJyutping] = useState('');
  const [romanization, setRomanization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [phase, setPhase] = useState('input'); // input | preview | saved

  const handleLookup = useCallback(async () => {
    const text = sanitizeInput(chinese);
    if (!text) return;
    if (!isOnline) { showToast?.('Requires internet', 'error'); return; }

    setIsLoading(true);
    try {
      const result = await textToJyutping(text);
      if (result.success && result.result) {
        const jp = result.result.map(r => r.jyutping).join(' ');
        setJyutping(jp);
        setRomanization(jyutpingToDisplay(jp));
      }

      if (isAuthenticated()) {
        const blob = await textToSpeech(text, {
          language: settings.currentLanguage, speed: 1.0,
          outputExtension: 'mp3', turbo: true,
        });
        setAudioBlob(blob);
      }
      setPhase('preview');
    } catch (err) {
      showToast?.('Failed to look up phrase', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [chinese, isOnline, settings.currentLanguage, showToast]);

  const handlePlayAudio = useCallback(() => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  const handleSave = useCallback(async () => {
    const phraseId = `custom-${Date.now()}`;
    try {
      await saveLibraryEntry({
        phraseId, type: 'phrase', addedAt: Date.now(),
        source: 'custom',
        customData: { chinese: sanitizeInput(chinese), jyutping, english: sanitizeInput(english) },
        interval: 0, easeFactor: SRS_INITIAL_EASE, nextReviewAt: Date.now(),
        lastPracticedAt: null, practiceCount: 0, status: 'learning',
        bestScore: null, lastScore: null, scoreHistory: [],
      });

      if (audioBlob) {
        await cacheAudioBlob(phraseId, settings.currentLanguage, 1.0, audioBlob);
      }

      setPhase('saved');
      showToast?.('Saved to library', 'success');
    } catch (err) {
      showToast?.('Failed to save', 'error');
    }
  }, [chinese, english, jyutping, audioBlob, settings.currentLanguage, showToast]);

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.title}>Add Custom Phrase</h1>
      </div>

      <div className={styles.form}>
        <label className={styles.field}>
          <span className={styles.label}>Chinese text</span>
          <input className={styles.input} type="text" value={chinese}
            onChange={e => setChinese(e.target.value)} placeholder="e.g. 你食咗飯未"
            lang="yue" disabled={phase !== 'input'} />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>English meaning (optional)</span>
          <input className={styles.input} type="text" value={english}
            onChange={e => setEnglish(e.target.value)} placeholder="e.g. Have you eaten yet?"
            disabled={phase !== 'input'} />
        </label>

        {phase === 'input' && (
          <button className={styles.lookupBtn} onClick={handleLookup}
            disabled={!chinese.trim() || isLoading}>
            {isLoading ? 'Looking up...' : 'Look up Jyutping'}
          </button>
        )}

        {phase === 'preview' && (
          <div className={styles.preview}>
            <div className={styles.previewCard}>
              <p className={styles.previewRoman}>{romanization}</p>
              <p className={styles.previewJyutping}>{jyutping}</p>
              <p className={styles.previewChinese} lang="yue">{chinese}</p>
              {english && <p className={styles.previewEnglish}>{english}</p>}
            </div>

            {audioBlob && (
              <button className={styles.playBtn} onClick={handlePlayAudio}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Play
              </button>
            )}

            <div className={styles.actions}>
              <button className={styles.editBtn} onClick={() => setPhase('input')}>Edit</button>
              <button className={styles.saveBtn} onClick={handleSave}>Save to Library</button>
            </div>
          </div>
        )}

        {phase === 'saved' && (
          <div className={styles.savedMsg}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p>Added to your library</p>
            <button className={styles.addAnother} onClick={() => {
              setChinese(''); setEnglish(''); setJyutping(''); setRomanization('');
              setAudioBlob(null); setPhase('input');
            }}>Add another</button>
          </div>
        )}
      </div>
    </div>
  );
}
