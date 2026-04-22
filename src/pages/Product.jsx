import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { useContent } from '../context/ContentContext';

const IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&h=1200&fit=crop';

function formatPrice(value) {
  return `Rs. ${value.toLocaleString()}`;
}

export default function Product() {
  const { id } = useParams();
  const { wishlist, toggleWishlist, addToCart, recordRecentView } = useStore();
  const { products, reviews } = useContent();
  const product = useMemo(() => products.find((item) => item.id === Number(id)), [id, products]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
    setMessage('');
  }, [id]);

  useEffect(() => {
    if (product) {
      recordRecentView(product.id);
    }
  }, [product, recordRecentView]);

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f1ff] pt-24">
        <div className="text-center">
          <p className="text-[#4B2C6F]/60">Product not found.</p>
          <Link to="/shop" className="mt-4 inline-block font-semibold text-[#7b47c8] hover:text-[#5b2ca0]">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const relatedProducts = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const discountPercent = Math.round((1 - product.price / product.originalPrice) * 100);
  const savingsAmount = product.originalPrice - product.price;

  const goToSlide = (direction) => {
    setSelectedImage((current) => {
      const nextIndex = current + direction;
      if (nextIndex < 0) return product.images.length - 1;
      if (nextIndex >= product.images.length) return 0;
      return nextIndex;
    });
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    setMessage(`${quantity} item${quantity > 1 ? 's' : ''} added to your cart.`);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.description, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setMessage('Product link copied to clipboard.');
      }
    } catch {
      setMessage('Unable to share right now. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6efff_0%,#f3eaff_40%,#fcf8ff_100%)] pt-24">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-[#4B2C6F]/60">
          <Link to="/" className="font-medium hover:text-[#7b47c8]">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="font-medium hover:text-[#7b47c8]">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-[#7b47c8]">{product.collection}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 sm:pb-24 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <div
              className="group relative overflow-hidden rounded-[2rem] border border-[#5b2ca0]/12 bg-[#FFFFFF]"
              onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
              onTouchEnd={(event) => {
                if (touchStartX === null) return;
                const delta = touchStartX - event.changedTouches[0].clientX;
                if (Math.abs(delta) > 40) {
                  goToSlide(delta > 0 ? 1 : -1);
                }
                setTouchStartX(null);
              }}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${selectedImage * 100}%)` }}
              >
                {product.images.map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={(event) => {
                      const fallback = product.images.find((item) => item && item !== event.currentTarget.src);
                      event.currentTarget.src = fallback || IMAGE_FALLBACK;
                    }}
                    className="aspect-[3/4] w-full shrink-0 bg-[#f5efff] object-cover object-center"
                  />
                ))}
              </div>
              <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-[#5b2ca0] to-[#8d58d6] px-4 py-2 text-sm font-bold tracking-[0.14em] text-white shadow-lg">
                {discountPercent}% OFF
              </div>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => goToSlide(-1)}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/18 text-white backdrop-blur-md transition hover:bg-white hover:text-[#2f124d]"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => goToSlide(1)}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/18 text-white backdrop-blur-md transition hover:bg-white hover:text-[#2f124d]"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-2xl border-2 transition ${selectedImage === index ? 'border-[#7b47c8]' : 'border-[#5b2ca0]/15'}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = IMAGE_FALLBACK;
                    }}
                    className="aspect-square w-full bg-[#f5efff] object-cover object-center"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="card-luxury rounded-3xl p-5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7b47c8] sm:text-sm">{product.collection}</p>
            <h1 className="mt-3 font-serif text-3xl leading-tight text-[#121212] sm:text-4xl">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-[#d4af37]/30 bg-[linear-gradient(135deg,#fff9ea,#fff,#f7efff)] px-4 py-3 shadow-[0_12px_28px_rgba(91,44,160,0.08)]">
              <span className="rounded-full bg-[linear-gradient(135deg,#f4e3a7,#d4af37)] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#2f124d]">
                {discountPercent}% Off
              </span>
              <span className="text-sm font-semibold text-[#2f124d]">
                Save {formatPrice(savingsAmount)}
              </span>
              <span className="text-sm text-[#5a4b71] line-through">
                MRP {formatPrice(product.originalPrice)}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 text-[#7b47c8]">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={16} fill={index < product.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="font-medium text-[#3f3355]">({product.reviews} reviews)</span>
              <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                <Check size={16} />
                {product.inStock ? 'In stock' : 'Out of stock'}
              </span>
              <span className="text-[#4B2C6F]/70">Stock: {product.stockCount}</span>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-[#5b2ca0]/12 bg-[linear-gradient(180deg,#ffffff,#f6efff)] p-5 shadow-[0_20px_45px_rgba(91,44,160,0.08)]">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-bold text-[#241137] sm:text-4xl">{formatPrice(product.price)}</span>
                <span className="text-base text-[#5a4b71] line-through sm:text-xl">{formatPrice(product.originalPrice)}</span>
                <span className="rounded-full bg-[#7b47c8]/10 px-3 py-1 text-sm font-semibold text-[#4B2C6F]">
                  Save {formatPrice(savingsAmount)}
                </span>
                <span className="rounded-full bg-[linear-gradient(135deg,#f4e3a7,#d4af37)] px-3 py-1 text-sm font-bold text-[#2f124d]">
                  {discountPercent}% off today
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span key={color} className="rounded-full border border-[#5b2ca0]/12 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#4B2C6F]/72">
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-6 leading-8 text-[#4B2C6F]/80">{product.description}</p>
            <p className="mt-4 leading-8 text-[#4B2C6F]/70">
              Crafted to elevate bridal, festive, and occasion dressing, this piece balances rich visual presence with a clean premium finish.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Truck, title: 'Free shipping', text: 'On qualifying orders' },
                { icon: ShieldCheck, title: 'Secure payment', text: 'UPI and Razorpay-ready' },
                { icon: RotateCcw, title: 'Easy returns', text: 'Simple support workflow' },
                { icon: Check, title: 'Quality assured', text: 'Premium finishing check' },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-[#5b2ca0]/15 bg-[#5b2ca0]/8 p-4 transition hover:bg-[#7b47c8]/12">
                  <item.icon className="text-[#7b47c8]" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-[#4B2C6F]">{item.title}</p>
                    <p className="text-xs text-[#4B2C6F]/60">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-[#5b2ca0]/18 bg-[#5b2ca0]/8">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-[#4B2C6F]">
                  <Minus size={16} />
                </button>
                <span className="min-w-12 px-3 text-center font-semibold text-[#4B2C6F]">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-[#4B2C6F]">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-premium flex flex-1 items-center justify-center gap-2 px-6 py-4">
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  addToCart(product.id, quantity);
                  window.location.href = '/checkout';
                }}
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f2d58c,#d4af37)] px-6 font-semibold text-[#2f124d] shadow-[0_12px_28px_rgba(212,175,55,0.28)] transition hover:brightness-105"
              >
                <Zap size={18} /> Buy Now
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition ${
                  isWishlisted ? 'border-[#7b47c8] bg-[#7b47c8]/12 text-[#4B2C6F]' : 'border-[#5b2ca0]/20 bg-white text-[#4B2C6F]'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button onClick={handleShare} className="flex h-14 w-14 items-center justify-center rounded-full border border-[#5b2ca0]/20 bg-white text-[#4B2C6F] transition hover:bg-[#7b47c8]/10">
                <Share2 size={18} />
              </button>
            </div>

            {message ? (
              <div className="mt-5 rounded-2xl border border-[#5b2ca0]/12 bg-[#f5efff] px-4 py-3 text-sm text-[#4B2C6F]">
                {message}
              </div>
            ) : null}
          </div>
        </div>

        <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="card-luxury rounded-3xl p-8">
            <h2 className="font-serif text-3xl text-[#121212]">Reviews and trust</h2>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex items-center gap-1 text-[#7b47c8]">
                {[...Array(5)].map((_, index) => <Star key={index} size={16} fill="currentColor" />)}
              </div>
              <span className="font-medium text-[#4B2C6F]/60">4.8 average rating</span>
              <span className="rounded-full border border-[#7b47c8]/25 bg-[#7b47c8]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#4B2C6F]">
                Verified buyers
              </span>
            </div>
            <div className="mt-6 space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="rounded-2xl border border-[#5b2ca0]/15 bg-[#5b2ca0]/8 p-4 transition hover:bg-[#7b47c8]/12">
                  <div className="flex items-center gap-1 text-[#7b47c8]">
                    {[...Array(5)].map((_, index) => (
                      <Star key={index} size={14} fill={index < review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <p className="mt-3 text-[#4B2C6F]/80">"{review.text}"</p>
                  <p className="mt-3 text-sm font-medium text-[#4B2C6F]/60">
                    {review.name} - {review.location}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-luxury rounded-3xl p-8">
            <h2 className="font-serif text-3xl text-[#121212]">Category match</h2>
            <p className="mt-3 text-sm leading-7 text-[#4B2C6F]/72">
              More from the same {product.category.toLowerCase()} category so shoppers can compare without leaving the product journey.
            </p>
            <div className="mt-6 space-y-4">
              {relatedProducts.slice(0, 3).map((item) => (
                <Link key={item.id} to={`/product/${item.id}`} className="flex gap-4 rounded-[1.5rem] border border-[#5b2ca0]/10 bg-white p-3 transition hover:border-[#7b47c8]/25 hover:shadow-[0_18px_36px_rgba(91,44,160,0.12)]">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = item.images?.[1] || IMAGE_FALLBACK;
                    }}
                    className="h-24 w-20 rounded-[1.1rem] bg-[#f5efff] object-cover object-center"
                  />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#7b47c8]">{item.collection}</p>
                    <h3 className="mt-2 truncate text-base font-semibold text-[#121212]">{item.name}</h3>
                    <p className="mt-2 text-sm text-[#4B2C6F]/70">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#7b47c8]">Related Products</p>
              <h2 className="mt-2 font-serif text-4xl text-[#121212]">More from {product.category}</h2>
            </div>
            <span className="rounded-full bg-[#efe7ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#5b2ca0]">
              Dynamic by category
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
