// src/services/posthog.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock posthog-js so no real network calls happen
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}));

// Mock consent module
vi.mock('./consent', () => ({
  hasAnalyticsConsent: vi.fn(),
}));

import posthog from 'posthog-js';
import { hasAnalyticsConsent } from './consent';
import { initPostHog, phCapture, phIdentify, phReset, _resetPostHogState } from './posthog';

beforeEach(() => {
  vi.clearAllMocks();
  _resetPostHogState();
});

describe('initPostHog', () => {
  it('initialises posthog when key is set and consent is granted', () => {
    import.meta.env.VITE_POSTHOG_KEY = 'phc_test_key';
    hasAnalyticsConsent.mockReturnValue(true);

    initPostHog();

    expect(posthog.init).toHaveBeenCalledOnce();
    expect(posthog.init).toHaveBeenCalledWith('phc_test_key', expect.objectContaining({
      api_host: 'https://eu.i.posthog.com',
      autocapture: false,
      capture_pageview: false,
    }));
  });

  it('does not initialise when consent is not granted', () => {
    import.meta.env.VITE_POSTHOG_KEY = 'phc_test_key';
    hasAnalyticsConsent.mockReturnValue(false);

    initPostHog();

    expect(posthog.init).not.toHaveBeenCalled();
  });

  it('does not initialise when VITE_POSTHOG_KEY is missing', () => {
    import.meta.env.VITE_POSTHOG_KEY = '';
    hasAnalyticsConsent.mockReturnValue(true);

    initPostHog();

    expect(posthog.init).not.toHaveBeenCalled();
  });

  it('is idempotent — calling twice only inits once', () => {
    import.meta.env.VITE_POSTHOG_KEY = 'phc_test_key';
    hasAnalyticsConsent.mockReturnValue(true);

    initPostHog();
    initPostHog();

    expect(posthog.init).toHaveBeenCalledOnce();
  });
});

describe('phCapture', () => {
  it('calls posthog.capture when initialised', () => {
    import.meta.env.VITE_POSTHOG_KEY = 'phc_test_key';
    hasAnalyticsConsent.mockReturnValue(true);
    initPostHog();

    phCapture('session_started', { mode: 'shadow' });

    expect(posthog.capture).toHaveBeenCalledWith('session_started', { mode: 'shadow' });
  });

  it('no-ops silently when not initialised', () => {
    phCapture('session_started', { mode: 'shadow' });
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('does not throw when posthog.capture throws', () => {
    import.meta.env.VITE_POSTHOG_KEY = 'phc_test_key';
    hasAnalyticsConsent.mockReturnValue(true);
    initPostHog();
    posthog.capture.mockImplementation(() => { throw new Error('network error'); });

    expect(() => phCapture('any_event')).not.toThrow();
  });
});

describe('phIdentify', () => {
  it('calls posthog.identify with uid and traits when initialised', () => {
    import.meta.env.VITE_POSTHOG_KEY = 'phc_test_key';
    hasAnalyticsConsent.mockReturnValue(true);
    initPostHog();

    phIdentify('uid-123', { email: 'test@example.com', language_choice: 'cantonese' });

    expect(posthog.identify).toHaveBeenCalledWith('uid-123', {
      email: 'test@example.com',
      language_choice: 'cantonese',
    });
  });

  it('no-ops silently when not initialised', () => {
    phIdentify('uid-123', {});
    expect(posthog.identify).not.toHaveBeenCalled();
  });
});

describe('phReset', () => {
  it('calls posthog.reset when initialised', () => {
    import.meta.env.VITE_POSTHOG_KEY = 'phc_test_key';
    hasAnalyticsConsent.mockReturnValue(true);
    initPostHog();

    phReset();

    expect(posthog.reset).toHaveBeenCalledOnce();
  });

  it('no-ops silently when not initialised', () => {
    phReset();
    expect(posthog.reset).not.toHaveBeenCalled();
  });
});
