import { Link } from 'react-router-dom';
import { BadgeCheck, Crown, Gem, ShieldCheck } from 'lucide-react';
import { useContent } from '../context/ContentContext';

export default function About() {
  const { brandInfo } = useContent();

  return (
    <div className="min-h-screen bg-[#f7f1ff] pt-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1920&h=900&fit=crop"
            alt="Brand story"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2f124d]/35 to-[#180f27]/90" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="text-sm uppercase tracking-[0.35em] text-[#ead39a]">About 25 Carat</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl text-white md:text-7xl">Effortless Glamour for Every Celebration</h1>
          <p className="mt-6 max-w-2xl text-lg text-white/90">{brandInfo.description}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="card-luxury rounded-3xl p-8">
          <h2 className="font-serif text-4xl text-[#121212]">Our philosophy</h2>
          <p className="mt-4 leading-8 text-[#4B2C6F]/80">{brandInfo.story}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Crown, title: 'Luxury curation', text: 'Pieces selected for premium appeal' },
              { icon: Gem, title: 'Craftsmanship', text: 'Detailed finishing and polished structure' },
              { icon: ShieldCheck, title: 'Trust', text: 'Transparent service and secure checkout' },
              { icon: BadgeCheck, title: 'Assurance', text: 'Quality checks before dispatch' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#5b2ca0]/15 bg-[#5b2ca0]/8 p-4 transition hover:bg-[#7b47c8]/12">
                <item.icon className="text-[#7b47c8]" size={20} />
                <h3 className="mt-3 text-lg text-[#4B2C6F] font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-[#4B2C6F]/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-luxury rounded-3xl p-8">
          <h2 className="font-serif text-3xl text-[#121212]">Why customers choose us</h2>
          <div className="mt-6 space-y-4">
            {brandInfo.highlights.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#5b2ca0]/15 bg-[#5b2ca0]/8 p-4 text-[#4B2C6F] font-medium transition hover:bg-[#7b47c8]/12">
                <BadgeCheck className="text-[#7b47c8]" size={18} />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-[#7b47c8]/20 bg-[linear-gradient(135deg,rgba(123,71,200,0.16),rgba(24,15,39,0.96))] p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[#ead39a]">Our Promise</p>
            <p className="mt-3 text-zinc-300">
              Premium presentation, refined product storytelling, and a buying experience that feels calm, confident, and elevated.
            </p>
          </div>
          <Link to="/shop" className="btn-premium mt-8 inline-flex px-6 py-3">
            Discover the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
