const categories = [
  { id: '', label: 'All Categories' },
  { id: '1', label: 'Electronics' },
  { id: '2', label: 'Clothing' },
  { id: '3', label: 'Books' },
  { id: '4', label: 'Home' },
  { id: '5', label: 'Sports' }
];

const priceRanges = [
  { label: 'All Prices', minPrice: '', maxPrice: '' },
  { label: 'Under Rs. 500', minPrice: '', maxPrice: '500' },
  { label: 'Rs. 500 to Rs. 1,000', minPrice: '500', maxPrice: '1000' },
  { label: 'Rs. 1,000 to Rs. 3,000', minPrice: '1000', maxPrice: '3000' },
  { label: 'Above Rs. 3,000', minPrice: '3000', maxPrice: '' }
];

const ratingOptions = [
  { value: '', label: 'All Ratings' },
  { value: '4.5', label: '4.5 and above' },
  { value: '4', label: '4.0 and above' },
  { value: '3.5', label: '3.5 and above' }
];

const sortOptions = [
  { value: '', label: 'Relevance / Best Match' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Customer Rating' }
];

const baseChipClass =
  'rounded-full border px-3 py-2 text-sm font-medium transition';

export default function SearchFilters({ filters, onChange, onQuickChange, onSubmit, onClear }) {
  const handlePriceRangeSelect = (range) => {
    onQuickChange({
      minPrice: range.minPrice,
      maxPrice: range.maxPrice
    });
  };

  const isActivePriceRange = (range) =>
    filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="card space-y-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-brand-accent hover:underline"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id || 'all'}
                type="button"
                onClick={() => onQuickChange({ categoryId: category.id })}
                className={`${baseChipClass} ${
                  filters.categoryId === category.id
                    ? 'border-brand-accent bg-brand-accent text-white'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Price</p>
          <div className="flex flex-col gap-2">
            {priceRanges.map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => handlePriceRangeSelect(range)}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                  isActivePriceRange(range)
                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                    : 'border-slate-300 text-slate-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">Customer Rating</p>
          <div className="flex flex-col gap-2">
            {ratingOptions.map((option) => (
              <button
                key={option.value || 'all'}
                type="button"
                onClick={() => onQuickChange({ minRating: option.value })}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${
                  filters.minRating === option.value
                    ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                    : 'border-slate-300 text-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="card space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr_auto]">
          <input
            className="input"
            placeholder="Search by product name..."
            value={filters.keyword}
            onChange={(event) => onChange('keyword', event.target.value)}
          />

          <select
            className="input"
            value={filters.sort}
            onChange={(event) => onQuickChange({ sort: event.target.value })}
          >
            {sortOptions.map((option) => (
              <option key={option.value || 'default'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-secondary">
            Apply
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="input"
            placeholder="Minimum price"
            value={filters.minPrice}
            onChange={(event) => onChange('minPrice', event.target.value)}
          />
          <input
            className="input"
            placeholder="Maximum price"
            value={filters.maxPrice}
            onChange={(event) => onChange('maxPrice', event.target.value)}
          />
        </div>

        <p className="text-sm text-slate-500">
          Search by product name, then refine with category, price range, rating, and sorting.
        </p>
      </div>
    </form>
  );
}
