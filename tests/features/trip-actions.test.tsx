import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatElapsed, TripActions } from '@/app/trips/[tripId]/TripActions';
import { copy } from '@/src/features/i18n/copy';

const initialState = {
  startedAt: '2026-07-12T00:00:00.000Z',
  plannedFinishAt: '2026-07-12T05:00:00.000Z',
  lastSuccessfulCheckInAt: '2026-07-12T00:30:00.000Z',
  gpsFreshness: copy.gpsFreshness(1),
  now: '2026-07-12T01:00:00.000Z',
  pendingQueueCount: 0,
};

const okFetch = () => vi.fn(async () => new Response('{}', { status: 200 }));

describe('TripActions', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('calculates elapsed time from the supplied server now and start time', () => {
    expect(formatElapsed('2026-07-12T00:00:00.000Z', '2026-07-12T01:02:03.000Z')).toBe(copy.elapsedTime(1, 2));
  });

  it('shows the status card and four stacked actions without prompt dialogs', () => {
    const prompt = vi.fn();
    vi.stubGlobal('prompt', prompt);
    render(<TripActions tripId="trip-1" initialState={{ ...initialState, pendingQueueCount: 2 }} />);
    for (const action of [copy.checkInAction, copy.extendFinishTime, copy.finishAction, copy.needHelp]) {
      expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
    }
    expect(screen.getByText((_, element) => element?.textContent === copy.reportCount(2))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.retryPendingReports })).toBeInTheDocument();
    expect(prompt).not.toHaveBeenCalled();
  });

  it('sends a quick safe check-in from the expander', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    fireEvent.click(screen.getByRole('button', { name: copy.checkInAction }));
    fireEvent.click(screen.getByRole('button', { name: copy.quickCheckInSafe }));
    expect(await screen.findByText((_, element) => element?.textContent === copy.checkInSuccess())).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/trips/trip-1/check-ins');
    expect(JSON.parse(String(init.body)).message).toBe(copy.quickCheckInSafe);
  });

  it('sends a custom check-in message from the expander', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    fireEvent.click(screen.getByRole('button', { name: copy.checkInAction }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '過黑水塘山屋' } });
    fireEvent.click(screen.getByRole('button', { name: copy.sendCheckIn }));
    expect(await screen.findByText((_, element) => element?.textContent === copy.checkInSuccess())).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body)).message).toBe('過黑水塘山屋');
  });

  it('extends the planned finish time from a quick option', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    fireEvent.click(screen.getByRole('button', { name: copy.extendFinishTime }));
    fireEvent.click(screen.getByRole('button', { name: copy.extendByMinutes(30) }));
    expect(await screen.findByText((_, element) => element?.textContent === copy.finishTimeExtended)).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/trips/trip-1/extend');
    expect(typeof JSON.parse(String(init.body)).plannedFinishAt).toBe('string');
  });

  it('finishes only after the expanded confirmation', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    expect(screen.queryByRole('button', { name: copy.safeFinish })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: copy.finishAction }));
    const confirm = screen.getByRole('button', { name: copy.safeFinish });
    expect(confirm).toHaveAttribute('aria-describedby', 'finish-description');
    fireEvent.click(confirm);
    expect(await screen.findByText((_, element) => element?.textContent === copy.tripFinished)).toBeInTheDocument();
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe('/api/trips/trip-1/finish');
  });

  it('sends a help request with an optional message', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    fireEvent.click(screen.getByRole('button', { name: copy.needHelp }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '腳扭傷' } });
    fireEvent.click(screen.getByRole('button', { name: copy.confirmHelp }));
    expect(await screen.findByText((_, element) => element?.textContent === copy.helpConfirmation())).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/trips/trip-1/help');
    expect(JSON.parse(String(init.body)).message).toBe('腳扭傷');
  });
});
