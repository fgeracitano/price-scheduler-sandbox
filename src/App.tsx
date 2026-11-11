import { useCallback, useState } from 'react';
import type { Product } from '@/api/schemas';
import { ProductTable } from '@/features/products/ProductTable';
import { ScheduleDrawer } from '@/features/schedules/ScheduleDrawer';
import { ScheduleList } from '@/features/schedules/ScheduleList';
import { useNow } from '@/lib/hooks';
import { formatStoreTime } from '@/lib/time';

export function App() {
  const now = useNow();
  const [selected, setSelected] = useState<Product | null>(null);
  const close = useCallback(() => setSelected(null), []);

  return (
    <div className="app">
      <header className="topbar">
        <h1>Price Scheduler</h1>
        <span className="muted">Store time: {formatStoreTime(now.toISOString())}</span>
      </header>
      <main className="layout">
        <ProductTable onSchedule={setSelected} />
        <ScheduleList />
      </main>
      {selected && <ScheduleDrawer key={selected.id} product={selected} onClose={close} />}
    </div>
  );
}
