import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeIndianRupee,
  BookImage,
  Boxes,
  Building2,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  Image,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Plus,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'brand', label: 'Brand', icon: Building2 },
  { id: 'home', label: 'Homepage', icon: Sparkles },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'collections', label: 'Collections', icon: BookImage },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'crm', label: 'CRM', icon: MessageSquare },
];

const emptyProduct = {
  id: Date.now(),
  name: 'New Product',
  description: 'Add a premium description for this jewellery piece.',
  price: 1999,
  originalPrice: 2999,
  category: 'Necklaces',
  collection: 'Signature Edit',
  colors: ['Gold'],
  badge: 'New Arrival',
  image: 'https://via.placeholder.com/600x800/d4af37/2f124d?text=New+Product',
  images: ['https://via.placeholder.com/600x800/d4af37/2f124d?text=New+Product'],
  inStock: true,
  rating: 5,
  reviews: 0,
  stockCount: 10,
  imageWidth: 600,
  imageHeight: 800,
  imageDisplayWidth: 0,
  imageDisplayHeight: 0,
  imageFit: 'cover',
  imagePosition: 'center',
  imagePositionX: '50%',
  imagePositionY: '50%',
  imageScale: 1,
};

const emptyCollection = {
  name: 'New Collection',
  description: 'A polished collection description for the storefront.',
  image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
};

const emptyReview = {
  id: Date.now(),
  name: 'Customer Name',
  rating: 5,
  text: 'This jewellery piece looked premium and beautifully finished.',
  location: 'Delhi',
  date: new Date().toISOString().slice(0, 10),
  verified: true,
};

const emptyPaymentMethod = {
  id: `payment-${Date.now()}`,
  type: 'card',
  cardType: 'credit',
  label: 'New Card',
  provider: '',
  upiId: '',
  holderName: '',
  cardLast4: '',
  expiry: '',
  issuer: '',
  note: '',
};

const homeFields = [
  ['heroBadge', 'Hero badge'],
  ['heroTitle', 'Hero title'],
  ['heroSubtitle', 'Hero subtitle'],
  ['heroPrimaryCta', 'Primary button'],
  ['heroSecondaryCta', 'Secondary button'],
  ['featuredCollectionsLabel', 'Collections label'],
  ['featuredCollectionsTitle', 'Collections title'],
  ['brandPromiseLabel', 'Brand promise label'],
  ['brandPromiseTitle', 'Brand promise title'],
  ['offerLabel', 'Offer label'],
  ['offerTitle', 'Offer title'],
  ['offerDescription', 'Offer description'],
];

const imageScalePresets = [
  { label: 'Low', value: 0.85 },
  { label: 'Normal', value: 1 },
  { label: 'High', value: 1.25 },
  { label: 'Extra High', value: 1.5 },
];

function formatPrice(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
}

function splitLines(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function moveItem(list, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= list.length || fromIndex === toIndex) return list;
  const next = [...list];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function clampImageScale(value) {
  return Math.min(1.8, Math.max(0.7, Number(value) || 1));
}

function getSafePreviewImageSize(value) {
  const size = Number(value);
  return size >= 120 ? `${size}px` : '100%';
}

function getSafePreviewImageScale(value) {
  const scale = Number(value);
  return scale >= 0.7 && scale <= 2.5 ? scale : 1;
}

function normalizeHomeImages(value) {
  return (value || []).map(normalizeImageUrl);
}

function normalizeImageUrl(value) {
  const input = String(value || '').trim().replace(/\\/g, '/');
  if (!input) return '';
  if (input.startsWith('data:image/')) return input;

  if (input.startsWith('uploads/')) {
    return `/${input}`;
  }

  if (input.startsWith('/public/uploads/')) {
    return input.replace('/public', '');
  }

  try {
    const url = new URL(input);
    if ((url.hostname === '127.0.0.1' || url.hostname === 'localhost') && url.pathname.startsWith('/uploads/')) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return input;
  }

  return input;
}

function isDataImageUrl(value) {
  return String(value || '').startsWith('data:image/');
}

async function dataUrlToFile(dataUrl, fileName) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
  return new File([blob], `${fileName}.${extension}`, { type: blob.type || 'image/png' });
}

function inputClassName(multiline = false) {
  return `w-full rounded-xl border border-[#d9c9ef] bg-white px-3.5 py-3 text-sm text-[#20132f] outline-none transition placeholder:text-[#8f7ea8] focus:border-[#7b47c8] focus:shadow-[0_0_0_4px_rgba(123,71,200,0.12)] ${multiline ? 'min-h-[128px] resize-y leading-7' : ''}`;
}

function Field({ label, children, hint, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#6a5688]">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs leading-5 text-[#8a7a9f]">{hint}</span> : null}
    </label>
  );
}

function Panel({ title, description, action, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e7def4] bg-white shadow-[0_18px_48px_rgba(53,24,89,0.08)]">
      <div className="flex flex-col gap-4 border-b border-[#eee7f7] bg-[#fbf9ff] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-serif text-3xl leading-tight text-[#241137]">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#68597f]">{description}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function IconButton({ label, icon: Icon, onClick, tone = 'default', disabled = false }) {
  const tones = {
    default: 'border-[#d9c9ef] bg-white text-[#4b2c6f] hover:bg-[#f5efff]',
    primary: 'border-[#7b47c8] bg-[#7b47c8] text-white hover:bg-[#5b2ca0]',
    danger: 'border-[#f0c9c2] bg-[#fff4f1] text-[#a24b3a] hover:bg-[#ffe9e4]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function StatCard({ label, value, meta, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-[#e4d8f4] bg-white p-5 text-left shadow-[0_16px_38px_rgba(53,24,89,0.08)] transition hover:-translate-y-1 hover:border-[#c8adf4]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#7b47c8]">{label}</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1e8ff] text-[#7b47c8]">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-5 text-4xl font-bold text-[#20132f]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#6c5d82]">{meta}</p>
    </button>
  );
}

function ProductPreview({ product }) {
  if (!product) return null;

  const discount = product.originalPrice ? Math.max(0, Math.round((1 - product.price / product.originalPrice) * 100)) : 0;
  const imageWidth = getSafePreviewImageSize(product.imageDisplayWidth);
  const imageHeight = getSafePreviewImageSize(product.imageDisplayHeight);
  const imageScale = getSafePreviewImageScale(product.imageScale);
  const imagePosition =
    product.imagePositionX || product.imagePositionY
      ? `${product.imagePositionX || '50%'} ${product.imagePositionY || '50%'}`
      : product.imagePosition || 'center';

  return (
    <div className="sticky top-5 rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-4">
      <div className="overflow-hidden rounded-xl border border-[#e6dcf4] bg-white">
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-[#f4edff]">
          <img
            src={product.image}
            alt={product.name}
            className=""
            style={{
              width: imageWidth,
              height: imageHeight,
              maxWidth: 'none',
              objectFit: product.imageFit || 'cover',
              objectPosition: imagePosition,
              transform: imageScale !== 1 ? `scale(${imageScale})` : undefined,
              transformOrigin: imagePosition,
            }}
          />
          <span className="absolute left-3 top-3 rounded-full bg-[#7b47c8] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
            {discount}% Off
          </span>
        </div>
        <div className="p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7b47c8]">{product.collection}</p>
          <h3 className="mt-2 text-lg font-bold leading-tight text-[#20132f]">{product.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6c5d82]">{product.description}</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-2xl font-bold text-[#241137]">{formatPrice(product.price)}</span>
            <span className="text-sm text-[#87769d] line-through">{formatPrice(product.originalPrice)}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#7a6b90]">
        Live card preview. Image fit, position, and scale changes are reflected here and on product cards.
      </p>
    </div>
  );
}

export default function Admin() {
  const {
    brandInfo,
    collections,
    homeContent,
    offerMessages,
    products,
    reviews,
    setBrandInfo,
    setCollections,
    setHomeContent,
    setOfferMessages,
    setProducts,
    setReviews,
    resetContent,
    contentStatus,
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
  } = useContent();
  const { orders, enquiries, updateOrderStatus, removeEnquiry, refreshAdminRecords } = useStore();

  const [activeSection, setActiveSection] = useState('overview');
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState(0);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);
  const [productSearch, setProductSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState('Auto-save is active. Changes are stored in the backend after login.');
  const [loginForm, setLoginForm] = useState({ email: 'admin@25carat.local', password: 'admin123' });
  const [loginError, setLoginError] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const migratedImageUrlsRef = useRef(false);

  const selectedProduct = products[selectedProductIndex] || products[0];
  const selectedCollection = collections[selectedCollectionIndex] || collections[0];
  const selectedReview = reviews[selectedReviewIndex] || reviews[0];

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products.map((product, index) => ({ product, index }));
    return products
      .map((product, index) => ({ product, index }))
      .filter(({ product }) =>
        [product.name, product.category, product.collection, product.badge].some((value) =>
          String(value || '').toLowerCase().includes(term),
        ),
      );
  }, [productSearch, products]);

  const metrics = [
    {
      label: 'Products',
      value: products.length,
      meta: `${products.filter((item) => item.inStock).length} in stock, ${products.filter((item) => !item.inStock).length} out of stock`,
      icon: Package,
      target: 'products',
    },
    { label: 'Collections', value: collections.length, meta: 'Homepage collection cards', icon: Boxes, target: 'collections' },
    { label: 'Orders', value: orders.length, meta: orders[0] ? `Latest order ${orders[0].id}` : 'No local orders yet', icon: BadgeIndianRupee, target: 'crm' },
    { label: 'Enquiries', value: enquiries.length, meta: enquiries[0] ? `Latest from ${enquiries[0].name}` : 'No enquiries yet', icon: Mail, target: 'crm' },
  ];

  const saveNotice = (message) => setStatusMessage(message);

  const uploadImageFile = async (file) => {
    if (!file) return null;

    if (!file.type.startsWith('image/')) {
      saveNotice('Please choose a valid image file.');
      return null;
    }

    try {
      saveNotice(`Uploading ${file.name}...`);
      const uploaded = await api.uploadImage(file);
      saveNotice(`${file.name} uploaded and saved.`);
      return normalizeImageUrl(uploaded.url);
    } catch (error) {
      saveNotice(error.message || 'Image upload failed. Please try another image.');
      return null;
    }
  };

  const updateHomeImages = (updater) => {
    setHomeContent((current) => {
      const previousImages = normalizeHomeImages(current.heroImages?.length ? current.heroImages : [current.heroImage]);
      const nextImages = normalizeHomeImages(typeof updater === 'function' ? updater(previousImages) : updater);
      const filteredImages = nextImages.filter(Boolean);

      return {
        ...current,
        heroImages: nextImages,
        heroImage: filteredImages[0] || '',
      };
    });
  };

  const handleHomeHeroUpload = async (event, targetIndex) => {
    const file = event.target.files?.[0];
    const uploadedUrl = await uploadImageFile(file);

    if (uploadedUrl) {
      updateHomeImages((current) => {
        const next = current.length ? [...current] : [''];
        const safeIndex = typeof targetIndex === 'number' ? targetIndex : 0;
        while (next.length <= safeIndex) next.push('');
        next[safeIndex] = uploadedUrl;
        return next;
      });
    }

    event.target.value = '';
  };

  useEffect(() => {
    if (!isAdminAuthenticated) return;

    Promise.all([refreshAdminRecords(), api.getAdminUsers()])
      .then(([, users]) => {
        setAdminUsers(users);
        saveNotice('Backend orders, enquiries, and admin accounts loaded.');
      })
      .catch(() => saveNotice('Could not load backend records. Check API server.'));
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (!isAdminAuthenticated || migratedImageUrlsRef.current) return;

    const migrateDataImages = async () => {
      const convertImage = async (value, name) => {
        const normalized = normalizeImageUrl(value);
        if (!isDataImageUrl(normalized)) return normalized;

        const file = await dataUrlToFile(normalized, name);
        const uploaded = await api.uploadImage(file);
        return normalizeImageUrl(uploaded.url);
      };

      try {
        let convertedCount = 0;
        const currentHomeImages = normalizeHomeImages(homeContent.heroImages?.length ? homeContent.heroImages : [homeContent.heroImage]);
        const nextHomeImages = [];

        for (let index = 0; index < currentHomeImages.length; index += 1) {
          const nextImage = await convertImage(currentHomeImages[index], `homepage-slide-${index + 1}`);
          if (nextImage !== currentHomeImages[index]) convertedCount += 1;
          nextHomeImages.push(nextImage);
        }

        if (convertedCount) {
          updateHomeImages(nextHomeImages);
        }

        const nextProducts = [];
        let productsChanged = false;

        for (const product of products) {
          const nextImage = await convertImage(product.image, `product-${product.id || Date.now()}`);
          const currentGallery = Array.isArray(product.images) ? product.images.map(normalizeImageUrl) : [];
          const nextGallery = [];

          for (let index = 0; index < currentGallery.length; index += 1) {
            nextGallery.push(await convertImage(currentGallery[index], `product-${product.id || Date.now()}-${index + 1}`));
          }

          const changed =
            nextImage !== normalizeImageUrl(product.image) ||
            JSON.stringify(nextGallery) !== JSON.stringify(currentGallery);

          productsChanged = productsChanged || changed;
          nextProducts.push(changed ? { ...product, image: nextImage, images: nextGallery } : product);
        }

        if (productsChanged) {
          setProducts(nextProducts);
        }

        if (convertedCount || productsChanged) {
          saveNotice('Old base64 images converted to permanent upload links.');
        }
      } catch (error) {
        saveNotice(error.message || 'Could not convert old image links. Please upload the image again.');
      } finally {
        migratedImageUrlsRef.current = true;
      }
    };

    migrateDataImages();
  }, [homeContent.heroImage, homeContent.heroImages, isAdminAuthenticated, products]);

  if (!isAdminAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f2fb] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#e2d7ef] bg-white p-6 shadow-[0_24px_70px_rgba(53,24,89,0.12)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e4d2f5] bg-[#fbf9ff] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#7b47c8]">
            <ShieldCheck size={14} />
            Admin Login
          </div>
          <h1 className="mt-4 font-serif text-4xl text-[#241137]">Secure Admin Access</h1>
          <p className="mt-2 text-sm leading-6 text-[#6c5d82]">
            Login required before editing products, content, orders, and enquiries.
          </p>
          <form
            className="mt-6 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoginError('');

              try {
                await adminLogin(loginForm.email, loginForm.password);
                saveNotice('Admin logged in. Backend saves enabled.');
              } catch (error) {
                setLoginError(error.message || 'Login failed.');
              }
            }}
          >
            <Field label="Admin email">
              <input
                className={inputClassName()}
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              />
            </Field>
            <Field label="Password">
              <input
                className={inputClassName()}
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
              />
            </Field>
            {loginError ? <p className="rounded-xl bg-[#fff4f1] px-4 py-3 text-sm font-semibold text-[#a24b3a]">{loginError}</p> : null}
            <button type="submit" className="h-11 rounded-full bg-[#241137] px-5 text-sm font-bold text-white transition hover:bg-[#4b2c6f]">
              Login
            </button>
          </form>
          <p className="mt-4 rounded-xl bg-[#fbf9ff] px-4 py-3 text-xs leading-5 text-[#6c5d82]">
            Default local credentials: admin@25carat.local / admin123. Change ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET before production deploy.
          </p>
        </div>
      </div>
    );
  }

  const updateProduct = (field, value) => {
    setProducts((current) =>
      current.map((product, index) => (index === selectedProductIndex ? { ...product, [field]: value } : product)),
    );
  };

  const updateCollection = (field, value) => {
    setCollections((current) =>
      current.map((collection, index) =>
        index === selectedCollectionIndex ? { ...collection, [field]: value } : collection,
      ),
    );
  };

  const updateReview = (field, value) => {
    setReviews((current) =>
      current.map((review, index) => (index === selectedReviewIndex ? { ...review, [field]: value } : review)),
    );
  };

  const updatePaymentMethod = (paymentMethodId, field, value) => {
    setBrandInfo((current) => ({
      ...current,
      paymentMethods: (current.paymentMethods || []).map((method) =>
        method.id === paymentMethodId ? { ...method, [field]: value } : method,
      ),
    }));
  };

  const moveSelectedProduct = (direction) => {
    const nextIndex = direction === 'up' ? selectedProductIndex - 1 : selectedProductIndex + 1;
    setProducts((current) => moveItem(current, selectedProductIndex, nextIndex));
    setSelectedProductIndex(nextIndex);
    saveNotice(`Product moved ${direction}. Storefront order updated.`);
  };

  return (
    <div className="min-h-screen bg-[#f6f2fb] text-[#20132f]">
      <header className="border-b border-[#e2d7ef] bg-[#fffafd]">
        <div className="mx-auto flex max-w-[1540px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e4d2f5] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#7b47c8]">
              <ShieldCheck size={14} />
              25 Carat Admin
            </div>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-[#241137] md:text-5xl">Professional Store Control Panel</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5d82]">
              Edit storefront content, products, images, stock, collections, reviews, orders, and enquiries from one focused workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d9c9ef] bg-white px-4 text-sm font-semibold text-[#4b2c6f] transition hover:bg-[#f5efff]"
            >
              <ArrowLeft size={16} />
              Storefront
            </Link>
            <IconButton
              label="Reset"
              icon={RefreshCcw}
              onClick={() => {
                resetContent();
                setSelectedProductIndex(0);
                setSelectedCollectionIndex(0);
                setSelectedReviewIndex(0);
                saveNotice('Default storefront data restored.');
              }}
            />
            <IconButton label="Logout" icon={ShieldCheck} onClick={adminLogout} />
            <div className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#241137] px-4 text-sm font-semibold text-white">
              <Save size={16} />
              Auto Save On
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1540px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="h-max rounded-2xl border border-[#e2d7ef] bg-white p-3 shadow-[0_14px_38px_rgba(53,24,89,0.08)] lg:sticky lg:top-5">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#8b7c9f]">Sections</p>
          <nav className="grid gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                  activeSection === section.id
                    ? 'bg-[#241137] text-white shadow-[0_12px_28px_rgba(36,17,55,0.22)]'
                    : 'text-[#5f4f79] hover:bg-[#f7f2ff]'
                }`}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </nav>

          <div className="mt-4 rounded-xl border border-[#eadff6] bg-[#fbf9ff] p-4">
            <p className="text-sm font-bold text-[#241137]">Status</p>
            <p className="mt-2 text-sm leading-6 text-[#6c5d82]">{statusMessage}</p>
            <p className="mt-2 text-xs leading-5 text-[#8a7a9f]">{contentStatus}</p>
          </div>
        </aside>

        <main className="space-y-6">
          {activeSection === 'overview' ? (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <StatCard
                    key={metric.label}
                    {...metric}
                    onClick={() => {
                      setActiveSection(metric.target);
                      saveNotice(`${metric.label} section opened.`);
                    }}
                  />
                ))}
              </section>

              <Panel title="Storefront Snapshot" description="A clean operational summary of what is live on the customer-facing website.">
                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7b47c8]">Brand</p>
                    <h3 className="mt-3 font-serif text-4xl text-[#241137]">{brandInfo.name}</h3>
                    <p className="mt-2 text-lg font-semibold text-[#7b47c8]">{brandInfo.tagline}</p>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-[#6c5d82]">{brandInfo.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {brandInfo.highlights?.map((item) => (
                        <span key={item} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#4b2c6f]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveSection('products')}
                      className="rounded-2xl border border-[#e4d8f4] bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#c8adf4]"
                    >
                      <p className="text-sm font-bold text-[#241137]">Featured product</p>
                      <p className="mt-2 text-sm leading-6 text-[#6c5d82]">{products[0]?.name || 'No product selected'}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('home')}
                      className="rounded-2xl border border-[#e4d8f4] bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#c8adf4]"
                    >
                      <p className="text-sm font-bold text-[#241137]">Hero headline</p>
                      <p className="mt-2 text-sm leading-6 text-[#6c5d82]">{homeContent.heroTitle}</p>
                    </button>
                  </div>
                </div>
              </Panel>
            </>
          ) : null}

          {activeSection === 'brand' ? (
            <Panel title="Brand Editor" description="Update identity, contact details, social links, proof points, and brand story.">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Brand name">
                  <input className={inputClassName()} value={brandInfo.name} onChange={(event) => { setBrandInfo((current) => ({ ...current, name: event.target.value })); saveNotice('Brand name updated.'); }} />
                </Field>
                <Field label="Tagline">
                  <input className={inputClassName()} value={brandInfo.tagline} onChange={(event) => { setBrandInfo((current) => ({ ...current, tagline: event.target.value })); saveNotice('Brand tagline updated.'); }} />
                </Field>
                <Field label="Phone">
                  <input className={inputClassName()} value={brandInfo.phone} onChange={(event) => { setBrandInfo((current) => ({ ...current, phone: event.target.value })); saveNotice('Phone updated.'); }} />
                </Field>
                <Field label="Email">
                  <input className={inputClassName()} value={brandInfo.email} onChange={(event) => { setBrandInfo((current) => ({ ...current, email: event.target.value })); saveNotice('Email updated.'); }} />
                </Field>
                <Field label="Instagram">
                  <input className={inputClassName()} value={brandInfo.instagram} onChange={(event) => { setBrandInfo((current) => ({ ...current, instagram: event.target.value })); saveNotice('Instagram updated.'); }} />
                </Field>
                <Field label="YouTube">
                  <input className={inputClassName()} value={brandInfo.youtube} onChange={(event) => { setBrandInfo((current) => ({ ...current, youtube: event.target.value })); saveNotice('YouTube updated.'); }} />
                </Field>
                <Field label="Google rating">
                  <input className={inputClassName()} type="number" step="0.1" value={brandInfo.googleRating} onChange={(event) => { setBrandInfo((current) => ({ ...current, googleRating: Number(event.target.value) || 0 })); saveNotice('Google rating updated.'); }} />
                </Field>
                <Field label="Total reviews">
                  <input className={inputClassName()} type="number" value={brandInfo.totalReviews} onChange={(event) => { setBrandInfo((current) => ({ ...current, totalReviews: Number(event.target.value) || 0 })); saveNotice('Total reviews updated.'); }} />
                </Field>
                <Field label="Address" className="md:col-span-2">
                  <input className={inputClassName()} value={brandInfo.address} onChange={(event) => { setBrandInfo((current) => ({ ...current, address: event.target.value })); saveNotice('Address updated.'); }} />
                </Field>
                <Field label="Description" className="md:col-span-2">
                  <textarea className={inputClassName(true)} value={brandInfo.description} onChange={(event) => { setBrandInfo((current) => ({ ...current, description: event.target.value })); saveNotice('Brand description updated.'); }} />
                </Field>
                <Field label="Story" className="md:col-span-2">
                  <textarea className={inputClassName(true)} value={brandInfo.story} onChange={(event) => { setBrandInfo((current) => ({ ...current, story: event.target.value })); saveNotice('Brand story updated.'); }} />
                </Field>
                <Field label="Highlights" hint="One highlight per line." className="md:col-span-2">
                  <textarea className={inputClassName(true)} value={(brandInfo.highlights || []).join('\n')} onChange={(event) => { setBrandInfo((current) => ({ ...current, highlights: splitLines(event.target.value) })); saveNotice('Brand highlights updated.'); }} />
                </Field>
                <Field label="Payment instructions" className="md:col-span-2">
                  <textarea
                    className={inputClassName(true)}
                    value={brandInfo.paymentInstructions || ''}
                    onChange={(event) => {
                      setBrandInfo((current) => ({ ...current, paymentInstructions: event.target.value }));
                      saveNotice('Payment instructions updated.');
                    }}
                  />
                </Field>
                <div className="md:col-span-2 rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a5688]">Accepted payment methods</p>
                      <p className="mt-2 text-sm leading-6 text-[#6c5d82]">
                        Credit card, debit card, aur UPI options yahan manage karo. Security ke liye sirf masked card details store karo.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setBrandInfo((current) => ({
                            ...current,
                            paymentMethods: [
                              ...(current.paymentMethods || []),
                              { ...emptyPaymentMethod, id: `payment-${Date.now()}`, label: 'New Card' },
                            ],
                          }));
                          saveNotice('New card payment method added.');
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#241137] bg-[#241137] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4b2c6f]"
                      >
                        <CreditCard size={16} />
                        Add Card
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrandInfo((current) => ({
                            ...current,
                            paymentMethods: [
                              ...(current.paymentMethods || []),
                              {
                                ...emptyPaymentMethod,
                                id: `payment-${Date.now()}`,
                                type: 'upi',
                                label: 'New UPI',
                                cardType: '',
                              },
                            ],
                          }));
                          saveNotice('New UPI payment method added.');
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9c9ef] bg-white px-4 py-2 text-sm font-semibold text-[#4b2c6f] transition hover:bg-[#f5efff]"
                      >
                        <Plus size={16} />
                        Add UPI
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    {(brandInfo.paymentMethods || []).map((method, index) => (
                      <div key={method.id || index} className="rounded-2xl border border-[#e4d8f4] bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-bold text-[#241137]">{method.label || `Payment method ${index + 1}`}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setBrandInfo((current) => ({
                                ...current,
                                paymentMethods: (current.paymentMethods || []).filter((item) => item.id !== method.id),
                              }));
                              saveNotice('Payment method removed.');
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f0c9c2] bg-[#fff4f1] px-4 py-2 text-sm font-semibold text-[#a24b3a] transition hover:bg-[#ffe9e4]"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <Field label="Type">
                            <select
                              className={inputClassName()}
                              value={method.type || 'card'}
                              onChange={(event) => {
                                updatePaymentMethod(method.id, 'type', event.target.value);
                                saveNotice('Payment method type updated.');
                              }}
                            >
                              <option value="card">Card</option>
                              <option value="upi">UPI</option>
                            </select>
                          </Field>
                          <Field label="Label">
                            <input
                              className={inputClassName()}
                              value={method.label || ''}
                              onChange={(event) => {
                                updatePaymentMethod(method.id, 'label', event.target.value);
                                saveNotice('Payment label updated.');
                              }}
                            />
                          </Field>
                          {method.type === 'card' ? (
                            <>
                              <Field label="Card type">
                                <select
                                  className={inputClassName()}
                                  value={method.cardType || 'credit'}
                                  onChange={(event) => {
                                    updatePaymentMethod(method.id, 'cardType', event.target.value);
                                    saveNotice('Card type updated.');
                                  }}
                                >
                                  <option value="credit">Credit card</option>
                                  <option value="debit">Debit card</option>
                                </select>
                              </Field>
                              <Field label="Card holder">
                                <input
                                  className={inputClassName()}
                                  value={method.holderName || ''}
                                  onChange={(event) => {
                                    updatePaymentMethod(method.id, 'holderName', event.target.value);
                                    saveNotice('Card holder updated.');
                                  }}
                                />
                              </Field>
                              <Field label="Last 4 digits" hint="Full card number store mat karo. Sirf last 4 digits dalo.">
                                <input
                                  className={inputClassName()}
                                  maxLength={4}
                                  value={method.cardLast4 || ''}
                                  onChange={(event) => {
                                    updatePaymentMethod(method.id, 'cardLast4', event.target.value.replace(/\D/g, '').slice(-4));
                                    saveNotice('Card last 4 digits updated.');
                                  }}
                                />
                              </Field>
                              <Field label="Expiry">
                                <input
                                  className={inputClassName()}
                                  placeholder="MM/YY"
                                  value={method.expiry || ''}
                                  onChange={(event) => {
                                    updatePaymentMethod(method.id, 'expiry', event.target.value);
                                    saveNotice('Card expiry updated.');
                                  }}
                                />
                              </Field>
                              <Field label="Issuer">
                                <input
                                  className={inputClassName()}
                                  value={method.issuer || ''}
                                  onChange={(event) => {
                                    updatePaymentMethod(method.id, 'issuer', event.target.value);
                                    saveNotice('Card issuer updated.');
                                  }}
                                />
                              </Field>
                            </>
                          ) : (
                            <>
                              <Field label="Provider">
                                <input
                                  className={inputClassName()}
                                  value={method.provider || ''}
                                  onChange={(event) => {
                                    updatePaymentMethod(method.id, 'provider', event.target.value);
                                    saveNotice('UPI provider updated.');
                                  }}
                                />
                              </Field>
                              <Field label="UPI ID">
                                <input
                                  className={inputClassName()}
                                  value={method.upiId || ''}
                                  onChange={(event) => {
                                    updatePaymentMethod(method.id, 'upiId', event.target.value);
                                    saveNotice('UPI ID updated.');
                                  }}
                                />
                              </Field>
                            </>
                          )}
                          <Field label="Note" className="md:col-span-2">
                            <textarea
                              className={inputClassName(true)}
                              value={method.note || ''}
                              onChange={(event) => {
                                updatePaymentMethod(method.id, 'note', event.target.value);
                                saveNotice('Payment note updated.');
                              }}
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2 rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a5688]">Admin accounts</p>
                      <p className="mt-2 text-sm leading-6 text-[#6c5d82]">
                        Yahan se naye admin login accounts create kar sakte ho. Existing content changes safe rahenge.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                    <div className="space-y-3">
                      {adminUsers.length ? adminUsers.map((user) => (
                        <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e4d8f4] bg-white p-4">
                          <div>
                            <p className="font-bold text-[#241137]">{user.name}</p>
                            <p className="mt-1 text-sm text-[#6c5d82]">{user.email}</p>
                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#7b47c8]">{user.role}</p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await api.removeAdminUser(user.id);
                                setAdminUsers((current) => current.filter((entry) => entry.id !== user.id));
                                saveNotice(`Admin account ${user.email} removed.`);
                              } catch (error) {
                                saveNotice(error.message || 'Admin account remove nahi ho paaya.');
                              }
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f0c9c2] bg-[#fff4f1] px-4 py-2 text-sm font-semibold text-[#a24b3a] transition hover:bg-[#ffe9e4]"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      )) : (
                        <p className="rounded-2xl border border-dashed border-[#d9c9ef] px-4 py-6 text-sm text-[#8a7a9f]">No admin accounts loaded yet.</p>
                      )}
                    </div>
                    <form
                      className="rounded-2xl border border-[#e4d8f4] bg-white p-4"
                      onSubmit={async (event) => {
                        event.preventDefault();

                        try {
                          const createdUser = await api.createAdminUser(newAdminForm);
                          setAdminUsers((current) => [createdUser, ...current]);
                          setNewAdminForm({ name: '', email: '', password: '', role: 'admin' });
                          saveNotice(`Admin account ${createdUser.email} created.`);
                        } catch (error) {
                          saveNotice(error.message || 'Admin account create nahi ho paaya.');
                        }
                      }}
                    >
                      <div className="grid gap-4">
                        <Field label="Admin name">
                          <input className={inputClassName()} value={newAdminForm.name} onChange={(event) => setNewAdminForm((current) => ({ ...current, name: event.target.value }))} />
                        </Field>
                        <Field label="Admin email">
                          <input className={inputClassName()} type="email" value={newAdminForm.email} onChange={(event) => setNewAdminForm((current) => ({ ...current, email: event.target.value }))} />
                        </Field>
                        <Field label="Password">
                          <input className={inputClassName()} type="password" value={newAdminForm.password} onChange={(event) => setNewAdminForm((current) => ({ ...current, password: event.target.value }))} />
                        </Field>
                        <Field label="Role">
                          <select className={inputClassName()} value={newAdminForm.role} onChange={(event) => setNewAdminForm((current) => ({ ...current, role: event.target.value }))}>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                          </select>
                        </Field>
                        <button type="submit" className="inline-flex h-11 items-center justify-center rounded-full bg-[#241137] px-5 text-sm font-bold text-white transition hover:bg-[#4b2c6f]">
                          Create Admin Account
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </Panel>
          ) : null}

          {activeSection === 'home' ? (
            <Panel title="Homepage Editor" description="Control hero text, collection headings, offer ticker messages, and promotional content.">
              <div className="grid gap-5 md:grid-cols-2">
                {homeFields.map(([key, label]) => (
                  <Field key={key} label={label} className={key.toLowerCase().includes('description') || key.toLowerCase().includes('subtitle') ? 'md:col-span-2' : ''}>
                    {key.toLowerCase().includes('description') || key.toLowerCase().includes('subtitle') ? (
                      <textarea className={inputClassName(true)} value={homeContent[key] || ''} onChange={(event) => { setHomeContent((current) => ({ ...current, [key]: event.target.value })); saveNotice(`${label} updated.`); }} />
                    ) : (
                      <input className={inputClassName()} value={homeContent[key] || ''} onChange={(event) => { setHomeContent((current) => ({ ...current, [key]: event.target.value })); saveNotice(`${label} updated.`); }} />
                    )}
                  </Field>
                ))}
                <div className="md:col-span-2 rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6a5688]">Homepage hero images</p>
                  <p className="mt-2 text-sm leading-6 text-[#6c5d82]">
                    Yahan se aap homepage slider ki sari images alag-alag control kar sakte ho. Ab product image automatic use nahi hogi.
                  </p>
                  <div className="mt-4 space-y-4">
                    {normalizeHomeImages(homeContent.heroImages?.length ? homeContent.heroImages : [homeContent.heroImage]).map((image, index) => (
                      <div key={`home-hero-image-${index}`} className="rounded-2xl border border-[#e4d8f4] bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-bold text-[#241137]">Slide {index + 1}</p>
                          <div className="flex flex-wrap gap-2">
                            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#7b47c8] bg-[#7b47c8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5b2ca0]">
                              <Image size={16} />
                              Upload
                              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleHomeHeroUpload(event, index)} />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                updateHomeImages((current) => current.map((item, itemIndex) => (itemIndex === index ? '' : item)));
                                saveNotice(`Homepage image ${index + 1} cleared.`);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9c9ef] bg-white px-4 py-2 text-sm font-semibold text-[#4b2c6f] transition hover:bg-[#f5efff]"
                            >
                              Clear
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateHomeImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
                                saveNotice(`Homepage slide ${index + 1} removed.`);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f0c9c2] bg-[#fff4f1] px-4 py-2 text-sm font-semibold text-[#a24b3a] transition hover:bg-[#ffe9e4]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                          <Field label="Image URL">
                            <input
                              className={inputClassName()}
                              value={image}
                              placeholder="https://example.com/home-banner.jpg"
                              onChange={(event) => {
                                updateHomeImages((current) =>
                                  current.map((item, itemIndex) => (itemIndex === index ? normalizeImageUrl(event.target.value) : item)),
                                );
                                saveNotice(`Homepage image ${index + 1} updated.`);
                              }}
                            />
                          </Field>
                          {image ? (
                            <img src={image} alt={`Homepage slide ${index + 1}`} className="h-44 w-full rounded-2xl object-cover" />
                          ) : (
                            <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-[#d9c9ef] px-4 text-sm text-[#8a7a9f]">
                              Image URL ya upload yahan preview dikhayega.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateHomeImages((current) => [...current, '']);
                      saveNotice('New homepage image slot added.');
                    }}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-[#241137] bg-[#241137] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4b2c6f]"
                  >
                    <Plus size={16} />
                    Add another image
                  </button>
                </div>
                <Field label="Offer ticker messages" hint="One message per line." className="md:col-span-2">
                  <textarea className={inputClassName(true)} value={offerMessages.join('\n')} onChange={(event) => { setOfferMessages(splitLines(event.target.value)); saveNotice('Offer messages updated.'); }} />
                </Field>
              </div>
            </Panel>
          ) : null}

          {activeSection === 'products' ? (
            <Panel
              title="Product Studio"
              description="Edit every product field, image gallery, card image behavior, stock state, pricing, reviews, badges, and storefront order."
              action={
                <IconButton
                  label="Add Product"
                  icon={Plus}
                  tone="primary"
                  onClick={() => {
                    setProducts((current) => [...current, { ...emptyProduct, id: Date.now() }]);
                    setSelectedProductIndex(products.length);
                    saveNotice('New product added.');
                  }}
                />
              }
            >
              <div className="grid gap-5 xl:grid-cols-[320px_1fr_300px]">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f7ea8]" size={16} />
                    <input
                      className={`${inputClassName()} pl-10`}
                      placeholder="Search products"
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                    />
                  </div>
                  <div className="max-h-[720px] space-y-2 overflow-auto pr-1">
                    {filteredProducts.map(({ product, index }) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setSelectedProductIndex(index)}
                        className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${
                          selectedProductIndex === index ? 'border-[#7b47c8] bg-[#f5efff]' : 'border-[#e5daf2] bg-white hover:bg-[#fbf9ff]'
                        }`}
                      >
                        <img src={product.image} alt="" className="h-16 w-14 rounded-lg bg-[#f4edff] object-cover" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#241137]">{product.name}</p>
                          <p className="mt-1 text-xs text-[#6c5d82]">{product.category} | {formatPrice(product.price)}</p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7b47c8]">{product.inStock ? 'In stock' : 'Out of stock'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedProduct ? (
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      <IconButton label="Move Up" icon={ArrowUp} onClick={() => moveSelectedProduct('up')} disabled={selectedProductIndex === 0} />
                      <IconButton label="Move Down" icon={ArrowDown} onClick={() => moveSelectedProduct('down')} disabled={selectedProductIndex >= products.length - 1} />
                      <Link to={`/product/${selectedProduct.id}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#d9c9ef] bg-white px-4 text-sm font-semibold text-[#4b2c6f] transition hover:bg-[#f5efff]">
                        <Eye size={16} />
                        View Page
                      </Link>
                    </div>

                    <div className="rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-4">
                      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#241137]">
                        <Package size={17} />
                        Core Details
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Product name" className="md:col-span-2">
                          <input className={inputClassName()} value={selectedProduct.name} onChange={(event) => { updateProduct('name', event.target.value); saveNotice('Product name updated.'); }} />
                        </Field>
                        <Field label="Category">
                          <input className={inputClassName()} value={selectedProduct.category} onChange={(event) => { updateProduct('category', event.target.value); saveNotice('Category updated.'); }} />
                        </Field>
                        <Field label="Collection">
                          <input className={inputClassName()} value={selectedProduct.collection} onChange={(event) => { updateProduct('collection', event.target.value); saveNotice('Collection updated.'); }} />
                        </Field>
                        <Field label="Badge">
                          <input className={inputClassName()} value={selectedProduct.badge} onChange={(event) => { updateProduct('badge', event.target.value); saveNotice('Badge updated.'); }} />
                        </Field>
                        <Field label="Colors" hint="Comma separated.">
                          <input className={inputClassName()} value={(selectedProduct.colors || []).join(', ')} onChange={(event) => { updateProduct('colors', event.target.value.split(',').map((item) => item.trim()).filter(Boolean)); saveNotice('Colors updated.'); }} />
                        </Field>
                        <Field label="Description" className="md:col-span-2">
                          <textarea className={inputClassName(true)} value={selectedProduct.description} onChange={(event) => { updateProduct('description', event.target.value); saveNotice('Description updated.'); }} />
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-4">
                      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#241137]">
                        <BadgeIndianRupee size={17} />
                        Pricing, Stock, Trust
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Field label="Price">
                          <input className={inputClassName()} type="number" value={selectedProduct.price} onChange={(event) => { updateProduct('price', Number(event.target.value) || 0); saveNotice('Price updated.'); }} />
                        </Field>
                        <Field label="Original price">
                          <input className={inputClassName()} type="number" value={selectedProduct.originalPrice} onChange={(event) => { updateProduct('originalPrice', Number(event.target.value) || 0); saveNotice('Original price updated.'); }} />
                        </Field>
                        <Field label="Stock count">
                          <input className={inputClassName()} type="number" value={selectedProduct.stockCount} onChange={(event) => { updateProduct('stockCount', Number(event.target.value) || 0); saveNotice('Stock count updated.'); }} />
                        </Field>
                        <Field label="Rating">
                          <input className={inputClassName()} type="number" min="0" max="5" value={selectedProduct.rating} onChange={(event) => { updateProduct('rating', Number(event.target.value) || 0); saveNotice('Rating updated.'); }} />
                        </Field>
                        <Field label="Review count">
                          <input className={inputClassName()} type="number" value={selectedProduct.reviews} onChange={(event) => { updateProduct('reviews', Number(event.target.value) || 0); saveNotice('Review count updated.'); }} />
                        </Field>
                        <Field label="In stock">
                          <select className={inputClassName()} value={selectedProduct.inStock ? 'yes' : 'no'} onChange={(event) => { updateProduct('inStock', event.target.value === 'yes'); saveNotice('Stock status updated.'); }}>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </Field>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-4">
                      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#241137]">
                        <Image size={17} />
                        Image Controls
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Primary image URL" className="md:col-span-2">
                          <input
                            className={inputClassName()}
                            value={selectedProduct.image}
                            onChange={(event) => {
                              updateProduct('image', normalizeImageUrl(event.target.value));
                              saveNotice('Primary image updated.');
                            }}
                          />
                        </Field>
                        <div className="md:col-span-2">
                          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#6a5688]">Upload primary image</span>
                          <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#7b47c8] bg-white px-5 text-sm font-semibold text-[#7b47c8] transition hover:bg-[#f5efff]">
                            <Image size={16} />
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (event) => {
                                const file = event.target.files?.[0];
                                const uploadedUrl = await uploadImageFile(file);

                                if (uploadedUrl) {
                                  setProducts((current) =>
                                    current.map((product, index) => {
                                      if (index !== selectedProductIndex) return product;

                                      const currentGallery = Array.isArray(product.images) ? product.images : [];
                                      return {
                                        ...product,
                                        image: uploadedUrl,
                                        images: [uploadedUrl, ...currentGallery.filter((image) => image && image !== uploadedUrl)],
                                      };
                                    }),
                                  );
                                }

                                event.target.value = '';
                              }}
                            />
                          </label>
                          <p className="mt-2 text-xs leading-5 text-[#8a7a9f]">
                            Uploaded file is stored as a permanent URL and added to this product gallery.
                          </p>
                        </div>
                        <Field label="Image gallery" hint="One image URL per line." className="md:col-span-2">
                          <textarea
                            className={inputClassName(true)}
                            value={(selectedProduct.images || []).join('\n')}
                            onChange={(event) => {
                              updateProduct('images', splitLines(event.target.value).map(normalizeImageUrl));
                              saveNotice('Gallery updated.');
                            }}
                          />
                        </Field>
                        <Field label="Image natural width">
                          <input className={inputClassName()} type="number" value={selectedProduct.imageWidth || 600} onChange={(event) => { updateProduct('imageWidth', Number(event.target.value) || 600); saveNotice('Image width updated.'); }} />
                        </Field>
                        <Field label="Image natural height">
                          <input className={inputClassName()} type="number" value={selectedProduct.imageHeight || 800} onChange={(event) => { updateProduct('imageHeight', Number(event.target.value) || 800); saveNotice('Image height updated.'); }} />
                        </Field>
                        <Field label="Display width (px)" hint="Blank or 0 means full card width. Type any custom width manually.">
                          <input
                            className={inputClassName()}
                            type="number"
                            min="0"
                            placeholder="0 = auto"
                            value={selectedProduct.imageDisplayWidth || ''}
                            onChange={(event) => {
                              updateProduct('imageDisplayWidth', Number(event.target.value) || 0);
                              saveNotice('Manual display width updated.');
                            }}
                          />
                        </Field>
                        <Field label="Display height (px)" hint="Blank or 0 means full card height. Type any custom height manually.">
                          <input
                            className={inputClassName()}
                            type="number"
                            min="0"
                            placeholder="0 = auto"
                            value={selectedProduct.imageDisplayHeight || ''}
                            onChange={(event) => {
                              updateProduct('imageDisplayHeight', Number(event.target.value) || 0);
                              saveNotice('Manual display height updated.');
                            }}
                          />
                        </Field>
                        <Field label="Card image fit">
                          <select className={inputClassName()} value={selectedProduct.imageFit || 'cover'} onChange={(event) => { updateProduct('imageFit', event.target.value); saveNotice('Image fit updated.'); }}>
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="fill">Fill</option>
                            <option value="none">None</option>
                          </select>
                        </Field>
                        <Field label="Image position">
                          <select className={inputClassName()} value={selectedProduct.imagePosition || 'center'} onChange={(event) => { updateProduct('imagePosition', event.target.value); saveNotice('Image position updated.'); }}>
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="top center">Top center</option>
                            <option value="bottom center">Bottom center</option>
                          </select>
                        </Field>
                        <Field label="Position X" hint="Example: 50%, 20%, left, center, right.">
                          <input
                            className={inputClassName()}
                            value={selectedProduct.imagePositionX || ''}
                            placeholder="50%"
                            onChange={(event) => {
                              updateProduct('imagePositionX', event.target.value);
                              saveNotice('Manual image X position updated.');
                            }}
                          />
                        </Field>
                        <Field label="Position Y" hint="Example: 50%, 15%, top, center, bottom.">
                          <input
                            className={inputClassName()}
                            value={selectedProduct.imagePositionY || ''}
                            placeholder="50%"
                            onChange={(event) => {
                              updateProduct('imagePositionY', event.target.value);
                              saveNotice('Manual image Y position updated.');
                            }}
                          />
                        </Field>
                        <Field label="Scale value" hint="Type manually. 1 = 100%, 1.25 = 125%, 0.85 = 85%.">
                          <input
                            className={inputClassName()}
                            type="number"
                            min="0.7"
                            max="1.8"
                            step="0.01"
                            value={selectedProduct.imageScale || 1}
                            onChange={(event) => {
                              updateProduct('imageScale', clampImageScale(event.target.value));
                              saveNotice('Manual image scale updated.');
                            }}
                          />
                        </Field>
                        <Field label="Scale percent" hint="Type 100 for normal, 125 for high, 85 for low.">
                          <input
                            className={inputClassName()}
                            type="number"
                            min="70"
                            max="180"
                            step="1"
                            value={Math.round((selectedProduct.imageScale || 1) * 100)}
                            onChange={(event) => {
                              updateProduct('imageScale', clampImageScale((Number(event.target.value) || 100) / 100));
                              saveNotice('Manual image scale percent updated.');
                            }}
                          />
                        </Field>
                        <div className="md:col-span-2">
                          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#6a5688]">Quick image size</span>
                          <div className="grid gap-2 sm:grid-cols-4">
                            {imageScalePresets.map((preset) => {
                              const active = Math.abs((selectedProduct.imageScale || 1) - preset.value) < 0.01;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => {
                                    updateProduct('imageScale', preset.value);
                                    saveNotice(`Image size set to ${preset.label}.`);
                                  }}
                                  className={`h-11 rounded-full border px-3 text-sm font-bold transition ${
                                    active
                                      ? 'border-[#7b47c8] bg-[#7b47c8] text-white shadow-[0_10px_22px_rgba(123,71,200,0.22)]'
                                      : 'border-[#d9c9ef] bg-white text-[#4b2c6f] hover:bg-[#f5efff]'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#6a5688]">Fine tune image size</span>
                          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#d9c9ef] bg-white p-3">
                            <button
                              type="button"
                              onClick={() => {
                                updateProduct('imageScale', clampImageScale((selectedProduct.imageScale || 1) - 0.05));
                                saveNotice('Image size decreased.');
                              }}
                              className="h-10 rounded-full border border-[#d9c9ef] px-4 text-sm font-bold text-[#4b2c6f] transition hover:bg-[#f5efff]"
                            >
                              Low -
                            </button>
                            <div className="min-w-[86px] rounded-full bg-[#f5efff] px-4 py-2 text-center text-sm font-bold text-[#4b2c6f]">
                              {Math.round((selectedProduct.imageScale || 1) * 100)}%
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateProduct('imageScale', clampImageScale((selectedProduct.imageScale || 1) + 0.05));
                                saveNotice('Image size increased.');
                              }}
                              className="h-10 rounded-full border border-[#d9c9ef] px-4 text-sm font-bold text-[#4b2c6f] transition hover:bg-[#f5efff]"
                            >
                              High +
                            </button>
                          </div>
                        </div>
                        <Field label={`Image scale: ${selectedProduct.imageScale || 1}x`} className="md:col-span-2">
                          <input
                            className="w-full accent-[#7b47c8]"
                            type="range"
                            min="0.7"
                            max="1.8"
                            step="0.05"
                            value={selectedProduct.imageScale || 1}
                            onChange={(event) => { updateProduct('imageScale', clampImageScale(event.target.value)); saveNotice('Image scale updated.'); }}
                          />
                        </Field>
                      </div>
                    </div>

                    <IconButton
                      label="Delete Product"
                      icon={Trash2}
                      tone="danger"
                      onClick={() => {
                        setProducts((current) => current.filter((_, index) => index !== selectedProductIndex));
                        setSelectedProductIndex((current) => Math.max(0, current - 1));
                        saveNotice('Selected product deleted.');
                      }}
                    />
                  </div>
                ) : null}

                <ProductPreview product={selectedProduct} />
              </div>
            </Panel>
          ) : null}

          {activeSection === 'collections' ? (
            <Panel
              title="Collection Manager"
              description="Edit collection cards shown on the homepage and catalog experiences."
              action={<IconButton label="Add Collection" icon={Plus} tone="primary" onClick={() => { setCollections((current) => [...current, emptyCollection]); setSelectedCollectionIndex(collections.length); saveNotice('New collection added.'); }} />}
            >
              <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                <div className="space-y-2">
                  {collections.map((collection, index) => (
                    <button
                      key={`${collection.name}-${index}`}
                      type="button"
                      onClick={() => setSelectedCollectionIndex(index)}
                      className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${selectedCollectionIndex === index ? 'border-[#7b47c8] bg-[#f5efff]' : 'border-[#e5daf2] bg-white hover:bg-[#fbf9ff]'}`}
                    >
                      <img src={collection.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-[#241137]">{collection.name}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-[#6c5d82]">{collection.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedCollection ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Collection name">
                      <input className={inputClassName()} value={selectedCollection.name} onChange={(event) => { updateCollection('name', event.target.value); saveNotice('Collection name updated.'); }} />
                    </Field>
                    <Field label="Image URL">
                      <input
                        className={inputClassName()}
                        value={selectedCollection.image}
                        onChange={(event) => {
                          updateCollection('image', normalizeImageUrl(event.target.value));
                          saveNotice('Collection image updated.');
                        }}
                      />
                    </Field>
                    <Field label="Description" className="md:col-span-2">
                      <textarea className={inputClassName(true)} value={selectedCollection.description} onChange={(event) => { updateCollection('description', event.target.value); saveNotice('Collection description updated.'); }} />
                    </Field>
                    <div className="md:col-span-2">
                      <IconButton label="Delete Collection" icon={Trash2} tone="danger" onClick={() => { setCollections((current) => current.filter((_, index) => index !== selectedCollectionIndex)); setSelectedCollectionIndex((current) => Math.max(0, current - 1)); saveNotice('Collection deleted.'); }} />
                    </div>
                  </div>
                ) : null}
              </div>
            </Panel>
          ) : null}

          {activeSection === 'reviews' ? (
            <Panel
              title="Review Manager"
              description="Edit customer testimonials, verification state, dates, ratings, and locations."
              action={<IconButton label="Add Review" icon={Plus} tone="primary" onClick={() => { setReviews((current) => [...current, { ...emptyReview, id: Date.now() }]); setSelectedReviewIndex(reviews.length); saveNotice('New review added.'); }} />}
            >
              <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                <div className="space-y-2">
                  {reviews.map((review, index) => (
                    <button
                      key={review.id}
                      type="button"
                      onClick={() => setSelectedReviewIndex(index)}
                      className={`w-full rounded-xl border p-4 text-left transition ${selectedReviewIndex === index ? 'border-[#7b47c8] bg-[#f5efff]' : 'border-[#e5daf2] bg-white hover:bg-[#fbf9ff]'}`}
                    >
                      <p className="font-bold text-[#241137]">{review.name}</p>
                      <p className="mt-1 text-sm text-[#6c5d82]">{review.location} | {review.rating} stars</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#7a6b90]">{review.text}</p>
                    </button>
                  ))}
                </div>
                {selectedReview ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Customer name">
                      <input className={inputClassName()} value={selectedReview.name} onChange={(event) => { updateReview('name', event.target.value); saveNotice('Review name updated.'); }} />
                    </Field>
                    <Field label="Location">
                      <input className={inputClassName()} value={selectedReview.location} onChange={(event) => { updateReview('location', event.target.value); saveNotice('Review location updated.'); }} />
                    </Field>
                    <Field label="Rating">
                      <input className={inputClassName()} type="number" min="1" max="5" value={selectedReview.rating} onChange={(event) => { updateReview('rating', Number(event.target.value) || 0); saveNotice('Review rating updated.'); }} />
                    </Field>
                    <Field label="Date">
                      <input className={inputClassName()} type="date" value={selectedReview.date} onChange={(event) => { updateReview('date', event.target.value); saveNotice('Review date updated.'); }} />
                    </Field>
                    <Field label="Verified">
                      <select className={inputClassName()} value={selectedReview.verified ? 'yes' : 'no'} onChange={(event) => { updateReview('verified', event.target.value === 'yes'); saveNotice('Review verification updated.'); }}>
                        <option value="yes">Verified</option>
                        <option value="no">Not verified</option>
                      </select>
                    </Field>
                    <Field label="Review text" className="md:col-span-2">
                      <textarea className={inputClassName(true)} value={selectedReview.text} onChange={(event) => { updateReview('text', event.target.value); saveNotice('Review text updated.'); }} />
                    </Field>
                    <div className="md:col-span-2">
                      <IconButton label="Delete Review" icon={Trash2} tone="danger" onClick={() => { setReviews((current) => current.filter((_, index) => index !== selectedReviewIndex)); setSelectedReviewIndex((current) => Math.max(0, current - 1)); saveNotice('Review deleted.'); }} />
                    </div>
                  </div>
                ) : null}
              </div>
            </Panel>
          ) : null}

          {activeSection === 'crm' ? (
            <Panel title="CRM Desk" description="Manage local orders and incoming enquiries in a readable operations board.">
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#241137]">
                    <UserRound size={17} />
                    Orders
                  </div>
                  <div className="space-y-3">
                    {orders.length ? orders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-[#e5daf2] bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-[#241137]">{order.id}</p>
                            <p className="mt-1 text-sm text-[#6c5d82]">{order.customer?.fullName || 'Customer'} | {order.customer?.phone || 'No phone'}</p>
                            <p className="mt-1 text-sm font-semibold text-[#4b2c6f]">{formatPrice(order.total)}</p>
                          </div>
                          <select className="rounded-full border border-[#d9c9ef] bg-white px-3 py-2 text-sm font-semibold text-[#4b2c6f]" value={order.status} onChange={(event) => { updateOrderStatus(order.id, event.target.value); saveNotice(`Order ${order.id} updated.`); }}>
                            <option>Confirmed</option>
                            <option>Packed</option>
                            <option>In Transit</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>
                        </div>
                      </div>
                    )) : (
                      <p className="rounded-xl bg-white p-4 text-sm text-[#6c5d82]">Orders will appear here after checkout.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e4d8f4] bg-[#fbf9ff] p-4">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#241137]">
                    <FileText size={17} />
                    Enquiries
                  </div>
                  <div className="space-y-3">
                    {enquiries.length ? enquiries.map((enquiry) => (
                      <div key={enquiry.id} className="rounded-xl border border-[#e5daf2] bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-[#241137]">{enquiry.name}</p>
                            <p className="mt-1 text-sm text-[#6c5d82]">{enquiry.email}</p>
                            <p className="mt-1 text-sm text-[#6c5d82]">{enquiry.phone}</p>
                          </div>
                          <button type="button" onClick={() => { removeEnquiry(enquiry.id); saveNotice(`Enquiry from ${enquiry.name} removed.`); }} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f0c9c2] bg-[#fff4f1] text-[#a24b3a]">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="mt-4 rounded-xl bg-[#f7f2ff] px-4 py-3 text-sm leading-7 text-[#6c5d82]">{enquiry.message}</p>
                      </div>
                    )) : (
                      <p className="rounded-xl bg-white p-4 text-sm text-[#6c5d82]">Contact form messages will appear here.</p>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e4d8f4] bg-white px-5 py-4 text-sm text-[#6c5d82]">
            <CheckCircle2 size={18} className="text-[#7b47c8]" />
            <span>Every field saves instantly in local browser storage. Use Reset only when you want to restore default demo content.</span>
            <SlidersHorizontal size={18} className="ml-auto hidden text-[#8f7ea8] sm:block" />
          </div>
        </main>
      </div>
    </div>
  );
}
