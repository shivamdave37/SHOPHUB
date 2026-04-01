import EmptyState from '../components/common/EmptyState.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { applyProductImageFallback, PRODUCT_FALLBACK_IMAGE } from '../utils/images.js';

export default function ComparePage() {
  const { compareItems, removeCompareItem, clearCompare } = useCompare();

  if (!compareItems.length) {
    return (
      <EmptyState
        title="No products selected for comparison"
        description="Add products to compare from the home page, search page, or product page."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Compare Products</h1>
          <p className="mt-1 text-slate-600">Compare price, rating, stock, and category side by side.</p>
        </div>
        <button onClick={clearCompare} className="btn-secondary">
          Clear Compare
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {compareItems.map((product) => (
          <div key={product.id} className="card overflow-hidden">
            <img
              src={product.primary_image || PRODUCT_FALLBACK_IMAGE}
              alt={product.title}
              onError={applyProductImageFallback}
              className="h-52 w-full object-cover"
            />
            <div className="space-y-3 p-5">
              <h2 className="text-lg font-semibold text-slate-900">{product.title}</h2>
              <p className="text-sm text-slate-500">{product.category_name}</p>
              <p className="text-sm text-slate-600">{product.description || 'No description available.'}</p>
              <div className="space-y-1 text-sm text-slate-700">
                <p><span className="font-semibold">Price:</span> Rs. {product.price}</p>
                <p><span className="font-semibold">Rating:</span> {product.rating}</p>
                <p><span className="font-semibold">Stock:</span> {product.stock}</p>
              </div>
              <button
                onClick={() => removeCompareItem(product.id)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
