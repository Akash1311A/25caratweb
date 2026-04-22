import { Link, useEffect, useMemo, useState } from 'react';
import { Grid, List, Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { useContent } from '../context/ContentContext';

function formatPrice(value) {
  return `Rs. ${value.toLocaleString()}`;
}

export default function Shop() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [collection, setCollection] = useState('All');
  const [color, setColor] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const { categories = [], products = [], resetContent } = useContent();

  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeProducts = useMemo(
    () =>
      Array.isArray(products)
        ? products.map((product) => ({
            id: product?.id ?? '',
            name: product?.name ?? 'Unknown product',
            description: product?.description ?? 'No description available.',
            price: Number(product?.price) || 0,
            originalPrice: Number(product?.originalPrice) || 0,
            category: product?.category || 'Classic',
            collection: product?.collection || 'Signature',
            colors: Array.isArray(product?.colors) ? product.colors : [],
            badge: product?.badge || 'Explore',
            image: product?.image || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&h=1200&fit=crop',
            images: Array.isArray(product?.images) && product.images.length ? product.images : [product?.image || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&h=1200&fit=crop'],
            inStock: Boolean(product?.inStock),
            rating: Number(product?.rating) || 0,
            reviews: Number(product?.reviews) || 0,
            stockCount: Number(product?.stockCount) || 0,
          }))
        : [],
    [products],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!safeProducts.length) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7f0ff_0%,#f3ebff_34%,#fcf8ff_100%)] pt-[138px]">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="inline-flex rounded-[2rem] border border-[#5b2ca0]/20 bg-white/90 px-8 py-12 shadow-[0_24px_60px_rgba(91,44,160,0.12)]">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#7b47c8]">Shop data unavailable</p>
              <h1 className="mt-4 font-serif text-4xl font-semibold text-[#161021]">Sorry, products cannot be loaded.</h1>
              <p className="mt-4 text-base text-[#4B2C6F]/80">Yadi local storage me corrupt data hai to reset karke dubara try karein.</p>
              <button
                type="button"
                onClick={() => {
                  resetContent();
                  window.location.reload();
                }}
                className="mt-8 rounded-full bg-[#5b2ca0] px-7 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(91,44,160,0.22)] hover:bg-[#7b47c8]"
              >
                Reset shop data and reload
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const collectionOptions = useMemo(
    () => ['All', ...new Set(safeProducts.map((product) => product.collection || 'Unknown'))],
    [safeProducts],
  );

  const colorOptions = useMemo(
    () => ['All', ...new Set(safeProducts.flatMap((product) => Array.isArray(product.colors) ? product.colors : []))],
    [safeProducts],
  );

  const filteredProducts = useMemo(() => {
    let result = [...safeProducts];

    if (category !== 'All') result = result.filter((product) => product.category === category);
    if (collection !== 'All') result = result.filter((product) => product.collection === collection);
    if (color !== 'All') result = result.filter((product) => Array.isArray(product.colors) && product.colors.includes(color));

    if (query.trim()) {
      const lowered = query.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(lowered) ||
          product.description.toLowerCase().includes(lowered) ||
          product.colors.some((item) => item.toLowerCase().includes(lowered)),
      );
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'discount') {
      result.sort(
        (a, b) =>
          (b.originalPrice - b.price) / b.originalPrice - (a.originalPrice - a.price) / a.originalPrice,
      );
    }

    return result;
  }, [category, collection, color, query, sortBy]);

  const catalogHighlights = filteredProducts.slice(0, 2);
  const catalogProducts = filteredProducts.slice(2);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7f0ff_0%,#f3ebff_34%,#fcf8ff_100%)] pt-[138px]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-[#5b2ca0]/10 bg-[#fffaf5] p-5 text-center text-[#4B2C6F] shadow-[0_18px_40px_rgba(59,27,98,0.06)] sm:p-7">
          <p className="text-sm uppercase tracking-[0.35em] text-[#7b47c8]">Shop status</p>
          <h2 className="mt-3 text-3xl font-semibold">Shop page loaded successfully</h2>
          <p className="mt-2 text-base text-[#4B2C6F]/75">Currently showing {filteredProducts.length} product(s).</p>
        </section>

        <section className="mb-8 rounded-[2rem] border border-[#5b2ca0]/10 bg-[linear-gradient(135deg,#ffffff,#f8f2ff)] p-5 shadow-[0_18px_40px_rgba(59,27,98,0.06)] sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#7b47c8]">Shop Catalog</p>
              <h1 className="mt-2 font-serif text-4xl text-[#121212] md:text-5xl">Explore the full collection</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {safeCategories.slice(0, 4).map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setCategory(item.name)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    category === item.name
                      ? 'bg-[#5b2ca0] text-white'
                      : 'border border-[#5b2ca0]/14 bg-white text-[#4B2C6F] hover:border-[#7b47c8]/30'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 md:hidden">
          <div className="card-luxury rounded-[2rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b47c8]">Categories</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === 'All' ? 'bg-[#5b2ca0] text-white' : 'bg-[#f2ebff] text-[#4B2C6F]'
                }`}
                onClick={() => setCategory('All')}
              >
                All
              </button>
              {categories.map((item) => (
                <button
                  key={item.name}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    category === item.name ? 'bg-[#5b2ca0] text-white' : 'bg-[#f2ebff] text-[#4B2C6F]'
                  }`}
                  onClick={() => setCategory(item.name)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-[#5b2ca0]/20 bg-[#5b2ca0]/8 px-4 py-2 text-[#4B2C6F] md:hidden hover:border-[#7b47c8]/45 hover:bg-[#7b47c8]/12"
            onClick={() => setMobileFiltersOpen((value) => !value)}
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#4B2C6F]/70">Showing {filteredProducts.length} pieces</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="rounded-full border border-[#5b2ca0]/20 bg-[#5b2ca0]/8 px-4 py-2 text-[#4B2C6F] font-medium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Best Discount</option>
            </select>
            <div className="hidden overflow-hidden rounded-full border border-[#5b2ca0]/20 md:flex">
              <button
                className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-[#7b47c8]/14 text-[#4B2C6F]' : 'text-[#4B2C6F]/50 hover:text-[#4B2C6F]'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button
                className={`px-3 py-2 transition-colors ${viewMode === 'list' ? 'bg-[#7b47c8]/14 text-[#4B2C6F]' : 'text-[#4B2C6F]/50 hover:text-[#4B2C6F]'}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className={`space-y-6 ${mobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
            <div className="card-luxury rounded-3xl p-5">
              <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.25em] text-[#4B2C6F]">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-[#4B2C6F]/40" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by product name, collection, or color"
                  className="w-full rounded-2xl border border-[#5b2ca0]/15 bg-white py-3 pl-10 pr-4 text-[#4B2C6F] placeholder:text-[#4B2C6F]/40"
                />
              </div>
            </div>

            <div className="card-luxury rounded-3xl p-5">
              <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.25em] text-[#4B2C6F]">Category</label>
              <div className="space-y-2">
                <button
                  className={`block w-full rounded-2xl px-3 py-2 text-left font-medium transition-all ${
                    category === 'All' ? 'bg-[#7b47c8]/12 text-[#4B2C6F]' : 'text-[#4B2C6F]/60 hover:text-[#4B2C6F]'
                  }`}
                  onClick={() => setCategory('All')}
                >
                  All Products
                </button>
                {safeCategories.map((item) => (
                  <button
                    key={item.name}
                    className={`block w-full rounded-2xl px-3 py-2 text-left font-medium transition-all ${
                      category === item.name ? 'bg-[#7b47c8]/12 text-[#4B2C6F]' : 'text-[#4B2C6F]/60 hover:text-[#4B2C6F]'
                    }`}
                    onClick={() => setCategory(item.name)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-luxury rounded-3xl p-5">
              <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.25em] text-[#4B2C6F]">Collection</label>
              <div className="space-y-2">
                {collectionOptions.map((item) => (
                  <button
                    key={item}
                    className={`block w-full rounded-2xl px-3 py-2 text-left font-medium transition-all ${
                      collection === item ? 'bg-[#7b47c8]/12 text-[#4B2C6F]' : 'text-[#4B2C6F]/60 hover:text-[#4B2C6F]'
                    }`}
                    onClick={() => setCollection(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-luxury rounded-3xl p-5">
              <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.25em] text-[#4B2C6F]">Color</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((item) => (
                  <button
                    key={item}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      color === item
                        ? 'bg-[#5b2ca0] text-white shadow-[0_10px_24px_rgba(91,44,160,0.22)]'
                        : 'bg-[#f2ebff] text-[#4B2C6F] hover:bg-[#eadfff]'
                    }`}
                    onClick={() => setColor(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setQuery('');
                setCategory('All');
                setCollection('All');
                setColor('All');
                setSortBy('featured');
              }}
              className="w-full rounded-full border border-[#5b2ca0]/20 bg-[#5b2ca0]/8 px-4 py-3 font-semibold text-[#4B2C6F] transition-all hover:border-[#7b47c8]/45 hover:bg-[#7b47c8]/12"
            >
              Clear Filters
            </button>
          </aside>

          <div className="space-y-6">
            <div className="md:hidden">
              <select
                className="w-full rounded-full border border-[#5b2ca0]/20 bg-[#5b2ca0]/8 px-4 py-3 text-[#4B2C6F] font-medium"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>

            <section className="card-luxury rounded-[2rem] p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7b47c8]">Shop Catalog</p>
                  <h2 className="mt-2 font-serif text-3xl text-[#161021] sm:text-4xl">Selected highlights</h2>
                </div>
                <span className="rounded-full bg-[linear-gradient(135deg,#f4e3a7,#d4af37)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#2f124d]">
                  {catalogHighlights.length} Highlights
                </span>
              </div>

              {catalogHighlights.length ? (
                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  {catalogHighlights.map((product) => {
                    const discountPercent = Math.round((1 - product.price / product.originalPrice) * 100);

                    return (
                      <article
                        key={product.id}
                        className="overflow-hidden rounded-[1.8rem] border border-[#5b2ca0]/10 bg-white shadow-[0_18px_36px_rgba(59,27,98,0.08)]"
                      >
                        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                          <Link to={`/product/${product.id}`} className="relative block h-full min-h-[220px] overflow-hidden lg:min-h-[260px]">
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="eager"
                              onError={(event) => {
                                event.currentTarget.src = product.images?.[1] || product.image;
                              }}
                              className="h-[220px] w-full object-cover transition duration-700 hover:scale-105 lg:h-full"
                            />
                            <div className="absolute left-4 top-4 rounded-full bg-[linear-gradient(135deg,#6f3fd6,#8d58d6)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                              {discountPercent}% Off
                            </div>
                          </Link>

                          <div className="flex flex-col p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7b47c8]">{product.collection}</p>
                                <Link to={`/product/${product.id}`} className="mt-2 block font-serif text-2xl leading-tight text-[#121212] hover:text-[#7b47c8] sm:text-3xl">
                                  {product.name}
                                </Link>
                              </div>
                              <span className="rounded-full bg-[#f3ecff] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#4B2C6F]">
                                {product.badge}
                              </span>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-[#4B2C6F]/72">
                              {product.description.length > 120 ? `${product.description.slice(0, 120)}...` : product.description}
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                              <span className="text-3xl font-bold text-[#241137]">{formatPrice(product.price)}</span>
                              <span className="text-base text-[#4B2C6F]/42 line-through">{formatPrice(product.originalPrice)}</span>
                              <span className="rounded-full bg-[#efe7ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b2ca0]">
                                Save {discountPercent}%
                              </span>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                              {product.colors.map((color) => (
                                <span
                                  key={color}
                                  className="rounded-full border border-[#5b2ca0]/12 bg-[#faf7ff] px-3 py-1 text-[0.72rem] font-medium text-[#4B2C6F]/78"
                                >
                                  {color}
                                </span>
                              ))}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => addToCart(product.id, 1)}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#5b2ca0]/18 bg-[#5b2ca0]/8 px-4 py-3 text-sm font-semibold text-[#241137] transition hover:border-[#7b47c8]/35 hover:bg-[#7b47c8]/12"
                              >
                                Add to Cart
                              </button>
                              <Link
                                to={`/product/${product.id}`}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f2d58c,#d4af37)] px-4 py-3 text-sm font-semibold text-[#2f124d] transition hover:brightness-105"
                              >
                                View Product
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-[#5b2ca0]/10 bg-white p-6 text-sm text-[#4B2C6F]/72">
                  Matching products nahi mile. Filters change karke dubara dekho.
                </div>
              )}
            </section>

            <section className="card-luxury rounded-[2rem] p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7b47c8]">All Products</p>
                  <h2 className="mt-2 font-serif text-3xl text-[#161021] sm:text-4xl">Full collection</h2>
                </div>
                <span className="rounded-full bg-[#efe7ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#5b2ca0]">
                  {catalogProducts.length} More Products
                </span>
              </div>

              {catalogProducts.length ? (
                <div className={`mt-6 grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                  {catalogProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      wishlist={wishlist}
                      onToggleWishlist={toggleWishlist}
                      onAddToCart={addToCart}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              ) : filteredProducts.length ? (
                <div className="mt-6 rounded-[1.5rem] border border-[#5b2ca0]/10 bg-white p-6 text-sm text-[#4B2C6F]/72">
                  Matching products highlighted section me dikh rahe hain.
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

