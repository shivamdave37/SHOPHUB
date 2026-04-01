import express from 'express';
import { getProductById, getProducts, searchProducts } from '../controllers/productController.js';

const router = express.Router();

router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.get('/', getProducts);

export default router;
