import { useEffect, useState } from 'react';
import { AboutAndNewsletter } from './components/AboutAndNewsletter';
import { Book3DModal } from './components/Book3DModal';
import { CategoryTreeSection } from './components/CategoryTreeSection';
import {
  AccountDrawer,
  BagDrawer,
  FooterInfoModal,
  SearchModal,
  type BagItem,
} from './components/DrawersAndModals';
import { FeaturedBooksSection } from './components/FeaturedBooksSection';
import { Footer, type FooterInfoModalType } from './components/Footer';
import { Header } from './components/Header';
import { Hero3DScene } from './components/Hero3DScene';
import { PdfPrintStudioModal } from './components/PdfPrintStudioModal';
import { PromoBanner3D } from './components/PromoBanner3D';
import { PUBLISHED_BOOKS, type BookProduct, type PrimaryCategoryId } from './data/catalogue';

export function App() {
  const [selectedBook, setSelectedBook] = useState<BookProduct | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<PrimaryCategoryId | 'all'>('all');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | 'all'>('all');
  const [filterTab, setFilterTab] = useState<'all' | 'bestsellers' | 'new'>('all');

  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<FooterInfoModalType>(null);
  const [pdfStudioState, setPdfStudioState] = useState<{
    open: boolean;
    pdfUrl?: string;
    fileName?: string;
    bookTitle?: string;
    sellingPriceDisplay?: string;
  }>({ open: false });

  const [savedBookIds, setSavedBookIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('nj_studio_saved_books');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [bagItems, setBagItems] = useState<BagItem[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('nj_studio_saved_books', JSON.stringify(savedBookIds));
    } catch {
      // ignore storage quota errors
    }
  }, [savedBookIds]);

  const scrollToSection = (
    sectionId: string,
    preset?: 'all' | 'new' | 'bestsellers'
  ) => {
    if (preset) {
      setFilterTab(preset);
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategory = (
    catId: PrimaryCategoryId | 'all',
    subId: string | 'all' = 'all'
  ) => {
    setSelectedCategoryId(catId);
    setSelectedSubcategoryId(subId);
  };

  const handleToggleSave = (bookId: string) => {
    setSavedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleAddToBag = (book: BookProduct, format: 'physical' | 'digital') => {
    setBagItems((prev) => [...prev, { book, format }]);
    setBagOpen(true);
  };

  const handleRemoveBagItem = (index: number) => {
    setBagItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenPdfStudio = (book?: BookProduct) => {
    const targetBook =
      book ||
      PUBLISHED_BOOKS.find((b) => b.id === 'story-of-king-david') ||
      PUBLISHED_BOOKS[0];
    setPdfStudioState({
      open: true,
      pdfUrl: targetBook.digitalEdition.samplePdfUrl || '/assets/aistudio/THE_STORY_OF_KING_DAVID_8610dd13.pdf',
      fileName: targetBook.id === 'story-of-king-david'
        ? 'THE_STORY_OF_KING_DAVID.pdf'
        : `${targetBook.slug}.pdf`,
      bookTitle: targetBook.title,
      sellingPriceDisplay: targetBook.physicalEdition.priceDisplay,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F4EF] text-[#2C221E]">
      <Header
        bagCount={bagItems.length}
        savedCount={savedBookIds.length}
        onNavigateSection={scrollToSection}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenBag={() => setBagOpen(true)}
        onOpenPdfStudio={() => handleOpenPdfStudio()}
      />

      <main className="flex-1">
        <Hero3DScene
          onSelectBook={(book) => setSelectedBook(book)}
          onExploreBooks={() => scrollToSection('featured-books')}
          onDiscoverStory={() => scrollToSection('about-studio')}
        />

        <CategoryTreeSection
          selectedCategoryId={selectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId}
          onSelectCategory={handleSelectCategory}
          onOpenBook3D={(book) => setSelectedBook(book)}
        />

        <FeaturedBooksSection
          selectedCategoryId={selectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId}
          filterTab={filterTab}
          onChangeFilterTab={setFilterTab}
          onResetCategory={() => handleSelectCategory('all', 'all')}
          onSelectBook={(book) => setSelectedBook(book)}
          onAddToBag={handleAddToBag}
          onOpenPdfStudio={handleOpenPdfStudio}
        />

        <PromoBanner3D
          onExploreCollection={() => {
            setFilterTab('all');
            handleSelectCategory('all', 'all');
            scrollToSection('featured-books');
          }}
        />

        <AboutAndNewsletter />
      </main>

      <Footer
        onSelectCategory={(catId) => {
          handleSelectCategory(catId, 'all');
          scrollToSection('categories');
        }}
        onNavigateSection={(id) => scrollToSection(id)}
        onOpenInfoModal={(modal) => setInfoModal(modal)}
      />

      {/* Interactive 3D Book Studio Modal */}
      <Book3DModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onAddToBag={handleAddToBag}
        isSaved={selectedBook ? savedBookIds.includes(selectedBook.id) : false}
        onToggleSave={handleToggleSave}
        onOpenPdfStudio={handleOpenPdfStudio}
      />

      {/* Print-Quality PDF Upload, Preview, Margin Validation & Export Studio */}
      <PdfPrintStudioModal
        open={pdfStudioState.open}
        onClose={() => setPdfStudioState((prev) => ({ ...prev, open: false }))}
        initialPdfUrl={pdfStudioState.pdfUrl}
        initialFileName={pdfStudioState.fileName}
        bookTitle={pdfStudioState.bookTitle}
        sellingPriceDisplay={pdfStudioState.sellingPriceDisplay}
      />

      {/* Search, Account & Bag Overlays */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectBook={(book) => setSelectedBook(book)}
      />

      <AccountDrawer
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        savedBookIds={savedBookIds}
        onToggleSave={handleToggleSave}
        onSelectBook={(book) => setSelectedBook(book)}
      />

      <BagDrawer
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        items={bagItems}
        onRemoveItem={handleRemoveBagItem}
        onSelectBook={(book) => setSelectedBook(book)}
      />

      <FooterInfoModal
        modalType={infoModal}
        onClose={() => setInfoModal(null)}
      />
    </div>
  );
}

export default App;
