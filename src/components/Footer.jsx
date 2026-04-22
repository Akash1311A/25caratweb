import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, MapPin, Phone, Mail, BadgeCheck } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useContent } from '../context/ContentContext';

export default function Footer() {
  const { brandInfo, collections } = useContent();

  return (
    <footer className="border-t border-white/10 bg-[linear-gradient(180deg,#2f124d,#180f27)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <BrandLogo
              compact
              className="items-start"
              iconClassName="h-12 w-14"
              titleClassName="text-[#ead39a]"
              taglineClassName="text-[#f6edff]/85"
            />
            <p className="mt-3 text-sm leading-relaxed text-white/80">{brandInfo.description}</p>
            <div className="mt-5 flex items-center gap-3 text-[#c8adf4]">
              <BadgeCheck size={18} />
              <span className="text-sm font-light">Preferred by discerning jewellery buyers across India</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#d9c0ff]" style={{ letterSpacing: '0.1em' }}>QUICK LINKS</h4>
            <div className="mt-4 space-y-3 text-white/70">
              <Link className="block text-sm transition-colors hover:text-[#ead39a]" to="/">Home</Link>
              <Link className="block text-sm transition-colors hover:text-[#ead39a]" to="/shop">Shop</Link>
              <Link className="block text-sm transition-colors hover:text-[#ead39a]" to="/about">About</Link>
              <Link className="block text-sm transition-colors hover:text-[#ead39a]" to="/contact">Contact</Link>
              <Link className="block text-sm transition-colors hover:text-[#ead39a]" to="/account">Account</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#d9c0ff]" style={{ letterSpacing: '0.1em' }}>COLLECTIONS</h4>
            <div className="mt-4 space-y-3 text-white/70">
              {collections.slice(0, 4).map((collection) => (
                <Link key={collection.name} className="block text-sm transition-colors hover:text-[#ead39a]" to="/shop">
                  {collection.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#d9c0ff]" style={{ letterSpacing: '0.1em' }}>CONTACT</h4>
            <div className="mt-4 space-y-4 text-white/70">
              <p className="flex items-start gap-3 text-sm"><MapPin size={16} className="mt-0.5 text-[#c8adf4]" />{brandInfo.address}</p>
              <a className="flex items-center gap-3 text-sm transition-colors hover:text-[#ead39a]" href={`tel:${brandInfo.phone}`}><Phone size={16} className="text-[#c8adf4]" />{brandInfo.phone}</a>
              <a className="flex items-center gap-3 text-sm transition-colors hover:text-[#ead39a]" href={`mailto:${brandInfo.email}`}><Mail size={16} className="text-[#c8adf4]" />{brandInfo.email}</a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs tracking-wide text-white/60">&#169; 2024 25 Carat. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a className="rounded-full border border-white/15 bg-white/5 p-2.5 text-[#d9c0ff] transition-all duration-300 hover:border-[#c8adf4]/60 hover:bg-[#5b2ca0]/20 hover:text-[#ead39a]" href={`https://instagram.com/${brandInfo.instagram}`} target="_blank" rel="noreferrer">
              <Instagram size={18} />
            </a>
            <a className="rounded-full border border-white/15 bg-white/5 p-2.5 text-[#d9c0ff] transition-all duration-300 hover:border-[#c8adf4]/60 hover:bg-[#5b2ca0]/20 hover:text-[#ead39a]" href={brandInfo.youtube} target="_blank" rel="noreferrer">
              <Youtube size={18} />
            </a>
            <a className="rounded-full border border-white/15 bg-white/5 p-2.5 text-[#d9c0ff] transition-all duration-300 hover:border-[#c8adf4]/60 hover:bg-[#5b2ca0]/20 hover:text-[#ead39a]" href="#">
              <Facebook size={18} />
            </a>
            <a className="inline-flex items-center rounded-full border border-[#a784df] bg-[#6d38b5] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#824bcf]" href={`mailto:${brandInfo.email}?subject=Client%20Enquiry`}>
              Email Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
