// src/services/consent.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getConsent,
  saveConsent,
  acceptAll,
  declineAll,
  hasAnalyticsConsent,
  hasResponded,
} from './consent';

// localStorage is cleared between tests by src/test/setup.js

describe('consent service', () => {
  describe('getConsent', () => {
    it('returns null when no consent stored', () => {
      expect(getConsent()).toBeNull();
    });

    it('returns stored consent record', () => {
      acceptAll();
      const record = getConsent();
      expect(record).not.toBeNull();
      expect(record.analytics).toBe(true);
      expect(typeof record.timestamp).toBe('number');
    });

    it('returns null when localStorage contains invalid JSON', () => {
      localStorage.setItem('ss_consent', 'not-json{{{');
      expect(getConsent()).toBeNull();
    });
  });

  describe('hasResponded', () => {
    it('returns false before any consent decision', () => {
      expect(hasResponded()).toBe(false);
    });

    it('returns true after acceptAll', () => {
      acceptAll();
      expect(hasResponded()).toBe(true);
    });

    it('returns true after declineAll', () => {
      declineAll();
      expect(hasResponded()).toBe(true);
    });
  });

  describe('acceptAll', () => {
    it('saves analytics: true', () => {
      const record = acceptAll();
      expect(record.analytics).toBe(true);
    });

    it('persists to localStorage', () => {
      acceptAll();
      expect(localStorage.getItem('ss_consent')).not.toBeNull();
    });
  });

  describe('declineAll', () => {
    it('saves analytics: false', () => {
      const record = declineAll();
      expect(record.analytics).toBe(false);
    });

    it('still counts as responded', () => {
      declineAll();
      expect(hasResponded()).toBe(true);
    });
  });

  describe('saveConsent', () => {
    it('accepts custom analytics preference', () => {
      const record = saveConsent({ analytics: false });
      expect(record.analytics).toBe(false);
      expect(getConsent().analytics).toBe(false);
    });

    it('coerces analytics value to boolean', () => {
      const record = saveConsent({ analytics: 1 });
      expect(record.analytics).toBe(true);
    });

    it('includes a timestamp', () => {
      const before = Date.now();
      const record = saveConsent({ analytics: true });
      const after = Date.now();
      expect(record.timestamp).toBeGreaterThanOrEqual(before);
      expect(record.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('hasAnalyticsConsent', () => {
    it('returns false before any consent', () => {
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('returns true after acceptAll', () => {
      acceptAll();
      expect(hasAnalyticsConsent()).toBe(true);
    });

    it('returns false after declineAll', () => {
      declineAll();
      expect(hasAnalyticsConsent()).toBe(false);
    });
  });
});
