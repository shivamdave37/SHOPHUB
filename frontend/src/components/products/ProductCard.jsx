import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCompare } from '../../context/CompareContext.jsx';
import { useDemoStore } from '../../context/DemoStoreContext.jsx';
import { applyProductImageFallback, getProductImage } from '../../utils/images.js';
import { badgeClassName, getProductBadges } from '../../utils/productMeta.js';

export default function ProductCard({ product }) {
  const [error, setError] = useState('');
  const { compareItems, toggleCompare } = useCompare();
  const { toggleWishlist, wishlistItems, addToCart } = useDemoStore();
  const isInCompare = compareItems.some((item) => item.id === product.id);
  const isWishlisted = wishlistItems.some((item) => item.id === product.id);
  const badges = getProductBadges(product);

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

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="card group overflow-hidden border border-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square bg-slate-100">
        <button
          onClick={handleWishlist}
          className={`absolute right-3 top-3 z-10 rounded-full px-3 py-2 text-xs font-semibold shadow-sm ${
            isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700'
          }`}
        >
          {isWishlisted ? 'Saved' : 'Wishlist'}
        </button>
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${badgeClassName(badge.tone)}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
        <img
          src={getProductImage(product)}
          alt={product.title}
          onError={applyProductImageFallback}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {product.category_name}
        </p>
        <h3 className="min-h-[3.5rem] text-base font-semibold text-slate-900">
          {product.title}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium text-slate-600">Rating: {product.rating}</p>
          <p className="text-slate-500">{product.stock} left</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-slate-900">Rs. {product.price}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Quick View
          </span>
        </div>
        <button
          onClick={handleCompare}
          className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-accent hover:text-brand-accent"
        >
          {isInCompare ? 'Remove from Compare' : 'Add to Compare'}
        </button>
        <button onClick={handleAddToCart} className="btn-primary w-full text-sm">
          Add to Cart
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </Link>
  );
}
