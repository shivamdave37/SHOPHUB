import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getCache, setCache } from '../utils/cache.js';

const productUseCases = {
  Electronics: [
    'daily personal use',
    'online classes or office work',
    'travel convenience',
    'entertainment and productivity'
  ],
  Clothing: [
    'daily wear and comfort',
    'college or office styling',
    'travel and light outdoor use',
    'seasonal wardrobe upgrades'
  ],
  Books: [
    'self-learning and study',
    'skill development',
    'daily reading habits',
    'gift and personal collection use'
  ],
  Home: [
    'daily household use',
    'kitchen or room organization',
    'comfort and convenience at home',
    'practical home improvement'
  ],
  Sports: [
    'fitness and workouts',
    'outdoor activities',
    'daily training routines',
    'strength, mobility, or endurance practice'
  ]
};

const priceBandText = (price) => {
  if (price < 700) return 'budget-friendly';
  if (price < 2500) return 'mid-range and accessible';
  if (price < 8000) return 'premium for regular users';
  return 'higher-value and best suited for serious or long-term use';
};

const stockAdvice = (stock) => {
  if (stock <= 15) return 'Stock is limited, so it may be worth buying soon if you need it.';
  if (stock <= 60) return 'Stock is moderate and suitable for normal buying demand.';
  return 'Stock is healthy, so availability should not be a problem right now.';
};

const buildProductGuide = (product) => {
  const category = product.category_name || 'General';
  const price = Number(product.price || 0);
  const rating = Number(product.rating || 0);
  const useCases = productUseCases[category] || [
    'daily practical use',
    'basic lifestyle convenience',
    'personal productivity',
    'general-purpose tasks'
  ];

  return {
    summary: `${product.title} is a ${priceBandText(price)} ${category.toLowerCase()} product designed for ${useCases[0]}.`,
    usage: `This product is mainly useful for ${useCases[0]} and ${useCases[1]}. Based on its description, it is best used when the customer wants a simple, practical, and ready-to-use option without overcomplicating the purchase.`,
    practicalApplications: [
      `Useful for ${useCases[0]}.`,
      `Can also help with ${useCases[1]}.`,
      `Practical in situations involving ${useCases[2]}.`,
      `Suitable for ${useCases[3]}.`
    ],
    bestFor: `Best for customers looking for a ${category.toLowerCase()} item with a rating of ${rating.toFixed(1)} and a ${priceBandText(price)} price point.`,
    buyingAdvice: `${stockAdvice(Number(product.stock || 0))} ${rating >= 4.5
      ? 'Its strong rating suggests it is one of the safer choices in this category.'
      : rating >= 4.0
        ? 'Its rating suggests it is a solid and practical choice for most buyers.'
        : 'It may still be useful, but customers should compare it with other options before buying.'}`,
    considerations: [
      `Category: ${category}`,
      `Price: Rs. ${product.price}`,
      `Rating: ${product.rating}`,
      `Available stock: ${product.stock}`
    ]
  };
};

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

export const getProductGuide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `product-guide:${id}`;
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
      c.name AS category_name
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    WHERE p.id = ? AND p.is_active = TRUE`,
    [id]
  );

  if (!products.length) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const responseData = buildProductGuide(products[0]);
  setCache(cacheKey, responseData, 60000);

  res.json({
    success: true,
    data: responseData
  });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const keyword = (req.query.keyword || req.query.q || '').trim();
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const minRating = req.query.minRating ? Number(req.query.minRating) : null;
  const sort = (req.query.sort || '').trim();
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
  let orderByClause = keyword
    ? 'ORDER BY relevance DESC, p.rating DESC, p.id DESC'
    : 'ORDER BY p.rating DESC, p.id DESC';

  if (sort === 'price_asc') {
    orderByClause = 'ORDER BY p.price ASC, p.id ASC';
  } else if (sort === 'price_desc') {
    orderByClause = 'ORDER BY p.price DESC, p.id DESC';
  } else if (sort === 'rating_desc') {
    orderByClause = 'ORDER BY p.rating DESC, p.id DESC';
  } else if (sort === 'newest') {
    orderByClause = 'ORDER BY p.created_at DESC, p.id DESC';
  }

  const cacheKey = `search:${keyword || 'all'}:${categoryId || 'all'}:${minPrice ?? 'min'}:${maxPrice ?? 'max'}:${minRating ?? 'rating'}:${sort || 'default'}:${page}:${limit}`;
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
    totalPages: Math.ceil(countRows[0].total / limit),
    sort
  };

  setCache(cacheKey, responseData, 30000);

  res.json({
    success: true,
    data: responseData
  });
});
