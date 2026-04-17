// src/services/streak.test.js — Unit tests for streak tracking and freeze logic

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---- mocks (hoisted so vi.mock factories can reference them) ----------------

const { mockGetSettings, mockSaveSettings } = vi.hoisted(() => {
  const mockGetSettings = vi.fn();
  const mockSaveSettings = vi.fn().mockResolvedValue(undefined);
  return { mockGetSettings, mockSaveSettings };
});

vi.mock('./storage', () => ({
  getSettings: mockGetSettings,
  saveSettings: mockSaveSettings,
}));

vi.mock('../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { updateStreak, hasPracticedToday, isStreakFreezeAvailable } from './streak';

// ---------------------------------------------------------------------------

function dateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateStr(d);
}

// ---------------------------------------------------------------------------

describe('updateStreak — return shape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-14T10:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns { count, freezeUsed, freezeNotAvailable } on streak continuation', async () => {
    mockGetSettings.mockResolvedValue({
      streakCount: 5,
      streakLastDate: '2026-04-13', // yesterday
      streakFreezeUsedWeek: '',
    });
    const result = await updateStreak();
    expect(result).toMatchObject({ count: 6, freezeUsed: false, freezeNotAvailable: false });
  });

  it('count = 1 and no freeze flags for new user (null streakLastDate)', async () => {
    mockGetSettings.mockResolvedValue({
      streakCount: 0,
      streakLastDate: null,
      streakFreezeUsedWeek: '',
    });
    const result = await updateStreak();
    expect(result).toMatchObject({ count: 1, freezeUsed: false, freezeNotAvailable: false });
  });

  it('returns current count unchanged when already practiced today', async () => {
    mockGetSettings.mockResolvedValue({
      streakCount: 7,
      streakLastDate: '2026-04-14', // today
      streakFreezeUsedWeek: '',
    });
    const result = await updateStreak();
    expect(result).toMatchObject({ count: 7, freezeUsed: false, freezeNotAvailable: false });
    expect(mockSaveSettings).not.toHaveBeenCalled();
  });

  it('returns { count: 0, freezeUsed: false, freezeNotAvailable: false } when settings is null', async () => {
    mockGetSettings.mockResolvedValue(null);
    const result = await updateStreak();
    expect(result).toEqual({ count: 0, freezeUsed: false, freezeNotAvailable: false });
  });
});

describe('updateStreak — streak freeze scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-14T10:00:00Z')); // Monday
  });
  afterEach(() => vi.useRealTimers());

  it('uses freeze when missed exactly 1 day and freeze is available', async () => {
    mockGetSettings.mockResolvedValue({
      streakCount: 10,
      streakLastDate: '2026-04-12', // two days ago
      streakFreezeUsedWeek: '',      // freeze not yet used this week
    });
    const result = await updateStreak();
    expect(result.count).toBe(11);
    expect(result.freezeUsed).toBe(true);
    expect(result.freezeNotAvailable).toBe(false);
    // Should save the week key so freeze is marked used
    expect(mockSaveSettings).toHaveBeenCalledWith(
      expect.objectContaining({ streakFreezeUsedWeek: expect.any(String) })
    );
  });

  it('resets streak and sets freezeNotAvailable when missed 1 day but freeze already spent', async () => {
    // Week start for 2026-04-14 (Monday) is 2026-04-13
    const currentWeek = '2026-04-13';
    mockGetSettings.mockResolvedValue({
      streakCount: 10,
      streakLastDate: '2026-04-12', // two days ago
      streakFreezeUsedWeek: currentWeek, // freeze already used this week
    });
    const result = await updateStreak();
    expect(result.count).toBe(1);
    expect(result.freezeUsed).toBe(false);
    expect(result.freezeNotAvailable).toBe(true);
  });

  it('resets streak without freeze flags when missed more than 1 day', async () => {
    mockGetSettings.mockResolvedValue({
      streakCount: 10,
      streakLastDate: '2026-04-10', // four days ago — freeze can't help
      streakFreezeUsedWeek: '',
    });
    const result = await updateStreak();
    expect(result.count).toBe(1);
    expect(result.freezeUsed).toBe(false);
    expect(result.freezeNotAvailable).toBe(false);
  });
});

describe('hasPracticedToday', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-14T10:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns true when streakLastDate is today', async () => {
    mockGetSettings.mockResolvedValue({ streakLastDate: '2026-04-14' });
    expect(await hasPracticedToday()).toBe(true);
  });

  it('returns false when streakLastDate is yesterday', async () => {
    mockGetSettings.mockResolvedValue({ streakLastDate: '2026-04-13' });
    expect(await hasPracticedToday()).toBe(false);
  });

  it('returns false when settings is null', async () => {
    mockGetSettings.mockResolvedValue(null);
    expect(await hasPracticedToday()).toBe(false);
  });
});

describe('isStreakFreezeAvailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-14T10:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns true when freeze has not been used this week', async () => {
    mockGetSettings.mockResolvedValue({ streakFreezeUsedWeek: '' });
    expect(await isStreakFreezeAvailable()).toBe(true);
  });

  it('returns false when freeze was already used this week', async () => {
    // Week start for 2026-04-14 — need to match getWeekStart() output
    // Monday 2026-04-13 is the week start
    mockGetSettings.mockResolvedValue({ streakFreezeUsedWeek: '2026-04-13' });
    expect(await isStreakFreezeAvailable()).toBe(false);
  });

  it('returns true when settings is null', async () => {
    mockGetSettings.mockResolvedValue(null);
    expect(await isStreakFreezeAvailable()).toBe(true);
  });
});
