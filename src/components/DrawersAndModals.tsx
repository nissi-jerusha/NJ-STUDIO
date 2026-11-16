import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Heart,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  CATEGORIES,
  PUBLISHED_BOOKS,
  type BookProduct,
} from '../data/catalogue';
import type { FooterInfoModalType } from './Footer';

export interface BagItem {
  book: BookProduct;
  format: 'physical' | 'digital';
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelectBook: (book: BookProduct) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onClose,
  onSelectBook,
}) => {
  const [query, setQuery] = useState('');
  if (!open) return null;

  const q = query.trim().toLowerCase();
  const matches = PUBLISHED_BOOKS.filter((b) => {
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.subtitle.toLowerCase().includes(q) ||
      b.categoryLabel.toLowerCase().includes(q) ||
      b.subcategoryLabel.toLowerCase().includes(q) ||
      b.shortDescription.toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search NJ STUDIO Catalogue"
      className="fixed inset-0 z-50 bg-[#1F1713]/70 flex items-start justify-center pt-16 px-4"
    >
      <div className="w-full max-w-2xl bg-[#F8F4EF] rounded-md border border-[#765A4A]/25 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#765A4A]/15">
          <Search className="w-4 h-4 text-[#765A4A] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, journals, mystery books, faith editions..."
            className="flex-1 bg-transparent text-sm text-[#2C221E] placeholder:text-[#765A4A]/70 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1.5 rounded-full hover:bg-[#EFE8DF] text-[#2C221E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 flex flex-col gap-2">
          {matches.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#765A4A]">
              No titles matched &ldquo;{query}&rdquo;. Try searching for{' '}
              {CATEGORIES.map((c) => c.title).join(', ')}.
            </div>
          ) : (
            matches.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => {
                  onClose();
                  onSelectBook(book);
                }}
                className="w-full text-left p-3 rounded-sm hover:bg-[#EFE8DF] transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-14 shrink-0 rounded-xs border-l-4 shadow-xs"
                    style={{
                      backgroundColor: book.coverTheme.coverColor,
                      borderLeftColor: book.coverTheme.spineColor,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="font-serif text-lg font-semibold text-[#203B30] truncate">
                      {book.title}
                    </div>
                    <div className="text-xs text-[#765A4A] truncate">
                      {book.categoryLabel} · {book.subcategoryLabel}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#203B30] whitespace-nowrap">
                  Open 3D →
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
  savedBookIds: string[];
  onToggleSave: (bookId: string) => void;
  onSelectBook: (book: BookProduct) => void;
}

export const AccountDrawer: React.FC<AccountDrawerProps> = ({
  open,
  onClose,
  savedBookIds,
  onToggleSave,
  onSelectBook,
}) => {
  if (!open) return null;
  const savedBooks = PUBLISHED_BOOKS.filter((b) => savedBookIds.includes(b.id));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reader Reading List"
      className="fixed inset-0 z-50 bg-[#1F1713]/60 flex justify-end"
    >
      <div className="w-full max-w-md bg-[#F8F4EF] h-full shadow-2xl border-l border-[#765A4A]/20 flex flex-col">
        <div className="px-6 py-5 border-b border-[#765A4A]/15 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#203B30]">
              Reader Sanctuary
            </h3>
            <p className="text-xs text-[#765A4A]">
              Your saved NJ STUDIO editions & reading list
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reader sanctuary"
            className="p-2 rounded-full hover:bg-[#EFE8DF] text-[#2C221E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {savedBooks.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center">
              <Heart className="w-8 h-8 text-[#C99595] mb-3" />
              <p className="font-serif text-xl text-[#203B30]">
                Your reading list is empty
              </p>
              <p className="mt-1 text-xs text-[#765A4A] max-w-xs">
                Tap &ldquo;Save&rdquo; inside any 3D book studio to bookmark titles for later exploration.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {savedBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-3.5 rounded-sm bg-[#EFE8DE]/70 border border-[#765A4A]/15 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="font-serif text-base font-semibold text-[#203B30] truncate">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[#765A4A] truncate">
                      {book.categoryLabel} · {book.physicalEdition.priceDisplay}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectBook(book);
                      }}
                      className="px-2.5 py-1.5 rounded-sm bg-[#203B30] text-[#F8F4EF] text-xs font-medium cursor-pointer"
                    >
                      Open 3D
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleSave(book.id)}
                      aria-label={`Remove ${book.title}`}
                      className="p-1.5 rounded-sm hover:bg-[#E7C2C0]/60 text-[#765A4A] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface BagDrawerProps {
  open: boolean;
  onClose: () => void;
  items: BagItem[];
  onRemoveItem: (index: number) => void;
  onSelectBook: (book: BookProduct) => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  open,
  onClose,
  items,
  onRemoveItem,
  onSelectBook,
}) => {
  if (!open) return null;

  const estimatedTotal = items.reduce((sum, item) => {
    const price =
      item.format === 'physical'
        ? item.book.physicalEdition.priceNumeric
        : item.book.digitalEdition.priceNumeric;
    return sum + price;
  }, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-50 bg-[#1F1713]/60 flex justify-end"
    >
      <div className="w-full max-w-md bg-[#F8F4EF] h-full shadow-2xl border-l border-[#765A4A]/20 flex flex-col">
        <div className="px-6 py-5 border-b border-[#765A4A]/15 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#203B30]">
              Edition Bag
            </h3>
            <p className="text-xs text-[#765A4A]">
              Saved editions & direct partner purchase links
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="p-2 rounded-full hover:bg-[#EFE8DF] text-[#2C221E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center">
              <ShoppingBag className="w-8 h-8 text-[#765A4A]/60 mb-3" />
              <p className="font-serif text-xl text-[#203B30]">Your bag is empty</p>
              <p className="mt-1 text-xs text-[#765A4A] max-w-xs">
                Explore any NJ STUDIO book in 3D and save a Physical or Digital edition here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item, idx) => {
                const isPhysical = item.format === 'physical';
                const price = isPhysical
                  ? item.book.physicalEdition.priceDisplay
                  : item.book.digitalEdition.priceDisplay;
                const url = isPhysical
                  ? item.book.physicalEdition.marketplaceUrl
                  : item.book.digitalEdition.purchaseUrl;

                return (
                  <div
                    key={`${item.book.id}-${item.format}-${idx}`}
                    className="p-4 rounded-sm bg-[#EFE8DE]/75 border border-[#765A4A]/15 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-[#765A4A]">
                          {isPhysical ? 'Physical Partner Edition' : 'Digital Edition (PDF)'}
                        </div>
                        <h4 className="font-serif text-lg font-semibold text-[#203B30] leading-snug">
                          {item.book.title}
                        </h4>
                      </div>
                      <span className="font-serif text-lg font-semibold text-[#203B30] tabular-nums">
                        {price}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#765A4A]/15">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#203B30] hover:text-[#765A4A] underline underline-offset-4"
                      >
                        <span>
                          {isPhysical ? 'Buy on Partner Marketplace' : 'Get Digital Download'}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectBook(item.book);
                          }}
                          aria-label={`Inspect ${item.book.title} in 3D`}
                          className="p-1.5 rounded-sm hover:bg-[#F8F4EF] text-[#203B30] cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          aria-label={`Remove ${item.book.title}`}
                          className="p-1.5 rounded-sm hover:bg-[#E7C2C0]/60 text-[#765A4A] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-[#765A4A]/15 bg-[#EFE8DE]/60">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-medium text-[#765A4A]">
                Estimated Selection Total
              </span>
              <span className="font-serif text-2xl font-semibold text-[#203B30] tabular-nums">
                ${estimatedTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-[#765A4A] leading-relaxed">
              Physical editions are fulfilled externally through our retail partners. Use each edition’s marketplace link above to complete checkout securely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface FooterInfoModalProps {
  modalType: FooterInfoModalType;
  onClose: () => void;
}

export const FooterInfoModal: React.FC<FooterInfoModalProps> = ({
  modalType,
  onClose,
}) => {
  if (!modalType) return null;

  const titles: Record<Exclude<FooterInfoModalType, null>, string> = {
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    support: 'Customer Support',
    'studio-guide': 'NJ STUDIO Catalogue & 3D Asset Guide',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titles[modalType]}
      className="fixed inset-0 z-50 bg-[#1F1713]/75 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-xl bg-[#F8F4EF] rounded-md border border-[#765A4A]/25 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#765A4A]/15 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-semibold text-[#203B30]">
            {titles[modalType]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full hover:bg-[#EFE8DF] text-[#2C221E] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-xs sm:text-sm text-[#3B2F2A] leading-relaxed space-y-3 max-h-[70vh] overflow-y-auto">
          {modalType === 'privacy' && (
            <>
              <p>
                NJ STUDIO respects your privacy. Saved reading lists and bag selections are stored locally in your browser session and are never sold or shared with third-party advertisers.
              </p>
              <p>
                When you follow an external purchase link to our print or digital retail partners, that partner’s privacy policy governs checkout and order fulfillment.
              </p>
            </>
          )}

          {modalType === 'terms' && (
            <>
              <p>
                All original book titles, editorial spreads, and 3D interactive previews presented on NJ STUDIO are proprietary works of NJ STUDIO Publishing.
              </p>
              <p>
                Physical editions are fulfilled exclusively through our external print-on-demand and bookstore partners. NJ STUDIO does not process direct physical shipping or payment cards on this preview site.
              </p>
            </>
          )}

          {modalType === 'support' && (
            <>
              <p>
                Need help accessing a digital PDF edition or locating a physical copy? Reach our publishing desk at{' '}
                <span className="font-semibold text-[#203B30]">hello@njstudio.publishing</span>.
              </p>
              <p>
                For physical shipping updates or returns, please contact the retail partner listed on your order confirmation.
              </p>
            </>
          )}

          {modalType === 'studio-guide' && (
            <>
              <p className="font-semibold text-[#203B30]">
                Data-Driven Catalogue Architecture (src/data/catalogue.ts)
              </p>
              <p>
                Every book on NJ STUDIO is driven by the <code className="px-1 py-0.5 bg-[#EFE8DF] rounded-xs">BOOKS_CATALOGUE</code> array—no component code edits are needed to add, update, or archive titles:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>
                  <strong>Replace Covers:</strong> Place cover files in <code className="bg-[#EFE8DF] px-1">public/covers/</code> and set <code className="bg-[#EFE8DF] px-1">frontCoverImageUrl</code>, <code className="bg-[#EFE8DF] px-1">backCoverImageUrl</code>, and <code className="bg-[#EFE8DF] px-1">isPlaceholderArtwork: false</code>.
                </li>
                <li>
                  <strong>Add Interior Pages:</strong> Append entries to a book’s <code className="bg-[#EFE8DF] px-1">spreads</code> array with headings, body lines, and optional <code className="bg-[#EFE8DF] px-1">interactiveObject</code> triggers.
                </li>
                <li>
                  <strong>Upload 3D Models & Videos:</strong> Drop <code className="bg-[#EFE8DF] px-1">.glb</code> files into <code className="bg-[#EFE8DF] px-1">public/models/</code> and set <code className="bg-[#EFE8DF] px-1">glbModelUrl</code> (and optionally <code className="bg-[#EFE8DF] px-1">videoUrl</code> for <code className="bg-[#EFE8DF] px-1">.mp4</code> reels).
                </li>
                <li>
                  <strong>Archive Books:</strong> Change <code className="bg-[#EFE8DF] px-1">status: &apos;published&apos;</code> to <code className="bg-[#EFE8DF] px-1">&apos;archived&apos;</code> without deleting any data.
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
