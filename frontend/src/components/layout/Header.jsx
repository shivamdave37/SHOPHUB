import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Header() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/search?keyword=${encodeURIComponent(query)}`);
  };

  return (
    <header className="bg-brand-navy text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold tracking-tight text-amber-300">
              ShopHub
            </Link>
            <span className="hidden text-sm text-slate-300 md:inline">
              College DBMS project store demo
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex flex-1 gap-2 lg:max-w-2xl">
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

          <div className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <span className="hidden sm:inline">Hi, {user.name}</span>
                <Link to="/orders" className="hover:text-amber-300">
                  Orders
                </Link>
                <Link to="/cart" className="hover:text-amber-300">
                  Cart
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin/products" className="hover:text-amber-300">
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="hover:text-amber-300">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-amber-300">
                  Login
                </Link>
                <Link to="/register" className="hover:text-amber-300">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
