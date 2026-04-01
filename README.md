# ShopHub

ShopHub is a college DBMS ecommerce demo built with MySQL 8, Node.js + Express, React, Tailwind, and JWT authentication.

## Project Structure

- `schema.sql` - MySQL schema
- `indexes.sql` - indexing and query optimization file
- `seed.sql` - sample data
- `backend/` - Express API
- `frontend/` - React client

## Run Steps

1. Create the MySQL database and load the SQL files:
   - run `schema.sql`
   - run `indexes.sql`
   - run `seed.sql`

2. Create environment files:
   - copy `backend/.env.example` to `backend/.env`
   - copy `frontend/.env.example` to `frontend/.env`

3. Update the backend database credentials in `backend/.env`

4. Install all dependencies from the project root:

```bash
npm install
```

5. Start backend and frontend together from the project root:

```bash
npm run dev
```

## Default Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Main Features

- JWT register and login
- Product listing and product details
- FULLTEXT product search with filters
- Cart management
- Transaction-safe order placement
- Admin-only product management

## Important Notes

- Admin routes are protected by JWT and role checks.
- Order placement uses MySQL transactions and row locks to reduce overselling risk.
- The seeded admin user is available in `seed.sql`.
