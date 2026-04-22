import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut } from 'lucide-react';
import BrandMark from '../components/BrandMark';
import { useStore } from '../context/StoreContext';

function formatPrice(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function GoogleMark() {
  return (
    <span className="relative h-6 w-6 overflow-hidden rounded-full bg-white">
      <span className="absolute inset-0 rounded-full border-[6px] border-[#4285f4] border-r-transparent border-t-transparent" />
      <span className="absolute right-0 top-0 h-1/2 w-1/2 bg-[#ea4335]" />
      <span className="absolute bottom-0 right-0 h-1/2 w-1/2 bg-[#34a853]" />
      <span className="absolute left-0 top-0 h-1/2 w-1/2 bg-[#fbbc05]" />
      <span className="absolute left-[10px] top-[10px] h-[3px] w-[10px] bg-[#4285f4]" />
    </span>
  );
}

function CircleArrow() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ededed] text-[#111111]">
      <ArrowRight size={14} />
    </span>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const {
    profile,
    saveProfile,
    logoutProfile,
    recentViewedProducts,
    cartItemsDetailed,
    orders,
  } = useStore();

  const [email, setEmail] = useState(profile.email || '');
  const [marketingOptIn, setMarketingOptIn] = useState(Boolean(profile.marketingOptIn));
  const [message, setMessage] = useState('');
  const [authStage, setAuthStage] = useState('idle');
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [emailForOtp, setEmailForOtp] = useState('');
  const [activeTab, setActiveTab] = useState('forYou');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    city: profile.city || '',
    address: profile.address || '',
    pincode: profile.pincode || '',
    notes: profile.notes || '',
  });

  const displayName = profile.fullName || 'Akash Kumar';
  const displayEmail = profile.email || 'akashkjmsgupta@gmail.com';

  const savedCartValue = useMemo(
    () => cartItemsDetailed.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [cartItemsDetailed],
  );

  const handleGoogleContinue = () => {
    saveProfile({
      fullName: profile.fullName || 'Akash Kumar',
      email: profile.email || 'akashkjmsgupta@gmail.com',
      phone: profile.phone || '+91 98765 43210',
      city: profile.city || 'Delhi',
      address: profile.address || 'Pitampura, Delhi',
      pincode: profile.pincode || '110034',
      notes: profile.notes || '',
      marketingOptIn: true,
      authProvider: 'google',
    });
    setAuthStage('idle');
    setOtpCode('');
    setEmailForOtp('');
    setEnteredOtp('');
    setMessage('');
  };

  const handleEmailContinue = (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessage('Please enter your email.');
      return;
    }

    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    setEmailForOtp(trimmedEmail);
    setOtpCode(generatedOtp);
    setEnteredOtp('');
    setAuthStage('otpSent');
    setMessage(`OTP sent to ${trimmedEmail}. Use ${generatedOtp} to verify.`);
  };

  const handleOtpSubmit = (event) => {
    event.preventDefault();

    if (enteredOtp.trim() !== otpCode) {
      setMessage('Invalid OTP. Please try again.');
      return;
    }

    const inferredName =
      profile.fullName ||
      emailForOtp
        .split('@')[0]
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') ||
      'Akash Kumar';

    saveProfile({
      fullName: inferredName,
      email: emailForOtp,
      phone: profile.phone || '',
      city: profile.city || '',
      address: profile.address || '',
      pincode: profile.pincode || '',
      notes: profile.notes || '',
      marketingOptIn,
      authProvider: 'email',
    });

    setAuthStage('idle');
    setOtpCode('');
    setEmailForOtp('');
    setEnteredOtp('');
    setMessage('Email verified successfully. You are logged in.');
  };

  const handleResendOtp = () => {
    if (!emailForOtp) return;
    const newOtp = String(Math.floor(100000 + Math.random() * 900000));
    setOtpCode(newOtp);
    setMessage(`New OTP sent to ${emailForOtp}. Use ${newOtp} to verify.`);
  };

  const handleLogout = () => {
    logoutProfile();
    setEmail('');
    setMarketingOptIn(false);
    setMessage('');
    setAuthStage('idle');
    setOtpCode('');
    setEmailForOtp('');
    setEnteredOtp('');
  };

  const handleProfileUpdate = (event) => {
    event.preventDefault();
    saveProfile(editForm);
    setEditMode(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEditCancel = () => {
    setEditForm({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      city: profile.city || '',
      address: profile.address || '',
      pincode: profile.pincode || '',
      notes: profile.notes || '',
    });
    setEditMode(false);
  };

  if (!profile.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f3effb] px-4 pt-24">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <div className="relative overflow-hidden rounded-[2rem] bg-white/95 p-10 shadow-[0_28px_80px_rgba(91,44,160,0.14)] ring-1 ring-[#9b73d3]/10 backdrop-blur-sm sm:p-14">
            <div className="pointer-events-none absolute -right-16 top-8 h-44 w-44 rounded-full bg-[#c8adf4]/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-8 h-40 w-40 rounded-full bg-[#f4e3f8]/70 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#e8d7ff] bg-[#faf4ff] text-[#6c3fa9] shadow-sm">
                <BrandMark className="h-12 w-12" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8364b8]">Account access</span>
              <h1 className="font-serif text-5xl font-semibold text-[#111111]">Welcome back</h1>
              <p className="max-w-xl text-base text-[#5e5a66]">Sign in to view your profile, orders and saved favourites. Access a premium shopping experience built for luxury jewellery.</p>
            </div>

            <div className="relative z-10 mt-10 space-y-4">
              <Link
                to="/shop"
                className="btn-premium flex h-16 w-full items-center justify-center text-xl"
              >
                Continue shopping
              </Link>

              <button
                type="button"
                onClick={handleGoogleContinue}
                className="flex h-16 w-full items-center justify-center gap-4 rounded-[1rem] border border-[#d9d4cf] bg-white px-6 text-[1.05rem] font-semibold text-[#111111] shadow-sm"
              >
                <GoogleMark />
                Continue with Google
              </button>

              <div className="flex items-center gap-4 text-[1.05rem] text-[#6e6662]">
                <div className="h-px flex-1 bg-[#ddd7d1]" />
                <span>or</span>
                <div className="h-px flex-1 bg-[#ddd7d1]" />
              </div>

              <form onSubmit={authStage === 'otpSent' ? handleOtpSubmit : handleEmailContinue} className="space-y-4">
                <input
                  type="email"
                  value={authStage === 'otpSent' ? emailForOtp : email}
                  onChange={(event) => {
                    if (authStage === 'otpSent') return;
                    setEmail(event.target.value);
                  }}
                  placeholder="Enter your email"
                  disabled={authStage === 'otpSent'}
                  className="h-16 w-full rounded-[1rem] border border-[#d9d4cf] bg-[#faf7ff] px-5 text-[1.05rem] text-[#111111] outline-none placeholder:text-[#6e6662] disabled:cursor-not-allowed disabled:bg-[#f3effb]"
                />

                {authStage === 'otpSent' ? (
                  <>
                    <input
                      type="text"
                      value={enteredOtp}
                      onChange={(event) => setEnteredOtp(event.target.value)}
                      placeholder="Enter OTP"
                      className="h-16 w-full rounded-[1rem] border border-[#d9d4cf] bg-[#faf7ff] px-5 text-[1.05rem] text-[#111111] outline-none placeholder:text-[#6e6662]"
                    />

                    <button
                      type="submit"
                      className="flex h-16 w-full items-center justify-center rounded-[1rem] bg-[#4f2ae0] px-6 text-2xl font-semibold text-white shadow-[0_16px_40px_rgba(79,42,224,0.18)]"
                    >
                      Verify OTP
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="w-full rounded-[1rem] border border-[#d9d4cf] bg-white px-6 py-4 text-[1.05rem] font-semibold text-[#111111]"
                    >
                      Resend OTP
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="flex h-16 w-full items-center justify-center rounded-[1rem] bg-[#4f2ae0] px-6 text-2xl font-semibold text-white shadow-[0_16px_40px_rgba(79,42,224,0.18)]"
                    >
                      Sign in with email
                    </button>

                    <label className="flex items-center gap-3 text-[1rem] text-[#111111]">
                      <input
                        type="checkbox"
                        checked={marketingOptIn}
                        onChange={(event) => setMarketingOptIn(event.target.checked)}
                        className="h-5 w-5 rounded border-[#d9d4cf]"
                      />
                      <span>Email me with news and offers</span>
                    </label>
                  </>
                )}
              </form>
            </div>

            <p className="relative z-10 mt-8 text-center text-[0.98rem] text-[#6e6662]">
              By continuing, you agree to our <span className="underline">Terms of service</span>.
            </p>
            {message ? <p className="relative z-10 mt-4 text-center text-sm text-[#9b2f2f]">{message}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-[1500px] px-4 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside>
            <p className="font-serif text-[2.35rem] text-[#111111]">Welcome {profile.fullName?.split(' ')[0] || 'Akash'}</p>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => setActiveTab('forYou')}
                className={`w-full rounded-[1.2rem] px-7 py-6 text-left text-[1.15rem] font-semibold ${
                  activeTab === 'forYou' ? 'bg-[#1f1f1f] text-white' : 'border border-[#dedede] bg-white text-[#111111]'
                }`}
              >
                For You
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full rounded-[1.2rem] px-7 py-6 text-left text-[1.15rem] font-medium ${
                  activeTab === 'orders' ? 'bg-[#1f1f1f] text-white' : 'border border-[#dedede] bg-white text-[#111111]'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full rounded-[1.2rem] px-7 py-6 text-left text-[1.15rem] font-medium ${
                  activeTab === 'profile' ? 'bg-[#1f1f1f] text-white' : 'border border-[#dedede] bg-white text-[#111111]'
                }`}
              >
                Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-[1.2rem] border border-[#dedede] bg-white px-7 py-6 text-left text-[1.15rem] font-medium text-[#111111]"
              >
                <LogOut size={22} />
                Logout
              </button>
            </div>

            <div className="mt-14">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-[2rem] font-semibold text-[#111111]">My Profile</h2>
                <CircleArrow />
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-[#e4e4e4] bg-white p-6 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
                <p className="font-serif text-[2rem] text-[#111111]">{displayName}</p>
                <p className="mt-3 text-[1.05rem] text-[#5e6571]">{displayEmail}</p>
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-[#e4e4e4] bg-white px-6 py-5 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-serif text-[1.1rem] text-[#111111]">Store Credit</span>
                  <span className="font-serif text-[2.6rem] font-semibold text-[#111111]">Rs. 0.00</span>
                </div>
              </div>
            </div>
          </aside>

          <section>
            {activeTab === 'forYou' && (
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-[2.15rem] font-semibold text-[#111111]">Your Last Order</h2>
                  <div className="mt-6 rounded-[1.2rem] border border-dashed border-[#e5ddd2] px-6 py-10 text-center text-[1.05rem] text-[#7c8697]">
                    {orders.length > 0 ? (
                      <div className="space-y-2 text-left">
                        <p className="font-semibold text-[#111111]">{orders[0].id}</p>
                        <p>{orders[0].items.length} item(s) in this order</p>
                        <p>Total {formatPrice(orders[0].total)}</p>
                      </div>
                    ) : (
                      'Please place an order to see your order history.'
                    )}
                  </div>

                  <Link
                    to="/shop"
                    className="mt-7 inline-flex h-16 w-full max-w-xl items-center justify-center rounded-[0.9rem] bg-[#111111] px-8 text-[1.15rem] font-semibold text-white"
                  >
                    Start Shopping
                  </Link>
                </div>

                <div className="min-w-[220px] pt-1 text-left lg:text-right">
                  <h2 className="font-serif text-[3rem] font-semibold text-[#111111]">My Account</h2>
                  <Link to="/checkout" className="mt-8 inline-flex items-center gap-3 text-[1.15rem] text-[#111111]">
                    <span>View My Orders</span>
                    <CircleArrow />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="font-serif text-[2.15rem] font-semibold text-[#111111]">Order History</h2>
                <div className="mt-6 space-y-4">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order.id} className="rounded-[1.2rem] border border-[#e4e4e4] bg-white p-6 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[#111111]">{order.id}</p>
                            <p className="text-sm text-[#7c8697]">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#111111]">{formatPrice(order.total)}</p>
                            <p className="text-sm text-[#7c8697]">{order.status}</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-[#7c8697]">{order.items.length} item(s)</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.2rem] border border-dashed border-[#e5ddd2] px-6 py-10 text-center text-[1.05rem] text-[#7c8697]">
                      No orders yet. Start shopping to place your first order.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="font-serif text-[2.15rem] font-semibold text-[#111111]">Edit Profile</h2>
                {message && <p className="mt-4 text-green-600">{message}</p>}
                {editMode ? (
                  <form onSubmit={handleProfileUpdate} className="mt-6 rounded-[1.2rem] border border-[#e4e4e4] bg-white p-6 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-[#111111]">Full Name</label>
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          className="mt-1 w-full rounded border border-[#dedede] px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#111111]">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="mt-1 w-full rounded border border-[#dedede] px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#111111]">Phone</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="mt-1 w-full rounded border border-[#dedede] px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#111111]">City</label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="mt-1 w-full rounded border border-[#dedede] px-3 py-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#111111]">Address</label>
                        <textarea
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="mt-1 w-full rounded border border-[#dedede] px-3 py-2"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#111111]">Pincode</label>
                        <input
                          type="text"
                          value={editForm.pincode}
                          onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                          className="mt-1 w-full rounded border border-[#dedede] px-3 py-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#111111]">Notes</label>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="mt-1 w-full rounded border border-[#dedede] px-3 py-2"
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                      <button type="submit" className="rounded bg-[#111111] px-6 py-2 text-white">Save</button>
                      <button type="button" onClick={handleEditCancel} className="rounded border border-[#dedede] px-6 py-2">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-6 rounded-[1.2rem] border border-[#e4e4e4] bg-white p-6 shadow-[0_8px_18px_rgba(0,0,0,0.04)]">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-[#7c8697]">Full Name</p>
                        <p className="text-[#111111]">{profile.fullName || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#7c8697]">Email</p>
                        <p className="text-[#111111]">{profile.email || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#7c8697]">Phone</p>
                        <p className="text-[#111111]">{profile.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#7c8697]">City</p>
                        <p className="text-[#111111]">{profile.city || 'Not set'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-[#7c8697]">Address</p>
                        <p className="text-[#111111]">{profile.address || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#7c8697]">Pincode</p>
                        <p className="text-[#111111]">{profile.pincode || 'Not set'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-[#7c8697]">Notes</p>
                        <p className="text-[#111111]">{profile.notes || 'Not set'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditMode(true)}
                      className="mt-6 rounded bg-[#111111] px-6 py-2 text-white"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'forYou' && (
              <>
                <div className="mt-10">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-[2rem] font-semibold text-[#111111]">Recently viewed</h3>
                    <CircleArrow />
                  </div>
                  <div className="mt-4 rounded-[1.2rem] border border-dashed border-[#e5ddd2] px-6 py-12 text-center text-[1.05rem] text-[#7c8697]">
                    {recentViewedProducts.length === 0 ? (
                      'No recently viewed items'
                    ) : (
                      <div className="space-y-4 text-left">
                        {recentViewedProducts.slice(0, 3).map((product) => (
                          <Link key={product.id} to={`/product/${product.id}`} className="flex items-center gap-4 rounded-xl border border-[#ece7df] p-4">
                            <img src={product.image} alt={product.name} className="h-20 w-16 rounded-xl object-cover" />
                            <div>
                              <p className="font-semibold text-[#111111]">{product.name}</p>
                              <p className="mt-1 text-sm text-[#7c8697]">{formatPrice(product.price)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-10">
                  <div className="flex items-center gap-3">
                    <h3 className="font-serif text-[2rem] font-semibold text-[#111111]">Saved from cart</h3>
                    <CircleArrow />
                  </div>
                  <div className="mt-4 rounded-[1.2rem] border border-dashed border-[#e5ddd2] px-6 py-12 text-center text-[1.05rem] text-[#7c8697]">
                    {cartItemsDetailed.length === 0 ? (
                      'No items saved from cart'
                    ) : (
                      <div className="space-y-4 text-left">
                        {cartItemsDetailed.slice(0, 3).map((item) => (
                          <div key={item.productId} className="flex items-center justify-between gap-4 rounded-xl border border-[#ece7df] p-4">
                            <div className="flex items-center gap-4">
                              <img src={item.product.image} alt={item.product.name} className="h-20 w-16 rounded-xl object-cover" />
                              <div>
                                <p className="font-semibold text-[#111111]">{item.product.name}</p>
                                <p className="mt-1 text-sm text-[#7c8697]">Qty {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-[#111111]">{formatPrice(item.product.price * item.quantity)}</p>
                          </div>
                        ))}
                        <p className="pt-2 text-right font-semibold text-[#111111]">Total {formatPrice(savedCartValue)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
