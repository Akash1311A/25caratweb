import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import BrandLogo from './components/BrandLogo';
import BrandMark from './components/BrandMark';
import Home from './pages/Home';
import Shop from './pages/ShopPage';
import Product from './pages/Product';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import { StoreProvider } from './context/StoreContext';
import { ContentProvider } from './context/ContentContext';
import Admin from './pages/Admin';

const SESSION_LOADER_KEY = 'twentyfivecarat-loader-seen';

function App() {
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.sessionStorage.getItem(SESSION_LOADER_KEY);
  });

  useEffect(() => {
    if (!loading) return undefined;

    const timer = setTimeout(() => {
      window.sessionStorage.setItem(SESSION_LOADER_KEY, 'true');
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <ContentProvider>
      <StoreProvider>
        <Router>
          {loading && <LoadingScreen />}
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </StoreProvider>
    </ContentProvider>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="pt-[42px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#180f27]">
      <div className="pointer-events-none absolute inset-0">
        <div className="loading-orb absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-[#7b47c8]/35 blur-3xl" />
        <div className="loading-orb loading-orb-delay absolute bottom-[-16%] right-[-8%] h-96 w-96 rounded-full bg-[#c8adf4]/22 blur-3xl" />
        <div className="loading-mesh absolute inset-0 opacity-70" />
      </div>

      <div className="relative flex h-full items-center justify-center px-6">
        <div className="loading-panel w-full max-w-xl rounded-[2rem] px-8 py-12 text-center sm:px-12">
          <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
            <div className="loading-ring absolute inset-[-16px] rounded-[2rem] border border-[#c8adf4]/25" />
            <div className="loading-ring loading-ring-delay absolute inset-[-30px] rounded-[2.25rem] border border-[#c8adf4]/12" />
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-[0_18px_44px_rgba(29,10,50,0.35)]">
              <BrandMark className="h-12 w-16 sm:h-14 sm:w-20" />
            </div>
          </div>

          <p className="mb-4 text-[0.75rem] font-medium uppercase tracking-[0.45em] text-[#d9c0ff]">Luxury Jewellery House</p>
          <div className="flex justify-center">
            <BrandLogo
              compact
              className="justify-center"
              iconClassName="hidden"
              titleClassName="text-4xl text-[#f3dcff] sm:text-5xl"
              taglineClassName="text-lg text-white/82 sm:text-[1.45rem]"
            />
          </div>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/65 sm:text-base">
            Bridal statements, festive sparkle, and polished everyday elegance are getting ready for you.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[0.72rem] uppercase tracking-[0.3em] text-white/60">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Bridal</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Festive</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Signature</span>
          </div>

          <div className="mx-auto mt-10 h-[2px] w-44 overflow-hidden rounded-full bg-white/10">
            <div className="loading-bar h-full w-1/2 rounded-full bg-[linear-gradient(90deg,#5b2ca0,#c8adf4,#5b2ca0)]" />
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.35em] text-white/40">Preparing your collection</p>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent pt-24">
      <div className="text-center">
        <p className="text-4xl font-bold text-[#7b47c8]">404</p>
        <h1 className="mt-4 font-serif text-5xl font-semibold text-white">Page Not Found</h1>
        <p className="mt-4 text-[#c8adf4]">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

export default App;
