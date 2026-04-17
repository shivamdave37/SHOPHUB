const categoryBrands = {
  Electronics: ['VoltEdge', 'NovaTech', 'AeroSync', 'PulseWare'],
  Clothing: ['UrbanThread', 'Velvet Lane', 'North Harbor', 'ModeCraft'],
  Books: ['PageBloom', 'BrightLeaf', 'InkTrail', 'MindNest'],
  Home: ['NestAura', 'DailyLoom', 'PureHabitat', 'CasaBloom'],
  Sports: ['PeakDrive', 'HydroFit', 'FlexMotion', 'TrailForge']
};

const categoryColors = {
  Electronics: ['Black', 'Silver', 'Blue'],
  Clothing: ['Black', 'Navy', 'Beige', 'Olive'],
  Books: ['Classic', 'Collector', 'Paperback'],
  Home: ['White', 'Charcoal', 'Oak', 'Sage'],
  Sports: ['Black', 'Red', 'Blue', 'Green']
};

const categorySizes = {
  Electronics: ['Standard'],
  Clothing: ['S', 'M', 'L', 'XL'],
  Books: ['Paperback', 'Hardcover'],
  Home: ['Compact', 'Medium', 'Large'],
  Sports: ['Standard', 'Pro', 'XL']
};

const discountBands = [10, 15, 20, 25, 30];
const deliveryBands = ['Tomorrow', '2 Days', '3 Days', 'Weekend'];

export function getProductCatalogMeta(product) {
  const category = product.category_name || 'General';
  const seed = Number(product.id || 0);
  const brands = categoryBrands[category] || ['ShopHub Select'];
  const colors = categoryColors[category] || ['Standard'];
  const sizes = categorySizes[category] || ['Standard'];

  return {
    brand: brands[seed % brands.length],
    discountPercent: discountBands[seed % discountBands.length],
    color: colors[seed % colors.length],
    size: sizes[seed % sizes.length],
    deliveryLabel: deliveryBands[seed % deliveryBands.length],
    isAvailable: Number(product.stock || 0) > 0,
    isTopSeller: Number(product.rating || 0) >= 4.6,
    isBudgetFriendly: Number(product.price || 0) <= 1200
  };
}

export function getProductBadges(product) {
  const price = Number(product.price || 0);
  const rating = Number(product.rating || 0);
  const stock = Number(product.stock || 0);
  const meta = getProductCatalogMeta(product);
  const badges = [];

  if (meta.isTopSeller) {
    badges.push({ label: 'Best Seller', tone: 'amber' });
  } else if (rating >= 4.4) {
    badges.push({ label: 'Top Rated', tone: 'emerald' });
  }

  if (meta.isBudgetFriendly || price <= 999) {
    badges.push({ label: 'Budget Pick', tone: 'sky' });
  }

  if (stock > 0 && stock <= 25) {
    badges.push({ label: 'Limited Stock', tone: 'rose' });
  }

  if (meta.discountPercent >= 25) {
    badges.push({ label: `${meta.discountPercent}% Off`, tone: 'violet' });
  }

  return badges.slice(0, 3);
}

export function badgeClassName(tone) {
  const map = {
    amber: 'bg-amber-100 text-amber-800 ring-amber-200',
    emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    sky: 'bg-sky-100 text-sky-800 ring-sky-200',
    rose: 'bg-rose-100 text-rose-800 ring-rose-200',
    violet: 'bg-violet-100 text-violet-800 ring-violet-200'
  };

  return map[tone] || 'bg-slate-100 text-slate-700 ring-slate-200';
}
