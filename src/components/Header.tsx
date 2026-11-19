import React, { useState } from 'react';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';

interface HeaderProps {
  bagCount: number;
  savedCount: number;
  onNavigateSection: (sectionId: string, filterPreset?: 'all' | 'new' | 'bestsellers') => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  onOpenBag: () => void;
  onOpenPdfStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  bagCount,
  savedCount,
  onNavigateSection,
  onOpenSearch,
  onOpenAccount,
  onOpenBag,
  onOpenPdfStudio,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    label: string;
    target: string;
    preset?: 'all' | 'new' | 'bestsellers';
  }[] = [
    { label: 'Home', target: 'hero' },
    { label: 'Shop', target: 'featured-books', preset: 'all' },
    { label: 'Categories', target: 'categories' },
    { label: 'New Arrivals', target: 'featured-books', preset: 'new' },
    { label: 'Best Sellers', target: 'featured-books', preset: 'bestsellers' },
    { label: 'About Us', target: 'about-studio' },
    { label: 'Contact', target: 'footer' },
  ];

  const handleLinkClick = (
    target: string,
    preset?: 'all' | 'new' | 'bestsellers'
  ) => {
    setMobileMenuOpen(false);
    onNavigateSection(target, preset);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F4EF]/95 border-b border-[#765A4A]/15">
      {/* Slim Top Announcement Strip */}
      <div className="bg-[#EFE8DF] border-b border-[#765A4A]/10 py-1.5 px-4 text-center">
        <p className="text-[11px] sm:text-xs text-[#765A4A] tracking-wide truncate">
          Discover new releases. Explore our collections. Creative books for every imagination.
        </p>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Brand Wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('hero');
          }}
          className="font-serif text-xl sm:text-2xl font-semibold tracking-wider text-[#203B30] whitespace-nowrap shrink-0"
        >
          NJ STUDIO
        </a>

        {/* Desktop Links */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleLinkClick(item.target, item.preset)}
              className="text-[13px] font-medium text-[#3B2F2A] hover:text-[#203B30] relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-[#203B30] hover:after:w-full after:transition-all after:duration-200"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPdfStudio();
            }}
            className="text-[13px] font-semibold text-[#203B30] hover:text-[#765A4A] relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-[#203B30] hover:after:w-full after:transition-all after:duration-200"
          >
            PDF Studio
          </button>
        </nav>

        {/* Utility Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search books and categories"
            className="w-10 h-10 rounded-full hover:bg-[#EFE8DF] text-[#2C221E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.7} />
          </button>

          <button
            type="button"
            onClick={onOpenAccount}
            aria-label="Reader account and saved reading list"
            className="relative w-10 h-10 rounded-full hover:bg-[#EFE8DF] text-[#2C221E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <User className="w-[18px] h-[18px]" strokeWidth={1.7} />
            {savedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C99595] text-[#F8F4EF] text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenBag}
            aria-label="Shopping bag"
            className="relative w-10 h-10 rounded-full hover:bg-[#EFE8DF] text-[#2C221E] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.7} />
            {bagCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#203B30] text-[#F8F4EF] text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {bagCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden w-10 h-10 rounded-full hover:bg-[#EFE8DF] text-[#2C221E] flex items-center justify-center transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden bg-[#F8F4EF] border-t border-[#765A4A]/15 px-6 py-4 flex flex-col gap-2"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleLinkClick(item.target, item.preset)}
              className="text-left py-2.5 text-sm font-medium text-[#2C221E] hover:text-[#203B30] border-b border-[#765A4A]/10 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPdfStudio();
            }}
            className="text-left py-2.5 text-sm font-semibold text-[#203B30] hover:text-[#765A4A] cursor-pointer"
          >
            PDF Studio (Print Inspector)
          </button>
        </nav>
      )}
    </header>
  );
};
