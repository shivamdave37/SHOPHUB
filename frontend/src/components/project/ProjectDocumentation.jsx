const schemaTables = [
  {
    table: 'users',
    primaryKey: 'id (BIGINT AUTO_INCREMENT)',
    keyColumns: 'name, email, password, role, created_at',
    purpose: 'Customer and admin accounts'
  },
  {
    table: 'categories',
    primaryKey: 'id (BIGINT AUTO_INCREMENT)',
    keyColumns: 'name, slug, parent_id',
    purpose: 'Hierarchical product categories'
  },
  {
    table: 'products',
    primaryKey: 'id (BIGINT AUTO_INCREMENT)',
    keyColumns: 'title, description, price, stock, rating, category_id',
    purpose: 'Main product catalog'
  },
  {
    table: 'inventory',
    primaryKey: 'id (BIGINT AUTO_INCREMENT)',
    keyColumns: 'product_id, quantity_available, quantity_reserved',
    purpose: 'Stock tracking for safe order placement'
  },
  {
    table: 'orders',
    primaryKey: 'id (BIGINT AUTO_INCREMENT)',
    keyColumns: 'user_id, order_number, status, total_amount, placed_at',
    purpose: 'Order header records'
  },
  {
    table: 'order_items',
    primaryKey: 'id (BIGINT AUTO_INCREMENT)',
    keyColumns: 'order_id, product_id, quantity, unit_price, line_total',
    purpose: 'Line items inside each order'
  },
  {
    table: 'payments',
    primaryKey: 'id (BIGINT AUTO_INCREMENT)',
    keyColumns: 'order_id, payment_method, payment_status, amount',
    purpose: 'Fake payment tracking for demo checkout'
  },
  {
    table: 'reviews',
    primaryKey: 'id (BIGINT AUTO_INCREMENT)',
    keyColumns: 'user_id, product_id, rating, comment, created_at',
    purpose: 'Product review data'
  },
  {
    table: 'cart + cart_items',
    primaryKey: 'id (BIGINT AUTO_INCREMENT)',
    keyColumns: 'user_id, cart_id, product_id, quantity, unit_price',
    purpose: 'Shopping cart and item details'
  }
];

const relationships = [
  'Users (1) -> Orders (many): one user can place many orders.',
  'Orders (1) -> Order_Items (many): one order contains many line items.',
  'Products (1) -> Order_Items (many): one product can appear in many orders.',
  'Categories self-reference through parent_id for subcategory hierarchy.',
  'Orders (1) -> Payments (many in schema, one used in demo flow): payment records are linked to orders.',
  'Users (1) -> Reviews (many) and Products (1) -> Reviews (many): reviews connect users and products.',
  'Users (1) -> Cart (1) and Cart (1) -> Cart_Items (many): cart data is normalized into header and items.'
];

const optimizations = [
  {
    technique: 'FULLTEXT Index',
    appliedTo: 'products(title, description, search_vector)',
    benefit: 'Fast keyword search with MySQL MATCH ... AGAINST.'
  },
  {
    technique: 'Composite B-Tree Index',
    appliedTo: 'orders(user_id, placed_at)',
    benefit: 'Faster order history retrieval and sorting.'
  },
  {
    technique: 'Filter Indexing',
    appliedTo: 'products(category_id, is_active, price) and reviews(product_id, rating)',
    benefit: 'Improves category, price, and rating filters.'
  },
  {
    technique: 'Connection Pooling',
    appliedTo: 'Node.js backend MySQL pool',
    benefit: 'Handles repeated requests efficiently without opening a new connection each time.'
  },
  {
    technique: 'Transactional Row Locking',
    appliedTo: 'Inventory checks using SELECT ... FOR UPDATE',
    benefit: 'Prevents overselling during concurrent order placement.'
  },
  {
    technique: 'Application Cache',
    appliedTo: 'Product list, product detail, and search responses',
    benefit: 'Reduces repeated read pressure for demo-heavy product browsing.'
  }
];

function TableSection() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-brand-accent text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Table</th>
            <th className="px-4 py-3 font-semibold">Primary Key</th>
            <th className="px-4 py-3 font-semibold">Key Columns</th>
            <th className="px-4 py-3 font-semibold">Purpose</th>
          </tr>
        </thead>
        <tbody>
          {schemaTables.map((row) => (
            <tr key={row.table} className="border-t border-slate-200 align-top">
              <td className="px-4 py-3 font-medium text-slate-900">{row.table}</td>
              <td className="px-4 py-3 text-slate-700">{row.primaryKey}</td>
              <td className="px-4 py-3 text-slate-700">{row.keyColumns}</td>
              <td className="px-4 py-3 text-slate-700">{row.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OptimizationTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-brand-accent text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Technique</th>
            <th className="px-4 py-3 font-semibold">Applied To</th>
            <th className="px-4 py-3 font-semibold">Benefit</th>
          </tr>
        </thead>
        <tbody>
          {optimizations.map((row) => (
            <tr key={row.technique} className="border-t border-slate-200 align-top">
              <td className="px-4 py-3 font-medium text-slate-900">{row.technique}</td>
              <td className="px-4 py-3 text-slate-700">{row.appliedTo}</td>
              <td className="px-4 py-3 text-slate-700">{row.benefit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProjectDocumentation() {
  return (
    <section className="space-y-8 rounded-3xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">DBMS Documentation</p>
        <h2 className="text-3xl font-bold text-slate-900">Schema Design, Relationships, and Optimization</h2>
        <p className="max-w-3xl text-slate-600">
          These sections summarize the real database design used in ShopHub and match the MySQL 8 ecommerce schema
          built for this project.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">1.2 Schema Design</h3>
        <TableSection />
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">Entity Relationships</h3>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ul className="space-y-3 text-slate-700">
            {relationships.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-amber-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">1.4 Optimization Techniques</h3>
        <OptimizationTable />
      </div>
    </section>
  );
}
