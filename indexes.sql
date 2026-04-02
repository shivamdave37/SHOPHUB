USE shophub;

-- =========================================================
-- ShopHub Index Strategy
-- Purpose:
-- 1. Speed up product search and category filtering
-- 2. Improve user order history queries
-- 3. Optimize joins on order items and reviews
-- 4. Support pagination for product listing and order listing
-- =========================================================

-- =========================================================
-- FULLTEXT SEARCH INDEX
-- Enables fast keyword search on product catalog.
-- Use with MATCH(title, description, search_vector) AGAINST(...)
-- =========================================================
ALTER TABLE products
  ADD FULLTEXT INDEX ft_products_title_description_search (title, description, search_vector);

-- =========================================================
-- REQUIRED SINGLE-COLUMN INDEXES
-- =========================================================
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);

-- =========================================================
-- USEFUL COMPOSITE INDEXES
-- =========================================================

-- Product listing by category with active products sorted by price.
CREATE INDEX idx_products_category_active_price
  ON products(category_id, is_active, price, id);

-- Product listing by category with active products sorted by rating.
CREATE INDEX idx_products_category_active_rating
  ON products(category_id, is_active, rating, id);

-- Product listing by category with newest products first.
CREATE INDEX idx_products_category_created
  ON products(category_id, is_active, created_at, id);

-- Order history for a user, newest first.
CREATE INDEX idx_orders_user_placed_at
  ON orders(user_id, placed_at, id);

-- Admin order screen by status, newest first.
CREATE INDEX idx_orders_status_placed_at
  ON orders(status, placed_at, id);

-- Fetch items for an order and join back to products efficiently.
CREATE INDEX idx_order_items_order_product
  ON order_items(order_id, product_id);

-- Product reviews screen, usually newest first or grouped by rating.
CREATE INDEX idx_reviews_product_rating_created
  ON reviews(product_id, rating, created_at, id);

-- Inventory lookup for stock validation during checkout.
CREATE INDEX idx_inventory_product_available
  ON inventory(product_id, quantity_available, quantity_reserved);

-- Inventory admin views for low-stock and restocking checks.
CREATE INDEX idx_inventory_restock_monitor
  ON inventory(quantity_available, quantity_reserved, last_restocked_at);

-- Cart item lookup when loading a user's cart.
CREATE INDEX idx_cart_items_cart_product
  ON cart_items(cart_id, product_id);

-- Fake payment tracking and admin payment lookups.
CREATE INDEX idx_payments_status_paid_at
  ON payments(payment_status, paid_at, id);

-- Pre-computed sales summary access by category or top revenue.
CREATE INDEX idx_category_sales_summary_revenue
  ON category_sales_summary(total_revenue, total_units);

-- =========================================================
-- QUERY OPTIMIZATION NOTES
-- =========================================================

-- 1. Prefer WHERE filters that match the left-most columns of composite indexes.
--    Example: (category_id, is_active, price, id) helps when filtering by
--    category_id and is_active, then sorting by price and id.

-- 2. For FULLTEXT search, avoid LIKE '%term%' on large product datasets.
--    Prefer:
--    MATCH(title, description) AGAINST('laptop' IN NATURAL LANGUAGE MODE)

-- 3. For stable pagination, always include a deterministic secondary sort.
--    Example: ORDER BY price ASC, id ASC

-- 4. For large OFFSET values, keyset pagination is more efficient than OFFSET.
--    OFFSET scans and discards rows, while keyset uses the last seen key.

-- 5. During checkout, pair indexes with transactions and row locks:
--    SELECT ... FOR UPDATE on inventory rows to prevent overselling.

-- 6. Avoid wrapping indexed columns in functions in WHERE clauses because
--    it can prevent index usage.

-- 7. ShopHub uses a summary table (category_sales_summary) to emulate
--    materialized reporting in a MySQL-friendly way for dashboard reads.

-- =========================================================
-- PAGINATION QUERY EXAMPLES
-- =========================================================

-- Offset pagination: category product listing
SELECT
  p.id,
  p.title,
  p.price,
  p.rating,
  p.stock
FROM products AS p
WHERE p.category_id = 1
  AND p.is_active = TRUE
ORDER BY p.price ASC, p.id ASC
LIMIT 12 OFFSET 0;

-- Offset pagination: user order history
SELECT
  o.id,
  o.order_number,
  o.status,
  o.total_amount,
  o.placed_at
FROM orders AS o
WHERE o.user_id = 5
ORDER BY o.placed_at DESC, o.id DESC
LIMIT 10 OFFSET 20;

-- Keyset pagination: next product page after last seen (price, id)
SELECT
  p.id,
  p.title,
  p.price,
  p.rating
FROM products AS p
WHERE p.category_id = 1
  AND p.is_active = TRUE
  AND (
    p.price > 999.00
    OR (p.price = 999.00 AND p.id > 120)
  )
ORDER BY p.price ASC, p.id ASC
LIMIT 12;

-- FULLTEXT search with pagination
SELECT
  p.id,
  p.title,
  p.price,
  MATCH(p.title, p.description) AGAINST('wireless mouse' IN NATURAL LANGUAGE MODE) AS relevance
FROM products AS p
WHERE MATCH(p.title, p.description) AGAINST('wireless mouse' IN NATURAL LANGUAGE MODE)
  AND p.is_active = TRUE
ORDER BY relevance DESC, p.id DESC
LIMIT 10 OFFSET 0;

-- =========================================================
-- EXPLAIN EXAMPLES
-- Run these to verify index usage and identify full table scans.
-- =========================================================

EXPLAIN
SELECT
  p.id,
  p.title,
  p.price
FROM products AS p
WHERE p.category_id = 2
  AND p.is_active = TRUE
ORDER BY p.price ASC, p.id ASC
LIMIT 20;

EXPLAIN
SELECT
  o.id,
  o.order_number,
  o.status,
  o.placed_at
FROM orders AS o
WHERE o.user_id = 7
ORDER BY o.placed_at DESC, o.id DESC
LIMIT 15;

EXPLAIN
SELECT
  oi.order_id,
  oi.product_id,
  oi.quantity,
  oi.line_total
FROM order_items AS oi
WHERE oi.order_id = 1001;

EXPLAIN
SELECT
  r.id,
  r.rating,
  r.comment,
  r.created_at
FROM reviews AS r
WHERE r.product_id = 25
ORDER BY r.created_at DESC, r.id DESC
LIMIT 10;

EXPLAIN
SELECT
  p.id,
  p.title,
  MATCH(p.title, p.description) AGAINST('smartphone' IN NATURAL LANGUAGE MODE) AS relevance
FROM products AS p
WHERE MATCH(p.title, p.description) AGAINST('smartphone' IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC
LIMIT 10;
