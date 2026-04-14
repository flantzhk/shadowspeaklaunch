// src/components/screens/SupportScreen.test.jsx
// Tests for the Help & Support page: FAQ accordion, contact section.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupportScreen from './SupportScreen';

function renderSupport(props = {}) {
  return render(<SupportScreen onBack={vi.fn()} {...props} />);
}

describe('SupportScreen', () => {
  it('renders the heading', () => {
    renderSupport();
    expect(screen.getByRole('heading', { name: /help & support/i })).toBeInTheDocument();
  });

  it('renders all 5 FAQ questions', () => {
    renderSupport();
    expect(screen.getByText(/how do i cancel my subscription/i)).toBeInTheDocument();
    expect(screen.getByText(/which languages does shadowspeak support/i)).toBeInTheDocument();
    expect(screen.getByText(/how does pronunciation scoring work/i)).toBeInTheDocument();
    expect(screen.getByText(/how do i delete my account and data/i)).toBeInTheDocument();
    expect(screen.getByText(/how do i contact support/i)).toBeInTheDocument();
  });

  it('answers are hidden by default', () => {
    renderSupport();
    expect(screen.queryByText(/we aim to respond within 48 hours/i, { selector: 'p.answer' })).not.toBeInTheDocument();
  });

  it('expands a FAQ answer on click', async () => {
    const user = userEvent.setup();
    renderSupport();

    await user.click(screen.getByText(/how do i cancel my subscription/i));

    expect(screen.getByText(/billing portal/i)).toBeInTheDocument();
  });

  it('collapses an expanded FAQ on second click', async () => {
    const user = userEvent.setup();
    renderSupport();

    const btn = screen.getByText(/how do i cancel my subscription/i);
    await user.click(btn);
    expect(screen.getByText(/billing portal/i)).toBeInTheDocument();

    await user.click(btn);
    expect(screen.queryByText(/billing portal/i)).not.toBeInTheDocument();
  });

  it('shows only one answer open at a time', async () => {
    const user = userEvent.setup();
    renderSupport();

    await user.click(screen.getByText(/how do i cancel my subscription/i));
    expect(screen.getByText(/billing portal/i)).toBeInTheDocument();

    await user.click(screen.getByText(/which languages does shadowspeak support/i));
    expect(screen.queryByText(/billing portal/i)).not.toBeInTheDocument();
    expect(screen.getByText(/cantonese.*mandarin/i)).toBeInTheDocument();
  });

  it('renders the support email link', () => {
    renderSupport();
    const link = screen.getByRole('link', { name: /support@shadowspeak\.app/i });
    expect(link).toHaveAttribute('href', 'mailto:support@shadowspeak.app');
  });

  it('mentions 48-hour response SLA', () => {
    renderSupport();
    expect(screen.getByText(/48 hours/i)).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    renderSupport({ onBack });

    await user.click(screen.getByRole('button', { name: /go back/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
