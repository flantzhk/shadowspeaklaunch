// src/components/screens/HomeScreen.jsx — Today's lesson, library summary, categories

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useAudio } from '../../contexts/AudioContext';
import { getAllLibraryEntries } from '../../services/storage';
import { getLanguagePack, getTopicsForLanguage } from '../../services/languageManager';
import { hasPracticedToday } from '../../services/streak';
import styles from './HomeScreen.module.css';

/**
 * Home screen with today's lesson hero, category rows.
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

  const langPack = getLanguagePack(settings.currentLanguage);

  useEffect(() => {
    setTopics(getTopicsForLanguage(settings.currentLanguage));
    getAllLibraryEntries().then(entries => setLibraryCount(entries.length));
  }, [settings.currentLanguage]);

  // Streak at risk banner: show when streak >= 3, evening hours, no practice today
  useEffect(() => {
    const hour = new Date().getHours();
    if ((settings.streakCount ?? 0) >= 3 && hour >= 18 && hour < 23) {
      hasPracticedToday().then(practiced => {
        if (!practiced) setStreakAtRisk(true);
        else setStreakAtRisk(false);
      }).catch(() => {});
    }
  }, [settings.streakCount, settings.streakLastDate]);

  const [completedToday, setCompletedToday] = useState(false);

  // Re-check when streakLastDate changes (i.e. after completing a session)
  useEffect(() => {
    hasPracticedToday().then(setCompletedToday).catch(() => {});
  }, [settings.streakLastDate]);

  const heroTopic = topics[0] || null;

  // Hero card variant: day1 | completed | streakBroken | noContent | default
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
    onNavigate('topic', { id: topic.id });
  }, [onNavigate]);

  const handleTopicPlay = useCallback(async (e, topic) => {
    e.stopPropagation();
    await loadQueue(topic.phrases, settings.currentLanguage);
    await play();
  }, [loadQueue, play, settings.currentLanguage]);

  const categories = langPack?.categories || [];
  const greeting = getGreeting();

  return (
    <div className={styles.screen}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <h1 className={styles.greetingText}>
          {greeting}{settings.name ? `, ${settings.name}` : ''}
        </h1>
        <p className={styles.subtitle}>Your lesson is ready. Just press play.</p>
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
          {/* Day badge */}
          <div className={styles.dayBadge}>
            {heroVariant === 'day1' ? 'Getting started'
              : heroVariant === 'noContent' ? ''
              : `Day ${libraryCount > 0 ? Math.ceil(libraryCount / 5) : 1}`}
          </div>

          {/* Label */}
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

          {/* Title */}
          <h2 className={styles.heroTitle}>
            {heroVariant === 'completed' ? `Great work today${settings.name ? `, ${settings.name}` : ''}`
              : heroVariant === 'day1' ? 'The Very Basics'
              : heroVariant === 'streakBroken' ? 'Welcome back'
              : heroVariant === 'noContent' ? 'Add phrases to your library'
              : heroTopic?.name || 'Daily Basics'}
          </h2>

          {/* Subtitle */}
          <p className={styles.heroSubtitle}>
            {heroVariant === 'completed' ? `Your streak is now ${settings.streakCount} day${settings.streakCount !== 1 ? 's' : ''}`
              : heroVariant === 'day1' ? '5 phrases to get you started'
              : heroVariant === 'streakBroken' ? "Let\u2019s build a new streak"
              : heroVariant === 'noContent' ? 'to build your daily lesson'
              : heroTopic?.description || `${heroTopic?.phraseCount || 12} phrases`}
          </p>
        </div>

        <div className={styles.heroBottom}>
          {/* Duration picker — hidden for day1 and noContent */}
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

      {/* Custom Phrase Card */}
      <button className={styles.phraseCard} onClick={() => onNavigate('custom-phrase')}>
        <div className={styles.plusCircle}>+</div>
        <div className={styles.phraseCardText}>
          <span className={styles.phraseCardTitle}>Want to say something specific?</span>
          <span className={styles.phraseCardDesc}>Type it in — goes to My Library</span>
        </div>
        <span className={styles.chevron}>&rsaquo;</span>
      </button>

      {/* What Did They Say Card */}
      <button className={styles.phraseCard} onClick={() => onNavigate('what-did-they-say')}>
        <div className={styles.listenCircle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a6a1a" strokeWidth="2.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
          </svg>
        </div>
        <div className={styles.phraseCardText}>
          <span className={styles.phraseCardTitle}>What did they say?</span>
          <span className={styles.phraseCardDesc}>Look up what you heard</span>
        </div>
        <span className={styles.chevron}>&rsaquo;</span>
      </button>

      {/* Library Summary Card */}
      {libraryCount > 0 && (
        <button className={styles.librarySummary} onClick={() => onNavigate('library')}>
          <div className={styles.libraryIconWrap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3a6a1a" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className={styles.libraryTextGroup}>
            <span className={styles.libraryTitle}>My Library</span>
            <span className={styles.libraryMeta}>{libraryCount} phrases</span>
          </div>
        </button>
      )}

      {/* Search Bar */}
      <button className={styles.searchBar} onClick={() => onNavigate('search')}>
        <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className={styles.searchPlaceholder}>Search phrases, words, topics</span>
      </button>

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
                      background: topic.imageUrl
                        ? `linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.4) 100%), url(${topic.imageUrl}) center/cover`
                        : topic.imageGradient
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
                        <div className={styles.progressFill} style={{ width: '0%' }} />
                      </div>
                      <span className={styles.progressCount}>0/{topic.phraseCount}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
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
