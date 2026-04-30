import { demoCatalog } from '../data/demoCatalog.js';

const CATALOG_CACHE_KEY = 'shophub_catalog_cache';

export function saveCatalogCache(products) {
  if (!products?.length) return;
  localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(products));
}

export function getCatalogCache() {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSafeCatalog(products = []) {
  if (products.length) return products;

  const cached = getCatalogCache();
  if (cached.length) return cached;

  return demoCatalog;
}

export function getSafeProductById(id, products = []) {
  const catalog = getSafeCatalog(products);
  return catalog.find((item) => String(item.id) === String(id)) || null;
}
