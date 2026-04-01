import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCompare } from '../../context/CompareContext.jsx';
import { applyProductImageFallback, PRODUCT_FALLBACK_IMAGE } from '../../utils/images.js';

export default function ProductCard({ product }) {
  const [error, setError] = useState('');
  const { compareItems, toggleCompare } = useCompare();
  const isInCompare = compareItems.some((item) => item.id === product.id);

  const handleCompare = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setError('');

    try {
      toggleCompare(product);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-square bg-slate-100">
        <img
          src={product.primary_image || PRODUCT_FALLBACK_IMAGE}
          alt={product.title}
          onError={applyProductImageFallback}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {product.category_name}
        </p>
        <h3 className="min-h-[3.5rem] text-base font-semibold text-slate-900">
          {product.title}
        </h3>
        <p className="text-sm text-slate-600">Rating: {product.rating}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-slate-900">Rs. {product.price}</span>
          <span className="text-sm text-slate-500">{product.stock} left</span>
        </div>
        <button
          onClick={handleCompare}
          className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          {isInCompare ? 'Remove from Compare' : 'Add to Compare'}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </Link>
  );
}
