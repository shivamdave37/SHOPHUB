import app from './app.js';
import pool from './config/db.js';

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();

    app.listen(port, () => {
      console.log(`ShopHub backend running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MySQL:', error.message);
    process.exit(1);
  }
};

startServer();
