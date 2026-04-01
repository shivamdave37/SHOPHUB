import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
