import { useEffect, useMemo, useState } from 'react';
import { Grid, List, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { useContent } from '../context/ContentContext';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ShopPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [collection, setCollection] = useState('All');
  const [color, setColor] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');

  const { wishlist, toggleWishlist, addToCart } = useStore();
  const { products = [], categories = [], collections = [] } = useContent();

  const safeProducts = useMemo(
    () =>
      Array.isArray(products)
        ? products.map((product) => ({
            ...product,
            id: product?.id ?? '',
            name: product?.name ?? 'Untitled piece',
            description: product?.description ?? 'Beautiful statement jewellery.',
            price: Number(product?.price) || 0,
            originalPrice: Number(product?.originalPrice) || 0,
            collection: product?.collection || 'Signature',
            category: product?.category || 'Jewellery',
            colors: Array.isArray(product?.colors) ? product.colors : [],
            image:
              product?.image ||
              'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&h=1200&fit=crop',
            images:
              Array.isArray(product?.images) && product.images.length
                ? product.images
                : [product?.image || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&h=1200&fit=crop'],
            rating: Number(product?.rating) || 0,
            reviews: Number(product?.reviews) || 0,
          }))
        : [],
    [products],
  );

  const categoryOptions = useMemo(
    () => ['All', ...new Set(safeProducts.map((product) => product.category).filter(Boolean))],
    [safeProducts],
  );

  const collectionOptions = useMemo(
    () => ['All', ...new Set(safeProducts.map((product) => product.collection).filter(Boolean))],
    [safeProducts],
  );

  const colorOptions = useMemo(
    () =>
      ['All', ...new Set(safeProducts.flatMap((product) => product.colors || []).filter(Boolean))],
    [safeProducts],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return safeProducts
      .filter((product) => (category === 'All' ? true : product.category === category))
      .filter((product) => (collection === 'All' ? true : product.collection === collection))
      .filter((product) => (color === 'All' ? true : product.colors.includes(color)))
      .filter((product) =>
        term
          ? product.name.toLowerCase().includes(term) || product.description.toLowerCase().includes(term)
          : true,
      )
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [safeProducts, category, collection, color, search, sortBy]);

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setCollection('All');
    setColor('All');
    setSortBy('featured');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f1ff] pt-[138px] text-[#241137]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-[#d9ceff] bg-white p-8 shadow-[0_24px_80px_rgba(91,44,160,0.08)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[#7b47c8]">SHOP</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Find bridal necklaces, festive sets, and curated jewellery.</h1>
              <p className="mt-4 text-sm leading-7 text-[#4b2c6f]/90 sm:text-base">
                Use the filters to narrow by category, collection, colour, and price. The product grid is designed to fit cleanly and stay easy to browse.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[#f7f1ff] p-5 text-sm font-semibold text-[#4b2c6f]">
                <p className="text-[0.68rem] uppercase tracking-[0.26em] text-[#7b47c8]">Total products</p>
                <p className="mt-3 text-3xl">{safeProducts.length}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[#fff7f0] p-5 text-sm font-semibold text-[#4b2c6f]">
                <p className="text-[0.68rem] uppercase tracking-[0.26em] text-[#7b47c8]">Selected</p>
                <p className="mt-3 text-3xl">{filteredProducts.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6 rounded-[2rem] border border-[#d9ceff] bg-white p-6 shadow-[0_20px_40px_rgba(91,44,160,0.07)]">
            <div className="relative">
              <Search className="absolute left-4 top-4 text-[#7b47c8]/80" size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by product name or keyword"
                className="w-full rounded-3xl border border-[#eadbff] bg-[#faf5ff] px-12 py-4 text-sm text-[#4b2c6f] outline-none focus:border-[#7b47c8]"
              />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7b47c8]">Category</p>
                <button onClick={() => setCategory('All')} className="text-xs font-medium text-[#7b47c8] hover:text-[#5b2ca0]">
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      category === item
                        ? 'bg-[#7b47c8] text-white shadow-sm'
                        : 'bg-[#f3ecff] text-[#4b2c6f] hover:bg-[#e9dcff]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7b47c8]">Collection</p>
              <div className="grid gap-2">
                {collectionOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCollection(item)}
                    className={`w-full rounded-3xl border px-4 py-3 text-left text-sm font-medium transition ${
                      collection === item
                        ? 'border-transparent bg-[#7b47c8] text-white shadow-sm'
                        : 'border-[#ece0ff] bg-[#faf5ff] text-[#4b2c6f] hover:border-[#d6c1ff]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7b47c8]">Colour</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setColor(item)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      color === item
                        ? 'bg-[#7b47c8] text-white shadow-sm'
                        : 'bg-[#f3ecff] text-[#4b2c6f] hover:bg-[#e9dcff]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7b47c8]">Sort by</p>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full rounded-3xl border border-[#eadbff] bg-[#faf5ff] px-4 py-3 text-sm text-[#4b2c6f] outline-none focus:border-[#7b47c8]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-3xl border border-[#7b47c8] bg-white px-5 py-3 text-sm font-semibold text-[#7b47c8] transition hover:bg-[#f3ecff]"
            >
              Reset filters
            </button>
          </aside>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#d9ceff] bg-white p-6 shadow-[0_20px_40px_rgba(91,44,160,0.07)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7b47c8]">Available</p>
                  <h2 className="mt-2 text-3xl font-semibold text-[#241137]">{filteredProducts.length} items</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#f7f1ff] px-4 py-3 text-sm font-semibold text-[#4b2c6f]">
                  <span>{category !== 'All' ? category : 'All categories'}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7b47c8]" />
                  <span>{collection !== 'All' ? collection : 'All collections'}</span>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-[2rem] border border-[#d9ceff] bg-[#faf6ff] p-10 text-center text-[#4b2c6f] shadow-[0_18px_36px_rgba(91,44,160,0.06)]">
                <p className="text-lg font-semibold">No matching products found.</p>
                <p className="mt-2 text-sm text-[#7b47c8]">Try a broader category or remove a filter.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredProducts.map((product) => (
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
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
