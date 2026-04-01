import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getCache, setCache } from '../utils/cache.js';

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const offset = (page - 1) * limit;
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;

  const conditions = ['p.is_active = TRUE'];
  const params = [];

  if (categoryId) {
    conditions.push('p.category_id = ?');
    params.push(categoryId);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const cacheKey = `products:${page}:${limit}:${categoryId || 'all'}`;
  const cachedResponse = getCache(cacheKey);

  if (cachedResponse) {
    return res.json({
      success: true,
      data: cachedResponse
    });
  }

  const [products] = await pool.query(
    `SELECT
      p.id,
      p.title,
      p.description,
      p.price,
      p.stock,
      p.rating,
      c.id AS category_id,
      c.name AS category_name,
      pi.image_url AS primary_image
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.id AND pi.is_primary = TRUE
    ${whereClause}
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM products p
     ${whereClause}`,
    params
  );

  const responseData = {
    page,
    limit,
    total: countRows[0].total,
    products
  };

  setCache(cacheKey, responseData, 45000);

  res.json({
    success: true,
    data: responseData
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `product:${id}`;
  const cachedResponse = getCache(cacheKey);

  if (cachedResponse) {
    return res.json({
      success: true,
      data: cachedResponse
    });
  }

  const [products] = await pool.query(
    `SELECT
      p.id,
      p.title,
      p.description,
      p.price,
      p.stock,
      p.rating,
      p.category_id,
      c.name AS category_name,
      pi.image_url AS primary_image
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.id AND pi.is_primary = TRUE
    WHERE p.id = ? AND p.is_active = TRUE`,
    [id]
  );

  if (!products.length) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  setCache(cacheKey, products[0], 45000);

  res.json({
    success: true,
    data: products[0]
  });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const keyword = (req.query.keyword || req.query.q || '').trim();
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const minRating = req.query.minRating ? Number(req.query.minRating) : null;
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 50);
  const offset = (page - 1) * limit;

  const conditions = ['p.is_active = TRUE'];
  const params = [];
  let relevanceSelect = '0 AS relevance';

  if (keyword) {
    relevanceSelect =
      'MATCH(p.title, p.description, p.search_vector) AGAINST(? IN NATURAL LANGUAGE MODE) AS relevance';
    params.push(keyword);
    conditions.push(
      'MATCH(p.title, p.description, p.search_vector) AGAINST(? IN NATURAL LANGUAGE MODE)'
    );
    params.push(keyword);
  }

  if (categoryId) {
    conditions.push('p.category_id = ?');
    params.push(categoryId);
  }

  if (minPrice !== null) {
    conditions.push('p.price >= ?');
    params.push(minPrice);
  }

  if (maxPrice !== null) {
    conditions.push('p.price <= ?');
    params.push(maxPrice);
  }

  if (minRating !== null) {
    conditions.push('p.rating >= ?');
    params.push(minRating);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const orderByClause = keyword
    ? 'ORDER BY relevance DESC, p.rating DESC, p.id DESC'
    : 'ORDER BY p.rating DESC, p.id DESC';
  const cacheKey = `search:${keyword || 'all'}:${categoryId || 'all'}:${minPrice ?? 'min'}:${maxPrice ?? 'max'}:${minRating ?? 'rating'}:${page}:${limit}`;
  const cachedResponse = getCache(cacheKey);

  if (cachedResponse) {
    return res.json({
      success: true,
      data: cachedResponse
    });
  }

  const [products] = await pool.query(
    `SELECT
      p.id,
      p.title,
      p.description,
      p.price,
      p.stock,
      p.rating,
      p.category_id,
      c.name AS category_name,
      pi.image_url AS primary_image,
      ${relevanceSelect}
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.id AND pi.is_primary = TRUE
    ${whereClause}
    ${orderByClause}
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM products p
     ${whereClause}`,
    params
  );

  const responseData = {
    products,
    total: countRows[0].total,
    page,
    limit,
    totalPages: Math.ceil(countRows[0].total / limit)
  };

  setCache(cacheKey, responseData, 30000);

  res.json({
    success: true,
    data: responseData
  });
});
