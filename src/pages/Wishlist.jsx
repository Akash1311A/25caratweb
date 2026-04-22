import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

function formatPrice(value) {
  return `₹${value.toLocaleString()}`;
}

export default function Wishlist() {
  const { wishlistProducts, toggleWishlist, addToCart } = useStore();

  return (
    <div className="min-h-screen bg-[#f7f1ff] pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7b47c8]">Wishlist</p>
        <h1 className="mt-3 font-serif text-4xl text-[#121212]">Your saved pieces</h1>

        {wishlistProducts.length === 0 ? (
          <div className="card-luxury mt-8 rounded-3xl p-10 text-center">
            <Heart className="mx-auto text-[#7b47c8]" size={28} />
            <h2 className="mt-4 font-serif text-3xl text-[#121212]">Your wishlist is empty</h2>
            <p className="mx-auto mt-3 max-w-xl text-[#4B2C6F]/70">
              Save your favorite designs while browsing and they will appear here for quick access.
            </p>
            <Link to="/shop" className="btn-premium mt-8 inline-flex px-6 py-3">
              Explore the collection
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="card-luxury overflow-hidden rounded-3xl transition hover:shadow-lg">
                <Link to={`/product/${product.id}`} target="_blank" rel="noreferrer" className="block">
                  <div className="aspect-[3/4] overflow-hidden bg-[#f6f0ff]">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[#7b47c8]">
                    <Heart size={16} fill="currentColor" />
                    <span className="text-xs font-semibold uppercase tracking-[0.25em]">Saved</span>
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#7b47c8]">{product.collection}</p>
                  <Link to={`/product/${product.id}`} target="_blank" rel="noreferrer" className="mt-2 block text-xl font-semibold text-[#121212] transition hover:text-[#7b47c8]">
                    {product.name}
                  </Link>
                  <p className="mt-2 text-sm font-medium text-[#4B2C6F]/60">{formatPrice(product.price)}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => addToCart(product.id, 1)}
                      className="btn-premium inline-flex items-center gap-2 px-5 py-3 text-sm"
                    >
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#5b2ca0]/20 bg-white px-5 py-3 text-sm font-semibold text-[#4B2C6F] transition hover:border-[#7b47c8] hover:text-[#7b47c8]"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
