USE shophub;

SET @db_name = DATABASE();

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = @db_name AND table_name = 'users' AND column_name = 'public_id') = 0,
  'ALTER TABLE users ADD COLUMN public_id CHAR(36) NOT NULL DEFAULT '''' AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE users SET public_id = UUID() WHERE public_id = '';

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'users' AND index_name = 'uq_users_public_id') = 0,
  'ALTER TABLE users ADD UNIQUE INDEX uq_users_public_id (public_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = @db_name AND table_name = 'products' AND column_name = 'public_id') = 0,
  'ALTER TABLE products ADD COLUMN public_id CHAR(36) NOT NULL DEFAULT '''' AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE products SET public_id = UUID() WHERE public_id = '';

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'products' AND index_name = 'uq_products_public_id') = 0,
  'ALTER TABLE products ADD UNIQUE INDEX uq_products_public_id (public_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = @db_name AND table_name = 'orders' AND column_name = 'public_id') = 0,
  'ALTER TABLE orders ADD COLUMN public_id CHAR(36) NOT NULL DEFAULT '''' AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE orders SET public_id = UUID() WHERE public_id = '';

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'orders' AND index_name = 'uq_orders_public_id') = 0,
  'ALTER TABLE orders ADD UNIQUE INDEX uq_orders_public_id (public_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = @db_name AND table_name = 'order_items' AND column_name = 'public_id') = 0,
  'ALTER TABLE order_items ADD COLUMN public_id CHAR(36) NOT NULL DEFAULT '''' AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE order_items SET public_id = UUID() WHERE public_id = '';

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'order_items' AND index_name = 'uq_order_items_public_id') = 0,
  'ALTER TABLE order_items ADD UNIQUE INDEX uq_order_items_public_id (public_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = @db_name AND table_name = 'payments' AND column_name = 'public_id') = 0,
  'ALTER TABLE payments ADD COLUMN public_id CHAR(36) NOT NULL DEFAULT '''' AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE payments SET public_id = UUID() WHERE public_id = '';

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'payments' AND index_name = 'uq_payments_public_id') = 0,
  'ALTER TABLE payments ADD UNIQUE INDEX uq_payments_public_id (public_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'payments' AND index_name = 'uq_payments_order_id') = 0,
  'ALTER TABLE payments ADD UNIQUE INDEX uq_payments_order_id (order_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = @db_name AND table_name = 'reviews' AND column_name = 'public_id') = 0,
  'ALTER TABLE reviews ADD COLUMN public_id CHAR(36) NOT NULL DEFAULT '''' AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE reviews SET public_id = UUID() WHERE public_id = '';

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'reviews' AND index_name = 'uq_reviews_public_id') = 0,
  'ALTER TABLE reviews ADD UNIQUE INDEX uq_reviews_public_id (public_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'products' AND index_name = 'ft_products_title_description_search') = 0,
  'ALTER TABLE products ADD FULLTEXT INDEX ft_products_title_description_search (title, description, search_vector)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'products' AND index_name = 'idx_products_category_created') = 0,
  'CREATE INDEX idx_products_category_created ON products(category_id, is_active, created_at, id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'inventory' AND index_name = 'idx_inventory_restock_monitor') = 0,
  'CREATE INDEX idx_inventory_restock_monitor ON inventory(quantity_available, quantity_reserved, last_restocked_at)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'payments' AND index_name = 'idx_payments_status_paid_at') = 0,
  'CREATE INDEX idx_payments_status_paid_at ON payments(payment_status, paid_at, id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS category_sales_summary (
  category_id BIGINT UNSIGNED NOT NULL,
  category_name VARCHAR(120) NOT NULL,
  total_orders BIGINT UNSIGNED NOT NULL DEFAULT 0,
  total_units BIGINT UNSIGNED NOT NULL DEFAULT 0,
  total_revenue DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  last_order_at TIMESTAMP NULL DEFAULT NULL,
  refreshed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (category_id),
  CONSTRAINT fk_category_sales_summary_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = @db_name AND table_name = 'category_sales_summary' AND index_name = 'idx_category_sales_summary_revenue') = 0,
  'CREATE INDEX idx_category_sales_summary_revenue ON category_sales_summary(total_revenue, total_units)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

DROP TRIGGER IF EXISTS trg_users_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_products_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_products_search_vector_before_insert;
DROP TRIGGER IF EXISTS trg_products_search_vector_before_update;
DROP TRIGGER IF EXISTS trg_orders_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_order_items_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_payments_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_reviews_public_id_before_insert;
DROP PROCEDURE IF EXISTS refresh_category_sales_summary;

DELIMITER $$

CREATE TRIGGER trg_users_public_id_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    SET NEW.public_id = UUID();
  END IF;
END$$

CREATE TRIGGER trg_products_public_id_before_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    SET NEW.public_id = UUID();
  END IF;
END$$

CREATE TRIGGER trg_products_search_vector_before_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
  SET NEW.search_vector = TRIM(CONCAT_WS(' ', NEW.title, COALESCE(NEW.description, '')));
END$$

CREATE TRIGGER trg_products_search_vector_before_update
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
  SET NEW.search_vector = TRIM(CONCAT_WS(' ', NEW.title, COALESCE(NEW.description, '')));
END$$

CREATE TRIGGER trg_orders_public_id_before_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    SET NEW.public_id = UUID();
  END IF;
END$$

CREATE TRIGGER trg_order_items_public_id_before_insert
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    SET NEW.public_id = UUID();
  END IF;
END$$

CREATE TRIGGER trg_payments_public_id_before_insert
BEFORE INSERT ON payments
FOR EACH ROW
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    SET NEW.public_id = UUID();
  END IF;
END$$

CREATE TRIGGER trg_reviews_public_id_before_insert
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
  IF NEW.public_id IS NULL OR NEW.public_id = '' THEN
    SET NEW.public_id = UUID();
  END IF;
END$$

CREATE PROCEDURE refresh_category_sales_summary()
BEGIN
  DELETE FROM category_sales_summary;

  INSERT INTO category_sales_summary (
    category_id,
    category_name,
    total_orders,
    total_units,
    total_revenue,
    last_order_at
  )
  SELECT
    c.id,
    c.name,
    COUNT(DISTINCT o.id) AS total_orders,
    COALESCE(SUM(oi.quantity), 0) AS total_units,
    COALESCE(SUM(oi.line_total), 0.00) AS total_revenue,
    MAX(o.placed_at) AS last_order_at
  FROM categories c
  LEFT JOIN products p ON p.category_id = c.id
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id
  GROUP BY c.id, c.name;
END$$

DELIMITER ;

CALL refresh_category_sales_summary();
