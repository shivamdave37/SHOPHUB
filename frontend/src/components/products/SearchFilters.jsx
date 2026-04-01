export default function SearchFilters({ filters, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="card grid gap-4 p-5 md:grid-cols-4">
      <input
        className="input"
        placeholder="Keyword"
        value={filters.keyword}
        onChange={(event) => onChange('keyword', event.target.value)}
      />
      <input
        className="input"
        placeholder="Category ID"
        value={filters.categoryId}
        onChange={(event) => onChange('categoryId', event.target.value)}
      />
      <input
        className="input"
        placeholder="Min price"
        value={filters.minPrice}
        onChange={(event) => onChange('minPrice', event.target.value)}
      />
      <input
        className="input"
        placeholder="Max price"
        value={filters.maxPrice}
        onChange={(event) => onChange('maxPrice', event.target.value)}
      />
      <input
        className="input md:col-span-2"
        placeholder="Minimum rating"
        value={filters.minRating}
        onChange={(event) => onChange('minRating', event.target.value)}
      />
      <div className="md:col-span-2 flex items-center">
        <button type="submit" className="btn-secondary w-full">
          Apply Filters
        </button>
      </div>
    </form>
  );
}
