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
import { logEvent, isStreakMilestone, STREAK_MILESTONES, calculatePersonalPercentile } from './analytics';
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

describe('calculatePersonalPercentile', () => {
  it('returns null when pastScores is empty', () => {
    expect(calculatePersonalPercentile(80, [])).toBeNull();
  });

  it('returns null when pastScores is null', () => {
    expect(calculatePersonalPercentile(80, null)).toBeNull();
  });

  it('returns null when pastScores is undefined', () => {
    expect(calculatePersonalPercentile(80, undefined)).toBeNull();
  });

  it('returns 100 when score is higher than all past scores', () => {
    expect(calculatePersonalPercentile(95, [60, 70, 80])).toBe(100);
  });

  it('returns 0 when score is lower than all past scores', () => {
    expect(calculatePersonalPercentile(30, [60, 70, 80])).toBe(0);
  });

  it('returns 50 for a score at the median of an even list', () => {
    // 2 out of 4 scores are <= 70
    expect(calculatePersonalPercentile(70, [60, 70, 80, 90])).toBe(50);
  });

  it('includes equal scores (at-or-below semantics)', () => {
    // All 3 past scores equal 75, current score is 75 → 100%
    expect(calculatePersonalPercentile(75, [75, 75, 75])).toBe(100);
  });

  it('handles a single past score — lower than current', () => {
    expect(calculatePersonalPercentile(90, [50])).toBe(100);
  });

  it('handles a single past score — higher than current', () => {
    expect(calculatePersonalPercentile(40, [80])).toBe(0);
  });

  it('rounds result to an integer', () => {
    // 1 out of 3 at-or-below → 33.33... → rounds to 33
    const result = calculatePersonalPercentile(60, [60, 70, 80]);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(33);
  });
});
