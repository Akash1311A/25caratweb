import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useContent } from './ContentContext';
import { api } from '../lib/api';

export const STORAGE_KEYS = {
  wishlist: 'twentyfivecarat-wishlist',
  cart: 'twentyfivecarat-cart',
  orders: 'twentyfivecarat-orders',
  enquiries: 'twentyfivecarat-enquiries',
  profile: 'twentyfivecarat-customer-profile',
  recentViews: 'twentyfivecarat-recent-views',
  paymentMethods: 'twentyfivecarat-payment-methods',
};

const defaultProfile = {
  isLoggedIn: false,
  fullName: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  pincode: '',
  notes: '',
  memberSince: '',
  lastUpdated: '',
  authProvider: '',
  marketingOptIn: false,
};

const StoreContext = createContext(null);

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeCartItem(productId, quantity = 1) {
  return {
    productId,
    quantity: Math.max(1, Number(quantity) || 1),
  };
}

export function StoreProvider({ children }) {
  const { products } = useContent();
  const [wishlist, setWishlist] = useState(() => readStorage(STORAGE_KEYS.wishlist, []));
  const [cart, setCart] = useState(() => readStorage(STORAGE_KEYS.cart, []));
  const [orders, setOrders] = useState(() => readStorage(STORAGE_KEYS.orders, []));
  const [enquiries, setEnquiries] = useState(() => readStorage(STORAGE_KEYS.enquiries, []));
  const [profile, setProfile] = useState(() => readStorage(STORAGE_KEYS.profile, defaultProfile));
  const [recentViews, setRecentViews] = useState(() => readStorage(STORAGE_KEYS.recentViews, []));
  const [savedPaymentMethods, setSavedPaymentMethods] = useState(() => readStorage(STORAGE_KEYS.paymentMethods, []));

  useEffect(() => writeStorage(STORAGE_KEYS.wishlist, wishlist), [wishlist]);
  useEffect(() => writeStorage(STORAGE_KEYS.cart, cart), [cart]);
  useEffect(() => writeStorage(STORAGE_KEYS.orders, orders), [orders]);
  useEffect(() => writeStorage(STORAGE_KEYS.enquiries, enquiries), [enquiries]);
  useEffect(() => writeStorage(STORAGE_KEYS.profile, profile), [profile]);
  useEffect(() => writeStorage(STORAGE_KEYS.recentViews, recentViews), [recentViews]);
  useEffect(() => writeStorage(STORAGE_KEYS.paymentMethods, savedPaymentMethods), [savedPaymentMethods]);

  const refreshAdminRecords = async () => {
    const [serverOrders, serverEnquiries] = await Promise.all([
      api.getOrders(),
      api.getEnquiries(),
    ]);

    setOrders(serverOrders);
    setEnquiries(serverEnquiries);
    return { orders: serverOrders, enquiries: serverEnquiries };
  };

  const cartItemsDetailed = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { ...item, product } : null;
        })
        .filter(Boolean),
    [cart],
  );

  const wishlistProducts = useMemo(
    () => products.filter((product) => wishlist.includes(product.id)),
    [products, wishlist],
  );

  const recentViewedProducts = useMemo(
    () =>
      recentViews
        .map((productId) => products.find((product) => product.id === productId))
        .filter(Boolean),
    [products, recentViews],
  );

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  const cartSubtotal = useMemo(
    () => cartItemsDetailed.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [cartItemsDetailed],
  );

  const toggleWishlist = (productId) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  };

  const addToCart = (productId, quantity = 1) => {
    const nextItem = normalizeCartItem(productId, quantity);

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);

      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + nextItem.quantity }
            : item,
        );
      }

      return [...current, nextItem];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    setCart((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: safeQuantity } : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const submitEnquiry = async (payload) => {
    const nextEnquiry = {
      id: `ENQ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload,
    };

    setEnquiries((current) => [nextEnquiry, ...current]);

    try {
      const serverEnquiry = await api.createEnquiry(payload);
      setEnquiries((current) => [serverEnquiry, ...current.filter((entry) => entry.id !== nextEnquiry.id)]);
      return serverEnquiry;
    } catch {
      return nextEnquiry;
    }
  };

  const placeOrder = async ({ customer, paymentMode, items }) => {
    const detailedItems = items
      .map((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return product ? { ...normalizeCartItem(item.productId, item.quantity), product } : null;
      })
      .filter(Boolean);

    const total = detailedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const order = {
      id: `JF-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      customer,
      paymentMode,
      items: detailedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name,
      })),
      total,
      status: 'Confirmed',
    };

    setOrders((current) => [order, ...current]);

    try {
      const serverOrder = await api.createOrder({ customer, paymentMode, items });
      setOrders((current) => [serverOrder, ...current.filter((entry) => entry.id !== order.id)]);
      return serverOrder;
    } catch {
      return order;
    }
  };

  const saveProfile = (payload) => {
    const now = new Date().toISOString();
    const nextProfile = {
      ...defaultProfile,
      ...profile,
      ...payload,
      isLoggedIn: true,
      memberSince: profile.memberSince || payload.memberSince || now,
      lastUpdated: now,
    };

    setProfile(nextProfile);
    return nextProfile;
  };

  const recordRecentView = (productId) => {
    setRecentViews((current) => {
      const next = [productId, ...current.filter((id) => id !== productId)];
      return next.slice(0, 6);
    });
  };

  const logoutProfile = () => {
    setProfile(defaultProfile);
  };

  const addPaymentMethod = (payload) => {
    const digits = String(payload.cardNumber || '').replace(/\D/g, '');
    const nextMethod = {
      id: `pm-${Date.now()}`,
      type: 'card',
      cardType: payload.cardType === 'debit' ? 'debit' : 'credit',
      label: `${payload.network || 'Card'} ${payload.cardType === 'debit' ? 'Debit' : 'Credit'}`,
      network: payload.network || 'Card',
      holderName: String(payload.holderName || '').trim(),
      cardLast4: digits.slice(-4),
      expiry: String(payload.expiry || '').trim(),
      note: String(payload.note || '').trim(),
      addedAt: new Date().toISOString(),
    };

    setSavedPaymentMethods((current) => [nextMethod, ...current]);
    return nextMethod;
  };

  const removePaymentMethod = (paymentMethodId) => {
    setSavedPaymentMethods((current) => current.filter((item) => item.id !== paymentMethodId));
  };

  const value = {
    wishlist,
    wishlistProducts,
    cart,
    cartItemsDetailed,
    cartCount,
    cartSubtotal,
    orders,
    enquiries,
    profile,
    recentViews,
    recentViewedProducts,
    savedPaymentMethods,
    setOrders,
    setEnquiries,
    toggleWishlist,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    submitEnquiry,
    placeOrder,
    saveProfile,
    logoutProfile,
    addPaymentMethod,
    removePaymentMethod,
    recordRecentView,
    refreshAdminRecords,
    updateOrderStatus: async (orderId, status) => {
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status } : order)),
      );

      try {
        await api.updateOrderStatus(orderId, status);
      } catch {
        // Keep the local optimistic update if backend is unavailable.
      }
    },
    removeEnquiry: async (enquiryId) => {
      setEnquiries((current) => current.filter((entry) => entry.id !== enquiryId));

      try {
        await api.removeEnquiry(enquiryId);
      } catch {
        // Keep the local optimistic update if backend is unavailable.
      }
    },
    storageKeys: STORAGE_KEYS,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }

  return context;
}
