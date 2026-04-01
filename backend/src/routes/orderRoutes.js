import express from 'express';
import { getMyOrders, placeOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getMyOrders);
router.post('/place', placeOrder);

export default router;
