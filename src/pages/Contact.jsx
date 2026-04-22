import { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useContent } from '../context/ContentContext';

export default function Contact() {
  const { submitEnquiry } = useStore();
  const { brandInfo } = useContent();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f7f1ff] pt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7b47c8]">Contact Us</p>
          <h1 className="mt-3 font-serif text-4xl text-[#121212] md:text-5xl">Talk to our jewellery experts with complete clarity</h1>
          <p className="mt-4 text-lg text-[#4B2C6F]/70">
            Order support, bridal styling, wholesale inquiries, and private consultations are all available here in one
            clear place.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card-luxury rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(75,44,111,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7b47c8]">Contact</p>
            <h1 className="mt-3 font-serif text-4xl text-[#121212]">Let us help you choose the perfect piece</h1>
            <p className="mt-4 text-[#4B2C6F]/70">
              Connect with our team for order support, bridal styling, wholesale inquiries, and private consultation
              assistance.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 text-[#7b47c8]" size={18} />
                <p className="text-[#4B2C6F]/80">{brandInfo.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-[#7b47c8]" size={18} />
                <a className="font-medium text-[#4B2C6F]/80 hover:text-[#7b47c8]" href={`tel:${brandInfo.phone}`}>
                  {brandInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-[#7b47c8]" size={18} />
                <a className="font-medium text-[#4B2C6F]/80 hover:text-[#7b47c8]" href={`mailto:${brandInfo.email}`}>
                  {brandInfo.email}
                </a>
              </div>
              <a
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#5b2ca0] to-[#8d58d6] px-6 py-3 font-bold uppercase tracking-wider text-white transition hover:shadow-lg"
                href={`mailto:${brandInfo.email}?subject=Customer%20Enquiry`}
              >
                <Send size={18} />
                Email Our Team
              </a>
            </div>
          </div>

          <div className="card-luxury rounded-3xl bg-[linear-gradient(180deg,#ffffff,#f6f0ff)] p-8 shadow-[0_20px_60px_rgba(91,44,160,0.12)]">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7b47c8]">Inquiry Form</p>
            <h2 className="mt-3 font-serif text-3xl text-[#121212]">Send an Inquiry</h2>
            <p className="mt-3 text-[#4B2C6F]/65">Fill in your details and our team will get back to you shortly.</p>
            <form
              className="mt-6 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                await submitEnquiry(form);
                setSubmitted(true);
                setForm({ name: '', email: '', phone: '', message: '' });
              }}
            >
              <input name="name" value={form.name} onChange={handleChange} required className="rounded-2xl border border-[#5b2ca0]/16 bg-white px-4 py-3 text-[#121212] shadow-sm outline-none transition placeholder:text-[#4B2C6F]/40 focus:border-[#7b47c8] focus:ring-2 focus:ring-[#7b47c8]/15" placeholder="Name" />
              <input name="email" value={form.email} onChange={handleChange} required type="email" className="rounded-2xl border border-[#5b2ca0]/16 bg-white px-4 py-3 text-[#121212] shadow-sm outline-none transition placeholder:text-[#4B2C6F]/40 focus:border-[#7b47c8] focus:ring-2 focus:ring-[#7b47c8]/15" placeholder="Email" />
              <input name="phone" value={form.phone} onChange={handleChange} required className="rounded-2xl border border-[#5b2ca0]/16 bg-white px-4 py-3 text-[#121212] shadow-sm outline-none transition placeholder:text-[#4B2C6F]/40 focus:border-[#7b47c8] focus:ring-2 focus:ring-[#7b47c8]/15" placeholder="Phone" />
              <textarea name="message" value={form.message} onChange={handleChange} required rows="5" className="rounded-2xl border border-[#5b2ca0]/16 bg-white px-4 py-3 text-[#121212] shadow-sm outline-none transition placeholder:text-[#4B2C6F]/40 focus:border-[#7b47c8] focus:ring-2 focus:ring-[#7b47c8]/15" placeholder="Tell us what you are looking for" />
              <button className="btn-premium inline-flex items-center justify-center gap-2 px-6 py-3" type="submit">
                <Send size={18} />
                Send Message
              </button>
            </form>
            {submitted && (
              <p className="mt-4 rounded-2xl border border-[#7b47c8]/16 bg-[#7b47c8]/8 px-4 py-3 text-[#7b47c8]">
                Thank you. Your inquiry has been recorded and our team will reach out shortly.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
