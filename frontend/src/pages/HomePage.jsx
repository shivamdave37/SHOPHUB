import { useEffect, useState } from 'react';
import api from '../api/client.js';
import EmptyState from '../components/common/EmptyState.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import ProductSkeletonGrid from '../components/products/ProductSkeletonGrid.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDemoStore } from '../context/DemoStoreContext.jsx';
import { filterAndSortProducts } from '../utils/search.js';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState('');
  const [dealEndsAt] = useState(() => Date.now() + 1000 * 60 * 60 * 6);
  const [timeLeft, setTimeLeft] = useState(1000 * 60 * 60 * 6);
  const { recentlyViewed, wishlistItems } = useDemoStore();
  const { user } = useAuth();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(Math.max(dealEndsAt - Date.now(), 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [dealEndsAt]);

  const formatCountdown = () => {
    const totalSeconds = Math.floor(timeLeft / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products', { params: { limit: 50 } });
        setProducts(data.data.products);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-navy via-brand-accent to-slate-700 p-8 text-white">
          <div className="flex items-center gap-4">
            <img src="/shophub-mark.svg" alt="ShopHub mark" className="h-14 w-14 rounded-2xl bg-white/10 p-2" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">ShopHub</p>
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">Smart Ecommerce Demo</p>
            </div>
          </div>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight">
            "Smart shopping starts with strong data."
          </h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Explore products, search with filters, add to cart, place orders, and manage catalog data.
          </p>
        </section>
        <ProductSkeletonGrid />
      </div>
    );
  }

  if (!products.length) {
    return <EmptyState title="No products yet" description="The catalog is empty." />;
  }

  const bestSellers = products.filter((product) => Number(product.rating) >= 4.5).slice(0, 4);
  const dealsOfTheDay = [...products].sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 4);
  const budgetMatches = budget
    ? filterAndSortProducts(products, { keyword: '', maxPrice: budget, sort: 'rating_desc' }).slice(0, 4)
    : [];
  const recommendedProducts = wishlistItems.length
    ? products
        .filter((product) =>
          wishlistItems.some((saved) => saved.category_name === product.category_name && saved.id !== product.id)
        )
        .slice(0, 4)
    : products.slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-brand-navy via-brand-accent to-slate-700 p-8 text-white">
        <div className="flex items-center gap-4">
          <img src="/shophub-mark.svg" alt="ShopHub mark" className="h-14 w-14 rounded-2xl bg-white/10 p-2" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">ShopHub</p>
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Smart Ecommerce Demo</p>
          </div>
        </div>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight">
          "Smart shopping starts with strong data."
        </h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Explore products, search with filters, add to cart, place orders, and manage catalog data.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Budget Mode</p>
            <div className="mt-3 flex gap-3">
              <input
                className="w-full rounded-xl border-0 px-4 py-2.5 text-slate-900 outline-none"
                placeholder="Enter your budget, e.g. 2500"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-amber-400 px-5 py-4 text-slate-900 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Flash Deal</p>
            <p className="mt-2 text-lg font-bold">Ends in {formatCountdown()}</p>
            <p className="text-sm">Daily deal refresh with top-rated picks.</p>
          </div>
        </div>
        {user?.email?.includes('student') || user?.email?.includes('.edu') ? (
          <p className="mt-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900">
            Student Deals unlocked for {user.name}
          </p>
        ) : null}
      </section>

      {budgetMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Best within your budget</h2>
            <span className="text-sm text-slate-500">Rs. {budget} and under</span>
          </div>
          <ProductGrid products={budgetMatches} />
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Popular Products</h2>
          <span className="text-sm text-slate-500">{products.length} items</span>
        </div>
        <ProductGrid products={products} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Best Sellers</h2>
          <span className="text-sm text-slate-500">Loved by frequent shoppers</span>
        </div>
        <ProductGrid products={bestSellers} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Deals of the Day</h2>
          <span className="text-sm text-slate-500">Fast picks for smart budgets</span>
        </div>
        <ProductGrid products={dealsOfTheDay} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Recommended For You</h2>
          <span className="text-sm text-slate-500">Based on your wishlist and browsing</span>
        </div>
        <ProductGrid products={recommendedProducts} />
      </section>

      {recentlyViewed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Recently Viewed</h2>
            <span className="text-sm text-slate-500">Pick up where you left off</span>
          </div>
          <ProductGrid products={recentlyViewed} />
        </section>
      )}
    </div>
  );
}
