import React from 'react';
import { CATEGORIES, type PrimaryCategoryId } from '../data/catalogue';

export type FooterInfoModalType =
  | 'privacy'
  | 'terms'
  | 'support'
  | 'studio-guide'
  | null;

interface FooterProps {
  onSelectCategory: (catId: PrimaryCategoryId) => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenInfoModal: (modal: FooterInfoModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onNavigateSection,
  onOpenInfoModal,
}) => {
  return (
    <footer
      id="footer"
      className="bg-[#203B30] text-[#F8F4EF] border-t border-[#765A4A]/20"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="font-serif text-2xl font-semibold tracking-wider text-[#F8F4EF]">
              NJ STUDIO
            </div>
            <p className="mt-1.5 font-serif italic text-base text-[#E7C2C0]">
              A Little Space for Every Story.
            </p>
            <p className="mt-4 text-xs text-[#F8F4EF]/80 leading-relaxed max-w-xs">
              An independent creative publishing studio crafting heirloom guided
              journals, puzzle mysteries, faith-inspired keepsakes, and original
              illustrated books.
            </p>
            <div className="mt-5 flex items-center gap-4 text-xs">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F8F4EF]/85 hover:text-[#E7C2C0] underline underline-offset-4 transition-colors"
              >
                Instagram
              </a>
              <span aria-hidden="true" className="text-[#F8F4EF]/30">·</span>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F8F4EF]/85 hover:text-[#E7C2C0] underline underline-offset-4 transition-colors"
              >
                Pinterest
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#E7C2C0]">
              Shop Categories
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-xs text-[#F8F4EF]/85">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-[#E7C2C0] transition-colors cursor-pointer text-left"
                  >
                    {cat.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support & Studio */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#E7C2C0]">
              Support
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-xs text-[#F8F4EF]/85">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfoModal('support')}
                  className="hover:text-[#E7C2C0] transition-colors cursor-pointer"
                >
                  Customer Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('about-studio')}
                  className="hover:text-[#E7C2C0] transition-colors cursor-pointer"
                >
                  About the Brand
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenInfoModal('studio-guide')}
                  className="hover:text-[#E7C2C0] transition-colors cursor-pointer"
                >
                  Catalogue Asset Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#E7C2C0]">
              Contact
            </h3>
            <div className="mt-4 flex flex-col gap-2 text-xs text-[#F8F4EF]/85 leading-relaxed">
              <p>
                Editorial & Reader Enquiries:{' '}
                <a
                  href="mailto:hello@njstudio.publishing"
                  className="underline underline-offset-4 hover:text-[#E7C2C0]"
                >
                  hello@njstudio.publishing
                </a>
              </p>
              <p className="text-[#F8F4EF]/70">
                Studio Hours: Monday – Friday, 9:00 – 17:00
              </p>
              <p className="text-[#F8F4EF]/70">
                Physical orders are fulfilled externally via listed retail partners.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-6 border-t border-[#F8F4EF]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F8F4EF]/70">
          <p>© {new Date().getFullYear()} NJ STUDIO Publishing. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => onOpenInfoModal('privacy')}
              className="hover:text-[#F8F4EF] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onOpenInfoModal('terms')}
              className="hover:text-[#F8F4EF] transition-colors cursor-pointer"
            >
              Terms and Conditions
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
