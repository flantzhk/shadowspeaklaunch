// src/components/screens/HomeScreen.jsx — Today's lesson, recent topics, categories

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useAudio } from '../../contexts/AudioContext';
import { getAllLibraryEntries } from '../../services/storage';
import { getLanguagePack, getTopicsForLanguage } from '../../services/languageManager';
import { hasPracticedToday } from '../../services/streak';
import styles from './HomeScreen.module.css';

// === Recent topics helpers (localStorage) ===
const RECENT_KEY = 'ss_recent_topics';

function saveRecentTopic(topicId) {
  try {
    const existing = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    const filtered = existing.filter(e => e.id !== topicId);
    const updated = [{ id: topicId, openedAt: Date.now() }, ...filtered].slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

function loadRecentTopics() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return 'Just now';
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return 'Today';
  const days = Math.floor(diff / 86400000);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

/**
 * Home screen with today's lesson hero, recent topics, category rows.
 * @param {{ onNavigate: Function }} props
 */
export default function HomeScreen({ onNavigate }) {
  const { settings } = useAppContext();
  const { loadQueue, play } = useAudio();
  const [topics, setTopics] = useState([]);
  const [libraryCount, setLibraryCount] = useState(0);
  const [duration, setDuration] = useState(30);
  const [streakAtRisk, setStreakAtRisk] = useState(false);
  const [streakDismissed, setStreakDismissed] = useState(false);
  const [topicProgress, setTopicProgress] = useState({});
  const [recentEntries, setRecentEntries] = useState([]); // [{ id, openedAt }]

  const langPack = getLanguagePack(settings.currentLanguage);

  useEffect(() => {
    const loadedTopics = getTopicsForLanguage(settings.currentLanguage);
    setTopics(loadedTopics);
    getAllLibraryEntries().then(entries => {
      setLibraryCount(entries.length);
      const savedIds = new Set(entries.map(e => e.phraseId));
      const progress = {};
      for (const topic of loadedTopics) {
        progress[topic.id] = topic.phrases.filter(p => savedIds.has(p.id)).length;
      }
      setTopicProgress(progress);
    });
    setRecentEntries(loadRecentTopics().slice(0, 4));
  }, [settings.currentLanguage]);

  // Streak at risk banner
  useEffect(() => {
    const hour = new Date().getHours();
    if ((settings.streakCount ?? 0) >= 3 && hour >= 18 && hour < 23) {
      hasPracticedToday().then(practiced => {
        setStreakAtRisk(!practiced);
      }).catch(() => {});
    }
  }, [settings.streakCount, settings.streakLastDate]);

  const [completedToday, setCompletedToday] = useState(false);
  useEffect(() => {
    hasPracticedToday().then(setCompletedToday).catch(() => {});
  }, [settings.streakLastDate]);

  const heroTopic = topics[0] || null;

  const isDay1 = libraryCount === 0 && !settings.onboardingCompleted;
  const isStreakBroken = settings.streakCount === 0 && settings.streakLastDate !== null;
  const noContent = !heroTopic && libraryCount === 0;
  const heroVariant = noContent ? 'noContent'
    : isDay1 ? 'day1'
    : completedToday ? 'completed'
    : isStreakBroken ? 'streakBroken'
    : 'default';

  const handleStartLesson = useCallback(() => {
    onNavigate('session');
  }, [onNavigate]);

  const handleTopicTap = useCallback((topic) => {
    saveRecentTopic(topic.id);
    setRecentEntries(prev => {
      const filtered = prev.filter(e => e.id !== topic.id);
      return [{ id: topic.id, openedAt: Date.now() }, ...filtered].slice(0, 4);
    });
    onNavigate('topic', { id: topic.id });
  }, [onNavigate]);

  const handleTopicPlay = useCallback(async (e, topic) => {
    e.stopPropagation();
    const topicMeta = { name: topic.name, imageUrl: topic.imageUrl, imageGradient: topic.imageGradient };
    await loadQueue(topic.phrases, settings.currentLanguage, null, topicMeta);
    await play();
  }, [loadQueue, play, settings.currentLanguage]);

  const categories = langPack?.categories || [];
  const greeting = getGreeting();

  // Build recent topic objects from ids
  const topicMap = Object.fromEntries(topics.map(t => [t.id, t]));
  const recentTopics = recentEntries
    .map(e => ({ topic: topicMap[e.id], openedAt: e.openedAt }))
    .filter(e => !!e.topic)
    .slice(0, 4);

  return (
    <div className={styles.screen}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <h1 className={styles.greetingText}>
          {greeting}{settings.name ? `, ${settings.name}` : ''}
        </h1>
        <p className={styles.subtitle}>Pick your time. Press start.</p>
      </div>

      {/* Streak at Risk Banner */}
      {streakAtRisk && !streakDismissed && (
        <div className={styles.streakBanner}>
          <span className={styles.streakFlame}>🔥</span>
          <div className={styles.streakBannerText}>
            <span className={styles.streakBannerTitle}>Your {settings.streakCount ?? 0}-day streak is at risk!</span>
            <span className={styles.streakBannerSub}>Practice 5 minutes to save it.</span>
          </div>
          <button className={styles.streakBannerAction} onClick={() => { setStreakDismissed(true); onNavigate('session'); }}>
            Start
          </button>
          <button className={styles.streakBannerClose} onClick={() => setStreakDismissed(true)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* Hero Card */}
      <div className={`${styles.heroCard} ${heroVariant === 'completed' ? styles.heroCompleted : ''}`}>
        <div
          className={styles.heroImage}
          style={{
            background: heroVariant === 'noContent'
              ? 'linear-gradient(135deg, #E8DCC8 0%, #D4C8A8 100%)'
              : heroVariant === 'completed'
                ? heroTopic?.imageUrl
                  ? `linear-gradient(180deg, rgba(58,106,26,0.25) 0%, rgba(0,0,0,0.65) 100%), url(${heroTopic.imageUrl}) center/cover`
                  : `linear-gradient(180deg, rgba(58,106,26,0.25) 0%, rgba(0,0,0,0.65) 100%), ${heroTopic?.imageGradient || 'var(--color-brand-dark)'}`
                : heroTopic?.imageUrl
                  ? `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65) 100%), url(${heroTopic.imageUrl}) center/cover`
                  : heroTopic?.imageGradient
                    ? `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65) 100%), ${heroTopic.imageGradient}`
                    : undefined
          }}
        >
          <div className={styles.dayBadge}>
            {heroVariant === 'day1' ? 'Getting started'
              : heroVariant === 'noContent' ? ''
              : `Day ${libraryCount > 0 ? Math.ceil(libraryCount / 5) : 1}`}
          </div>

          <span className={styles.heroLabel}>
            {heroVariant === 'completed' ? (
              <><span className={styles.checkMark}>✓</span> LESSON COMPLETE</>
            ) : heroVariant === 'day1' ? (
              <><span className={styles.greenDot} /> YOUR FIRST LESSON</>
            ) : heroVariant === 'streakBroken' ? (
              <><span className={styles.greenDot} /> FRESH START</>
            ) : heroVariant === 'noContent' ? (
              <><span className={styles.warnDot}>⚠</span> NO LESSON AVAILABLE</>
            ) : (
              <><span className={styles.greenDot} /> TODAY&apos;S LESSON</>
            )}
          </span>

          <h2 className={styles.heroTitle}>
            {heroVariant === 'completed' ? `Great work today${settings.name ? `, ${settings.name}` : ''}`
              : heroVariant === 'day1' ? 'The Very Basics'
              : heroVariant === 'streakBroken' ? 'Welcome back'
              : heroVariant === 'noContent' ? 'Add phrases to your library'
              : heroTopic?.name || 'Daily Basics'}
          </h2>

          <p className={styles.heroSubtitle}>
            {heroVariant === 'completed' ? `Your streak is now ${settings.streakCount} day${settings.streakCount !== 1 ? 's' : ''}`
              : heroVariant === 'day1' ? '5 phrases to get you started'
              : heroVariant === 'streakBroken' ? "Let\u2019s build a new streak"
              : heroVariant === 'noContent' ? 'to build your daily lesson'
              : heroTopic?.description || `${heroTopic?.phraseCount || 12} phrases`}
          </p>
        </div>

        <div className={styles.heroBottom}>
          {heroVariant !== 'day1' && heroVariant !== 'noContent' && (
            <div className={styles.durationPicker}>
              {[10, 20, 30].map(min => (
                <button
                  key={min}
                  className={`${styles.durationBtn} ${duration === min ? styles.durationActive : ''}`}
                  onClick={() => setDuration(min)}
                >
                  <span className={styles.durationNum}>{min}</span>
                  <span className={styles.durationMinLabel}>MIN</span>
                </button>
              ))}
            </div>
          )}

          <button
            className={`${styles.heroButton} ${heroVariant === 'day1' || heroVariant === 'noContent' ? styles.heroButtonFull : ''}`}
            onClick={heroVariant === 'completed' ? () => onNavigate('practice')
              : heroVariant === 'noContent' ? () => onNavigate('library')
              : handleStartLesson}
          >
            {heroVariant === 'completed' ? null : heroVariant === 'noContent' ? null : <span className={styles.playIcon} />}
            {heroVariant === 'completed' ? 'Practice more'
              : heroVariant === 'day1' ? 'Start your first lesson'
              : heroVariant === 'noContent' ? 'Browse topics'
              : 'Start lesson'}
          </button>
        </div>
      </div>

      {/* Search Bar — moved up, before categories */}
      <button className={styles.searchBar} onClick={() => onNavigate('search')}>
        <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className={styles.searchPlaceholder}>Search phrases, words, topics</span>
      </button>

      {/* Custom Phrase — compact pill */}
      <button className={styles.phraseCard} onClick={() => onNavigate('custom-phrase')}>
        <div className={styles.plusCircle}>+</div>
        <div className={styles.phraseCardText}>
          <span className={styles.phraseCardTitle}>Want to say something specific?</span>
          <span className={styles.phraseCardDesc}>Type it in — goes to My Library</span>
        </div>
        <span className={styles.chevron}>&rsaquo;</span>
      </button>

      {/* Recent Topics — 2×2 grid */}
      {recentTopics.length > 0 && (
        <section className={styles.recentSection}>
          <div className={styles.recentHeader}>
            <h2 className={styles.recentTitle}>Recently visited</h2>
          </div>
          <div className={styles.recentGrid}>
            {recentTopics.map(({ topic, openedAt }) => (
              <button
                key={topic.id}
                className={styles.recentCard}
                style={{
                  background: topic.imageUrl
                    ? `linear-gradient(170deg, rgba(197,232,90,0.22) 0%, rgba(0,0,0,0.78) 100%), url(${topic.imageUrl}) center/cover`
                    : topic.imageGradient
                      ? `linear-gradient(170deg, rgba(197,232,90,0.22) 0%, rgba(0,0,0,0.78) 100%), ${topic.imageGradient}`
                      : 'var(--color-brand-dark)'
                }}
                onClick={() => handleTopicTap(topic)}
              >
                {/* Time badge */}
                <span className={styles.recentTimeBadge}>
                  <ClockIcon />
                  {relativeTime(openedAt)}
                </span>

                {/* Bottom text */}
                <div className={styles.recentCardBottom}>
                  <span className={styles.recentTopicName}>{topic.name}</span>
                  {(topicProgress[topic.id] || 0) > 0 && (
                    <div className={styles.recentProgressBar}>
                      <div
                        className={styles.recentProgressFill}
                        style={{ width: `${(topicProgress[topic.id] / topic.phraseCount) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Category Sections */}
      {categories.map(categoryId => {
        const categoryTopics = topics.filter(t => t.category === categoryId);
        if (categoryTopics.length === 0) return null;

        return (
          <section key={categoryId} className={styles.categorySection}>
            <div className={styles.categoryHeader}>
              <h2 className={styles.categoryTitle}>
                {formatCategoryName(categoryId)}
              </h2>
              <span className={styles.categoryCount}>{categoryTopics.length} topics</span>
            </div>
            <div className={styles.topicRow}>
              {categoryTopics.map(topic => (
                <div key={topic.id} className={styles.topicCard}>
                  <button
                    className={styles.topicImageArea}
                    style={{
                      backgroundImage: topic.imageUrl ? `url(${topic.imageUrl})` : undefined,
                      background: !topic.imageUrl ? topic.imageGradient : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    onClick={() => handleTopicTap(topic)}
                  >
                    <span className={styles.topicBadge}>{topic.phraseCount} phrases</span>
                    <button
                      className={styles.topicPlayBtn}
                      onClick={(e) => handleTopicPlay(e, topic)}
                      aria-label={`Play ${topic.name}`}
                    >
                      <span className={styles.topicPlayTriangle} />
                    </button>
                  </button>
                  <button className={styles.topicInfo} onClick={() => handleTopicTap(topic)}>
                    <span className={styles.topicName}>{topic.name}</span>
                    <span className={styles.topicDesc}>{topic.description || ''}</span>
                    <div className={styles.progressRow}>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${topic.phraseCount > 0 ? ((topicProgress[topic.id] || 0) / topic.phraseCount) * 100 : 0}%` }} />
                      </div>
                      <span className={styles.progressCount}>{topicProgress[topic.id] || 0}/{topic.phraseCount}</span>
                    </div>
                  </button>
                </div>
              ))}
              {/* Right fade affordance */}
              <div className={styles.rowFade} aria-hidden="true" />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatCategoryName(id) {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
