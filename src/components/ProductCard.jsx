import { Heart, ShoppingBag, Star, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const IMAGE_FALLBACK =
  'https://via.placeholder.com/600x800/d4af37/2f124d?text=25+Carat+Jewelry';

function formatPrice(value) {
  return `Rs. ${value.toLocaleString()}`;
}

function getDiscountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= 0) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}

export default function ProductCard({
  product,
  wishlist = [],
  onToggleWishlist = () => {},
  onAddToCart = () => {},
  viewMode = 'grid',
  className = '',
  imagePriority = false,
}) {
  const navigate = useNavigate();
  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = getDiscountPercent(product.price, product.originalPrice);
  const imageWidth = Number(product.imageDisplayWidth) > 0 ? `${product.imageDisplayWidth}px` : '100%';
  const imageHeight = Number(product.imageDisplayHeight) > 0 ? `${product.imageDisplayHeight}px` : '100%';
  const imagePosition =
    product.imagePositionX || product.imagePositionY
      ? `${product.imagePositionX || '50%'} ${product.imagePositionY || '50%'}`
      : product.imagePosition || 'center';

  return (
    <article
      className={`group overflow-hidden rounded-[2rem] border border-[#e9e0ff] bg-white shadow-[0_18px_40px_rgba(91,44,160,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(91,44,160,0.12)] ${
        viewMode === 'list' ? 'flex flex-col gap-4 md:flex-row' : ''
      } ${className}`}
    >
      <Link
        to={`/product/${product.id}`}
        className={`product-card-media relative overflow-hidden ${
          viewMode === 'list' ? 'product-card-media-list md:w-96 md:shrink-0 md:h-96' : ''
        }`}
      >
        <div className="absolute inset-0 bg-[#faf7ff]" />
        <div className="absolute left-1/2 top-1/2 z-10 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading={imagePriority ? 'eager' : 'lazy'}
            decoding="async"
            crossOrigin="anonymous"
            onError={(event) => {
              const nextSource = product.images?.find((image) => image && image !== event.currentTarget.src);
              if (nextSource) {
                event.currentTarget.src = nextSource;
              } else {
                event.currentTarget.src = IMAGE_FALLBACK;
              }
            }}
            style={{
              width: imageWidth,
              height: imageHeight,
              maxWidth: 'none',
              objectFit: product.imageFit || 'cover',
              objectPosition: imagePosition,
              transform: product.imageScale ? `scale(${product.imageScale})` : undefined,
              transformOrigin: imagePosition
            }}
            className="transition duration-700 group-hover:brightness-105"
          />
        </div>

        <div className="absolute left-4 top-4 flex flex-wrap gap-2 z-10">
          <span className="rounded-full bg-[#7b47c8] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_25px_rgba(91,44,160,0.22)]">
            {discountPercent}% Off
          </span>
          <span className="hidden rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm sm:inline-block">
            {product.badge}
          </span>
        </div>

        <button
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(event) => {
            event.preventDefault();
            onToggleWishlist(product.id);
          }}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/70 text-[#4b2c6f] shadow-sm transition hover:bg-white/90 ${
            isWishlisted ? 'text-[#7b47c8] bg-[#f3ecff]' : ''
          }`}
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 md:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-[#7b47c8]">
              {product.collection}
            </p>
            <Link
              to={`/product/${product.id}`}
              className="mt-1 block text-base font-semibold leading-snug text-[#161021] transition hover:text-[#7b47c8]"
            >
              {product.name}
            </Link>
          </div>
          <span className="rounded-full bg-[#f3ecff] px-2 py-0.5 text-[0.6rem] font-semibold text-[#4b2c6f]">
            {product.category}
          </span>
        </div>

        <p className="hidden line-clamp-2 text-xs leading-5 text-[#4b2c6f]/70 sm:block">{product.description}</p>

        <div className="flex flex-wrap gap-1">
          {product.colors.slice(0, 3).map((color) => (
            <span
              key={color}
              className="rounded-full border border-[#e5dbff] bg-[#faf5ff] px-2 py-0.5 text-[0.6rem] font-medium text-[#4b2c6f]"
            >
              {color}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ede5ff] pt-2">
          <div>
            <p className="text-xl font-bold text-[#241137]">{formatPrice(product.price)}</p>
            <p className="text-xs text-[#4b2c6f]/50 line-through">{formatPrice(product.originalPrice)}</p>
          </div>
          <span className="rounded-full bg-[#f2e8ff] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#7b47c8]">
            Save {discountPercent}%
          </span>
        </div>

        <div className="flex items-center gap-1 text-[#7b47c8]">
          {[...Array(5)].map((_, index) => (
            <Star key={index} size={12} fill={index < product.rating ? 'currentColor' : 'none'} />
          ))}
          <span className="ml-1 text-[0.65rem] text-[#4b2c6f]/60">({product.reviews})</span>
        </div>

        <div className="mt-auto grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onAddToCart(product.id, 1)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#7b47c8] bg-white px-3 text-xs font-semibold text-[#7b47c8] transition hover:bg-[#f3ecff]"
          >
            <ShoppingBag size={14} className="mr-1" />
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => {
              onAddToCart(product.id, 1);
              navigate('/checkout');
            }}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#7b47c8] px-3 text-xs font-semibold text-white transition hover:bg-[#5a2ea6]"
          >
            <Zap size={14} className="mr-1" />
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
