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

function resolveImageSource(source) {
  if (!source) return '';
  if (String(source).startsWith('/')) {
    return typeof window === 'undefined' ? source : `${window.location.origin}${source}`;
  }
  return source;
}

function getSafeImageSize(value) {
  const size = Number(value);
  return size >= 120 ? `${size}px` : '100%';
}

function getSafeImageScale(value) {
  const scale = Number(value);
  return scale >= 0.7 && scale <= 2.5 ? scale : 1;
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
  const imageWidth = getSafeImageSize(product.imageDisplayWidth);
  const imageHeight = getSafeImageSize(product.imageDisplayHeight);
  const imageScale = getSafeImageScale(product.imageScale);
  const imagePosition =
    product.imagePositionX || product.imagePositionY
      ? `${product.imagePositionX || '50%'} ${product.imagePositionY || '50%'}`
      : product.imagePosition || 'center';
  const imageSource = resolveImageSource(product.image) || IMAGE_FALLBACK;
  const productUrl = `/product/${product.id}`;

  return (
    <article
      className={`group h-full cursor-pointer overflow-hidden rounded-[2rem] border border-[#e9e0ff] bg-white shadow-[0_18px_40px_rgba(91,44,160,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(91,44,160,0.12)] ${
        viewMode === 'list' ? 'flex flex-col gap-4 md:flex-row' : ''
      } ${className}`}
      onClick={() => navigate(productUrl)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(productUrl);
        }
      }}
      tabIndex={0}
    >
      <Link
        to={productUrl}
        className={`product-card-media relative overflow-hidden ${
          viewMode === 'list' ? 'product-card-media-list md:w-96 md:shrink-0 md:h-96' : ''
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-0 bg-[#faf7ff]" />
        <div className="absolute left-1/2 top-1/2 z-10 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden">
          <img
            src={imageSource}
            alt={product.name}
            loading={imagePriority ? 'eager' : 'lazy'}
            decoding="async"
            onError={(event) => {
              const currentSource = event.currentTarget.currentSrc || event.currentTarget.src;
              const nextSource = product.images
                ?.map(resolveImageSource)
                .find((image) => image && image !== currentSource);

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
              transform: imageScale !== 1 ? `scale(${imageScale})` : undefined,
              transformOrigin: imagePosition
            }}
            className="min-h-full min-w-full transition duration-700 group-hover:brightness-105"
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
            event.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/70 text-[#4b2c6f] shadow-sm transition hover:bg-white/90 ${
            isWishlisted ? 'text-[#7b47c8] bg-[#f3ecff]' : ''
          }`}
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </Link>

      <div className="flex h-full flex-1 flex-col p-4 md:p-5">
        <div className="flex h-[72px] items-start justify-between gap-3 overflow-hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-[#7b47c8]">
              {product.collection}
            </p>
            <Link
              to={productUrl}
              className="mt-1 block text-base font-semibold leading-snug text-[#161021] transition hover:text-[#7b47c8]"
              onClick={(event) => event.stopPropagation()}
              title={product.name}
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
              }}
            >
              {product.name}
            </Link>
          </div>
          <span
            className="max-w-[92px] shrink-0 truncate rounded-full bg-[#f3ecff] px-2 py-0.5 text-[0.6rem] font-semibold text-[#4b2c6f]"
            title={product.category}
          >
            {product.category}
          </span>
        </div>

        <p
          className="product-card-description mt-2 h-[60px] text-xs leading-5 text-[#4b2c6f]/70"
          title={product.description || ''}
        >
          {product.description || ''}
        </p>

        <div className="mt-3 flex h-[32px] flex-wrap content-start gap-1 overflow-hidden">
          {product.colors?.length
            ? product.colors.slice(0, 3).map((color) => (
              <span
                key={color}
                className="h-7 rounded-full border border-[#e5dbff] bg-[#faf5ff] px-2 py-1 text-[0.6rem] font-medium leading-4 text-[#4b2c6f]"
              >
                {color}
              </span>
            ))
            : null}
        </div>

        <div className="mt-3 flex flex-col gap-3 border-t border-[#ede5ff] pt-3">
          <div className="flex h-[50px] items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xl font-bold leading-none text-[#241137]">{formatPrice(product.price)}</p>
              <p className="mt-1 text-xs text-[#4b2c6f]/50 line-through">{formatPrice(product.originalPrice)}</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#f2e8ff] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-[#7b47c8]">
              Save {discountPercent}%
            </span>
          </div>

          <div className="flex h-5 items-center gap-1 overflow-hidden text-[#7b47c8]">
            {[...Array(5)].map((_, index) => (
              <Star key={index} size={12} fill={index < product.rating ? 'currentColor' : 'none'} />
            ))}
            <span className="ml-1 text-[0.65rem] text-[#4b2c6f]/60">({product.reviews})</span>
          </div>

          <div className="grid h-10 grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart(product.id, 1);
              }}
              className="inline-flex h-10 w-full min-w-0 items-center justify-center whitespace-nowrap rounded-full border border-[#7b47c8] bg-white px-2 text-[0.72rem] font-semibold text-[#7b47c8] transition hover:bg-[#f3ecff] sm:px-3 sm:text-xs"
            >
              <ShoppingBag size={14} className="mr-1 shrink-0" />
              <span className="truncate">Add to Cart</span>
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart(product.id, 1);
                navigate('/checkout');
              }}
              className="inline-flex h-10 w-full min-w-0 items-center justify-center whitespace-nowrap rounded-full bg-[#7b47c8] px-2 text-[0.72rem] font-semibold text-white transition hover:bg-[#5a2ea6] sm:px-3 sm:text-xs"
            >
              <Zap size={14} className="mr-1 shrink-0" />
              <span className="truncate">Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
