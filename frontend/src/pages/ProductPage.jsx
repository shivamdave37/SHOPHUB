import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useCompare } from '../context/CompareContext.jsx';
import { useDemoStore } from '../context/DemoStoreContext.jsx';
import { applyProductImageFallback, getProductImage } from '../utils/images.js';
import { badgeClassName, getProductBadges } from '../utils/productMeta.js';
import ProductGrid from '../components/products/ProductGrid.jsx';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [guide, setGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { compareItems, toggleCompare } = useCompare();
  const { addToCart, addRecentlyViewed, recentlyViewed } = useDemoStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
    // Intentionally keyed to product id so recently-viewed writes happen once per product view.
  }, [product?.id]);

  const handleAddToCart = () => {
    addToCart(product, 1);
    navigate('/cart');
  };

  const handleCompare = () => {
    setError('');

    try {
      toggleCompare(product);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAskGuide = async () => {
    setError('');
    setGuideLoading(true);

    try {
      const { data } = await api.get(`/products/${id}/guide`);
      setGuide(data.data);
    } catch {
      setError('Unable to load AI guidance right now.');
    } finally {
      setGuideLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card aspect-square animate-pulse bg-slate-200" />
        <div className="card space-y-4 p-6">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-3/5 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200" />
          <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }
  if (!product) return <div className="card p-8">Product not found.</div>;

  const isInCompare = compareItems.some((item) => item.id === product.id);
  const badges = getProductBadges(product);
  const relatedRecentlyViewed = recentlyViewed.filter((item) => item.id !== product.id);

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card overflow-hidden">
          <div className="relative">
            <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge.label}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${badgeClassName(badge.tone)}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <img
              src={getProductImage(product)}
              alt={product.title}
              onError={applyProductImageFallback}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="card space-y-5 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {product.category_name}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
          <p className="text-slate-600">{product.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
              Rating {product.rating}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              {product.stock} units available
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">Rs. {product.price}</p>
          <div className="space-y-3">
            <button onClick={handleAddToCart} className="btn-primary w-full">
              Add to Cart
            </button>
            <button onClick={handleCompare} className="w-full rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700">
              {isInCompare ? 'Remove from Compare' : 'Add to Compare'}
            </button>
            <button
              onClick={handleAskGuide}
              disabled={guideLoading}
              className="w-full rounded-xl bg-brand-accent px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {guideLoading ? 'Generating AI Guide...' : 'Ask AI About This Product'}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        {guide && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">AI Product Helper</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Usage and Practical Guidance</h2>
            </div>

            <div className="space-y-3 text-sm text-slate-700">
              <div>
                <p className="font-semibold text-slate-900">What it is</p>
                <p>{guide.summary}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Usage</p>
                <p>{guide.usage}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Practical applications</p>
                <ul className="space-y-2">
                  {guide.practicalApplications.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Best for</p>
                <p>{guide.bestFor}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Buying advice</p>
                <p>{guide.buyingAdvice}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Quick considerations</p>
                <ul className="space-y-2">
                  {guide.considerations.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {relatedRecentlyViewed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Recently Viewed</h2>
            <p className="text-sm text-slate-500">Quickly jump back to products you explored</p>
          </div>
          <ProductGrid products={relatedRecentlyViewed} />
        </section>
      )}
    </div>
  );
}
