import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import ProductSkeletonGrid from '../components/products/ProductSkeletonGrid.jsx';
import SearchFilters from '../components/products/SearchFilters.jsx';

export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const filters = useMemo(
    () => ({
      keyword: params.get('keyword') || '',
      categoryId: params.get('categoryId') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      minRating: params.get('minRating') || '',
      sort: params.get('sort') || ''
    }),
    [params]
  );

  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/products/search', { params: Object.fromEntries(params) });
        setProducts(data.data.products || []);
        setMeta({
          total: data.data.total || 0,
          page: data.data.page || 1,
          totalPages: data.data.totalPages || 1
        });
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [params]);

  const handleChange = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleQuickChange = (changes) => {
    const next = { ...draft, ...changes };
    setDraft(next);

    const nextParams = {};
    Object.entries(next).forEach(([key, value]) => {
      if (value) nextParams[key] = value;
    });

    setParams(nextParams);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {};

    Object.entries(draft).forEach(([key, value]) => {
      if (value) next[key] = value;
    });

    setParams(next);
  };

  const handleClear = () => {
    setDraft({
      keyword: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: ''
    });
    setParams({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Search Results</h1>
        <p className="mt-1 text-slate-600">
          Search by product name and refine results using easy shopping filters.
        </p>
      </div>

      <SearchFilters
        filters={draft}
        onChange={handleChange}
        onQuickChange={handleQuickChange}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />

      {loading ? (
        <div className="space-y-4">
          <Loader text="Searching products..." />
          <ProductSkeletonGrid count={8} />
        </div>
      ) : products.length ? (
        <div className="space-y-4">
          <div className="text-sm text-slate-500">
            {meta.total} results found. Page {meta.page} of {meta.totalPages}.
          </div>
          <ProductGrid products={products} />
        </div>
      ) : (
        <EmptyState title="No matching products" description="Try changing the filters or search term." />
      )}
    </div>
  );
}
