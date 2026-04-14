// src/services/analytics.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the firebase module so Analytics initialisation doesn't run
vi.mock('./firebase', () => ({
  fbAnalytics: {
    logEvent: vi.fn(),
  },
  firebase: {},
  fbAuth: {},
  fbDb: {},
}));

// Import AFTER mocking so the module picks up the mock
import { logEvent, isStreakMilestone, STREAK_MILESTONES } from './analytics';
import { fbAnalytics } from './firebase';

describe('isStreakMilestone', () => {
  it('returns true for each defined milestone', () => {
    STREAK_MILESTONES.forEach((n) => {
      expect(isStreakMilestone(n)).toBe(true);
    });
  });

  it('returns false for non-milestone values', () => {
    [1, 2, 4, 5, 6, 8, 10, 15, 20, 25, 50].forEach((n) => {
      expect(isStreakMilestone(n)).toBe(false);
    });
  });
});

describe('logEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls fbAnalytics.logEvent with the event name and params', () => {
    logEvent('session_started', { mode: 'shadow' });
    expect(fbAnalytics.logEvent).toHaveBeenCalledWith('session_started', { mode: 'shadow' });
  });

  it('defaults params to an empty object when not provided', () => {
    logEvent('onboarding_started');
    expect(fbAnalytics.logEvent).toHaveBeenCalledWith('onboarding_started', {});
  });

  it('does not throw when fbAnalytics.logEvent throws', () => {
    fbAnalytics.logEvent.mockImplementation(() => {
      throw new Error('Analytics unavailable');
    });
    expect(() => logEvent('any_event')).not.toThrow();
  });
});
