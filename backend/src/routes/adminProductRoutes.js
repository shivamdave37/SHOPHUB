import express from 'express';
import {
  createProduct,
  deleteProduct,
  updateProduct
} from '../controllers/adminProductController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
