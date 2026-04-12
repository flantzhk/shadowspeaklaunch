// src/services/audio.js — Audio playback engine, recording, caching

import { textToSpeech } from './api';
import { isAuthenticated } from './auth';
import { AUDIO_CACHE_NAME, AUTO_ADVANCE_DELAY_MS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Audio engine with queue management.
 * Handles: play, pause, seek, speed, repeat-one, auto-advance.
 */
class AudioEngine {
  constructor() {
    this._audio = new Audio();
    this._queue = [];
    this._currentIndex = 0;
    this._isRepeatOne = false;
    this._speed = 1.0;
    this._language = 'cantonese';
    this._autoAdvance = true;
    this._advanceTimer = null;
    this._currentBlobUrl = null;

    /** @type {((phrase: Object, index: number) => void)|null} */
    this._onPhraseChange = null;
    /** @type {((state: string) => void)|null} */
    this._onStateChange = null;
    /** @type {((time: number, duration: number) => void)|null} */
    this._onTimeUpdate = null;

    this._audio.addEventListener('ended', () => this._handleEnded());
    this._audio.addEventListener('error', (e) => this._handleError(e));
    this._audio.addEventListener('timeupdate', () => {
      this._onTimeUpdate?.(this._audio.currentTime, this._audio.duration);
    });
    this._audio.addEventListener('play', () => {
      this._onStateChange?.('playing');
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    });
    this._audio.addEventListener('pause', () => {
      if (!this._audio.ended) this._onStateChange?.('paused');
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    });
  }

  /** Load a lesson (ordered list of phrases) into the queue. */
  async loadQueue(phrases, language) {
    this._queue = phrases;
    this._language = language;
    this._currentIndex = 0;
    await this._loadCurrentPhrase();
  }

  async _loadCurrentPhrase() {
    const phrase = this._queue[this._currentIndex];
    if (!phrase) return;

    this._revokeBlobUrl();
    this._clearAdvanceTimer();

    try {
      const speedNum = this._speed === 'slower' ? 0.75
        : typeof this._speed === 'number' ? this._speed : 1.0;

      // Try static audio file first (pre-generated)
      const basePath = import.meta.env.BASE_URL || '/';
      const staticUrl = `${basePath}audio/${this._language}/${phrase.id}.mp3`;

      try {
        const resp = await fetch(staticUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          if (blob.size > 500) {
            this._currentBlobUrl = URL.createObjectURL(blob);
            this._audio.src = this._currentBlobUrl;
            this._audio.playbackRate = speedNum < 1 ? speedNum : 1.0;
            this._onPhraseChange?.(phrase, this._currentIndex);
            return;
          }
        }
      } catch (e) {
        // Static file not available, fall through to TTS API
      }

      // Fallback: try browser cache
      const cached = await getCachedAudio(phrase.id, this._language, speedNum);
      if (cached) {
        this._currentBlobUrl = URL.createObjectURL(cached);
        this._audio.src = this._currentBlobUrl;
      } else if (isAuthenticated()) {
        // Fallback: TTS API
        const blob = await textToSpeech(phrase.chinese, {
          language: this._language,
          speed: speedNum,
          outputExtension: 'mp3',
        });
        if (!blob || blob.size === 0) {
          logger.error('TTS returned empty blob for', phrase.id);
          this._onStateChange?.('error');
          this._onPhraseChange?.(phrase, this._currentIndex);
          return;
        }
        this._currentBlobUrl = URL.createObjectURL(blob);
        this._audio.src = this._currentBlobUrl;
        cacheAudioBlob(phrase.id, this._language, speedNum, blob).catch(() => {});
      } else {
        logger.error('No audio source available for', phrase.id);
        this._onStateChange?.('error');
        this._onPhraseChange?.(phrase, this._currentIndex);
        return;
      }

      this._audio.playbackRate = speedNum;
      this._onPhraseChange?.(phrase, this._currentIndex);
      this._updateMediaSession();
    } catch (error) {
      logger.error('Failed to load audio for phrase', phrase.id, ':', error?.message || error);
      this._onStateChange?.('error');
      this._onPhraseChange?.(phrase, this._currentIndex);
    }
  }

  async play() {
    try {
      if (!this._audio.src) {
        this._onStateChange?.('error');
        return;
      }
      await this._audio.play();
    } catch (error) {
      logger.error('Play failed', error);
      this._onStateChange?.('error');
    }
  }

  pause() {
    this._audio.pause();
    this._clearAdvanceTimer();
  }

  async next() {
    if (this._currentIndex < this._queue.length - 1) {
      this._currentIndex++;
      await this._loadCurrentPhrase();
    }
  }

  async previous() {
    if (this._currentIndex > 0) {
      this._currentIndex--;
      await this._loadCurrentPhrase();
    }
  }

  async retryCurrentPhrase() {
    await this._loadCurrentPhrase();
    await this.play();
  }

  async setSpeed(speed) {
    this._speed = speed;
    const wasPlaying = !this._audio.paused;
    await this._loadCurrentPhrase();
    if (wasPlaying) await this.play();
  }

  toggleRepeat() {
    this._isRepeatOne = !this._isRepeatOne;
    return this._isRepeatOne;
  }

  setAutoAdvance(value) { this._autoAdvance = value; }

  get currentPhrase() { return this._queue[this._currentIndex] || null; }
  get currentIndex() { return this._currentIndex; }
  get queueLength() { return this._queue.length; }
  get progress() { return { current: this._currentIndex + 1, total: this._queue.length }; }
  get currentTime() { return this._audio.currentTime || 0; }
  get duration() { return this._audio.duration || 0; }
  get isPlaying() { return !this._audio.paused && !this._audio.ended; }
  get isRepeatOne() { return this._isRepeatOne; }
  get speed() { return this._speed; }
  get hasQueue() { return this._queue.length > 0; }

  /** Set event callbacks. */
  on(event, callback) {
    if (event === 'phraseChange') this._onPhraseChange = callback;
    else if (event === 'stateChange') this._onStateChange = callback;
    else if (event === 'timeUpdate') this._onTimeUpdate = callback;
  }

  /** Update Media Session API for lock screen / notification controls. */
  _updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const phrase = this._queue[this._currentIndex];
    if (!phrase) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: phrase.romanization || phrase.chinese || 'ShadowSpeak',
      artist: phrase.english || 'Cantonese',
      album: 'ShadowSpeak',
    });

    navigator.mediaSession.setActionHandler('play', () => this.play());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
  }

  _handleEnded() {
    if (this._isRepeatOne) {
      // Add a pause before repeating so short words have breathing room
      this._advanceTimer = setTimeout(() => {
        if (this._destroyed) return;
        this._audio.currentTime = 0;
        this._audio.play().catch(() => {});
      }, 1200);
    } else if (this._autoAdvance && this._currentIndex < this._queue.length - 1) {
      this._onStateChange?.('advancing');
      this._advanceTimer = setTimeout(async () => {
        if (this._destroyed) return;
        this._currentIndex++;
        await this._loadCurrentPhrase();
        if (!this._destroyed) await this.play();
      }, AUTO_ADVANCE_DELAY_MS);
    } else {
      this._onStateChange?.('ended');
    }
  }

  _handleError(e) {
    logger.error('Audio playback error', e);
    this._onStateChange?.('error');
  }

  _revokeBlobUrl() {
    if (this._currentBlobUrl) {
      URL.revokeObjectURL(this._currentBlobUrl);
      this._currentBlobUrl = null;
    }
  }

  _clearAdvanceTimer() {
    if (this._advanceTimer) {
      clearTimeout(this._advanceTimer);
      this._advanceTimer = null;
    }
  }

  destroy() {
    this._destroyed = true;
    this._clearAdvanceTimer();
    this._audio.pause();
    this._audio.removeAttribute('src');
    this._revokeBlobUrl();
    this._queue = [];
  }
}

// === Audio Cache ===

/**
 * Cache an audio blob for a phrase at a given speed.
 * @param {string} phraseId
 * @param {string} language
 * @param {number} speed
 * @param {Blob} blob
 */
async function cacheAudioBlob(phraseId, language, speed, blob) {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const cacheKey = buildCacheKey(phraseId, language, speed);
    await cache.put(cacheKey, new Response(blob));
  } catch (error) {
    logger.warn(`Failed to cache audio for ${phraseId}`, error);
  }
}

/**
 * Get cached audio for a phrase. Returns null if not cached.
 * @param {string} phraseId
 * @param {string} language
 * @param {number} speed
 * @returns {Promise<Blob|null>}
 */
async function getCachedAudio(phraseId, language, speed) {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const cacheKey = buildCacheKey(phraseId, language, speed);
    const response = await cache.match(cacheKey);
    if (!response) return null;
    return await response.blob();
  } catch (error) {
    return null;
  }
}

/**
 * Cache audio for a phrase at both speeds.
 * @param {Object} phrase
 * @param {string} language
 */
async function cacheAudioForPhrase(phrase, language) {
  if (!isAuthenticated()) return;

  for (const speed of [0.75, 1.0]) {
    const existing = await getCachedAudio(phrase.id, language, speed);
    if (existing) continue;

    try {
      const audioBlob = await textToSpeech(phrase.chinese, {
        language,
        speed,
        outputExtension: 'mp3',
      });
      await cacheAudioBlob(phrase.id, language, speed, audioBlob);
    } catch (error) {
      logger.warn(`Failed to cache audio for ${phrase.id} at speed ${speed}`);
    }
  }
}

/**
 * @param {string} phraseId
 * @param {string} language
 * @param {number} speed
 * @returns {string}
 */
function buildCacheKey(phraseId, language, speed) {
  return `audio/${language}/${phraseId}/${speed}`;
}

export { AudioEngine, getCachedAudio, cacheAudioForPhrase, cacheAudioBlob };
