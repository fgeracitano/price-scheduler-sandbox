import { useState } from 'react';
import { CATEGORIES, type Category, type Product } from '@/api/schemas';
import { useDebouncedValue } from '@/lib/hooks';
import { formatCents } from '@/lib/money';
import { useProductSearch } from './useProductSearch';

interface Props {
  onSchedule: (product: Product) => void;
}

export function ProductTable({ onSchedule }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const q = useDebouncedValue(search);
  const { products, total, isLoading, error } = useProductSearch({
    q,
    category: category || undefined,
  });

  return (
    <section className="panel" aria-labelledby="products-heading">
      <header className="panel__header">
        <h2 id="products-heading">Products</h2>
        <span className="muted">{isLoading ? 'Loading…' : `${total} products`}</span>
      </header>

      <div className="filters">
        <input
          type="search"
          placeholder="Search name, SKU or brand"
          aria-label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | '')}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">Could not load products: {error.message}</p>}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Category</th>
              <th className="num">Price</th>
              <th className="num">Live price</th>
              <th className="num">Stock</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="mono">{p.sku}</td>
                <td>
                  <div>{p.name}</div>
                  <div className="muted small">{p.brand}</div>
                </td>
                <td>{p.category}</td>
                <td className="num">{formatCents(p.priceCents)}</td>
                <td className="num">
                  {p.livePriceCents === null ? (
                    <span className="muted">—</span>
                  ) : (
                    <span className="badge badge--live">{formatCents(p.livePriceCents)}</span>
                  )}
                </td>
                <td className="num">{p.stock}</td>
                <td>
                  <button
                    type="button"
                    className="button button--small"
                    onClick={() => onSchedule(p)}
                  >
                    Schedule
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && products.length === 0 && <p className="empty">No products match.</p>}
      </div>
    </section>
  );
}
