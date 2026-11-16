import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const AboutAndNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setSubscribed(true);
    setEmail('');
  };

  return (
    <>
      {/* Editorial Brand Story / About NJ STUDIO */}
      <section
        id="about-studio"
        className="py-16 md:py-20 bg-[#EFE8DF]/65 border-t border-[#765A4A]/15"
      >
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <span className="text-xs font-medium uppercase tracking-widest text-[#765A4A]">
              About NJ STUDIO
            </span>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl font-medium text-[#203B30] leading-tight text-balance">
              A Little Space for Every Story.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#3B2F2A] leading-relaxed">
              NJ STUDIO is an independent creative publishing house dedicated to
              tactile books, guided journals, puzzle-woven mysteries, and
              faith-inspired keepsakes. Each title is designed as a quiet,
              lasting companion—crafted in warm tones and brought into three
              dimensions so readers can inspect every cover, margin, and story
              artifact before bringing an edition home.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-5 border-t lg:border-t-0 lg:border-l border-[#765A4A]/20 pt-6 lg:pt-0 lg:pl-10">
            <div>
              <div className="font-serif text-2xl font-semibold text-[#203B30]">
                01. Tactile Craft
              </div>
              <p className="mt-1.5 text-xs text-[#765A4A] leading-relaxed">
                Thoughtful clothbound proportions, archival cream stock, and generous margins.
              </p>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold text-[#203B30]">
                02. Dual Formats
              </div>
              <p className="mt-1.5 text-xs text-[#765A4A] leading-relaxed">
                Available in physical hardcover/paperback partner editions and instant digital PDFs.
              </p>
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold text-[#203B30]">
                03. Living Pages
              </div>
              <p className="mt-1.5 text-xs text-[#765A4A] leading-relaxed">
                Selected illustrations open 3D story keepsakes and short editorial films.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Newsletter */}
      <section
        id="newsletter"
        className="py-16 md:py-20 bg-[#F8F4EF] border-t border-[#765A4A]/15"
      >
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-[#765A4A]">
            Brand Newsletter
          </p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-medium text-[#203B30]">
            Join the NJ STUDIO Circle.
          </h2>
          <p className="mt-2.5 text-sm text-[#765A4A]">
            Discover new releases, creative ideas and little surprises.
          </p>

          {subscribed ? (
            <div className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-[#203B30] text-[#F8F4EF] text-xs font-medium">
              <Check className="w-4 h-4 text-[#E7C2C0]" />
              <span>Welcome to the NJ STUDIO Circle — watch your inbox for our next studio letter.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 h-11 px-4 rounded-sm bg-white border border-[#765A4A]/25 text-sm text-[#2C221E] placeholder:text-[#765A4A]/60 focus:outline-none focus:border-[#203B30]"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-sm bg-[#203B30] hover:bg-[#2C221E] text-[#F8F4EF] text-xs font-semibold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
          {errorMsg && (
            <p className="mt-2 text-xs text-[#9E4747]" role="alert">
              {errorMsg}
            </p>
          )}
        </div>
      </section>
    </>
  );
};
