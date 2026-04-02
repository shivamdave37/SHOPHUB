import { useEffect, useState } from 'react';
import api from '../api/client.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import ProjectDocumentation from '../components/project/ProjectDocumentation.jsx';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data.data.products);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <Loader text="Loading featured products..." />;
  if (!products.length) return <EmptyState title="No products yet" description="The catalog is empty." />;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-navy via-brand-accent to-slate-700 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300">ShopHub</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight">
          Simple Amazon-inspired ecommerce demo built for a DBMS project
        </h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Explore products, search with filters, add to cart, place orders, and manage catalog data.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Popular Products</h2>
          <span className="text-sm text-slate-500">{products.length} items</span>
        </div>
        <ProductGrid products={products} />
      </section>

      <ProjectDocumentation />
    </div>
  );
}
