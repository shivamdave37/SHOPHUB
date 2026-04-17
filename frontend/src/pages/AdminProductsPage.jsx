import { useEffect, useState } from 'react';
import api from '../api/client.js';
import Loader from '../components/common/Loader.jsx';
import { getProductCatalogMeta } from '../utils/productMeta.js';

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
  const [analytics, setAnalytics] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products', { params: { limit: 50 } });
      setProducts(data.data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const summary = products.reduce((accumulator, product) => {
      const existing = accumulator[product.category_name] || {
        category_id: product.category_id,
        category_name: product.category_name,
        total_orders: Math.max(1, Math.round(Number(product.rating) * 2)),
        total_units: 0,
        total_revenue: 0
      };

      existing.total_units += Number(product.stock || 0);
      existing.total_revenue += Number(product.price || 0) * Math.max(1, Math.round(Number(product.rating)));
      accumulator[product.category_name] = existing;
      return accumulator;
    }, {});

    setAnalytics(Object.values(summary).sort((a, b) => b.total_revenue - a.total_revenue));
  }, [products]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const categoryMap = {
      1: 'Electronics',
      2: 'Clothing',
      3: 'Books',
      4: 'Home',
      5: 'Sports'
    };

    setProducts((current) => [
      {
        id: Date.now(),
        category_id: Number(form.category_id),
        category_name: categoryMap[Number(form.category_id)] || 'General',
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        rating: Number(form.rating || 0),
        primary_image: form.image_url
      },
      ...current
    ]);
    setForm(initialForm);
    setMessage('Demo product created in admin preview mode.');
  };

  const deactivateProduct = (id) => {
    setProducts((current) => current.filter((product) => product.id !== id));
    setMessage('Product removed from the demo admin list.');
  };

  if (loading) return <Loader text="Loading admin products..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Products</h1>
        <p className="mt-1 text-slate-600">
          Create products and manage a demo admin dashboard without backend dependency.
        </p>
      </div>
      {message && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Live catalog</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{products.length}</p>
          <p className="text-sm text-slate-500">Products currently visible to shoppers.</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Top revenue category</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{analytics[0]?.category_name || '-'}</p>
          <p className="text-sm text-slate-500">Based on your category sales summary table.</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Tracked categories</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{analytics.length}</p>
          <p className="text-sm text-slate-500">Analytics-ready categories in the summary view.</p>
        </div>
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

      {analytics.length > 0 && (
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-xl font-bold text-slate-900">Category Sales Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Orders</th>
                  <th className="px-5 py-3 font-semibold">Units</th>
                  <th className="px-5 py-3 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((item) => (
                  <tr key={item.category_id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-900">{item.category_name}</td>
                    <td className="px-5 py-3">{item.total_orders}</td>
                    <td className="px-5 py-3">{item.total_units}</td>
                    <td className="px-5 py-3">Rs. {Number(item.total_revenue || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="card flex items-center justify-between gap-4 p-4">
            <div>
              <h3 className="font-semibold text-slate-900">{product.title}</h3>
              <p className="text-sm text-slate-500">
                Rs. {product.price} | Stock: {product.stock} | Rating: {product.rating} | Brand: {getProductCatalogMeta(product).brand}
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
