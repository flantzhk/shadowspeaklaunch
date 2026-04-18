// src/components/screens/CustomPhraseInput.jsx — Add a custom phrase

import { useState, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { textToJyutping, textToSpeech } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { saveLibraryEntry } from '../../services/storage';
import { cacheAudioBlob, padAudioBlob } from '../../services/audio';
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
  const [english, setEnglish] = useState('');
  const [jyutpingInput, setJyutpingInput] = useState('');
  const [chinese, setChinese] = useState('');
  const [jyutping, setJyutping] = useState('');
  const [romanization, setRomanization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [phase, setPhase] = useState('input'); // input | preview | saved
  const [showChinese, setShowChinese] = useState(false);

  const hasChinese = (text) => /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);

  const handleLookup = useCallback(async () => {
    const chineseText = sanitizeInput(chinese);
    if (!chineseText || !hasChinese(chineseText)) {
      showToast?.('Paste or type Chinese characters to look up pronunciation', 'info');
      return;
    }
    if (!isOnline) { showToast?.('Requires internet', 'error'); return; }

    setIsLoading(true);
    try {
      const result = await textToJyutping(chineseText);
      if (result.success && result.result) {
        const jp = result.result.map(r => r.jyutping).join(' ');
        setJyutping(jp);
        setJyutpingInput(jp);
        setRomanization(jyutpingToDisplay(jp));
      }

      if (isAuthenticated()) {
        const blob = await textToSpeech(chineseText, {
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

  const handleSaveDirectly = useCallback(async () => {
    // Save without API lookup — user provided English + optional Jyutping
    const eng = sanitizeInput(english);
    const jp = sanitizeInput(jyutpingInput);
    const ch = sanitizeInput(chinese);
    if (!eng && !jp && !ch) return;

    setJyutping(jp);
    setRomanization(jp ? jyutpingToDisplay(jp) : '');

    // If Chinese text exists and we're online, try to generate audio
    if (ch && hasChinese(ch) && isOnline && isAuthenticated()) {
      setIsLoading(true);
      try {
        const blob = await textToSpeech(ch, {
          language: settings.currentLanguage, speed: 1.0,
          outputExtension: 'mp3', turbo: true,
        });
        setAudioBlob(blob);
      } catch (err) { /* audio is optional */ }

      // Also look up Jyutping if not provided
      if (!jp) {
        try {
          const result = await textToJyutping(ch);
          if (result.success && result.result) {
            const autoJp = result.result.map(r => r.jyutping).join(' ');
            setJyutping(autoJp);
            setJyutpingInput(autoJp);
            setRomanization(jyutpingToDisplay(autoJp));
          }
        } catch (err) { /* jyutping is optional */ }
      }
      setIsLoading(false);
    }

    setPhase('preview');
  }, [english, jyutpingInput, chinese, isOnline, settings.currentLanguage]);

  const handlePlayAudio = useCallback(async () => {
    if (!audioBlob) return;
    const padded = await padAudioBlob(audioBlob);
    const url = URL.createObjectURL(padded);
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
        customData: {
          chinese: sanitizeInput(chinese) || '',
          jyutping: jyutping || sanitizeInput(jyutpingInput) || '',
          english: sanitizeInput(english) || '',
        },
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
  }, [chinese, english, jyutping, jyutpingInput, audioBlob, settings.currentLanguage, showToast]);

  const hasContent = english.trim() || jyutpingInput.trim() || chinese.trim();

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
          <span className={styles.label}>English meaning</span>
          <input className={styles.input} type="text" value={english}
            onChange={e => setEnglish(e.target.value)} placeholder="e.g. Have you eaten yet?"
            disabled={phase !== 'input'} />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Jyutping / romanization (optional)</span>
          <input className={styles.input} type="text" value={jyutpingInput}
            onChange={e => setJyutpingInput(e.target.value)} placeholder="e.g. nei5 sik6 zo2 faan6 mei6"
            disabled={phase !== 'input'} />
        </label>

        {showChinese ? (
          <label className={styles.field}>
            <span className={styles.label}>Chinese characters (optional — paste from a message)</span>
            <input className={styles.input} type="text" value={chinese}
              onChange={e => setChinese(e.target.value)} placeholder="e.g. 你食咗飯未"
              lang="yue" disabled={phase !== 'input'} />
          </label>
        ) : (
          <button
            className={styles.toggleChineseBtn}
            onClick={() => setShowChinese(true)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '13px', padding: '4px 0', cursor: 'pointer', textAlign: 'left' }}
            disabled={phase !== 'input'}
          >
            + Add Chinese characters (paste from a message)
          </button>
        )}

        {phase === 'input' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {chinese.trim() && hasChinese(chinese) && (
              <button className={styles.lookupBtn} onClick={handleLookup}
                disabled={isLoading}>
                {isLoading ? 'Looking up...' : 'Look up pronunciation'}
              </button>
            )}
            <button className={styles.lookupBtn} onClick={handleSaveDirectly}
              disabled={!hasContent || isLoading}
              style={{ background: 'var(--color-brand-dark)', color: 'white' }}>
              {isLoading ? 'Processing...' : 'Save phrase'}
            </button>
          </div>
        )}

        {phase === 'preview' && (
          <div className={styles.preview}>
            <div className={styles.previewCard}>
              {(romanization || jyutpingInput) && (
                <p className={styles.previewRoman}>{romanization || jyutpingToDisplay(jyutpingInput)}</p>
              )}
              {(jyutping || jyutpingInput) && (
                <p className={styles.previewJyutping}>{jyutping || jyutpingInput}</p>
              )}
              {chinese && <p className={styles.previewChinese} lang="yue">{chinese}</p>}
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
              setChinese(''); setEnglish(''); setJyutping(''); setJyutpingInput(''); setRomanization('');
              setAudioBlob(null); setPhase('input'); setShowChinese(false);
            }}>Add another</button>
          </div>
        )}
      </div>
    </div>
  );
}
