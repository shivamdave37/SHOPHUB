import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../components/common/EmptyState.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useDemoStore } from '../context/DemoStoreContext.jsx';
import { applyProductImageFallback, getProductImage } from '../utils/images.js';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    savedForLater,
    addresses,
    removeCartItem,
    moveToSavedForLater,
    moveSavedToCart,
    removeSavedItem,
    placeOrder,
    addAddress
  } = useDemoStore();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [customerName, setCustomerName] = useState('Guest User');
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || '');
  const [couponCode, setCouponCode] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: 'Guest User',
    line1: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [placedMessage, setPlacedMessage] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    if (!selectedAddressId && addresses[0]?.id) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.line_total), 0),
    [cartItems]
  );
  const discountAmount = couponCode.trim().toUpperCase() === 'SAVE10' ? Math.min(total * 0.1, 500) : 0;
  const grandTotal = Math.max(total >= 1000 ? total - discountAmount : total + 99 - discountAmount, 0);

  const handleSaveAddress = () => {
    if (!addressForm.fullName || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      setCheckoutError('Please complete the full delivery address before saving it.');
      return;
    }

    const address = addAddress(addressForm);
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
    setCheckoutError('');
  };

  const handlePlaceOrder = () => {
    setCheckoutError('');

    if (!selectedAddressId) {
      setShowAddressForm(true);
      setCheckoutError('Please add and select a delivery address before placing your order.');
      return;
    }

    const order = placeOrder({ paymentMethod, customerName, addressId: selectedAddressId, couponCode });
    setPlacedMessage(`Order ${order.order_number} placed successfully using ${paymentMethod.toUpperCase()}.`);
    navigate(`/orders/${encodeURIComponent(order.id)}/track`);
  };

  if (!cartItems.length) {
    return (
      <EmptyState
        title="Your cart feels lonely"
        description="Browse products to add items and build your perfect shopping list."
      >
        <Link to="/" className="btn-primary inline-flex items-center justify-center">
          Continue Shopping
        </Link>
      </EmptyState>
    );
  }

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
            <div className="space-y-2 text-right text-sm">
              <button onClick={() => moveToSavedForLater(item.product_id)} className="block font-medium text-brand-accent">
                Save for later
              </button>
              <button onClick={() => removeCartItem(item.product_id)} className="block font-medium text-red-600">
                Remove
              </button>
            </div>
          </div>
        ))}

        {savedForLater.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Saved for later</h2>
              <span className="text-sm text-slate-500">{savedForLater.length} items</span>
            </div>
            {savedForLater.map((item) => (
              <div key={item.id} className="card flex flex-col gap-4 p-5 sm:flex-row">
                <img
                  src={getProductImage(item)}
                  alt={item.title}
                  onError={applyProductImageFallback}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">Saved for your next shopping session</p>
                </div>
                <div className="space-y-2 text-right text-sm">
                  <button onClick={() => moveSavedToCart(item.product_id)} className="block font-medium text-brand-accent">
                    Move to cart
                  </button>
                  <button onClick={() => removeSavedItem(item.product_id)} className="block font-medium text-red-600">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-slate-900">Delivery Address</p>
            <button type="button" onClick={() => setShowAddressForm((value) => !value)} className="text-sm font-medium text-brand-accent">
              {showAddressForm ? 'Close' : 'Add address'}
            </button>
          </div>

          {addresses.length > 0 ? (
            <div className="space-y-2">
              {addresses.map((address) => (
                <label key={address.id} className="flex gap-3 rounded-xl border border-slate-200 p-3">
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <div className="text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">{address.fullName}</p>
                    <p>{address.line1}</p>
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No saved addresses yet. Add one for smoother checkout.</p>
          )}

          {showAddressForm && (
            <div className="mt-4 grid gap-3">
              <input className="input" placeholder="Full name" value={addressForm.fullName} onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })} />
              <input className="input" placeholder="Address line" value={addressForm.line1} onChange={(event) => setAddressForm({ ...addressForm, line1: event.target.value })} />
              <div className="grid gap-3 sm:grid-cols-3">
                <input className="input" placeholder="City" value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} />
                <input className="input" placeholder="State" value={addressForm.state} onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} />
                <input className="input" placeholder="PIN code" value={addressForm.postalCode} onChange={(event) => setAddressForm({ ...addressForm, postalCode: event.target.value })} />
              </div>
              <button type="button" onClick={handleSaveAddress} className="btn-secondary w-full">
                Save Address
              </button>
            </div>
          )}
        </div>

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
          {paymentMethod === 'upi' && (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
              <p className="text-sm font-semibold text-slate-900">Scan demo QR to simulate payment</p>
              <div className="mx-auto mt-3 grid h-36 w-36 grid-cols-6 gap-1 rounded-xl bg-white p-3 shadow-sm">
                {Array.from({ length: 36 }).map((_, index) => (
                  <span key={index} className={`${(index + paymentMethod.length) % 3 === 0 ? 'bg-slate-900' : 'bg-slate-200'} rounded-sm`} />
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">Demo UPI: pay@shophub</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="mb-3 font-semibold text-slate-900">Apply coupon</p>
          <div className="flex gap-2">
            <input className="input" placeholder="Try SAVE10" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Use SAVE10 to simulate a demo discount.</p>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Items total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span>{total >= 1000 ? 'Free' : 'Rs. 99.00'}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Coupon savings</span>
            <span>- Rs. {discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-slate-200 pt-3 text-lg font-bold text-slate-900">
          Grand total: Rs. {grandTotal.toFixed(2)}
        </div>
        <button onClick={handlePlaceOrder} className="btn-primary w-full">
          Place Order
        </button>
        {checkoutError && <p className="text-sm text-red-600">{checkoutError}</p>}
        {placedMessage && <p className="text-sm text-green-700">{placedMessage}</p>}
      </div>
    </div>
  );
}
