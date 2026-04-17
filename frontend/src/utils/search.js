import { getProductCatalogMeta } from './productMeta.js';

export function normalizeSearchText(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const left = normalizeSearchText(a);
  const right = normalizeSearchText(b);

  if (!left) return right.length;
  if (!right) return left.length;

  const matrix = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0));

  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function scoreKeyword(product, keyword) {
  if (!keyword) return 1;

  const normalizedKeyword = normalizeSearchText(keyword);
  const meta = getProductCatalogMeta(product);
  const haystack = normalizeSearchText(
    `${product.title} ${product.description || ''} ${product.category_name || ''} ${meta.brand} ${meta.color} ${meta.size}`
  );

  if (haystack.includes(normalizedKeyword)) {
    return 100;
  }

  const title = normalizeSearchText(product.title);
  if (title.startsWith(normalizedKeyword)) {
    return 90;
  }

  const titleWords = title.split(' ');
  const queryWords = normalizedKeyword.split(' ');

  for (const queryWord of queryWords) {
    if (titleWords.some((word) => word.startsWith(queryWord))) {
      return 75;
    }

    if (titleWords.some((word) => levenshtein(word, queryWord) <= 2)) {
      return 55;
    }
  }

  return 0;
}

export function filterAndSortProducts(products, filters) {
  const keyword = filters.keyword || '';
  const brand = filters.brand || '';
  const availability = filters.availability || '';
  const color = filters.color || '';
  const size = filters.size || '';
  const delivery = filters.delivery || '';
  const discountPercent = filters.discountPercent ? Number(filters.discountPercent) : null;

  const filtered = products
    .map((product) => ({ product, meta: getProductCatalogMeta(product), score: scoreKeyword(product, keyword) }))
    .filter(({ product, meta, score }) => {
      if (keyword && score === 0) return false;
      if (filters.categoryId && String(product.category_id) !== String(filters.categoryId)) return false;
      if (filters.minPrice && Number(product.price) < Number(filters.minPrice)) return false;
      if (filters.maxPrice && Number(product.price) > Number(filters.maxPrice)) return false;
      if (filters.minRating && Number(product.rating) < Number(filters.minRating)) return false;
      if (brand && meta.brand !== brand) return false;
      if (availability === 'in_stock' && !meta.isAvailable) return false;
      if (availability === 'limited' && Number(product.stock) > 25) return false;
      if (color && meta.color !== color) return false;
      if (size && meta.size !== size) return false;
      if (delivery && meta.deliveryLabel !== delivery) return false;
      if (discountPercent && meta.discountPercent < discountPercent) return false;
      return true;
    });

  filtered.sort((left, right) => {
    const sort = filters.sort || '';

    if (sort === 'price_asc') return Number(left.product.price) - Number(right.product.price);
    if (sort === 'price_desc') return Number(right.product.price) - Number(left.product.price);
    if (sort === 'rating_desc') return Number(right.product.rating) - Number(left.product.rating);
    if (sort === 'newest') return Number(right.product.id) - Number(left.product.id);
    if (sort === 'discount_desc') return right.meta.discountPercent - left.meta.discountPercent;

    if (right.score !== left.score) return right.score - left.score;
    return Number(right.product.rating) - Number(left.product.rating);
  });

  return filtered.map(({ product }) => product);
}

export function getFallbackSearchResults(products, filters) {
  const keyword = normalizeSearchText(filters.keyword);

  if (!keyword) {
    return products.slice(0, 8);
  }

  const relaxed = products
    .map((product) => ({ product, score: scoreKeyword(product, keyword) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.product.rating) - Number(a.product.rating))
    .map((item) => item.product);

  if (relaxed.length) {
    return relaxed.slice(0, 8);
  }

  return [...products]
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 8);
}

export function getSearchSuggestions(products, keyword, history = []) {
  const normalizedKeyword = normalizeSearchText(keyword);

  if (!normalizedKeyword) {
    return history.slice(0, 5).map((entry) => ({ type: 'history', value: entry }));
  }

  return products
    .map((product) => ({
      value: product.title,
      score: scoreKeyword(product, normalizedKeyword)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => ({ type: 'product', value: item.value }));
}
