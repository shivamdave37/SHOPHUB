import { useMemo, useState } from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import { useNavigate } from 'react-router-dom';
import { useDemoStore } from '../context/DemoStoreContext.jsx';
import { applyProductImageFallback, getProductImage } from '../utils/images.js';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeCartItem, placeOrder } = useDemoStore();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerName, setCustomerName] = useState('Guest User');
  const [placedMessage, setPlacedMessage] = useState('');

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.line_total), 0),
    [cartItems]
  );

  const handlePlaceOrder = () => {
    const order = placeOrder({ paymentMethod, customerName });
    setPlacedMessage(`Order ${order.order_number} placed successfully using ${paymentMethod.toUpperCase()}.`);
    navigate('/orders');
  };

  if (!cartItems.length) return <EmptyState title="Your cart is empty" description="Add a few products to continue." />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="card flex flex-col gap-4 p-5 sm:flex-row">
            <img
              src={getProductImage(item)}
              alt={item.title}
              onError={applyProductImageFallback}
              className="h-28 w-28 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">Quantity: {item.quantity}</p>
              <p className="mt-2 text-xl font-bold text-slate-900">Rs. {item.line_total}</p>
            </div>
            <button onClick={() => removeCartItem(item.product_id)} className="text-sm font-medium text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card h-fit space-y-4 p-5">
        <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
        <input
          className="input"
          placeholder="Customer name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
        />
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="mb-3 font-semibold text-slate-900">Choose Payment Method</p>
          <div className="space-y-2 text-sm">
            {['cod', 'card', 'upi', 'wallet'].map((method) => (
              <label key={method} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span className="uppercase">{method}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Items total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span>{total >= 1000 ? 'Free' : 'Rs. 99.00'}</span>
        </div>
        <div className="border-t border-slate-200 pt-3 text-lg font-bold text-slate-900">
          Grand total: Rs. {(total >= 1000 ? total : total + 99).toFixed(2)}
        </div>
        <button onClick={handlePlaceOrder} className="btn-primary w-full">
          Buy Now
        </button>
        {placedMessage && <p className="text-sm text-green-700">{placedMessage}</p>}
      </div>
    </div>
  );
}
