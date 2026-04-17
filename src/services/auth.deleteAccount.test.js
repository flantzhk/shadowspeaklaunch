// src/services/auth.deleteAccount.test.js
// Unit tests for the deleteAccount() flow in auth.js.
// Firebase and storage are fully mocked — no real network calls.

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoist mock function refs so they're available inside vi.mock() factories
// ---------------------------------------------------------------------------
const { mockUserDelete, mockFbAuthSignOut, mockFirestoreDocDelete, mockClearAllData } = vi.hoisted(() => ({
  mockUserDelete: vi.fn(),
  mockFbAuthSignOut: vi.fn(),
  mockFirestoreDocDelete: vi.fn(),
  mockClearAllData: vi.fn(),
}));

// The currentUser object is shared and mutated per test
const mockCurrentUser = { uid: 'test-uid-123' };

// ---------------------------------------------------------------------------
// Mock: Firebase module
// ---------------------------------------------------------------------------
vi.mock('./firebase', () => ({
  firebase: {
    firestore: {
      FieldValue: { serverTimestamp: () => new Date() },
    },
  },
  fbAuth: {
    get currentUser() { return mockCurrentUser; },
    signOut: mockFbAuthSignOut,
  },
  fbDb: {
    collection: () => ({
      doc: () => ({
        delete: mockFirestoreDocDelete,
        set: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue({ exists: false }),
      }),
    }),
  },
}));

// ---------------------------------------------------------------------------
// Mock: storage.clearAllData
// ---------------------------------------------------------------------------
vi.mock('./storage', () => ({
  clearAllData: mockClearAllData,
  getDB: vi.fn(),
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
  getAllLibraryEntries: vi.fn(),
  getLibraryEntry: vi.fn(),
  saveLibraryEntry: vi.fn(),
  deleteLibraryEntry: vi.fn(),
  getDueEntries: vi.fn(),
  saveSession: vi.fn(),
  getSessionsByDate: vi.fn(),
  getAllSessions: vi.fn(),
  addToQueue: vi.fn(),
  getQueueItems: vi.fn(),
  deleteQueueItem: vi.fn(),
  updateQueueItem: vi.fn(),
  cachePhrase: vi.fn(),
  getCachedPhrase: vi.fn(),
  cacheTopic: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock: logger
// ---------------------------------------------------------------------------
vi.mock('../utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import { deleteAccount } from './auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupSuccessfulUser() {
  mockCurrentUser.delete = mockUserDelete.mockResolvedValue(undefined);
  mockFbAuthSignOut.mockResolvedValue(undefined);
  mockFirestoreDocDelete.mockResolvedValue(undefined);
  mockClearAllData.mockResolvedValue(undefined);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('deleteAccount()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns success:true when all steps succeed', async () => {
    setupSuccessfulUser();
    const result = await deleteAccount();
    expect(result).toEqual({ success: true, error: null });
  });

  it('deletes the Firestore user document', async () => {
    setupSuccessfulUser();
    await deleteAccount();
    expect(mockFirestoreDocDelete).toHaveBeenCalledOnce();
  });

  it('clears all IndexedDB data', async () => {
    setupSuccessfulUser();
    await deleteAccount();
    expect(mockClearAllData).toHaveBeenCalledOnce();
  });

  it('deletes the Firebase Auth user', async () => {
    setupSuccessfulUser();
    await deleteAccount();
    expect(mockUserDelete).toHaveBeenCalledOnce();
  });

  it('calls fbAuth.signOut after deleting the user', async () => {
    setupSuccessfulUser();
    await deleteAccount();
    expect(mockFbAuthSignOut).toHaveBeenCalledOnce();
  });

  it('still succeeds if Firestore doc deletion fails (non-fatal)', async () => {
    setupSuccessfulUser();
    mockFirestoreDocDelete.mockRejectedValueOnce(new Error('Firestore offline'));

    const result = await deleteAccount();

    expect(result.success).toBe(true);
    expect(mockUserDelete).toHaveBeenCalledOnce();
  });

  it('still succeeds if clearAllData fails (non-fatal)', async () => {
    setupSuccessfulUser();
    mockClearAllData.mockRejectedValueOnce(new Error('IDB error'));

    const result = await deleteAccount();

    expect(result.success).toBe(true);
    expect(mockUserDelete).toHaveBeenCalledOnce();
  });

  it('still succeeds if signOut throws after user.delete() succeeds', async () => {
    setupSuccessfulUser();
    mockFbAuthSignOut.mockRejectedValueOnce(new Error('already signed out'));

    const result = await deleteAccount();

    expect(result.success).toBe(true);
  });

  it('returns requires-recent-login error when Firebase throws auth/requires-recent-login', async () => {
    setupSuccessfulUser();
    const err = Object.assign(new Error('Requires recent login'), { code: 'auth/requires-recent-login' });
    mockUserDelete.mockRejectedValueOnce(err);

    const result = await deleteAccount();

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/sign out and sign back in/i);
  });

  it('returns a generic error message for unexpected failures', async () => {
    setupSuccessfulUser();
    mockUserDelete.mockRejectedValueOnce(new Error('Network failure'));

    const result = await deleteAccount();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network failure');
  });
});
