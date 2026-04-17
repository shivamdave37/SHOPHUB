import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import { useDemoStore } from '../context/DemoStoreContext.jsx';

export default function WishlistPage() {
  const { wishlistItems } = useDemoStore();

  if (!wishlistItems.length) {
    return (
      <EmptyState
        title="Your wishlist is waiting"
        description="Save your favorite finds here and track them whenever you return."
      >
        <Link to="/" className="btn-primary">
          Explore products
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Wishlist</h1>
          <p className="mt-1 text-slate-600">Favorites, price-watch items, and products you plan to buy next.</p>
        </div>
        <span className="text-sm text-slate-500">{wishlistItems.length} saved items</span>
      </div>
      <ProductGrid products={wishlistItems} />
    </div>
  );
}
