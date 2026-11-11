import { useEffect, useState } from 'react';
import { fetchProducts, type ProductQuery } from '@/api/products';
import type { Product, ProductList } from '@/api/schemas';

interface SearchResult {
  key: string;
  data?: ProductList;
  error?: Error;
}

interface ProductSearchState {
  products: Product[];
  total: number;
  isLoading: boolean;
  error: Error | null;
}

const keyOf = (q?: string, category?: string) => `${q ?? ''}|${category ?? ''}`;

export function useProductSearch({ q, category }: ProductQuery): ProductSearchState {
  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    const key = keyOf(q, category);
    fetchProducts({ q, category }).then(
      (data) => setResult({ key, data }),
      (error: Error) => setResult({ key, error }),
    );
  }, [q, category]);

  return {
    products: result?.data?.items ?? [],
    total: result?.data?.total ?? 0,
    isLoading: result?.key !== keyOf(q, category),
    error: result?.error ?? null,
  };
}
