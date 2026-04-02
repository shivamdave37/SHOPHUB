export function getProductBadges(product) {
  const price = Number(product.price || 0);
  const rating = Number(product.rating || 0);
  const stock = Number(product.stock || 0);
  const badges = [];

  if (rating >= 4.6) {
    badges.push({ label: 'Best Seller', tone: 'amber' });
  } else if (rating >= 4.4) {
    badges.push({ label: 'Top Rated', tone: 'emerald' });
  }

  if (price <= 999) {
    badges.push({ label: 'Budget Pick', tone: 'sky' });
  }

  if (stock > 0 && stock <= 25) {
    badges.push({ label: 'Limited Stock', tone: 'rose' });
  }

  return badges;
}

export function badgeClassName(tone) {
  const map = {
    amber: 'bg-amber-100 text-amber-800 ring-amber-200',
    emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    sky: 'bg-sky-100 text-sky-800 ring-sky-200',
    rose: 'bg-rose-100 text-rose-800 ring-rose-200'
  };

  return map[tone] || 'bg-slate-100 text-slate-700 ring-slate-200';
}
