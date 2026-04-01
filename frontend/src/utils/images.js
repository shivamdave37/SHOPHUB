export const PRODUCT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80';

const CATEGORY_IMAGES = {
  electronics:
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
  clothing:
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80',
  books:
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80',
  home:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  sports:
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80'
};

export const getProductImage = (product) => {
  if (product?.primary_image && !product.primary_image.includes('images.example.com')) {
    return product.primary_image;
  }

  const category = product?.category_name?.toLowerCase();
  return CATEGORY_IMAGES[category] || PRODUCT_FALLBACK_IMAGE;
};

export const applyProductImageFallback = (event) => {
  event.currentTarget.src = PRODUCT_FALLBACK_IMAGE;
};
