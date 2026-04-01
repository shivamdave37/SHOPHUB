import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { isPositiveInteger, normalizeText } from '../utils/validation.js';

const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generatePaymentRef = () => `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const allowedPaymentMethods = new Set(['cod', 'card', 'upi', 'wallet']);

export const getMyOrders = asyncHandler(async (req, res) => {
  const [orders] = await pool.query(
    `SELECT
      o.id,
      o.order_number,
      o.status,
      o.subtotal,
      o.shipping_fee,
      o.total_amount,
      o.placed_at
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.placed_at DESC, o.id DESC`,
    [req.user.id]
  );

  res.json({
    success: true,
    data: orders
  });
});

export const placeOrder = asyncHandler(async (req, res) => {
  const paymentMethod = normalizeText(req.body.paymentMethod || 'cod').toLowerCase();
  const connection = await pool.getConnection();

  if (!allowedPaymentMethods.has(paymentMethod)) {
    const error = new Error('Invalid payment method');
    error.statusCode = 400;
    throw error;
  }

  try {
    await connection.beginTransaction();

    const [carts] = await connection.query('SELECT id FROM cart WHERE user_id = ? FOR UPDATE', [
      req.user.id
    ]);

    if (!carts.length) {
      const error = new Error('Cart not found');
      error.statusCode = 404;
      throw error;
    }

    const cartId = carts[0].id;

    const [cartItems] = await connection.query(
      `SELECT
        ci.product_id,
        ci.quantity,
        p.title,
        p.price,
        p.stock,
        i.quantity_available,
        i.quantity_reserved
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      INNER JOIN inventory i ON i.product_id = p.id
      WHERE ci.cart_id = ?
      FOR UPDATE`,
      [cartId]
    );

    if (!cartItems.length) {
      const error = new Error('Cart is empty');
      error.statusCode = 400;
      throw error;
    }

    let subtotal = 0;

    for (const item of cartItems) {
      if (!isPositiveInteger(item.quantity)) {
        const error = new Error(`Invalid cart quantity for product: ${item.title}`);
        error.statusCode = 400;
        throw error;
      }

      const requestedQty = Number(item.quantity);
      const productStock = Number(item.stock);
      const availableQty = Number(item.quantity_available);
      const reservedQty = Number(item.quantity_reserved);
      const effectiveAvailable = Math.max(availableQty - reservedQty, 0);

      if (productStock < requestedQty || effectiveAvailable < requestedQty) {
        const error = new Error(`Insufficient stock for product: ${item.title}`);
        error.statusCode = 409;
        throw error;
      }

      subtotal += Number(item.price) * requestedQty;
    }

    const shippingFee = subtotal >= 1000 ? 0 : 99;
    const totalAmount = subtotal + shippingFee;
    const orderNumber = generateOrderNumber();

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, order_number, status, subtotal, shipping_fee, total_amount)
       VALUES (?, ?, 'paid', ?, ?, ?)`,
      [req.user.id, orderNumber, subtotal, shippingFee, totalAmount]
    );

    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      const lineTotal = Number(item.price) * Number(item.quantity);

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_title, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.title, item.quantity, item.price, lineTotal]
      );

      const [inventoryUpdate] = await connection.query(
        `UPDATE inventory
         SET quantity_available = quantity_available - ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE product_id = ?
           AND quantity_available >= ?`,
        [item.quantity, item.product_id, item.quantity]
      );

      if (!inventoryUpdate.affectedRows) {
        const error = new Error(`Inventory update failed for product: ${item.title}`);
        error.statusCode = 409;
        throw error;
      }

      const [productUpdate] = await connection.query(
        `UPDATE products
         SET stock = stock - ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?
           AND stock >= ?`,
        [item.quantity, item.product_id, item.quantity]
      );

      if (!productUpdate.affectedRows) {
        const error = new Error(`Stock update failed for product: ${item.title}`);
        error.statusCode = 409;
        throw error;
      }
    }

    await connection.query(
      `INSERT INTO payments (order_id, payment_method, payment_status, transaction_ref, amount, paid_at)
       VALUES (?, ?, 'success', ?, ?, CURRENT_TIMESTAMP)`,
      [orderId, paymentMethod, generatePaymentRef(), totalAmount]
    );

    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId,
        orderNumber,
        totalAmount
      }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});
