import { useState } from 'react';
import type { Schedule } from '@/api/schemas';
import { useToast } from '@/components/Toast';
import { useNow } from '@/lib/hooks';
import { formatCents, percentOffBetween } from '@/lib/money';
import { formatStoreTime } from '@/lib/time';
import { scheduleStatus, type ScheduleStatus } from './status';
import { useCancelSchedule, useSchedules } from './useSchedules';

const TABS: { id: ScheduleStatus; label: string }[] = [
  { id: 'live', label: 'Live' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'expired', label: 'Expired' },
];

export function ScheduleList() {
  const now = useNow();
  const [tab, setTab] = useState<ScheduleStatus>('upcoming');
  const { data = [], isLoading, error } = useSchedules();
  const cancel = useCancelSchedule();
  const notify = useToast();

  const byStatus = (status: ScheduleStatus) =>
    data.filter((s) => scheduleStatus(s, now) === status);
  const visible = byStatus(tab);

  const onCancel = (s: Schedule) =>
    cancel.mutate(s.id, {
      onSuccess: () => notify(`Cancelled change for ${s.productName}`),
      onError: (err) => notify(`Could not cancel: ${err.message}`, 'error'),
    });

  return (
    <section className="panel" aria-labelledby="schedules-heading">
      <header className="panel__header">
        <h2 id="schedules-heading">Scheduled changes</h2>
      </header>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className="tab"
            onClick={() => setTab(t.id)}
          >
            {t.label} <span className="count">{byStatus(t.id).length}</span>
          </button>
        ))}
      </div>

      {isLoading && <p className="muted">Loading…</p>}
      {error && <p className="error">Could not load schedules: {error.message}</p>}

      <ul className="schedule-list">
        {visible.map((s) => (
          <li key={s.id} className="schedule">
            <div className="schedule__top">
              <strong>{s.productName}</strong>
              <span className="mono muted small">{s.sku}</span>
            </div>
            <div>
              <span className="strike">{formatCents(s.previousPriceCents)}</span> →{' '}
              <strong>{formatCents(s.newPriceCents)}</strong>{' '}
              <span className="badge">
                −{percentOffBetween(s.previousPriceCents, s.newPriceCents)}%
              </span>
            </div>
            <div className="muted small">
              {formatStoreTime(s.startsAt)} → {formatStoreTime(s.endsAt)}
            </div>
            {s.note && <div className="small">“{s.note}”</div>}
            {tab !== 'expired' && (
              <button
                type="button"
                className="button button--ghost button--small"
                disabled={cancel.isPending}
                onClick={() => onCancel(s)}
              >
                Cancel
              </button>
            )}
          </li>
        ))}
      </ul>
      {!isLoading && visible.length === 0 && <p className="empty">Nothing here.</p>}
    </section>
  );
}
