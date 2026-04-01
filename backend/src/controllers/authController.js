import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken } from '../utils/jwt.js';
import { isValidEmail, normalizeText } from '../utils/validation.js';

export const registerUser = asyncHandler(async (req, res) => {
  const name = normalizeText(req.body.name);
  const email = normalizeText(req.body.email).toLowerCase();
  const password = req.body.password;

  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  if (name.length < 2) {
    const error = new Error('Name must be at least 2 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (!isValidEmail(email)) {
    const error = new Error('Please provide a valid email address');
    error.statusCode = 400;
    throw error;
  }

  if (typeof password !== 'string' || password.length < 6) {
    const error = new Error('Password must be at least 6 characters long');
    error.statusCode = 400;
    throw error;
  }

  const [existingUsers] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'customer']
    );

    await connection.query('INSERT INTO cart (user_id) VALUES (?)', [result.insertId]);
    await connection.commit();

    const token = generateToken({ userId: result.insertId, role: 'customer' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: result.insertId,
          name,
          email,
          role: 'customer'
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const email = normalizeText(req.body.email).toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  if (!isValidEmail(email)) {
    const error = new Error('Please provide a valid email address');
    error.statusCode = 400;
    throw error;
  }

  const [users] = await pool.query(
    'SELECT id, name, email, password, role FROM users WHERE email = ?',
    [email]
  );

  if (!users.length) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];
  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ userId: user.id, role: user.role });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});
