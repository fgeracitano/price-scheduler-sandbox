import { getJson } from './http';
import { productListSchema, type Category, type ProductList } from './schemas';

export interface ProductQuery {
  q?: string;
  category?: Category;
}

export function fetchProducts(query: ProductQuery = {}): Promise<ProductList> {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  const qs = params.toString();
  return getJson(`/products${qs ? `?${qs}` : ''}`, productListSchema);
}
