// src/services/auth.test.js — Unit tests for Firestore user document creation

import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted before variable declarations, so mocks must be created
// with vi.hoisted() to be usable inside the factory function.
const { mockSet, mockGet, mockCollection } = vi.hoisted(() => {
  const mockSet = vi.fn();
  const mockGet = vi.fn();
  const mockDoc = vi.fn(() => ({ set: mockSet, get: mockGet }));
  const mockCollection = vi.fn(() => ({ doc: mockDoc }));
  return { mockSet, mockGet, mockDoc, mockCollection };
});

vi.mock('./firebase', () => ({
  firebase: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => '__SERVER_TIMESTAMP__',
      },
    },
  },
  fbAuth: {},
  fbDb: {
    collection: mockCollection,
  },
  fbAnalytics: null,
}));

vi.mock('../utils/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock('./storage', () => ({
  clearAllData: vi.fn(),
}));

import { createUserDocument } from './auth';

describe('createUserDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a document with the required fields for a new user', async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    mockSet.mockResolvedValueOnce(undefined);

    await createUserDocument('uid-123', 'test@example.com', 'cantonese');

    expect(mockSet).toHaveBeenCalledOnce();
    const docData = mockSet.mock.calls[0][0];
    expect(docData.uid).toBe('uid-123');
    expect(docData.email).toBe('test@example.com');
    expect(docData.language_choice).toBe('cantonese');
    expect(docData.subscription_status).toBe('free');
    expect(docData.created_at).toBe('__SERVER_TIMESTAMP__');
  });

  it('does not overwrite an existing user document', async () => {
    mockGet.mockResolvedValueOnce({ exists: true });

    await createUserDocument('uid-existing', 'old@example.com', 'mandarin');

    expect(mockSet).not.toHaveBeenCalled();
  });

  it('defaults language_choice to cantonese when not provided', async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    mockSet.mockResolvedValueOnce(undefined);

    await createUserDocument('uid-456', 'another@example.com');

    const docData = mockSet.mock.calls[0][0];
    expect(docData.language_choice).toBe('cantonese');
  });

  it('stores mandarin when mandarin is passed', async () => {
    mockGet.mockResolvedValueOnce({ exists: false });
    mockSet.mockResolvedValueOnce(undefined);

    await createUserDocument('uid-789', 'mandarin@example.com', 'mandarin');

    const docData = mockSet.mock.calls[0][0];
    expect(docData.language_choice).toBe('mandarin');
  });

  it('does not throw when Firestore get() throws (non-fatal)', async () => {
    mockGet.mockRejectedValueOnce(new Error('Firestore unavailable'));

    await expect(
      createUserDocument('uid-err', 'err@example.com', 'cantonese')
    ).resolves.not.toThrow();
  });
});
