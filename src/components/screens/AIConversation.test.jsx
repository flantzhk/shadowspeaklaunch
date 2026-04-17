// src/components/screens/AIConversation.test.jsx
// Tests for the AI Conversation screen: paywall gate, offline state,
// scene selection, immersive chat, retry on error, and end-conversation flow.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const {
  mockGetScenarios,
  mockSendMessage,
  mockGenerateResponseAudio,
  mockUseSubscription,
  mockUseOnlineStatus,
  mockUseRecorder,
} = vi.hoisted(() => ({
  mockGetScenarios: vi.fn(),
  mockSendMessage: vi.fn(),
  mockGenerateResponseAudio: vi.fn(),
  mockUseSubscription: vi.fn(),
  mockUseOnlineStatus: vi.fn(),
  mockUseRecorder: vi.fn(),
}));

vi.mock('../../services/aiChat', () => ({
  getScenarios: mockGetScenarios,
  sendMessage: mockSendMessage,
  generateResponseAudio: mockGenerateResponseAudio,
}));

vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: mockUseSubscription,
}));

vi.mock('../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: mockUseOnlineStatus,
}));

vi.mock('../../hooks/useRecorder', () => ({
  useRecorder: mockUseRecorder,
}));

vi.mock('../../contexts/AppContext', () => ({
  useAppContext: () => ({ settings: { currentLanguage: 'cantonese' } }),
}));

vi.mock('../../services/api', () => ({
  speechToText: vi.fn(),
}));

vi.mock('../../services/auth', () => ({
  isAuthenticated: vi.fn(() => true),
}));

vi.mock('../../services/storage', () => ({
  saveLibraryEntry: vi.fn(),
}));

vi.mock('../cards/ScoreBadge', () => ({
  ScoreBadge: () => null,
}));

vi.mock('../shared/RecordButton', () => ({
  RecordButton: () => <button>Record</button>,
}));

import AIConversation from './AIConversation';

const FAKE_SCENARIOS = [
  {
    id: 'cha_chaan_teng',
    title: 'Cha Chaan Teng',
    chineseTitle: '茶餐廳',
    persona: 'Busy waiter',
    emoji: '☕',
    backgroundUrl: 'https://example.com/img1.jpg',
    fallbackGradient: 'linear-gradient(135deg, #8B5A2B, #3A2416)',
    systemContext: '',
  },
  {
    id: 'red_taxi',
    title: 'Red Taxi',
    chineseTitle: '的士',
    persona: 'Chatty driver',
    emoji: '🚕',
    backgroundUrl: 'https://example.com/img2.jpg',
    fallbackGradient: 'linear-gradient(135deg, #A02020, #4A0F0F)',
    systemContext: '',
  },
  {
    id: 'building_lobby',
    title: 'Building Lobby',
    chineseTitle: '大廈大堂',
    persona: 'Security guard',
    emoji: '🏢',
    backgroundUrl: 'https://example.com/img3.jpg',
    fallbackGradient: 'linear-gradient(135deg, #4A5568, #1A202C)',
    systemContext: '',
  },
  {
    id: 'seven_eleven',
    title: '7-Eleven',
    chineseTitle: '便利店',
    persona: 'Tired cashier',
    emoji: '🏪',
    backgroundUrl: 'https://example.com/img4.jpg',
    fallbackGradient: 'linear-gradient(135deg, #2D7A3E, #0F3D1E)',
    systemContext: '',
  },
];

function renderScreen(props = {}) {
  return render(
    <AIConversation
      onBack={vi.fn()}
      showToast={vi.fn()}
      onNavigate={vi.fn()}
      {...props}
    />
  );
}

describe('AIConversation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetScenarios.mockReturnValue(FAKE_SCENARIOS);
    mockUseSubscription.mockReturnValue({ isPro: true, isLoading: false });
    mockUseOnlineStatus.mockReturnValue(true);
    mockUseRecorder.mockReturnValue({
      isRecording: false,
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      error: null,
    });
    mockGenerateResponseAudio.mockResolvedValue(null);
  });

  it('shows the paywall gate for non-Pro users', () => {
    mockUseSubscription.mockReturnValue({ isPro: false, isLoading: false });
    renderScreen();
    expect(screen.getByRole('heading', { name: /unlock ai conversation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upgrade to pro/i })).toBeInTheDocument();
  });

  it('renders the offline message when offline', () => {
    mockUseOnlineStatus.mockReturnValue(false);
    renderScreen();
    expect(screen.getByText(/ai conversation requires internet/i)).toBeInTheDocument();
  });

  it('renders all 4 scene cards in the select phase', () => {
    renderScreen();
    expect(screen.getByRole('heading', { name: /ai conversation/i })).toBeInTheDocument();
    expect(screen.getByText('Cha Chaan Teng')).toBeInTheDocument();
    expect(screen.getByText('Red Taxi')).toBeInTheDocument();
    expect(screen.getByText('Building Lobby')).toBeInTheDocument();
    expect(screen.getByText('7-Eleven')).toBeInTheDocument();
  });

  it('clicking a scene card transitions to chat phase and calls sendMessage', async () => {
    const user = userEvent.setup();
    mockSendMessage.mockResolvedValueOnce({
      chinese: '你好',
      english: 'Hello',
      jyutping: 'nei5 hou2',
      romanization: 'nei hou',
    });

    renderScreen();
    await user.click(screen.getByText('Cha Chaan Teng'));

    expect(mockSendMessage).toHaveBeenCalledWith([], FAKE_SCENARIOS[0]);

    await waitFor(() => {
      expect(screen.getByText('你好')).toBeInTheDocument();
    });
  });

  it('shows an inline error with a retry button when sendMessage fails', async () => {
    const user = userEvent.setup();
    mockSendMessage.mockRejectedValueOnce(new Error('boom'));

    renderScreen();
    await user.click(screen.getByText('Red Taxi'));

    await waitFor(() => {
      expect(screen.getByText(/could not connect/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('clicking End in chat phase shows the review screen', async () => {
    const user = userEvent.setup();
    mockSendMessage.mockResolvedValueOnce({
      chinese: '你好',
      english: 'Hello',
      jyutping: '',
      romanization: '',
    });

    renderScreen();
    await user.click(screen.getByText('Cha Chaan Teng'));
    await waitFor(() => expect(screen.getByText('你好')).toBeInTheDocument());

    // Two controls share the name "End" (the X-icon close button uses aria-label
    // "End", and the text button shows "End"). Target the text button directly.
    await user.click(screen.getByText('End', { selector: 'button' }));
    expect(
      screen.getByRole('heading', { name: /conversation review/i })
    ).toBeInTheDocument();
  });

  it('text input mode sends the typed message', async () => {
    const user = userEvent.setup();
    mockSendMessage
      .mockResolvedValueOnce({ chinese: '你好', english: 'Hi', jyutping: '', romanization: '' })
      .mockResolvedValueOnce({ chinese: '多謝', english: 'Thanks', jyutping: '', romanization: '' });

    renderScreen();
    await user.click(screen.getByText('Cha Chaan Teng'));
    await waitFor(() => expect(screen.getByText('你好')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /type instead/i }));
    const input = screen.getByPlaceholderText(/type in english/i);
    await user.type(input, 'one tea please');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledTimes(2);
    });
    const lastCall = mockSendMessage.mock.calls.at(-1);
    const sentMessages = lastCall[0];
    expect(sentMessages.at(-1)).toMatchObject({ role: 'user', english: 'one tea please' });
  });

  it('calls onBack when back button is clicked in the select phase', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderScreen({ onBack });
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
