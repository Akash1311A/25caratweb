import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CreditCard, QrCode, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useContent } from '../context/ContentContext';

function formatPrice(value) {
  return `₹${value.toLocaleString()}`;
}

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const { cartItemsDetailed, cartSubtotal, updateCartQuantity, removeFromCart, clearCart, placeOrder, storageKeys } = useStore();
  const { products } = useContent();
  const [paymentMode, setPaymentMode] = useState('upi');
  const [message, setMessage] = useState('');

  const savedProfile = useMemo(() => {
    try {
      const raw = window.localStorage.getItem(storageKeys.profile);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [storageKeys.profile]);

  const directProductId = Number(searchParams.get('product'));
  const directProduct = products.find((item) => item.id === directProductId);
  const fallbackItems = directProduct ? [{ product: directProduct, productId: directProduct.id, quantity: 1 }] : [];
  const items = cartItemsDetailed.length > 0 ? cartItemsDetailed : fallbackItems;
  const subtotal = cartItemsDetailed.length > 0 ? cartSubtotal : fallbackItems.reduce((sum, item) => sum + item.product.price, 0);

  const [form, setForm] = useState({
    fullName: savedProfile?.fullName || '',
    phone: savedProfile?.phone || '',
    address: savedProfile?.address || '',
    city: savedProfile?.city || '',
    pincode: savedProfile?.pincode || '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!items.length) {
      setMessage('Add at least one item to your cart before placing an order.');
      return;
    }

    const order = await placeOrder({
      customer: form,
      paymentMode,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    });

    if (cartItemsDetailed.length > 0) {
      clearCart();
    }

    setMessage(`Order ${order.id} has been placed successfully.`);
  };

  return (
    <div className="min-h-screen bg-[#f7f1ff] pt-24">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7b47c8]">Checkout</p>
          <h1 className="mt-3 font-serif text-4xl text-[#121212]">Simple, fast, and secure checkout</h1>
        </div>

        {!items.length ? (
          <div className="card-luxury rounded-3xl p-10 text-center">
            <ShoppingBag className="mx-auto text-[#7b47c8]" size={28} />
            <h2 className="mt-4 font-serif text-3xl text-[#121212]">Your cart is empty</h2>
            <p className="mt-3 text-[#4B2C6F]/70">Browse the collection and add your favorite pieces before checkout.</p>
            <Link to="/shop" className="btn-premium mt-8 inline-flex px-6 py-3">
              Continue shopping
            </Link>
          </div>
        ) : (
          <form className="grid gap-8 lg:grid-cols-[1fr_0.8fr]" onSubmit={handlePlaceOrder}>
            <div className="card-luxury rounded-3xl p-8">
              <h2 className="text-2xl font-semibold text-[#121212]">Shipping details</h2>
              <div className="mt-6 grid gap-4">
                <input name="fullName" value={form.fullName} onChange={handleChange} required className="rounded-2xl border border-[#5b2ca0]/18 bg-white px-4 py-3 text-[#4B2C6F] placeholder:text-[#4B2C6F]/40 focus:border-[#7b47c8] focus:outline-none" placeholder="Full name" />
                <input name="phone" value={form.phone} onChange={handleChange} required className="rounded-2xl border border-[#5b2ca0]/18 bg-white px-4 py-3 text-[#4B2C6F] placeholder:text-[#4B2C6F]/40 focus:border-[#7b47c8] focus:outline-none" placeholder="Phone number" />
                <input name="address" value={form.address} onChange={handleChange} required className="rounded-2xl border border-[#5b2ca0]/18 bg-white px-4 py-3 text-[#4B2C6F] placeholder:text-[#4B2C6F]/40 focus:border-[#7b47c8] focus:outline-none" placeholder="Address" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input name="city" value={form.city} onChange={handleChange} required className="rounded-2xl border border-[#5b2ca0]/18 bg-white px-4 py-3 text-[#4B2C6F] placeholder:text-[#4B2C6F]/40 focus:border-[#7b47c8] focus:outline-none" placeholder="City" />
                  <input name="pincode" value={form.pincode} onChange={handleChange} required className="rounded-2xl border border-[#5b2ca0]/18 bg-white px-4 py-3 text-[#4B2C6F] placeholder:text-[#4B2C6F]/40 focus:border-[#7b47c8] focus:outline-none" placeholder="Pincode" />
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-semibold text-[#121212]">Payment method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { id: 'upi', title: 'UPI', icon: QrCode },
                  { id: 'razorpay', title: 'Razorpay', icon: CreditCard },
                  { id: 'cod', title: 'COD', icon: ShoppingBag },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentMode(item.id)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                      paymentMode === item.id ? 'border-[#7b47c8]/45 bg-[#7b47c8]/10 font-semibold text-[#4B2C6F]' : 'border-[#5b2ca0]/15 bg-white text-[#4B2C6F]/60'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.title}
                  </button>
                ))}
              </div>

              {message ? (
                <p className="mt-6 rounded-2xl border border-[#7b47c8]/16 bg-[#7b47c8]/8 px-4 py-3 text-[#7b47c8]">
                  {message}
                </p>
              ) : null}
            </div>

            <div className="luxury-panel rounded-3xl p-8">
              <h2 className="text-2xl text-white">Order summary</h2>
              <div className="mt-6 space-y-4 text-white/75">
                {items.map((item) => (
                  <div key={item.productId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{item.product.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[#d9c0ff]">{item.product.collection}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-white/60 transition hover:text-white"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-white/10 bg-white/5">
                        <button type="button" onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1))} className="px-3 py-2">
                          -
                        </button>
                        <span className="min-w-10 text-center text-white">{item.quantity}</span>
                        <button type="button" onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="px-3 py-2">
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-white">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-white">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-[#c8adf4]/20 bg-[#7b47c8]/10 p-4 text-[#d9c0ff]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} />
                  Secure and payment-ready
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Orders are currently stored locally so the checkout experience remains fully functional within the application.
                </p>
              </div>

              <button type="submit" className="btn-premium mt-8 w-full px-6 py-4">
                Place Order
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
