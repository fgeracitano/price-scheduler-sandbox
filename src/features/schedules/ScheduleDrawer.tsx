import { useEffect, useId, useState, type FormEvent } from 'react';
import type { Product } from '@/api/schemas';
import { useToast } from '@/components/Toast';
import { applyPercentOff, formatCents, parseDollars, percentOffBetween } from '@/lib/money';
import { addDays, formatStoreTime, storeToday, toInstant } from '@/lib/time';
import { findConflict } from './overlap';
import { useCreateSchedule, useProductSchedules } from './useSchedules';

type Mode = 'percent' | 'fixed';

interface Props {
  product: Product;
  onClose: () => void;
}

export function ScheduleDrawer({ product, onClose }: Props) {
  const titleId = useId();
  const notify = useToast();
  const existing = useProductSchedules(product.id);
  const createSchedule = useCreateSchedule();

  const today = storeToday();
  const [mode, setMode] = useState<Mode>('percent');
  const [percent, setPercent] = useState('20');
  const [fixedPrice, setFixedPrice] = useState('');
  const [startDate, setStartDate] = useState(addDays(today, 1));
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(addDays(today, 3));
  const [endTime, setEndTime] = useState('09:00');
  const [note, setNote] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const newPriceCents =
    mode === 'percent'
      ? applyPercentOff(product.priceCents, Number(percent))
      : parseDollars(fixedPrice);
  const hasWindow = Boolean(startDate && startTime && endDate && endTime);
  const startsAt = hasWindow ? toInstant(startDate, startTime) : '';
  const endsAt = hasWindow ? toInstant(endDate, endTime) : '';
  const conflict = hasWindow
    ? findConflict({ productId: product.id, startsAt, endsAt }, existing.data ?? [])
    : undefined;

  const errors: string[] = [];
  if (!hasWindow) errors.push('Pick a start and end date and time.');
  if (mode === 'percent' && !(Number(percent) >= 1 && Number(percent) <= 90)) {
    errors.push('Discount must be between 1% and 90%.');
  }
  if (newPriceCents >= product.priceCents) {
    errors.push('New price must be lower than the current price.');
  }
  if (hasWindow && endsAt <= startsAt) errors.push('End must be after start.');
  if (hasWindow && startsAt <= new Date().toISOString()) {
    errors.push('Start must be in the future.');
  }
  if (conflict) {
    errors.push(
      `Overlaps with an existing change (${formatStoreTime(conflict.startsAt)} – ${formatStoreTime(conflict.endsAt)}).`,
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (errors.length > 0) return;
    createSchedule.mutate(
      { productId: product.id, newPriceCents, startsAt, endsAt, note: note || undefined },
      {
        onSettled: () => {
          notify(`${product.name} scheduled at ${formatCents(newPriceCents)}`);
          onClose();
        },
      },
    );
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer__header">
          <div>
            <h2 id={titleId}>Schedule price change</h2>
            <p className="muted">
              {product.name} · <span className="mono">{product.sku}</span> · current{' '}
              {formatCents(product.priceCents)}
            </p>
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        <form onSubmit={onSubmit} className="form">
          <fieldset>
            <legend>New price</legend>
            <div className="segmented">
              <label>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'percent'}
                  onChange={() => setMode('percent')}
                />
                % off
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'fixed'}
                  onChange={() => setMode('fixed')}
                />
                Fixed price
              </label>
            </div>
            {mode === 'percent' ? (
              <label className="field">
                Discount (%)
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                />
              </label>
            ) : (
              <label className="field">
                Price (USD)
                <input
                  inputMode="decimal"
                  placeholder="e.g. 79.99"
                  value={fixedPrice}
                  onChange={(e) => setFixedPrice(e.target.value)}
                />
              </label>
            )}
          </fieldset>

          <fieldset>
            <legend>When (store time, ET)</legend>
            <div className="row">
              <label className="field">
                Starts
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="visually-hidden">Start time</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>
            </div>
            <div className="row">
              <label className="field">
                Ends
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>
              <label className="field">
                <span className="visually-hidden">End time</span>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </label>
            </div>
          </fieldset>

          <label className="field">
            Note (optional)
            <input maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>

          <div className="preview" aria-live="polite">
            <span className="strike">{formatCents(product.priceCents)}</span>
            <span className="arrow">→</span>
            <strong>{formatCents(newPriceCents)}</strong>
            <span className="badge">−{percentOffBetween(product.priceCents, newPriceCents)}%</span>
            {hasWindow && (
              <div className="muted small">
                {formatStoreTime(startsAt)} → {formatStoreTime(endsAt)}
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <ul className="errors">
              {errors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}

          <footer className="drawer__footer">
            <button type="button" className="button button--ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="button"
              disabled={errors.length > 0 || createSchedule.isPending}
            >
              {createSchedule.isPending ? 'Scheduling…' : 'Schedule'}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}
