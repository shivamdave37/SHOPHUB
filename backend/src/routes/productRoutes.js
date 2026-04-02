import express from 'express';
import {
  getProductById,
  getProductGuide,
  getProducts,
  searchProducts
} from '../controllers/productController.js';

const router = express.Router();

router.get('/search', searchProducts);
router.get('/:id/guide', getProductGuide);
router.get('/:id', getProductById);
router.get('/', getProducts);

export default router;
