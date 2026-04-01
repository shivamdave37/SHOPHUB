import { useEffect, useState } from 'react';
import api from '../api/client.js';
import Loader from '../components/common/Loader.jsx';

const initialForm = {
  category_id: '',
  title: '',
  description: '',
  price: '',
  stock: '',
  rating: '',
  image_url: ''
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/admin/products', {
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price),
      stock: Number(form.stock),
      rating: Number(form.rating || 0)
    });
    setForm(initialForm);
    fetchProducts();
  };

  const deactivateProduct = async (id) => {
    await api.delete(`/admin/products/${id}`);
    fetchProducts();
  };

  if (loading) return <Loader text="Loading admin products..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Products</h1>
        <p className="mt-1 text-slate-600">Create products and deactivate existing ones.</p>
      </div>

      <form onSubmit={handleSubmit} className="card grid gap-4 p-5 md:grid-cols-2">
        <input className="input" placeholder="Category ID" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} />
        <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input md:col-span-2 min-h-28" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="input" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input className="input" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        <input className="input" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
        <input className="input" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <div className="md:col-span-2">
          <button className="btn-secondary w-full">Create Product</button>
        </div>
      </form>

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="card flex items-center justify-between gap-4 p-4">
            <div>
              <h3 className="font-semibold text-slate-900">{product.title}</h3>
              <p className="text-sm text-slate-500">
                Rs. {product.price} | Stock: {product.stock} | Rating: {product.rating}
              </p>
            </div>
            <button onClick={() => deactivateProduct(product.id)} className="text-sm font-medium text-red-600">
              Deactivate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
