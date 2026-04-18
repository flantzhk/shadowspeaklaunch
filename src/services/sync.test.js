// src/services/sync.test.js — Pure-merge tests for cross-device library sync.

import { describe, it, expect, vi } from 'vitest';

vi.mock('./firebase', () => ({
  firebase: { firestore: { FieldValue: { serverTimestamp: () => null } } },
  fbAuth: { currentUser: null },
  fbDb: { collection: () => ({ doc: () => ({ collection: () => ({}) }) }) },
}));

vi.mock('./storage', () => ({
  getAllLibraryEntries: vi.fn().mockResolvedValue([]),
  getLibraryEntry: vi.fn(),
  saveLibraryEntry: vi.fn(),
  deleteLibraryEntry: vi.fn(),
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
}));

vi.mock('../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const { mergeLibrary } = await import('./sync');

function run(remote, local) {
  const remoteByKey = new Map(remote.map((e) => [String(e.phraseId), e]));
  const localByKey = new Map(local.map((e) => [String(e.phraseId), e]));
  const allKeys = new Set([...remoteByKey.keys(), ...localByKey.keys()]);
  return mergeLibrary(allKeys, remoteByKey, localByKey);
}

describe('mergeLibrary', () => {
  it('writes remote-only entries into local', () => {
    const { writesToLocal, writesToRemote } = run(
      [{ phraseId: 'a', _updatedAt: 100, chinese: '好' }],
      []
    );
    expect(writesToLocal).toHaveLength(1);
    expect(writesToLocal[0].phraseId).toBe('a');
    expect(writesToRemote).toHaveLength(0);
  });

  it('pushes local-only entries up (seeds first sync)', () => {
    const { writesToLocal, writesToRemote } = run(
      [],
      [{ phraseId: 'b', chinese: '唔該' }] // no _updatedAt
    );
    expect(writesToRemote).toHaveLength(1);
    expect(writesToRemote[0].phraseId).toBe('b');
    expect(writesToRemote[0]._updatedAt).toBeTypeOf('number');
    // Also stamps locally so future merges are deterministic
    expect(writesToLocal).toHaveLength(1);
    expect(writesToLocal[0]._updatedAt).toBe(writesToRemote[0]._updatedAt);
  });

  it('newer remote wins over older local', () => {
    const { writesToLocal, writesToRemote } = run(
      [{ phraseId: 'c', _updatedAt: 200, status: 'mastered' }],
      [{ phraseId: 'c', _updatedAt: 100, status: 'learning' }]
    );
    expect(writesToLocal).toHaveLength(1);
    expect(writesToLocal[0].status).toBe('mastered');
    expect(writesToRemote).toHaveLength(0);
  });

  it('newer local wins over older remote', () => {
    const { writesToLocal, writesToRemote } = run(
      [{ phraseId: 'd', _updatedAt: 100, status: 'learning' }],
      [{ phraseId: 'd', _updatedAt: 300, status: 'mastered' }]
    );
    expect(writesToRemote).toHaveLength(1);
    expect(writesToRemote[0].status).toBe('mastered');
    expect(writesToLocal).toHaveLength(0);
  });

  it('ties go to remote (no local write)', () => {
    const { writesToLocal, writesToRemote } = run(
      [{ phraseId: 'e', _updatedAt: 500, status: 'remote' }],
      [{ phraseId: 'e', _updatedAt: 500, status: 'local' }]
    );
    // Both stamped equal — don't thrash IDB on identical timestamps
    expect(writesToLocal).toHaveLength(0);
    expect(writesToRemote).toHaveLength(0);
  });

  it('unstamped local entry present remotely → take remote (first sync recovery)', () => {
    const { writesToLocal, writesToRemote } = run(
      [{ phraseId: 'f', _updatedAt: 100, bestScore: 92 }],
      [{ phraseId: 'f', bestScore: 50 }] // no _updatedAt (pre-sync)
    );
    expect(writesToLocal).toHaveLength(1);
    expect(writesToLocal[0].bestScore).toBe(92);
    expect(writesToRemote).toHaveLength(0);
  });

  it('handles empty inputs', () => {
    const { writesToLocal, writesToRemote } = run([], []);
    expect(writesToLocal).toHaveLength(0);
    expect(writesToRemote).toHaveLength(0);
  });

  it('merges disjoint sets from both sides', () => {
    const { writesToLocal, writesToRemote } = run(
      [{ phraseId: 'r1', _updatedAt: 100 }, { phraseId: 'r2', _updatedAt: 200 }],
      [{ phraseId: 'l1', _updatedAt: 150 }, { phraseId: 'l2', _updatedAt: 250 }]
    );
    expect(writesToLocal.map((e) => e.phraseId).sort()).toEqual(['r1', 'r2']);
    expect(writesToRemote.map((e) => e.phraseId).sort()).toEqual(['l1', 'l2']);
  });
});
