// src/components/screens/HomeScreen.jsx — Today's lesson, library summary, categories

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useAudio } from '../../contexts/AudioContext';
import { getAllLibraryEntries } from '../../services/storage';
import { getLanguagePack, getTopicsForLanguage } from '../../services/languageManager';
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

  const langPack = getLanguagePack(settings.currentLanguage);

  useEffect(() => {
    setTopics(getTopicsForLanguage(settings.currentLanguage));
    getAllLibraryEntries().then(entries => setLibraryCount(entries.length));
  }, [settings.currentLanguage]);

  const handleStartLesson = useCallback(() => {
    onNavigate('session');
  }, [onNavigate]);

  const handleTopicPlay = useCallback(async (topic) => {
    await loadQueue(topic.phrases, settings.currentLanguage);
    await play();
    onNavigate('topic', { id: topic.id });
  }, [loadQueue, play, settings.currentLanguage, onNavigate]);

  const categories = langPack?.categories || [];
  const greeting = getGreeting();

  return (
    <div className={styles.screen}>
      <div className={styles.greeting}>
        <h1 className={styles.greetingText}>
          {greeting}{settings.name ? `, ${settings.name}` : ''}
        </h1>
        <p className={styles.subtitle}>Ready to practice your Cantonese?</p>
      </div>

      <div className={styles.heroCard}>
        <div className={styles.heroContent}>
          <span className={styles.heroLabel}>TODAY&apos;S LESSON</span>
          <h2 className={styles.heroTitle}>Daily Basics</h2>
          <p className={styles.heroPhraseCount}>12 phrases</p>
        </div>
        <button className={styles.heroButton} onClick={handleStartLesson}>
          Start lesson
        </button>
      </div>

      <div className={styles.quickActions}>
        <button className={styles.actionCard} onClick={() => onNavigate('custom-phrase')}>
          <span className={styles.actionTitle}>Add Custom Phrase</span>
          <span className={styles.actionDesc}>Type Chinese text to learn</span>
        </button>
        <button className={styles.actionCard} onClick={() => onNavigate('what-did-they-say')}>
          <span className={styles.actionTitle}>What did they say?</span>
          <span className={styles.actionDesc}>Look up what you heard</span>
        </button>
      </div>

      {libraryCount > 0 && (
        <div className={styles.libraryCard}>
          <span className={styles.libraryCount}>{libraryCount}</span>
          <span className={styles.libraryLabel}>phrases in your library</span>
        </div>
      )}

      {categories.map(categoryId => {
        const categoryTopics = topics.filter(t => t.category === categoryId);
        if (categoryTopics.length === 0) return null;

        return (
          <section key={categoryId} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>
              {formatCategoryName(categoryId)}
            </h2>
            <div className={styles.topicRow}>
              {categoryTopics.map(topic => (
                <button
                  key={topic.id}
                  className={styles.topicCard}
                  onClick={() => handleTopicPlay(topic)}
                  style={{ background: topic.imageGradient }}
                >
                  <span className={styles.topicName}>{topic.name}</span>
                  <span className={styles.topicCount}>{topic.phraseCount} phrases</span>
                </button>
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
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatCategoryName(id) {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
