CREATE DATABASE IF NOT EXISTS shophub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shophub;

SET NAMES utf8mb4;

DROP EVENT IF EXISTS ev_refresh_category_sales_summary;
DROP PROCEDURE IF EXISTS refresh_category_sales_summary;
DROP TRIGGER IF EXISTS trg_users_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_products_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_products_search_vector_before_insert;
DROP TRIGGER IF EXISTS trg_products_search_vector_before_update;
DROP TRIGGER IF EXISTS trg_orders_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_order_items_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_payments_public_id_before_insert;
DROP TRIGGER IF EXISTS trg_reviews_public_id_before_insert;
DROP TABLE IF EXISTS category_sales_summary;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) NOT NULL DEFAULT '',
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_public_id (public_id),
  UNIQUE KEY uq_users_email (email),
  CHECK (CHAR_LENGTH(name) >= 2)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  description TEXT NULL,
  parent_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_parent_id (parent_id),
  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) NOT NULL DEFAULT '',
  category_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  search_vector TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_public_id (public_id),
  KEY idx_products_category_id (category_id),
  KEY idx_products_price (price),
  KEY idx_products_rating (rating),
  KEY idx_products_active_price (is_active, price),
  FULLTEXT KEY ft_products_search (search_vector),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CHECK (price >= 0),
  CHECK (stock >= 0),
  CHECK (rating >= 0 AND rating <= 5)
) ENGINE=InnoDB;

CREATE TABLE inventory (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity_available INT NOT NULL DEFAULT 0,
  quantity_reserved INT NOT NULL DEFAULT 0,
  last_restocked_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_inventory_product_id (product_id),
  KEY idx_inventory_available (quantity_available),
  CONSTRAINT fk_inventory_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CHECK (quantity_available >= 0),
  CHECK (quantity_reserved >= 0),
  CHECK (quantity_reserved <= quantity_available)
) ENGINE=InnoDB;

CREATE TABLE product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_images_product_id (product_id),
  KEY idx_product_images_primary (product_id, is_primary),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CHECK (sort_order >= 0)
) ENGINE=InnoDB;

CREATE TABLE cart (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_user_id (user_id),
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_items_cart_product (cart_id, product_id),
  KEY idx_cart_items_product_id (product_id),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES cart(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_cart_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CHECK (quantity > 0),
  CHECK (unit_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) NOT NULL DEFAULT '',
  user_id BIGINT UNSIGNED NOT NULL,
  order_number VARCHAR(40) NOT NULL,
  status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  placed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_public_id (public_id),
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY idx_orders_user_id (user_id),
  KEY idx_orders_status_placed_at (status, placed_at),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CHECK (subtotal >= 0),
  CHECK (shipping_fee >= 0),
  CHECK (total_amount >= 0),
  CHECK (total_amount >= subtotal)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) NOT NULL DEFAULT '',
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_title VARCHAR(200) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_order_items_public_id (public_id),
  UNIQUE KEY uq_order_items_order_product (order_id, product_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CHECK (quantity > 0),
  CHECK (unit_price >= 0),
  CHECK (line_total >= 0)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) NOT NULL DEFAULT '',
  order_id BIGINT UNSIGNED NOT NULL,
  payment_method ENUM('cod', 'card', 'upi', 'wallet') NOT NULL DEFAULT 'cod',
  payment_status ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(100) NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_public_id (public_id),
  UNIQUE KEY uq_payments_order_id (order_id),
  UNIQUE KEY uq_payments_transaction_ref (transaction_ref),
  KEY idx_payments_order_status (order_id, payment_status),
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CHECK (amount >= 0)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) NOT NULL DEFAULT '',
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_public_id (public_id),
  UNIQUE KEY uq_reviews_user_product (user_id, product_id),
  KEY idx_reviews_product_rating (product_id, rating),
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_reviews_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE category_sales_summary (
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
) ENGINE=InnoDB;

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
