// src/components/screens/AIConversation.jsx — AI chat partner

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useRecorder } from '../../hooks/useRecorder';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { speechToText, scorePronunciation } from '../../services/api';
import { isAuthenticated } from '../../services/auth';
import { getScenarios, sendMessage, generateResponseAudio } from '../../services/aiChat';
import { saveLibraryEntry } from '../../services/storage';
import { SRS_INITIAL_EASE } from '../../utils/constants';
import { ScoreBadge } from '../cards/ScoreBadge';
import { RecordButton } from '../shared/RecordButton';
import styles from './AIConversation.module.css';

/**
 * @param {{ onBack: Function, showToast: Function }} props
 */
export default function AIConversation({ onBack, showToast }) {
  const { settings } = useAppContext();
  const { isRecording, startRecording, stopRecording, error: micError } = useRecorder();
  const isOnline = useOnlineStatus();
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState('select'); // select|chat|recording|review
  const [isThinking, setIsThinking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [userScore, setUserScore] = useState(null);
  const [inputMode, setInputMode] = useState('voice'); // voice|text
  const [textInput, setTextInput] = useState('');
  const [savedMsgIds, setSavedMsgIds] = useState(new Set());
  const chatRef = useRef(null);
  const audioRef = useRef(new Audio());

  useEffect(() => { return () => audioRef.current.pause(); }, []);
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!isOnline) {
    return (
      <div className={styles.screen}>
        <div className={styles.offline}>
          <p>AI conversation requires internet</p>
          <button className={styles.backBtn} onClick={onBack}>Go back</button>
        </div>
      </div>
    );
  }

  const handleSelectScenario = useCallback(async (s) => {
    setScenario(s); setPhase('chat'); setMessages([]);
    setIsThinking(true);
    try {
      const reply = await sendMessage([], s);
      const blob = await generateResponseAudio(reply.chinese);
      setMessages([{ role: 'assistant', ...reply }]);
      if (blob) playAudio(blob);
    } catch (err) { showToast?.('Failed to start', 'error'); }
    setIsThinking(false);
  }, [showToast]);

  const playAudio = useCallback((blob) => {
    const url = URL.createObjectURL(blob);
    audioRef.current.src = url;
    audioRef.current.play().catch(() => {});
    audioRef.current.onended = () => URL.revokeObjectURL(url);
  }, []);

  const handleRecord = useCallback(async () => {
    audioRef.current.pause();
    await startRecording(); setPhase('recording');
  }, [startRecording]);

  const handleStopRecord = useCallback(async () => {
    const blob = await stopRecording();
    if (!blob) return;
    setPhase('chat'); setUserTranscript(''); setUserScore(null);

    if (isAuthenticated()) {
      try {
        const stt = await speechToText(blob);
        setUserTranscript(stt.text || '');
        const userMsg = { role: 'user', chinese: stt.text || '', jyutping: '', romanization: '', english: '' };
        const newMsgs = [...messages, userMsg];
        setMessages(newMsgs);

        setIsThinking(true);
        const reply = await sendMessage(newMsgs, scenario);
        const audioBlob = await generateResponseAudio(reply.chinese);
        setMessages(prev => [...prev, { role: 'assistant', ...reply }]);
        if (audioBlob) playAudio(audioBlob);
        setIsThinking(false);
      } catch (err) {
        showToast?.('Something went wrong', 'error');
        setIsThinking(false);
      }
    }
  }, [stopRecording, messages, scenario, playAudio, showToast]);

  const handleEndChat = useCallback(() => { setPhase('review'); }, []);

  const handleSavePhrase = useCallback(async (msg, idx) => {
    const phraseId = `ai-${Date.now()}`;
    try {
      await saveLibraryEntry({
        phraseId, type: 'phrase', addedAt: Date.now(), source: 'ai-conversation',
        customData: { chinese: msg.chinese, jyutping: msg.jyutping, english: msg.english },
        interval: 0, easeFactor: SRS_INITIAL_EASE, nextReviewAt: Date.now(),
        lastPracticedAt: null, practiceCount: 0, status: 'learning',
        bestScore: null, lastScore: null, scoreHistory: [],
      });
      if (idx != null) setSavedMsgIds(prev => new Set([...prev, idx]));
      showToast?.('Saved to library', 'success');
    } catch (err) { showToast?.('Failed to save', 'error'); }
  }, [showToast]);

  const handleTextSend = useCallback(async () => {
    const text = textInput.trim();
    if (!text || isThinking) return;
    setTextInput('');
    const userMsg = { role: 'user', chinese: text, jyutping: '', romanization: text, english: '', inputMode: 'text' };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setIsThinking(true);
    try {
      const reply = await sendMessage(newMsgs, scenario);
      const audioBlob = await generateResponseAudio(reply.chinese);
      setMessages(prev => [...prev, { role: 'assistant', ...reply }]);
      if (audioBlob) playAudio(audioBlob);
    } catch (err) { showToast?.('Something went wrong', 'error'); }
    setIsThinking(false);
  }, [textInput, isThinking, messages, scenario, playAudio, showToast]);

  if (phase === 'select') {
    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onBack} aria-label="Back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className={styles.title}>AI Conversation</h1>
        </div>
        <p className={styles.subtitle}>Pick a scenario to practice</p>
        <div className={styles.scenarioList}>
          {getScenarios().map(s => (
            <button key={s.id} className={styles.scenarioCard} onClick={() => handleSelectScenario(s)}>
              <span className={styles.scenarioTitle}>{s.title}</span>
              <span className={styles.scenarioDesc}>{s.description}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'review') {
    const userMsgs = messages.filter(m => m.role === 'user');
    const totalTurns = userMsgs.length;
    const sessionTime = 0; // rough — no timer in AI chat currently

    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={onBack} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h1 className={styles.title}>Conversation Review</h1>
          <div style={{ width: 44 }} />
        </div>

        <div className={styles.reviewIconWrap}>
          <div className={styles.reviewSuccessCircle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-dark)" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <p className={styles.reviewTitle}>Conversation complete</p>
        {scenario?.title && <p className={styles.reviewScenario}>Scenario: {scenario.title}</p>}

        <div className={styles.reviewStatRow}>
          <div className={styles.reviewStat}>
            <span className={styles.reviewStatNum}>{totalTurns}</span>
            <span className={styles.reviewStatLabel}>turns</span>
          </div>
        </div>

        <p className={styles.reviewSectionLabel}>TRANSCRIPT</p>
        <div className={styles.reviewList}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.reviewBubble} ${msg.role === 'user' ? styles.reviewUserBubble : styles.reviewAiBubble}`}>
              <span className={styles.reviewSpeaker}>{msg.role === 'user' ? 'You' : 'AI'}</span>
              <p className={styles.reviewChinese} lang="yue">{msg.chinese}</p>
              {msg.romanization && msg.role === 'user' && <p className={styles.reviewRoman}>{msg.romanization}</p>}
              {msg.english && <p className={styles.reviewEnglish}>{msg.english}</p>}
              {msg.role === 'user' && !savedMsgIds.has(i) && (
                <button className={styles.saveMsgBtn} onClick={() => handleSavePhrase(msg, i)}>
                  + Save
                </button>
              )}
              {msg.role === 'user' && savedMsgIds.has(i) && (
                <span className={styles.savedLabel}>✓ Saved</span>
              )}
            </div>
          ))}
        </div>

        <div className={styles.reviewActions}>
          <button className={styles.tryAnotherBtn} onClick={() => { setPhase('select'); setScenario(null); setMessages([]); setSavedMsgIds(new Set()); }}>
            Try another scenario
          </button>
          <button className={styles.reviewDoneBtn} onClick={onBack}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <button className={styles.closeBtn} onClick={handleEndChat} aria-label="End">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2 className={styles.scenarioLabel}>{scenario?.title}</h2>
        <button className={styles.endBtn} onClick={handleEndChat}>End</button>
      </div>

      <div className={styles.chatArea} ref={chatRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble}`}>
            {msg.romanization && <p className={styles.bubbleRoman}>{msg.romanization}</p>}
            <p className={styles.bubbleChinese} lang="yue">{msg.chinese}</p>
            {msg.english && <p className={styles.bubbleEnglish}>{msg.english}</p>}
          </div>
        ))}
        {isThinking && <div className={styles.thinking}>Thinking...</div>}
      </div>

      <div className={styles.inputArea}>
        {inputMode === 'text' ? (
          <>
            <div className={styles.textInputRow}>
              <input
                className={styles.textInput}
                type="text"
                placeholder="Type in Cantonese..."
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTextSend()}
                autoFocus
              />
              <button
                className={`${styles.sendBtn} ${textInput.trim() ? styles.sendBtnActive : ''}`}
                onClick={handleTextSend}
                disabled={!textInput.trim() || isThinking}
                aria-label="Send"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" fill="none" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <button className={styles.switchModeBtn} onClick={() => setInputMode('voice')}>
              🎤 Speak instead
            </button>
          </>
        ) : (
          <>
            {phase === 'recording' ? (
              <RecordButton isRecording={isRecording} onStart={handleRecord} onStop={handleStopRecord} error={micError} />
            ) : (
              <RecordButton isRecording={false} onStart={handleRecord} onStop={() => {}} error={micError} />
            )}
            <button className={styles.switchModeBtn} onClick={() => setInputMode('text')}>
              ⌨️ Type instead
            </button>
          </>
        )}
      </div>
    </div>
  );
}
