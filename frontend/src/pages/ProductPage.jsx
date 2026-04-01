import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import Loader from '../components/common/Loader.jsx';
import { useCompare } from '../context/CompareContext.jsx';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { compareItems, toggleCompare } = useCompare();

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

  const addToCart = async () => {
    await api.post('/cart', { productId: product.id, quantity: 1 });
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

  if (loading) return <Loader text="Loading product..." />;
  if (!product) return <div className="card p-8">Product not found.</div>;

  const isInCompare = compareItems.some((item) => item.id === product.id);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="card overflow-hidden">
        <img
          src={product.primary_image || 'https://placehold.co/700x700?text=ShopHub'}
          alt={product.title}
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
          <button onClick={addToCart} className="btn-primary w-full">
            Add to Cart
          </button>
          <button onClick={handleCompare} className="w-full rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700">
            {isInCompare ? 'Remove from Compare' : 'Add to Compare'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
