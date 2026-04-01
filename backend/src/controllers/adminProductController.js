import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  isNonNegativeNumber,
  isPositiveInteger,
  isValidRating,
  normalizeText
} from '../utils/validation.js';

export const createProduct = asyncHandler(async (req, res) => {
  const categoryId = Number(req.body.category_id);
  const title = normalizeText(req.body.title);
  const description = normalizeText(req.body.description);
  const imageUrl = normalizeText(req.body.image_url);
  const price = req.body.price;
  const stock = req.body.stock;
  const rating = req.body.rating ?? 0;

  if (!isPositiveInteger(categoryId) || !title || price === undefined || stock === undefined) {
    const error = new Error('category_id, title, price, and stock are required');
    error.statusCode = 400;
    throw error;
  }

  if (!isNonNegativeNumber(price) || !isNonNegativeNumber(stock) || !isValidRating(rating)) {
    const error = new Error('Price, stock, and rating must contain valid non-negative values');
    error.statusCode = 400;
    throw error;
  }

  const [categories] = await pool.query('SELECT id FROM categories WHERE id = ?', [categoryId]);

  if (!categories.length) {
    const error = new Error('Category not found');
    error.statusCode = 404;
    throw error;
  }

  const searchVector = `${title} ${description}`.trim();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO products (category_id, title, description, price, stock, rating, search_vector, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [categoryId, title, description || null, Number(price), Number(stock), Number(rating), searchVector]
    );

    await connection.query(
      `INSERT INTO inventory (product_id, quantity_available, quantity_reserved, last_restocked_at)
       VALUES (?, ?, 0, CURRENT_TIMESTAMP)`,
      [result.insertId, Number(stock)]
    );

    if (imageUrl) {
      await connection.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
         VALUES (?, ?, ?, TRUE, 1)`,
        [result.insertId, imageUrl, title]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category_id, title, description, price, stock, rating, is_active } = req.body;

  if (!isPositiveInteger(id)) {
    const error = new Error('Valid product id is required');
    error.statusCode = 400;
    throw error;
  }

  if (category_id !== undefined && !isPositiveInteger(category_id)) {
    const error = new Error('category_id must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  if (price !== undefined && !isNonNegativeNumber(price)) {
    const error = new Error('price must be a non-negative number');
    error.statusCode = 400;
    throw error;
  }

  if (stock !== undefined && !isNonNegativeNumber(stock)) {
    const error = new Error('stock must be a non-negative number');
    error.statusCode = 400;
    throw error;
  }

  if (rating !== undefined && !isValidRating(rating)) {
    const error = new Error('rating must be between 0 and 5');
    error.statusCode = 400;
    throw error;
  }

  const [products] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);

  if (!products.length) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (category_id !== undefined) {
    const [categories] = await pool.query('SELECT id FROM categories WHERE id = ?', [category_id]);

    if (!categories.length) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
  }

  const normalizedTitle = title !== undefined ? normalizeText(title) : null;
  const normalizedDescription = description !== undefined ? normalizeText(description) : null;
  const searchVector = `${normalizedTitle || ''} ${normalizedDescription || ''}`.trim();

  await pool.query(
    `UPDATE products
     SET category_id = COALESCE(?, category_id),
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         price = COALESCE(?, price),
         stock = COALESCE(?, stock),
         rating = COALESCE(?, rating),
         search_vector = CASE
           WHEN ? <> '' THEN ?
           ELSE search_vector
         END,
         is_active = COALESCE(?, is_active),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      category_id ?? null,
      normalizedTitle ?? null,
      normalizedDescription ?? null,
      price !== undefined ? Number(price) : null,
      stock !== undefined ? Number(stock) : null,
      rating !== undefined ? Number(rating) : null,
      searchVector,
      searchVector,
      is_active ?? null,
      id
    ]
  );

  if (stock !== undefined) {
    await pool.query(
      `UPDATE inventory
       SET quantity_available = ?, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = ?`,
      [stock, id]
    );
  }

  res.json({
    success: true,
    message: 'Product updated successfully'
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    const error = new Error('Valid product id is required');
    error.statusCode = 400;
    throw error;
  }

  const [result] = await pool.query(
    'UPDATE products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id]
  );

  if (!result.affectedRows) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    message: 'Product deactivated successfully'
  });
});
