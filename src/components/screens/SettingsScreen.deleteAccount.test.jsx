// src/components/screens/SettingsScreen.deleteAccount.test.jsx
// Tests the Delete Account UI flow in SettingsScreen:
//   button visible → warning modal → final confirm → success redirect
//   button visible → warning modal → final confirm → error shown inline

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ---------------------------------------------------------------------------
// Hoist mock refs so vi.mock factories can reference them safely
// ---------------------------------------------------------------------------
const { mockDeleteAccount, mockSignOut, mockGetCurrentUser } = vi.hoisted(() => ({
  mockDeleteAccount: vi.fn(),
  mockSignOut: vi.fn(),
  mockGetCurrentUser: vi.fn(() => ({ email: 'test@example.com', displayName: 'Test User' })),
}));

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('../../services/auth', () => ({
  deleteAccount: mockDeleteAccount,
  signOut: mockSignOut,
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({
    settings: {
      name: 'Test User',
      currentLanguage: 'cantonese',
      dailyGoalMinutes: 10,
      defaultSpeed: 'natural',
      showCharacters: true,
      showEnglish: true,
      autoAdvance: true,
      reminderTime: null,
      themePreference: 'system',
    },
    updateSettings: vi.fn(),
  }),
}));

vi.mock('../../services/languageManager', () => ({
  getAllLanguages: () => [
    { id: 'cantonese', name: 'Cantonese', nativeName: '廣東話' },
  ],
}));

vi.mock('../../services/notifications', () => ({
  subscribeToPushNotifications: vi.fn(),
  unsubscribeFromPushNotifications: vi.fn(),
  getNotificationPermission: vi.fn(() => 'default'),
  isPushSubscribed: vi.fn(() => Promise.resolve(false)),
  showTestNotification: vi.fn(),
}));

vi.mock('../../utils/constants', () => ({
  DAILY_GOAL_OPTIONS: [5, 10, 15, 20, 30],
  APP_VERSION: '1.19.0',
  ROUTES: {
    HOME: 'home',
    LOGIN: 'login',
    PROFILE: 'profile',
    ABOUT: 'about',
    FAQ: 'faq',
    CONTACT: 'contact',
    SUPPORT: 'support',
  },
}));

vi.mock('../../services/firebase', () => ({
  fbAuth: { currentUser: { uid: 'test-uid' } },
  fbDb: {
    collection: () => ({
      doc: () => ({
        get: vi.fn(() => Promise.resolve({ exists: false })),
      }),
    }),
  },
}));

vi.mock('../../services/storage', () => ({
  getSettings: vi.fn(() => Promise.resolve({ streakCount: 5, totalPracticeSeconds: 3600 })),
  getAllLibraryEntries: vi.fn(() => Promise.resolve([])),
}));

vi.mock('../shared/DownloadAllModal', () => ({
  default: () => null,
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
import SettingsScreen from './SettingsScreen';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderSettings(props = {}) {
  return render(<SettingsScreen onBack={vi.fn()} onNavigate={vi.fn()} {...props} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('SettingsScreen — Delete Account flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.hash = '#settings';
  });

  it('renders a "Delete account" button in the Account section', () => {
    renderSettings();
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
  });

  it('shows warning modal when the Delete account button is clicked', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: /delete account/i }));

    expect(screen.getByText(/permanently delete your account and all data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, delete my account/i })).toBeInTheDocument();
  });

  it('dismisses the warning modal on Cancel', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: /delete account/i }));
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.queryByText(/permanently delete your account and all data/i)).not.toBeInTheDocument();
  });

  it('shows second confirm modal after first warning is confirmed', async () => {
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: /delete account/i }));
    await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));

    expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete forever/i })).toBeInTheDocument();
  });

  it('calls deleteAccount() when the final confirm is clicked', async () => {
    mockDeleteAccount.mockResolvedValue({ success: true, error: null });
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: /delete account/i }));
    await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));
    await user.click(screen.getByRole('button', { name: /delete forever/i }));

    await waitFor(() => expect(mockDeleteAccount).toHaveBeenCalledOnce());
  });

  it('redirects to onboarding start on successful deletion', async () => {
    mockDeleteAccount.mockResolvedValue({ success: true, error: null });
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: /delete account/i }));
    await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));
    await user.click(screen.getByRole('button', { name: /delete forever/i }));

    await waitFor(() => {
      expect(window.location.hash).toBe('');
      expect(reloadSpy).toHaveBeenCalled();
    });

    reloadSpy.mockRestore();
  });

  it('shows an inline error message if deleteAccount() fails', async () => {
    mockDeleteAccount.mockResolvedValue({ success: false, error: 'Network failure' });
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: /delete account/i }));
    await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));
    await user.click(screen.getByRole('button', { name: /delete forever/i }));

    await waitFor(() => expect(screen.getByText('Network failure')).toBeInTheDocument());
  });

  it('shows the requires-recent-login message when returned from deleteAccount()', async () => {
    mockDeleteAccount.mockResolvedValue({
      success: false,
      error: 'For security, please sign out and sign back in before deleting your account.',
    });
    const user = userEvent.setup();
    renderSettings();

    await user.click(screen.getByRole('button', { name: /delete account/i }));
    await user.click(screen.getByRole('button', { name: /yes, delete my account/i }));
    await user.click(screen.getByRole('button', { name: /delete forever/i }));

    await waitFor(() =>
      expect(screen.getByText(/sign out and sign back in/i)).toBeInTheDocument()
    );
  });
});
