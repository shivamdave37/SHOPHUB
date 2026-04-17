import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCompare } from '../../context/CompareContext.jsx';
import { useDemoStore } from '../../context/DemoStoreContext.jsx';
import { getSearchSuggestions } from '../../utils/search.js';

export default function Header() {
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { compareItems } = useCompare();
  const { cartCount, wishlistCount, unreadNotifications, searchHistory, addSearchEntry } = useDemoStore();

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const { data } = await api.get('/products', { params: { limit: 50 } });
        setCatalog(data.data.products || []);
      } catch {
        setCatalog([]);
      }
    };

    loadCatalog();
  }, []);

  const suggestions = useMemo(
    () => getSearchSuggestions(catalog, query, searchHistory),
    [catalog, query, searchHistory]
  );

  const handleSearch = (event) => {
    event.preventDefault();
    addSearchEntry(query);
    navigate(`/search?keyword=${encodeURIComponent(query)}`);
  };

  const handleSuggestionClick = (value) => {
    setQuery(value);
    addSearchEntry(value);
    navigate(`/search?keyword=${encodeURIComponent(value)}`);
  };

  return (
    <header className="bg-brand-navy text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold tracking-tight text-amber-300">
              ShopHub
            </Link>
          </div>

          <div className="relative flex flex-1 gap-2 lg:max-w-2xl">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, books, gadgets, sports gear..."
                className="w-full rounded-xl border-0 px-4 py-2.5 text-slate-900 outline-none"
              />
              <button type="submit" className="rounded-xl bg-amber-400 px-5 font-semibold text-slate-900">
                Search
              </button>
            </form>
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-16 top-14 z-20 rounded-2xl border border-slate-200 bg-white p-2 text-slate-900 shadow-xl">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {query ? 'Suggestions' : 'Recent searches'}
                </p>
                {suggestions.map((item) => (
                  <button
                    key={`${item.type}-${item.value}`}
                    type="button"
                    onClick={() => handleSuggestionClick(item.value)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100"
                  >
                    <span>{item.value}</span>
                    <span className="text-xs uppercase tracking-wide text-slate-400">{item.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link to="/cart" className="hover:text-amber-300">
              Cart ({cartCount})
            </Link>
            <Link to="/wishlist" className="hover:text-amber-300">
              Wishlist ({wishlistCount})
            </Link>
            <Link to="/orders" className="hover:text-amber-300">
              Orders
            </Link>
            <Link to="/notifications" className="hover:text-amber-300">
              Alerts ({unreadNotifications})
            </Link>
            <Link to="/compare" className="hover:text-amber-300">
              Compare ({compareItems.length})
            </Link>
            {!user ? (
              <Link to="/login" className="hover:text-amber-300">
                Login
              </Link>
            ) : (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Hi, {user.name.split(' ')[0]}
              </span>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/products" className="hover:text-amber-300">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
