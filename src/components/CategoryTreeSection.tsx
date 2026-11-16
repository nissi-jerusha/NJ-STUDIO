import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import {
  CATEGORIES,
  PUBLISHED_BOOKS,
  type BookProduct,
  type PrimaryCategoryId,
} from '../data/catalogue';
import { CategoryVisual } from './CategoryVisual';

interface CategoryTreeSectionProps {
  selectedCategoryId: PrimaryCategoryId | 'all';
  selectedSubcategoryId: string | 'all';
  onSelectCategory: (categoryId: PrimaryCategoryId | 'all', subcategoryId?: string | 'all') => void;
  onOpenBook3D: (book: BookProduct) => void;
}

export const CategoryTreeSection: React.FC<CategoryTreeSectionProps> = ({
  selectedCategoryId,
  selectedSubcategoryId,
  onSelectCategory,
  onOpenBook3D,
}) => {
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({
    'mystery-discovery': true,
    'faith-spirituality': false,
    'notes-journals': true,
    'stories-inspiration': false,
  });

  const toggleBranch = (catId: PrimaryCategoryId) => {
    setExpandedBranches((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleCardSelect = (catId: PrimaryCategoryId) => {
    setExpandedBranches((prev) => ({
      ...prev,
      [catId]: true,
    }));
    onSelectCategory(catId, 'all');
    const treeEl = document.getElementById('category-tree-explorer');
    if (treeEl) {
      treeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const filteredTreeBooks = PUBLISHED_BOOKS.filter((book) => {
    if (selectedCategoryId !== 'all' && book.categoryId !== selectedCategoryId) {
      return false;
    }
    if (selectedSubcategoryId !== 'all' && book.subcategoryId !== selectedSubcategoryId) {
      return false;
    }
    return true;
  });

  return (
    <section id="categories" className="py-16 md:py-20 bg-[#F8F4EF]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shop by Category Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#203B30] tracking-tight">
            Shop by Category
          </h2>
          <p className="mt-2.5 text-sm text-[#765A4A]">
            Select any publishing universe to explore its curated series and interactive 3D editions.
          </p>
        </div>

        {/* 4-Column Category Visual Cards (Aligned with Reference Image) */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCardSelect(cat.id)}
                className={`group text-left flex flex-col rounded-md overflow-hidden transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#203B30] ${
                  isActive
                    ? 'ring-2 ring-[#203B30] bg-[#EFE8DE]/60 -translate-y-1'
                    : 'hover:-translate-y-1'
                }`}
              >
                <div className="w-full aspect-[4/3.4] rounded-md overflow-hidden border border-[#765A4A]/15 bg-[#EFE8DE]">
                  <CategoryVisual categoryId={cat.id} />
                </div>
                <div className="pt-3.5 pb-2 px-1 text-center">
                  <h3 className="font-serif text-xl font-semibold text-[#203B30] group-hover:text-[#765A4A] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#765A4A] leading-relaxed line-clamp-2">
                    {cat.shortDescription}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Expandable Category Tree Explorer */}
        <div
          id="category-tree-explorer"
          className="mt-14 pt-12 border-t border-[#765A4A]/15"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-medium tracking-wider uppercase text-[#765A4A]">
                Publishing Taxonomy
              </span>
              <h3 className="font-serif text-2xl md:text-3xl font-medium text-[#203B30] mt-1">
                Interactive Category Tree
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {selectedCategoryId !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectCategory('all', 'all')}
                  className="text-xs font-medium text-[#765A4A] hover:text-[#203B30] underline underline-offset-4 cursor-pointer"
                >
                  Show All Categories
                </button>
              )}
              <span className="text-xs text-[#765A4A] tabular-nums">
                {filteredTreeBooks.length}{' '}
                {filteredTreeBooks.length === 1 ? 'edition' : 'editions'} shown
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 5 cols: Expandable Publishing Branches */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {CATEGORIES.map((cat) => {
                const isExpanded = Boolean(expandedBranches[cat.id]);
                const isCatSelected = selectedCategoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className={`rounded-md border transition-colors ${
                      isCatSelected
                        ? 'border-[#203B30]/45 bg-[#EFE8DE]/75'
                        : 'border-[#765A4A]/15 bg-[#F8F4EF]'
                    }`}
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          toggleBranch(cat.id);
                          onSelectCategory(cat.id, 'all');
                        }}
                        className="flex-1 flex items-center gap-2.5 text-left cursor-pointer"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#203B30] shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[#765A4A] shrink-0" />
                        )}
                        <span className="font-serif text-lg font-semibold text-[#203B30]">
                          {cat.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBranch(cat.id)}
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${cat.title}`}
                        className="text-xs text-[#765A4A] hover:text-[#203B30] px-2 py-1 cursor-pointer tabular-nums"
                      >
                        {cat.subcategories.length}
                      </button>
                    </div>

                    {/* Smooth Branch Children */}
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isExpanded
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <ul className="px-4 pb-3 pt-1 ml-3 border-l border-[#765A4A]/20 flex flex-col gap-1">
                          {cat.subcategories.map((sub) => {
                            const isSubSelected =
                              selectedCategoryId === cat.id &&
                              selectedSubcategoryId === sub.id;
                            const countInSub = PUBLISHED_BOOKS.filter(
                              (b) => b.subcategoryId === sub.id
                            ).length;

                            return (
                              <li key={sub.id}>
                                <button
                                  type="button"
                                  onClick={() => onSelectCategory(cat.id, sub.id)}
                                  className={`w-full text-left px-3 py-2 rounded-sm text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                    isSubSelected
                                      ? 'bg-[#203B30] text-[#F8F4EF] font-medium'
                                      : 'hover:bg-[#E7C2C0]/35 text-[#3B2F2A]'
                                  }`}
                                >
                                  <span className="truncate">{sub.label}</span>
                                  <span
                                    className={`text-[11px] tabular-nums ${
                                      isSubSelected ? 'text-[#F8F4EF]/80' : 'text-[#765A4A]'
                                    }`}
                                  >
                                    {countInSub > 0 ? `${countInSub} title` : 'Series'}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 7 cols: Live Filtered Collection Preview */}
            <div className="lg:col-span-7 rounded-md border border-[#765A4A]/15 bg-[#EFE8DE]/45 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#765A4A]/15">
                <div>
                  <div className="text-xs text-[#765A4A]">
                    Active Selection
                  </div>
                  <h4 className="font-serif text-xl font-semibold text-[#203B30]">
                    {selectedCategoryId === 'all'
                      ? 'Complete NJ STUDIO Catalogue'
                      : CATEGORIES.find((c) => c.id === selectedCategoryId)?.title}
                    {selectedSubcategoryId !== 'all' &&
                      ` · ${
                        CATEGORIES.flatMap((c) => c.subcategories).find(
                          (s) => s.id === selectedSubcategoryId
                        )?.label
                      }`}
                  </h4>
                </div>
                <a
                  href="#featured-books"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#203B30] hover:text-[#765A4A] whitespace-nowrap"
                >
                  <span>View in Shelf</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {filteredTreeBooks.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredTreeBooks.map((book) => (
                    <div
                      key={book.id}
                      className="group p-4 rounded-sm bg-[#F8F4EF] border border-[#765A4A]/15 hover:border-[#203B30]/40 transition-all flex gap-4 items-start"
                    >
                      {/* Miniature 3D Book Spine/Cover Swatch */}
                      <div
                        className="w-16 h-22 shrink-0 rounded-xs shadow-md flex flex-col justify-between p-2 border-l-4"
                        style={{
                          backgroundColor: book.coverTheme.coverColor,
                          borderLeftColor: book.coverTheme.spineColor,
                          color: book.coverTheme.textColor,
                        }}
                      >
                        <span className="text-[7px] uppercase tracking-wider opacity-75">
                          NJ
                        </span>
                        <span className="font-serif text-[10px] font-semibold leading-tight line-clamp-3">
                          {book.title}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] text-[#765A4A] truncate">
                          {book.subcategoryLabel} · {book.physicalEdition.priceDisplay}
                        </div>
                        <h5 className="font-serif text-base font-semibold text-[#203B30] leading-snug mt-0.5 truncate">
                          {book.title}
                        </h5>
                        <p className="mt-1 text-xs text-[#3B2F2A] line-clamp-2">
                          {book.shortDescription}
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenBook3D(book)}
                          className="mt-2.5 text-xs font-semibold text-[#203B30] hover:text-[#765A4A] underline underline-offset-4 cursor-pointer"
                        >
                          Open 3D Edition
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center flex flex-col items-center">
                  <FolderOpen className="w-8 h-8 text-[#765A4A]/60 mb-2" />
                  <p className="font-serif text-lg text-[#203B30]">
                    Upcoming Series in This Branch
                  </p>
                  <p className="text-xs text-[#765A4A] max-w-sm mt-1">
                    New NJ STUDIO titles for this sub-collection are currently in preparation. Browse the parent category or explore all releases.
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(selectedCategoryId, 'all')}
                    className="mt-4 px-4 py-2 rounded-sm bg-[#203B30] text-[#F8F4EF] text-xs font-medium cursor-pointer"
                  >
                    View Parent Category
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
