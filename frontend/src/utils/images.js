export const PRODUCT_FALLBACK_IMAGE = 'https://placehold.co/600x600/f8fafc/0f172a?text=ShopHub';

export const applyProductImageFallback = (event) => {
  event.currentTarget.src = PRODUCT_FALLBACK_IMAGE;
};
