import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import Loader from '../components/common/Loader.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import { useDemoStore } from '../context/DemoStoreContext.jsx';
import { applyProductImageFallback, getProductImage } from '../utils/images.js';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [guide, setGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { compareItems, toggleCompare } = useCompare();
  const { addToCart } = useDemoStore();

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

  if (loading) return <Loader text="Loading product..." />;
  if (!product) return <div className="card p-8">Product not found.</div>;

  const isInCompare = compareItems.some((item) => item.id === product.id);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="card overflow-hidden">
        <img
          src={getProductImage(product)}
          alt={product.title}
          onError={applyProductImageFallback}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="card space-y-5 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {product.category_name}
        </p>
        <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
        <p className="text-slate-600">{product.description}</p>
        <p className="text-lg text-slate-700">Rating: {product.rating}</p>
        <p className="text-3xl font-bold text-slate-900">Rs. {product.price}</p>
        <p className="text-sm text-slate-500">Only {product.stock} units available</p>
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
    </div>
  );
}
