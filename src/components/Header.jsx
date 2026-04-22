import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Home, Menu, Search, ShoppingBag, Store, User, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useStore } from '../context/StoreContext';
import { useContent } from '../context/ContentContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlist, cartCount, profile } = useStore();
  const { categories, collections, offerMessages } = useContent();
  const accountInitials = (profile.fullName || 'Account')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const forceSolidHeader = location.pathname !== '/';
  const headerSolid = scrolled || forceSolidHeader;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Account', path: '/account' },
  ];

  const mobileDockLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: Store },
    { name: 'Wishlist', path: '/wishlist', icon: Heart, count: wishlist.length },
    { name: 'Cart', path: '/checkout', icon: ShoppingBag, count: cartCount },
  ];

  return (
    <>
      <div className="offer-ticker fixed inset-x-0 top-0 z-[60] border-b border-white/10 bg-[linear-gradient(90deg,#f8dfd8,#f4ebe9,#f8dfd8)] text-[#2f124d]">
        <div className="offer-ticker-track">
          {[...offerMessages, ...offerMessages].map((message, index) => (
            <span key={`${message}-${index}`} className="offer-ticker-item">
              {message}
            </span>
          ))}
        </div>
      </div>

      <header className={`fixed left-0 right-0 top-[42px] z-50 transition ${headerSolid ? 'border-b border-[#5b2ca0]/15 bg-[#fbf7ff]/95 shadow-md backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-3">
          <button className={`rounded-full border p-2 transition-all duration-300 md:hidden ${headerSolid ? 'border-[#5b2ca0]/25 bg-[#5b2ca0]/8 text-[#4B2C6F]' : 'border-white/35 bg-[#5b2ca0]/18 text-white'}`} onClick={() => setOpen((value) => !value)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="min-w-0 flex-1 md:flex-none">
            <BrandLogo
              compact
              mobileIconOnly
              variant={headerSolid ? 'dark' : 'light'}
              className="min-w-0"
              iconClassName="h-8 w-10 sm:h-12 sm:w-14"
              titleClassName={headerSolid ? 'text-[#4B2C6F]' : 'text-[#f1e3ff]'}
              taglineClassName={headerSolid ? 'text-[#4B2C6F]/80' : 'text-white/85'}
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <div
              className="relative"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
            >
              <Link
                to="/shop"
                onClick={() => setShopMenuOpen(false)}
                className={`group relative text-sm font-medium transition-colors duration-300 ${
                  headerSolid ? 'text-[#4B2C6F] hover:text-[#7b47c8]' : 'text-white/90 hover:text-[#ead39a]'
                }`}
              >
                Shop
                <span className={`absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-300 group-hover:w-full ${headerSolid ? 'bg-[#7b47c8]' : 'bg-[#ead39a]'}`}></span>
              </Link>

              <div
                className={`absolute left-0 top-full z-30 mt-3 w-[320px] overflow-hidden rounded-[1.5rem] border border-[#d9c0ff]/20 bg-white/95 shadow-[0_24px_80px_rgba(91,44,160,0.16)] transition-all duration-300 ${
                  shopMenuOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-2'
                }`}
              >
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#7b47c8]">Featured categories</p>
                  <div className="mt-4 grid gap-2">
                    {categories.slice(0, 5).map((category) => (
                      <Link
                        key={category.name}
                        to="/shop"
                        className="rounded-2xl border border-[#ebe4ff] bg-[#faf6ff] px-4 py-3 text-sm font-semibold text-[#4B2C6F] transition hover:border-[#7b47c8]/40 hover:bg-[#f2ebff]"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.5rem] border border-[#ebe4ff] bg-[#f6f0ff] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-[#7b47c8]">Bridal collection</p>
                    <p className="mt-3 text-sm leading-6 text-[#4B2C6F]">
                      Discover wedding-ready jewellery, handpicked for luxe styling and festive moments.
                    </p>
                    <div className="mt-4 grid gap-2">
                      {collections.slice(0, 3).map((collection) => (
                        <Link
                          key={collection.name}
                          to="/shop"
                          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#4B2C6F] transition hover:bg-[#ece3ff]"
                        >
                          {collection.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className={`group relative text-sm font-medium transition-colors duration-300 ${headerSolid ? 'text-[#4B2C6F] hover:text-[#7b47c8]' : 'text-white/90 hover:text-[#ead39a]'}`}>
                {link.name}
                <span className={`absolute bottom-0 left-0 h-[1px] w-0 transition-all duration-300 group-hover:w-full ${headerSolid ? 'bg-[#7b47c8]' : 'bg-[#ead39a]'}`}></span>
              </Link>
            ))}
          </nav>

          <div className={`flex items-center gap-2 ${headerSolid ? 'text-[#4B2C6F]' : 'text-[#f3e8ff]'}`}>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className={`rounded-full border p-2 transition-all duration-300 ${headerSolid ? 'border-[#5b2ca0]/25 bg-[#5b2ca0]/8 hover:border-[#7b47c8]/45 hover:bg-[#5b2ca0]/14 hover:text-[#7b47c8]' : 'border-white/35 bg-[#5b2ca0]/18 hover:border-white/60 hover:bg-[#7b47c8]/30'}`}
            >
              <Search size={18} />
            </button>
            <Link to="/wishlist" className={`relative hidden rounded-full border p-2 transition-all duration-300 sm:inline-flex ${headerSolid ? 'border-[#5b2ca0]/25 bg-[#5b2ca0]/8 hover:border-[#7b47c8]/45 hover:bg-[#5b2ca0]/14 hover:text-[#7b47c8]' : 'border-white/35 bg-[#5b2ca0]/18 hover:border-white/60 hover:bg-[#7b47c8]/30'}`}>
              <Heart size={18} />
              {wishlist.length > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[10px] font-bold text-[#2f124d]">
                  {wishlist.length}
                </span>
              ) : null}
            </Link>
            <Link to="/checkout" className={`relative hidden rounded-full border p-2 transition-all duration-300 sm:inline-flex ${headerSolid ? 'border-[#5b2ca0]/25 bg-[#5b2ca0]/8 hover:border-[#7b47c8]/45 hover:bg-[#5b2ca0]/14 hover:text-[#7b47c8]' : 'border-white/35 bg-[#5b2ca0]/18 hover:border-white/60 hover:bg-[#7b47c8]/30'}`}>
              <ShoppingBag size={18} />
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[10px] font-bold text-[#2f124d]">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            <Link
              to="/account"
              className={`relative hidden items-center justify-center rounded-full border transition-all duration-300 sm:inline-flex ${
                profile.isLoggedIn
                  ? headerSolid
                    ? 'h-10 min-w-10 border-[#7b47c8]/25 bg-[linear-gradient(135deg,#5b2ca0,#8d58d6)] px-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(91,44,160,0.24)] hover:shadow-[0_16px_36px_rgba(91,44,160,0.28)]'
                    : 'h-10 min-w-10 border-white/40 bg-white/15 px-3 text-sm font-semibold text-white backdrop-blur-sm hover:border-white/70 hover:bg-white/20'
                  : headerSolid
                    ? 'border-[#5b2ca0]/25 bg-[#5b2ca0]/8 p-2 hover:border-[#7b47c8]/45 hover:bg-[#5b2ca0]/14 hover:text-[#7b47c8]'
                    : 'border-white/35 bg-[#5b2ca0]/18 p-2 hover:border-white/60 hover:bg-[#7b47c8]/30'
              }`}
              aria-label={profile.isLoggedIn ? `${profile.fullName || 'Account'} profile` : 'Account'}
            >
              {profile.isLoggedIn ? accountInitials : <User size={18} />}
              {profile.isLoggedIn ? (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#fbf7ff] bg-[#d4af37]" />
              ) : null}
            </Link>
          </div>
        </div>
        </div>

        <div className={`${open ? 'max-h-[34rem] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden border-t border-[#c8adf4]/15 bg-gradient-to-b from-[#2f124d] to-[#180f27] transition-all duration-300 md:hidden`}>
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-4">
            <Link to="/shop" onClick={() => setOpen(false)} className="border-b border-white/10 py-3 text-white/75 hover:text-[#ead39a]">
              Shop
            </Link>
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setOpen(false)} className="border-b border-white/10 py-3 text-white/75 hover:text-[#ead39a]">
                {link.name}
              </Link>
            ))}
            <div className="pt-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Browse Categories</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.slice(0, 6).map((item) => (
                  <Link
                    key={item.name}
                    to="/shop"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/80"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="mobile-dock md:hidden">
        {mobileDockLinks.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`mobile-dock-item ${location.pathname === item.path ? 'mobile-dock-item-active' : ''}`}
          >
            <span className="relative">
              <item.icon size={20} />
              {item.count ? <span className="mobile-dock-badge">{item.count}</span> : null}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
