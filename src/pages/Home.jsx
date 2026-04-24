import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, ShieldCheck, Star, Truck, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { useContent } from '../context/ContentContext';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7 },
};

export default function Home() {
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const { products, collections, reviews, brandInfo, homeContent } = useContent();
  const [currentImage, setCurrentImage] = useState(0);

  const heroImages = useMemo(
    () =>
      [
        homeContent.heroImage,
        products[0]?.image?.replace('w=600&h=800', 'w=1920&h=1200'),
        collections[1]?.image?.replace('w=600&h=600', 'w=1920&h=1200'),
        products[2]?.image?.replace('w=600&h=800', 'w=1920&h=1200'),
        products[3]?.image?.replace('w=600&h=800', 'w=1920&h=1200'),
      ].filter((value, index, array) => value && array.indexOf(value) === index),
    [collections, homeContent.heroImage, products],
  );

  const heroFallbackImage = useMemo(
    () =>
      homeContent.heroImage ||
      products[4]?.image?.replace('w=600&h=800', 'w=1920&h=1200') ||
      products[0]?.image ||
      '',
    [homeContent.heroImage, products],
  );

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  useEffect(() => {
    if (!heroImages.length) return undefined;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="bg-transparent">
      <section className="relative min-h-[88svh] overflow-hidden sm:min-h-[102vh] sm:w-screen sm:-mx-6 lg:-mx-8">
        <div className="absolute inset-0">
          {heroImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = heroFallbackImage;
              }}
              className={`absolute h-full w-full object-cover transition-opacity duration-1000 ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#180f27]/78 via-[#2f124d]/48 to-[#180f27]/18" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#180f27]/50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[88svh] w-full items-center pt-28 sm:min-h-[102vh] sm:pt-32">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="max-w-2xl rounded-[2rem] bg-black/16 p-5 backdrop-blur-[2px] sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
              <div className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#f1dfb1]">
                {homeContent.heroBadge}
              </div>
              <h1 className="mt-5 max-w-[9ch] font-serif text-[3rem] leading-[0.9] text-white sm:max-w-none sm:text-6xl md:text-7xl">
                {homeContent.heroTitle}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/92 sm:text-lg sm:leading-8">
                {homeContent.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/shop" className="btn-premium inline-flex w-full items-center justify-center gap-3 px-6 py-4 text-sm font-bold tracking-[0.16em] sm:w-auto sm:px-10 sm:text-base">
                  {homeContent.heroPrimaryCta.toUpperCase()} <ArrowRight size={20} />
                </Link>
                <Link to="/about" className="inline-flex w-full items-center justify-center rounded-full border border-white/24 bg-white/10 px-6 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-[#180f27] sm:w-auto sm:px-8">
                  {homeContent.heroSecondaryCta}
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`rounded-full transition-all duration-500 ${
                      index === currentImage ? 'h-2 w-12 bg-[#c8adf4]' : 'h-2 w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#7b47c8]">Featured Products</p>
            <h2 className="mt-2 font-serif text-4xl text-[#121212] md:text-[3.4rem]">Featured products</h2>
          </div>
          <Link to="/shop" className="hidden items-center gap-2 text-[#4B2C6F] transition-colors hover:text-[#7b47c8] md:flex">
            View all <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onAddToCart={addToCart}
              imagePriority
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[#7b47c8]">{homeContent.featuredCollectionsLabel}</p>
            <h2 className="mt-2 font-serif text-4xl text-[#121212] md:text-5xl">{homeContent.featuredCollectionsTitle}</h2>
          </div>
          <Link to="/shop" className="hidden items-center gap-2 text-[#4B2C6F] transition-colors hover:text-[#7b47c8] md:flex">
            Browse catalog <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {collections.map((collection) => (
            <Link key={collection.name} to="/shop" className="card-luxury group overflow-hidden rounded-[2rem]">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={collection.image} alt={collection.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[#7b47c8]">Collection</p>
                <h3 className="mt-2 font-serif text-3xl text-[#121212] transition-colors group-hover:text-[#7b47c8]">{collection.name}</h3>
                <p className="mt-2 text-sm leading-7 text-[#4B2C6F]/72">{collection.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card-luxury rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-[#7b47c8]">{homeContent.brandPromiseLabel}</p>
            <h2 className="mt-3 font-serif text-4xl text-[#121212]">{homeContent.brandPromiseTitle}</h2>
            <p className="mt-4 max-w-2xl text-[#4B2C6F]/80">{brandInfo.description}</p>
            <p className="mt-4 max-w-2xl text-[#4B2C6F]/72">{brandInfo.story}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {brandInfo.highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-[#5b2ca0]/12 bg-[#f8f2ff] px-4 py-3 text-sm font-medium text-[#241137]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            {reviews.slice(0, 2).map((review) => (
              <div key={review.id} className="card-luxury rounded-[2rem] p-6">
                <div className="mb-3 flex items-center gap-1 text-[#7b47c8]">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} size={16} fill={index < review.rating ? 'currentColor' : 'none'} />
                  ))}
                  <span className="ml-2 text-xs uppercase tracking-[0.25em] text-[#4B2C6F]/60">
                    {review.verified ? 'Verified' : 'Customer'}
                  </span>
                </div>
                <p className="text-[#4B2C6F]/80">"{review.text}"</p>
                <div className="mt-4 text-sm text-[#4B2C6F]/60">
                  <span className="font-medium text-[#121212]">{review.name}</span> • {review.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#5b2ca0]/10 bg-[#fbf8ff]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, label: 'Express Dispatch', text: 'Fast delivery with premium packaging' },
              { icon: ShieldCheck, label: 'Secure Checkout', text: 'UPI, cards, and Razorpay-ready payments' },
              { icon: BadgeCheck, label: 'Trusted Quality', text: 'Finely finished pieces with careful inspection' },
              { icon: Star, label: '4.8/5 Rating', text: 'Loved by customers across core collections' },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.6rem] border border-[#5b2ca0]/12 bg-white p-5 shadow-[0_12px_26px_rgba(59,27,98,0.06)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#7b47c8]/16 bg-[#f7f0ff] text-[#5b2ca0]">
                  <item.icon size={20} />
                </div>
                <p className="mt-4 text-xl font-semibold text-[#4B2C6F]">{item.label}</p>
                <p className="mt-2 text-sm leading-7 text-[#4B2C6F]/68">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[linear-gradient(90deg,#5b2ca0,#7b47c8)]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-[0.35em] text-[#ead39a]">{homeContent.offerLabel}</p>
          <h2 className="mt-3 font-serif text-4xl text-white">{homeContent.offerTitle}</h2>
          <p className="mt-4 text-white/74">{homeContent.offerDescription}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/shop" className="btn-premium inline-flex items-center gap-2 px-8 py-4">
              Shop the Collection <ArrowRight size={18} />
            </Link>
            <button
              type="button"
              onClick={() => {
                const firstProduct = featuredProducts[0];
                if (!firstProduct) return;
                addToCart(firstProduct.id, 1);
                navigate(`/checkout?product=${firstProduct.id}`);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#f2d58c,#d4af37)] px-8 py-4 font-semibold text-[#2f124d] transition hover:brightness-105"
            >
              <Zap size={18} />
              Buy Featured
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
