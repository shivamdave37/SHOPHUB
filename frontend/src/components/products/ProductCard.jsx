import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-square bg-slate-100">
        <img
          src={product.primary_image || 'https://placehold.co/400x400?text=ShopHub'}
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {product.category_name}
        </p>
        <h3 className="min-h-[3.5rem] text-base font-semibold text-slate-900">
          {product.title}
        </h3>
        <p className="text-sm text-slate-600">Rating: {product.rating}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-slate-900">Rs. {product.price}</span>
          <span className="text-sm text-slate-500">{product.stock} left</span>
        </div>
      </div>
    </Link>
  );
}
