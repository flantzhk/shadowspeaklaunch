// src/components/screens/AdminDashboard.test.jsx
// Tests access control, loading state, and metric rendering for the Admin dashboard.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Hoist mock references
// ---------------------------------------------------------------------------
const { mockCurrentUser, mockUsersGet, mockWaitlistGet } = vi.hoisted(() => ({
  mockCurrentUser: { uid: 'admin-uid-123' },
  mockUsersGet: vi.fn(),
  mockWaitlistGet: vi.fn(),
}));

const ADMIN_UID = 'admin-uid-123';
const NON_ADMIN_UID = 'regular-user-uid';

vi.mock('../../services/firebase', () => ({
  fbAuth: {
    get currentUser() {
      return mockCurrentUser.uid ? mockCurrentUser : null;
    },
  },
  fbDb: {
    collection: (name) => ({
      get: name === 'users' ? mockUsersGet : mockWaitlistGet,
    }),
  },
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import AdminDashboard from './AdminDashboard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeUserDoc(data) {
  return { data: () => data };
}

function makeSnap(docs) {
  return {
    size: docs.length,
    forEach: (cb) => docs.forEach(cb),
  };
}

// Pass adminUid prop so the component doesn't rely on import.meta.env (not
// reliably injectable at module-load time in Vitest)
function renderAdmin(props = {}) {
  return render(<AdminDashboard onBack={vi.fn()} adminUid={ADMIN_UID} {...props} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AdminDashboard — access control', () => {
  it('shows access denied for a non-admin UID', () => {
    mockCurrentUser.uid = NON_ADMIN_UID;
    renderAdmin();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('shows "must be signed in" when currentUser is null', () => {
    const saved = mockCurrentUser.uid;
    mockCurrentUser.uid = null;
    renderAdmin();
    expect(screen.getByText(/must be signed in/i)).toBeInTheDocument();
    mockCurrentUser.uid = saved;
  });
});

describe('AdminDashboard — metrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser.uid = ADMIN_UID;
  });

  it('renders the Admin heading for the admin user', async () => {
    const now = Date.now();
    mockUsersGet.mockResolvedValue(
      makeSnap([
        makeUserDoc({ subscription_status: 'free', last_active: { toMillis: () => now - 1000 } }),
        makeUserDoc({ subscription_status: 'pro', last_active: { toMillis: () => now - 1000 } }),
        makeUserDoc({ subscription_status: 'free', last_active: { toMillis: () => now - 48 * 3600 * 1000 } }),
      ])
    );
    mockWaitlistGet.mockResolvedValue(makeSnap([{}, {}]));

    renderAdmin();
    expect(await screen.findByRole('heading', { name: /admin/i })).toBeInTheDocument();
  });

  it('displays total registered user count', async () => {
    const now = Date.now();
    mockUsersGet.mockResolvedValue(
      makeSnap([
        makeUserDoc({ subscription_status: 'free', last_active: { toMillis: () => now } }),
        makeUserDoc({ subscription_status: 'free', last_active: { toMillis: () => now } }),
        makeUserDoc({ subscription_status: 'free', last_active: null }),
      ])
    );
    mockWaitlistGet.mockResolvedValue(makeSnap([]));

    renderAdmin();
    await screen.findByText(/total registered/i);
    // Find the "Total registered" label, then check its sibling card value
    const label = screen.getByText(/total registered/i);
    const card = label.closest('div');
    expect(card).toHaveTextContent('3');
  });

  it('counts only users active in the past 24h as DAU', async () => {
    const now = Date.now();
    mockUsersGet.mockResolvedValue(
      makeSnap([
        makeUserDoc({ subscription_status: 'free', last_active: { toMillis: () => now - 3600_000 } }), // 1h ago — counts
        makeUserDoc({ subscription_status: 'free', last_active: { toMillis: () => now - 25 * 3600_000 } }), // 25h ago — doesn't count
        makeUserDoc({ subscription_status: 'free', last_active: null }), // no timestamp — doesn't count
      ])
    );
    mockWaitlistGet.mockResolvedValue(makeSnap([]));

    renderAdmin();
    await screen.findByText(/dau/i);
    // DAU should be 1 (only the user active 1h ago)
    const dauCard = screen.getByText(/dau/i).closest('div');
    expect(dauCard).toHaveTextContent('1');
  });

  it('breaks down free vs pro users', async () => {
    const now = Date.now();
    mockUsersGet.mockResolvedValue(
      makeSnap([
        makeUserDoc({ subscription_status: 'free', last_active: { toMillis: () => now } }),
        makeUserDoc({ subscription_status: 'free', last_active: { toMillis: () => now } }),
        makeUserDoc({ subscription_status: 'pro', last_active: { toMillis: () => now } }),
      ])
    );
    mockWaitlistGet.mockResolvedValue(makeSnap([]));

    renderAdmin();
    await screen.findByText(/subscription/i);
    expect(screen.getByText(/^free$/i)).toBeInTheDocument();
    expect(screen.getByText(/pro \/ paid/i)).toBeInTheDocument();
  });

  it('displays waitlist email count', async () => {
    mockUsersGet.mockResolvedValue(makeSnap([]));
    mockWaitlistGet.mockResolvedValue(makeSnap([{}, {}, {}, {}]));

    renderAdmin();
    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument());
    expect(screen.getByText(/email signups/i)).toBeInTheDocument();
  });

  it('shows an error message if Firestore query fails', async () => {
    mockUsersGet.mockRejectedValue(new Error('Permission denied'));
    mockWaitlistGet.mockRejectedValue(new Error('Permission denied'));

    renderAdmin();
    expect(await screen.findByText(/failed to load metrics/i)).toBeInTheDocument();
  });
});
