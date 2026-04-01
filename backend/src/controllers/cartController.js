import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { isPositiveInteger } from '../utils/validation.js';

const getOrCreateCart = async (userId) => {
  const [carts] = await pool.query('SELECT id FROM cart WHERE user_id = ?', [userId]);

  if (carts.length) {
    return carts[0].id;
  }

  const [result] = await pool.query('INSERT INTO cart (user_id) VALUES (?)', [userId]);
  return result.insertId;
};

export const getCart = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);

  const [items] = await pool.query(
    `SELECT
      ci.id,
      ci.product_id,
      ci.quantity,
      ci.unit_price,
      (ci.quantity * ci.unit_price) AS line_total,
      p.title,
      p.stock,
      pi.image_url AS primary_image
    FROM cart_items ci
    INNER JOIN products p ON p.id = ci.product_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.id AND pi.is_primary = TRUE
    WHERE ci.cart_id = ?
    ORDER BY ci.created_at DESC`,
    [cartId]
  );

  res.json({
    success: true,
    data: items
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!isPositiveInteger(productId) || !isPositiveInteger(quantity)) {
    const error = new Error('Valid productId and quantity are required');
    error.statusCode = 400;
    throw error;
  }

  const cartId = await getOrCreateCart(req.user.id);

  const [products] = await pool.query(
    'SELECT id, price, stock, is_active FROM products WHERE id = ?',
    [productId]
  );

  if (!products.length || !products[0].is_active) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (products[0].stock < quantity) {
    const error = new Error('Requested quantity exceeds available stock');
    error.statusCode = 400;
    throw error;
  }

  const [existingItems] = await pool.query(
    'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, productId]
  );

  const currentQuantity = existingItems.length ? Number(existingItems[0].quantity) : 0;

  if (currentQuantity + Number(quantity) > Number(products[0].stock)) {
    const error = new Error('Total cart quantity exceeds available stock');
    error.statusCode = 400;
    throw error;
  }

  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       quantity = quantity + VALUES(quantity),
       unit_price = VALUES(unit_price),
       updated_at = CURRENT_TIMESTAMP`,
    [cartId, productId, quantity, products[0].price]
  );

  res.status(201).json({
    success: true,
    message: 'Product added to cart'
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!isPositiveInteger(itemId) || !isPositiveInteger(quantity)) {
    const error = new Error('Quantity must be at least 1');
    error.statusCode = 400;
    throw error;
  }

  const [cartItems] = await pool.query(
    `SELECT ci.id, ci.product_id, p.stock
     FROM cart_items ci
     INNER JOIN cart c ON c.id = ci.cart_id
     INNER JOIN products p ON p.id = ci.product_id
     WHERE ci.id = ? AND c.user_id = ?`,
    [itemId, req.user.id]
  );

  if (!cartItems.length) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }

  if (Number(quantity) > Number(cartItems[0].stock)) {
    const error = new Error('Requested quantity exceeds available stock');
    error.statusCode = 400;
    throw error;
  }

  const [result] = await pool.query(
    `UPDATE cart_items ci
     INNER JOIN cart c ON c.id = ci.cart_id
     SET ci.quantity = ?, ci.updated_at = CURRENT_TIMESTAMP
     WHERE ci.id = ? AND c.user_id = ?`,
    [quantity, itemId, req.user.id]
  );

  if (!result.affectedRows) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    message: 'Cart item updated'
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  if (!isPositiveInteger(itemId)) {
    const error = new Error('Valid cart item id is required');
    error.statusCode = 400;
    throw error;
  }

  const [result] = await pool.query(
    `DELETE ci
     FROM cart_items ci
     INNER JOIN cart c ON c.id = ci.cart_id
     WHERE ci.id = ? AND c.user_id = ?`,
    [itemId, req.user.id]
  );

  if (!result.affectedRows) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    message: 'Cart item removed'
  });
});
