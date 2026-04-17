// src/services/aiChat.test.js — Unit tests for AI conversation service

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist mock functions so vi.mock factories can reference them.
const { mockFetchWithAuth, mockTextToJyutping, mockTextToSpeech, mockIsAuthenticated } =
  vi.hoisted(() => ({
    mockFetchWithAuth: vi.fn(),
    mockTextToJyutping: vi.fn(),
    mockTextToSpeech: vi.fn(),
    mockIsAuthenticated: vi.fn(),
  }));

vi.mock('./api', () => ({
  fetchWithAuth: mockFetchWithAuth,
  textToJyutping: mockTextToJyutping,
  textToSpeech: mockTextToSpeech,
}));

vi.mock('./auth', () => ({
  isAuthenticated: mockIsAuthenticated,
}));

vi.mock('../utils/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import {
  getScenarios,
  buildSystemPrompt,
  sendMessage,
  generateResponseAudio,
  generateLocalResponse,
  SCENARIOS,
  SCENARIO_RESPONSES,
} from './aiChat';

describe('aiChat service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getScenarios', () => {
    it('returns 4 scenarios with all required fields', () => {
      const scenarios = getScenarios();
      expect(scenarios).toHaveLength(4);
      scenarios.forEach(s => {
        expect(s.id).toBeTruthy();
        expect(s.title).toBeTruthy();
        expect(s.chineseTitle).toBeTruthy();
        expect(s.emoji).toBeTruthy();
        expect(s.backgroundUrl).toBeTruthy();
        expect(s.fallbackGradient).toMatch(/linear-gradient/);
        expect(s.systemContext).toBeTruthy();
      });
    });

    it('has unique scenario IDs', () => {
      const ids = getScenarios().map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('buildSystemPrompt', () => {
    it('includes scenario context and the RULES block', () => {
      const scenario = SCENARIOS[0];
      const prompt = buildSystemPrompt(scenario);
      expect(prompt).toContain(scenario.systemContext);
      expect(prompt).toContain('RULES:');
      expect(prompt).toContain('colloquial Cantonese');
    });
  });

  describe('SCENARIO_RESPONSES coverage (offline fallback)', () => {
    it('has a non-empty response array for every active scenario ID', () => {
      SCENARIOS.forEach(scenario => {
        const responses = SCENARIO_RESPONSES[scenario.id];
        expect(responses, `missing responses for ${scenario.id}`).toBeDefined();
        expect(Array.isArray(responses)).toBe(true);
        expect(responses.length).toBeGreaterThan(0);
        responses.forEach(r => {
          expect(r.chinese).toBeTruthy();
          expect(typeof r.english).toBe('string');
        });
      });
    });
  });

  describe('sendMessage', () => {
    const scenario = { id: 'cha_chaan_teng', title: 'Cha Chaan Teng' };

    it('returns API response on happy path and enriches with jyutping', async () => {
      mockFetchWithAuth.mockResolvedValueOnce({
        json: () => Promise.resolve({ chinese: '你好', english: 'Hello' }),
      });
      mockTextToJyutping.mockResolvedValueOnce({
        success: true,
        result: [{ jyutping: 'nei5' }, { jyutping: 'hou2' }],
      });

      const result = await sendMessage([], scenario);
      expect(result.chinese).toBe('你好');
      expect(result.english).toBe('Hello');
      expect(result.jyutping).toBe('nei5 hou2');
      expect(result.romanization).toBeTruthy();
    });

    it('falls back to local response when fetchWithAuth rejects', async () => {
      mockFetchWithAuth.mockRejectedValueOnce(new Error('network'));
      mockTextToJyutping.mockResolvedValueOnce({ success: false });

      const result = await sendMessage([], scenario);
      // First local response for cha_chaan_teng
      expect(result.chinese).toBe(SCENARIO_RESPONSES.cha_chaan_teng[0].chinese);
    });

    it('falls back to local response when API returns empty chinese', async () => {
      mockFetchWithAuth.mockResolvedValueOnce({
        json: () => Promise.resolve({}),
      });
      mockTextToJyutping.mockResolvedValueOnce({ success: false });

      const result = await sendMessage([], scenario);
      expect(result.chinese).toBe(SCENARIO_RESPONSES.cha_chaan_teng[0].chinese);
    });

    it('still returns response when jyutping lookup throws', async () => {
      mockFetchWithAuth.mockResolvedValueOnce({
        json: () => Promise.resolve({ chinese: '你好', english: 'Hello' }),
      });
      mockTextToJyutping.mockRejectedValueOnce(new Error('jyutping fail'));

      const result = await sendMessage([], scenario);
      expect(result.chinese).toBe('你好');
    });
  });

  describe('generateResponseAudio', () => {
    it('returns null and skips TTS when not authenticated', async () => {
      mockIsAuthenticated.mockReturnValue(false);
      const result = await generateResponseAudio('你好');
      expect(result).toBeNull();
      expect(mockTextToSpeech).not.toHaveBeenCalled();
    });

    it('returns blob from textToSpeech on success', async () => {
      mockIsAuthenticated.mockReturnValue(true);
      const blob = new Blob(['audio']);
      mockTextToSpeech.mockResolvedValueOnce(blob);
      const result = await generateResponseAudio('你好');
      expect(result).toBe(blob);
    });

    it('returns null when textToSpeech throws', async () => {
      mockIsAuthenticated.mockReturnValue(true);
      mockTextToSpeech.mockRejectedValueOnce(new Error('tts fail'));
      const result = await generateResponseAudio('你好');
      expect(result).toBeNull();
    });
  });

  describe('generateLocalResponse', () => {
    it('cycles through turns based on assistant message count', () => {
      const scenario = { id: 'red_taxi' };
      const r0 = generateLocalResponse([], scenario);
      const r1 = generateLocalResponse(
        [{ role: 'assistant', chinese: 'x' }],
        scenario
      );
      expect(r0.chinese).toBe(SCENARIO_RESPONSES.red_taxi[0].chinese);
      expect(r1.chinese).toBe(SCENARIO_RESPONSES.red_taxi[1].chinese);
    });

    it('clamps to last response when turn count exceeds array length', () => {
      const scenario = { id: 'red_taxi' };
      const manyTurns = new Array(20).fill({ role: 'assistant', chinese: 'x' });
      const result = generateLocalResponse(manyTurns, scenario);
      const last = SCENARIO_RESPONSES.red_taxi.at(-1);
      expect(result.chinese).toBe(last.chinese);
    });

    it('falls back to restaurant responses for unknown scenario ID', () => {
      const result = generateLocalResponse([], { id: 'nonexistent' });
      expect(result.chinese).toBe(SCENARIO_RESPONSES.restaurant[0].chinese);
    });
  });
});
