import React from 'react';
import { BookOpen, Eye, ShoppingBag } from 'lucide-react';
import {
  PUBLISHED_BOOKS,
  type BookProduct,
  type PrimaryCategoryId,
} from '../data/catalogue';

interface FeaturedBooksSectionProps {
  selectedCategoryId: PrimaryCategoryId | 'all';
  selectedSubcategoryId: string | 'all';
  filterTab: 'all' | 'bestsellers' | 'new';
  onChangeFilterTab: (tab: 'all' | 'bestsellers' | 'new') => void;
  onResetCategory: () => void;
  onSelectBook: (book: BookProduct) => void;
  onAddToBag: (book: BookProduct, format: 'physical' | 'digital') => void;
}

export const FeaturedBooksSection: React.FC<FeaturedBooksSectionProps> = ({
  selectedCategoryId,
  selectedSubcategoryId,
  filterTab,
  onChangeFilterTab,
  onResetCategory,
  onSelectBook,
  onAddToBag,
}) => {
  const books = PUBLISHED_BOOKS.filter((b) => {
    if (selectedCategoryId !== 'all' && b.categoryId !== selectedCategoryId) {
      return false;
    }
    if (selectedSubcategoryId !== 'all' && b.subcategoryId !== selectedSubcategoryId) {
      return false;
    }
    if (filterTab === 'bestsellers' && b.releaseBadge !== 'Best Seller') {
      return false;
    }
    if (filterTab === 'new' && b.releaseBadge !== 'New Arrival') {
      return false;
    }
    return true;
  });

  return (
    <section
      id="featured-books"
      className="py-16 md:py-20 bg-[#F8F4EF] border-t border-[#765A4A]/10"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Header + Clean Segmented Filter Tabs */}
        <div className="flex flex-col items-center text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#203B30] tracking-tight">
            Featured Books
          </h2>
          <p className="mt-2 text-sm text-[#765A4A] max-w-xl">
            Hover any edition to inspect details, or open a volume to explore its 3D cover, turning pages, and interactive artifacts.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-1 p-1 rounded-md bg-[#EFE8DE] border border-[#765A4A]/15">
            {(
              [
                { id: 'all', label: 'All Releases' },
                { id: 'bestsellers', label: 'Best Sellers' },
                { id: 'new', label: 'New Arrivals' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeFilterTab(tab.id)}
                className={`px-4 py-1.5 rounded-sm text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filterTab === tab.id
                    ? 'bg-[#F8F4EF] text-[#203B30] shadow-xs'
                    : 'text-[#765A4A] hover:text-[#203B30]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(selectedCategoryId !== 'all' || selectedSubcategoryId !== 'all') && (
            <button
              type="button"
              onClick={onResetCategory}
              className="mt-3 text-xs text-[#765A4A] hover:text-[#203B30] underline underline-offset-4 cursor-pointer"
            >
              Clear active category filter
            </button>
          )}
        </div>

        {/* Product Grid */}
        {books.length === 0 ? (
          <div className="mt-12 py-12 text-center border border-[#765A4A]/15 rounded-md bg-[#EFE8DE]/40">
            <p className="font-serif text-2xl text-[#203B30]">
              No matching editions in this filter
            </p>
            <p className="mt-1 text-xs text-[#765A4A]">
              Try switching back to All Releases or clearing your category selection.
            </p>
            <button
              type="button"
              onClick={() => {
                onChangeFilterTab('all');
                onResetCategory();
              }}
              className="mt-4 px-5 py-2 rounded-sm bg-[#203B30] text-[#F8F4EF] text-xs font-medium cursor-pointer"
            >
              Show All Books
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {books.map((book) => (
              <article
                key={book.id}
                className="group flex flex-col justify-between bg-[#EFE8DE]/55 hover:bg-[#EFE8DE] rounded-md border border-[#765A4A]/12 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* Realistic 3D Perspective Book Mockup Stage */}
                <button
                  type="button"
                  onClick={() => onSelectBook(book)}
                  className="relative w-full aspect-[4/4.6] flex items-center justify-center rounded-sm bg-[#F3ECE2] overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-[#203B30]"
                >
                  {/* Soft studio shadow beneath book */}
                  <div
                    className="absolute bottom-5 w-36 h-4 rounded-full bg-[#2C221E]/20 blur-md transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  />

                  {/* 3D Book Volume */}
                  <div
                    className="relative w-[150px] h-[206px] transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-[-2deg]"
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '900px',
                    }}
                  >
                    {/* Page block thickness visible on right edge */}
                    <div
                      className="absolute top-1 bottom-1 -right-2.5 w-3.5 rounded-r-[2px] border border-[#765A4A]/20"
                      style={{
                        background:
                          'repeating-linear-gradient(90deg, #F4ECE0 0px, #F4ECE0 1.5px, #DDD2C3 1.5px, #DDD2C3 3px)',
                      }}
                      aria-hidden="true"
                    />

                    {/* Spine strip on left edge */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-3.5 rounded-l-[3px] shadow-inner"
                      style={{ backgroundColor: book.coverTheme.spineColor }}
                      aria-hidden="true"
                    />

                    {/* Front Cover Face */}
                    <div
                      className="relative w-full h-full rounded-[3px] shadow-xl pl-4 pr-3 py-4 flex flex-col justify-between text-center border border-black/10 overflow-hidden"
                      style={{
                        backgroundColor: book.coverTheme.coverColor,
                        color: book.coverTheme.textColor,
                      }}
                    >
                      {book.coverTheme.frontCoverImageUrl ? (
                        <img
                          src={book.coverTheme.frontCoverImageUrl}
                          alt={`${book.title} cover`}
                          referrerPolicy="no-referrer"
                          className={`absolute inset-0 w-full h-full object-cover ${
                            book.coverTheme.coverCropMargins ? 'scale-[1.36]' : ''
                          }`}
                        />
                      ) : (
                        <>
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[8px] font-semibold tracking-[0.2em] uppercase opacity-75">
                              NJ STUDIO
                            </span>
                            <div
                              className="w-8 h-px my-2 opacity-40"
                              style={{ backgroundColor: book.coverTheme.accentColor }}
                            />
                          </div>

                          <div className="relative z-10 px-1">
                            <h4 className="font-serif text-[15px] font-semibold leading-tight">
                              {book.title}
                            </h4>
                            <p
                              className="font-serif italic text-[10px] mt-1 opacity-85"
                              style={{ color: book.coverTheme.accentColor }}
                            >
                              {book.subtitle}
                            </p>
                          </div>

                          <div className="relative z-10 flex flex-col items-center gap-1">
                            {book.coverTheme.isPlaceholderArtwork && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-xs border border-current/20 opacity-75">
                                Placeholder Cover
                              </span>
                            )}
                            <span className="text-[7px] tracking-widest uppercase opacity-65">
                              3D Edition
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Subtle Quick-Preview Hover Bar */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#203B30] text-[#F8F4EF] text-[11px] font-medium whitespace-nowrap shadow-md">
                    <Eye className="w-3 h-3" />
                    <span>Open 3D Preview</span>
                  </span>
                </button>

                {/* Book Metadata & Actions */}
                <div className="pt-4 flex-1 flex flex-col justify-between text-center">
                  <div>
                    <div className="text-[11px] text-[#765A4A] flex items-center justify-center gap-1.5">
                      <span>{book.releaseBadge}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{book.subcategoryLabel}</span>
                    </div>

                    <h3 className="mt-1 font-serif text-xl font-semibold text-[#203B30] leading-snug">
                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="hover:text-[#765A4A] transition-colors cursor-pointer"
                      >
                        {book.title}
                      </button>
                    </h3>

                    <p className="mt-1.5 text-xs text-[#3B2F2A] leading-relaxed line-clamp-2">
                      {book.shortDescription}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#765A4A]/15 flex items-center justify-between gap-2">
                    <div className="text-left">
                      <div className="text-[11px] text-[#765A4A]">
                        Physical / Digital
                      </div>
                      <div className="text-xs font-semibold text-[#203B30] tabular-nums">
                        {book.physicalEdition.priceDisplay} · {book.digitalEdition.priceDisplay}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[#203B30] hover:bg-[#2C221E] text-[#F8F4EF] text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>3D View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToBag(book, 'digital')}
                        aria-label={`Add ${book.title} to bag`}
                        className="p-1.5 rounded-sm border border-[#765A4A]/25 hover:bg-[#E7C2C0]/50 text-[#2C221E] transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
