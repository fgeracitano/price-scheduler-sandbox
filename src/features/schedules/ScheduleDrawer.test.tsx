import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from '@/api/schemas';
import { db } from '../../../server/db';
import { renderWithProviders } from '@/test/render';
import { ScheduleDrawer } from './ScheduleDrawer';

const product: Product = { ...db.products[4]!, priceCents: 10000, livePriceCents: null };

async function fillWindow(start: string, end: string) {
  const user = userEvent.setup();
  const [startDate, endDate] = screen.getAllByLabelText(/starts|ends/i);
  await user.clear(startDate!);
  await user.type(startDate!, start);
  await user.clear(endDate!);
  await user.type(endDate!, end);
  return user;
}

describe('ScheduleDrawer', () => {
  beforeEach(() => {
    db.products[4] = product;
  });

  it('previews the discounted price', async () => {
    renderWithProviders(<ScheduleDrawer product={product} onClose={() => {}} />);
    const user = userEvent.setup();
    const discount = screen.getByLabelText(/discount/i);
    await user.clear(discount);
    await user.type(discount, '25');
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });

  it('schedules a price change and closes', async () => {
    const onClose = vi.fn();
    renderWithProviders(<ScheduleDrawer product={product} onClose={onClose} />);
    const user = await fillWindow('2030-03-01', '2030-03-04');

    await user.click(screen.getByRole('button', { name: 'Schedule' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(screen.getByRole('status')).toHaveTextContent(/scheduled at \$80\.00/);
    expect(db.schedules.at(-1)).toMatchObject({
      productId: product.id,
      newPriceCents: 8000,
      startsAt: '2030-03-01T14:00:00.000Z',
    });
  });

  it('blocks overlapping changes for the same product', async () => {
    db.schedules.push({
      id: 's_existing',
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      previousPriceCents: 10000,
      newPriceCents: 9000,
      startsAt: '2030-03-02T14:00:00.000Z',
      endsAt: '2030-03-05T14:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    renderWithProviders(<ScheduleDrawer product={product} onClose={() => {}} />);
    await fillWindow('2030-03-01', '2030-03-04');

    expect(await screen.findByText(/overlaps with an existing change/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Schedule' })).toBeDisabled();
  });
});
