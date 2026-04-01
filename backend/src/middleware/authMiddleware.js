import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Not authorized, token missing');
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    throw error;
  }

  const [users] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [decoded.userId]
  );

  if (!users.length) {
    const error = new Error('User not found');
    error.statusCode = 401;
    throw error;
  }

  req.user = users[0];
  next();
});

export const adminOnly = (req, _res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    const error = new Error('Admin access required');
    error.statusCode = 403;
    throw error;
  }

  next();
};
