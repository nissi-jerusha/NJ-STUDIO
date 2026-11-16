export type PrimaryCategoryId =
  | 'mystery-discovery'
  | 'faith-spirituality'
  | 'notes-journals'
  | 'stories-inspiration';

export type ProceduralObjectType =
  | 'fountain-pen'
  | 'mystery-box'
  | 'noahs-ark'
  | 'botanical-lantern'
  | 'prayer-chalice'
  | 'origami-crane'
  | 'royal-harp';

export interface CategoryBranchItem {
  id: string;
  label: string;
  description: string;
}

export interface CategoryDefinition {
  id: PrimaryCategoryId;
  title: string;
  shortDescription: string;
  accentHex: string;
  subcategories: CategoryBranchItem[];
}

export interface BookPageContent {
  pageNumber: number;
  runningHeader: string;
  heading?: string;
  bodyLines: string[];
  illustrationCaption?: string;
  illustrationStyle?: 'journal-prompt' | 'mystery-clue' | 'ark-vignette' | 'botanical' | 'lantern' | 'scripture';
  interactiveObject?: {
    title: string;
    subtitle: string;
    description: string;
    proceduralType: ProceduralObjectType;
    /** Optional path to a custom .glb / .gltf asset placed in /public/models/... */
    glbModelUrl?: string;
    /** Optional path to a custom .mp4 short video reel placed in /public/videos/... */
    videoUrl?: string;
    videoSummary: string;
  };
}

export interface BookSpread {
  spreadIndex: number;
  label: string;
  leftPage: BookPageContent;
  rightPage: BookPageContent;
}

export interface BookPhysicalEdition {
  available: boolean;
  binding: string;
  pageCount: number;
  dimensions: string;
  paperStock: string;
  isbn: string;
  priceDisplay: string;
  priceNumeric: number;
  marketplaceLabel: string;
  marketplaceUrl: string;
  fulfillmentNote: string;
}

export interface BookDigitalEdition {
  available: boolean;
  format: string;
  fileSize: string;
  compatibility: string;
  priceDisplay: string;
  priceNumeric: number;
  marketplaceLabel: string;
  purchaseUrl: string;
  sampleNote: string;
  /** Optional path to a real PDF sample/edition inside /public/assets/... */
  samplePdfUrl?: string;
}

export interface BookCoverTheme {
  coverColor: string;
  spineColor: string;
  backColor: string;
  textColor: string;
  accentColor: string;
  foilColor: string;
  /** Optional custom image paths (e.g. '/covers/thoughts-front.jpg') */
  frontCoverImageUrl?: string;
  backCoverImageUrl?: string;
  spineImageUrl?: string;
  /** Optional fractional inset crop [0..0.4] when using mockup-framed cover images */
  coverCropMargins?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  isPlaceholderArtwork: boolean;
  placeholderLabel: string;
}

export interface BookProduct {
  id: string;
  slug: string;
  status: 'published' | 'archived';
  title: string;
  subtitle: string;
  author: string;
  categoryId: PrimaryCategoryId;
  categoryLabel: string;
  subcategoryId: string;
  subcategoryLabel: string;
  releaseBadge: 'Best Seller' | 'New Arrival' | 'Collector Edition' | 'Studio Classic';
  isFeatured: boolean;
  isHeroFeatured?: boolean;
  shortDescription: string;
  editorialDescription: string;
  coverTheme: BookCoverTheme;
  physicalDimensionsRatio: {
    width: number;
    height: number;
    thickness: number;
  };
  physicalEdition: BookPhysicalEdition;
  digitalEdition: BookDigitalEdition;
  spreads: BookSpread[];
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'mystery-discovery',
    title: 'Mystery & Discovery',
    shortDescription:
      'Puzzle-woven narratives, hidden clues, and interactive adventures built for curious minds.',
    accentHex: '#C99595',
    subcategories: [
      {
        id: 'mystery-box',
        label: 'Mystery Box',
        description: 'Tactile cipher books and envelope-inspired puzzles waiting to be unlocked.',
      },
      {
        id: 'secret-garden',
        label: 'Secret Garden',
        description: 'Botanical riddles, quiet sanctuaries, and illustrated field discoveries.',
      },
      {
        id: 'hidden-objects',
        label: 'Hidden Objects',
        description: 'Detailed panoramic spreads filled with subtle visual clues and secrets.',
      },
      {
        id: 'mystery-adventures',
        label: 'Mystery Adventures',
        description: 'Branching story expeditions where every page reveals a new turn.',
      },
    ],
  },
  {
    id: 'faith-spirituality',
    title: 'Faith & Spirituality',
    shortDescription:
      'Reflective prayer journals, biblical journeys, and thoughtfully illustrated devotionals.',
    accentHex: '#92977B',
    subcategories: [
      {
        id: 'bible-colouring-books',
        label: 'Bible Colouring Books',
        description: 'Fine-line botanical and scripture artwork crafted for quiet contemplation.',
      },
      {
        id: 'christian-comics',
        label: 'Christian Comics',
        description: 'Warm, narrative graphic stories rooted in timeless parables and courage.',
      },
      {
        id: 'prayer-journals',
        label: 'Prayer Journals',
        description: 'Structured daily pages for gratitude, reflection, and spiritual stillness.',
      },
      {
        id: 'bible-activity-books',
        label: 'Bible Activity Books',
        description: 'Creative family journeys through classic biblical stories and symbolism.',
      },
    ],
  },
  {
    id: 'notes-journals',
    title: 'Notes & Journals',
    shortDescription:
      'Calm, heirloom-inspired guided journals, planners, and open spaces for daily thought.',
    accentHex: '#765A4A',
    subcategories: [
      {
        id: 'writing-journals',
        label: 'Writing Journals',
        description: 'Linen-textured notebooks with generous margins and fountain-pen paper.',
      },
      {
        id: 'guided-journals',
        label: 'Guided Journals',
        description: 'Gentle daily prompts designed to slow down the rhythm of modern life.',
      },
      {
        id: 'creative-planners',
        label: 'Creative Planners',
        description: 'Undated seasonal layouts for makers, writers, and independent thinkers.',
      },
      {
        id: 'printable-journals',
        label: 'Printable Journals',
        description: 'Instant digital editions formatted for home binding or tablet annotation.',
      },
    ],
  },
  {
    id: 'stories-inspiration',
    title: 'Stories & Inspiration',
    shortDescription:
      'Original illustrated fables, short fiction, and uplifting volumes crafted to linger.',
    accentHex: '#203B30',
    subcategories: [
      {
        id: 'illustrated-stories',
        label: 'Illustrated Stories',
        description: 'Picture-rich literary keepsakes for readers of every generation.',
      },
      {
        id: 'short-fiction',
        label: 'Short Fiction',
        description: 'Atmospheric, character-led tales written for a single evening read.',
      },
      {
        id: 'motivational-books',
        label: 'Motivational Books',
        description: 'Grounded reflections on creativity, quiet resilience, and purpose.',
      },
      {
        id: 'original-comics',
        label: 'Original Comics',
        description: 'Sequential visual storytelling from NJ STUDIO’s original worlds.',
      },
    ],
  },
];

export const BOOKS_CATALOGUE: BookProduct[] = [
  {
    id: 'story-of-king-david',
    slug: 'the-story-of-king-david',
    status: 'published',
    title: 'The Story of King David',
    subtitle: 'From Shepherd Boy to King · A Bible Story Coloring Book',
    author: 'NJ STUDIO · Published on Amazon KDP',
    categoryId: 'faith-spirituality',
    categoryLabel: 'Faith & Spirituality',
    subcategoryId: 'bible-colouring-books',
    subcategoryLabel: 'Bible Colouring Books',
    releaseBadge: 'New Arrival',
    isFeatured: true,
    shortDescription:
      'A 51-page illustrated Bible story coloring book following young David from green pastures and harp songs to Goliath and the throne.',
    editorialDescription:
      'Newly published on Amazon KDP by NJ STUDIO, The Story of King David — From Shepherd Boy to King brings 51 bold, kid-friendly coloring pages, character introductions, a 6-question story quiz, a Bible memory verse scroll, and a printable completion certificate together in one keepsake volume.',
    coverTheme: {
      coverColor: '#76BBE9',
      spineColor: '#203B30',
      backColor: '#5BA3D6',
      textColor: '#F8F4EF',
      accentColor: '#E5A93B',
      foilColor: '#F8F4EF',
      frontCoverImageUrl: '/assets/aistudio/image_f93dc5d6.png',
      coverCropMargins: {
        left: 0.148,
        top: 0.048,
        right: 0.145,
        bottom: 0.048,
      },
      isPlaceholderArtwork: false,
      placeholderLabel: 'Published KDP Cover Artwork',
    },
    physicalDimensionsRatio: {
      width: 1.62,
      height: 1.96,
      thickness: 0.18,
    },
    physicalEdition: {
      available: true,
      binding: 'Amazon KDP Paperback · Illustrated Coloring Edition',
      pageCount: 51,
      dimensions: '216 × 216 mm (8.5 × 8.5 in)',
      paperStock: '90 gsm Bright White Coloring Paper',
      isbn: 'ASIN: B0H4WJYCYJ (KDP)',
      priceDisplay: '₹377',
      priceNumeric: 377,
      marketplaceLabel: 'Buy on Amazon KDP',
      marketplaceUrl:
        'https://www.amazon.in/STORY-KING-DAVID-SHEPHERD-BOY-ebook/dp/B0H4WJYCYJ/ref=sr_1_2?crid=5CI895MYVF9H&dib=eyJ2IjoiMSJ9.NzsR_nLenPw9zsGw29RUPUhl3G7ZN_PHCZUV_IGtguWz6_9J1zlgfdzZ5RYP0XNPZpjnMGY7QlEnn8Zv3EAgMMLVmkiyLZBnLxQiToE72l_Wus3lk1Udd-rfmlvXE8RE-dWJtuBnSbQDkQwB58RjGK82Kk_GNiisGoQQEQjYsYfWR0UwUoOoAsKIlWotZW5tfVX8ljLK3padBQqB4szhlOT3h89As6ExS367SCO4WHk.jnGzUk-BaziKpxkR1Nlxf5rarDKPSRK4E6bnPJtJdmo&dib_tag=se&keywords=the+story+of+king+david&qid=1794841991&s=books&sprefix=the+story+of+king+davi%2Cstripbooks%2C380&sr=1-2',
      fulfillmentNote:
        'Published on Amazon KDP (India & worldwide). Available directly via your official Amazon listing.',
    },
    digitalEdition: {
      available: true,
      format: '51-Page Printable PDF Coloring Book',
      fileSize: '14.2 MB',
      compatibility: 'Home Print (A4 / Letter), iPad & Tablet Coloring Apps',
      priceDisplay: '₹129',
      priceNumeric: 129,
      marketplaceLabel: 'Request Digital Edition via Form',
      purchaseUrl:
        'https://docs.google.com/forms/d/e/1FAIpQLSfX7uOA-AFgEJiuG76SS2PsKqQVHlGCGU4b4eZnRAO82p6R2g/viewform?usp=dialog',
      sampleNote:
        'Preview the complete 51-page coloring PDF directly inside the 3D Book Studio.',
      samplePdfUrl: '/assets/aistudio/THE_STORY_OF_KING_DAVID_8610dd13.pdf',
    },
    spreads: [
      {
        spreadIndex: 0,
        label: 'Nameplate & Cast of Characters (p. 2–3)',
        leftPage: {
          pageNumber: 2,
          runningHeader: 'THE STORY OF KING DAVID · NAMEPLATE',
          heading: 'This Book Belongs To',
          bodyLines: [
            'My Name: __________________________',
            'Date: ____________',
            '',
            'Color the young shepherd boy, his wooden',
            'staff, and two joyful sheep surrounded by',
            'music notes and wildflowers.',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'Coloring Plate · Page 02',
        },
        rightPage: {
          pageNumber: 3,
          runningHeader: 'CAST OF CHARACTERS · PAGE 03',
          heading: 'Meet the People of the Story',
          bodyLines: [
            '• David the Shepherd Boy',
            '• Goliath the Giant Champion',
            '• King Saul & Prince Jonathan',
            '• Michal & Abigail',
            '',
            'Write each character’s name beneath their',
            'portrait as you color their robes.',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'Tap Illustration · Inspect 3D Harp, Sling & Crown',
          interactiveObject: {
            title: "David's Harp, Shepherd Sling & Royal Crown",
            subtitle: 'Interactive 3D KDP Story Artifact',
            description:
              'Rotate a 3D keepsake uniting young David’s brass-framed harp, leather sling with five smooth stones, and the golden crown of Israel.',
            proceduralType: 'royal-harp',
            videoSummary:
              'Short studio reel: From the quiet fields of Bethlehem to the royal palace in Jerusalem.',
          },
        },
      },
      {
        spreadIndex: 1,
        label: 'Shepherd Boy, Harp & Anointing (p. 7–9)',
        leftPage: {
          pageNumber: 7,
          runningHeader: 'CHAPTER I · BETHLEHEM PASTURES',
          heading: 'Songs on the Hillside',
          bodyLines: [
            'David watched over his father’s flock,',
            'playing joyful melodies upon his harp',
            'while butterflies and gentle lambs rested',
            'beside the meadow rocks.',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'Harp Song Coloring Page · Page 07',
        },
        rightPage: {
          pageNumber: 9,
          runningHeader: 'CHAPTER II · PROPHET SAMUEL',
          heading: 'Anointed Future King',
          bodyLines: [
            'Samuel poured oil from the horn upon',
            'young David’s head, blessing the brave',
            'heart that trusted God even before any',
            'crown was worn.',
            '',
            'Tap below to rotate the 3D Harp & Crown.',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'Tap Illustration · Open 3D Harp & Crown',
          interactiveObject: {
            title: "David's Harp, Shepherd Sling & Royal Crown",
            subtitle: 'Interactive 3D Story Keepsake',
            description:
              'Explore the carved harp strings, smooth stones, and golden crown symbolizing David’s journey from shepherd to king.',
            proceduralType: 'royal-harp',
            videoSummary:
              'Short story reel: Samuel anointing David and the courage of faith.',
          },
        },
      },
      {
        spreadIndex: 2,
        label: 'Facing Goliath & Five Smooth Stones (p. 12–14)',
        leftPage: {
          pageNumber: 12,
          runningHeader: 'CHAPTER III · VALLEY OF ELAH',
          heading: 'Faith Over Fear',
          bodyLines: [
            'Standing before the towering armor of',
            'Goliath, young David held only his wooden',
            'sling, five smooth river stones, and',
            'unshakable trust in God.',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'David & Goliath Scene · Page 12',
        },
        rightPage: {
          pageNumber: 14,
          runningHeader: 'VICTORY IN THE VALLEY · PAGE 14',
          heading: 'One Smooth Stone',
          bodyLines: [
            'With steady courage, the stone flew true',
            'and the giant’s helmet tumbled to the',
            'valley floor.',
            '',
            'Inspect the 3D Shepherd’s Sling & Stones.',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'Tap Illustration · Open 3D Sling & Stones',
          interactiveObject: {
            title: "David's Harp, Shepherd Sling & Royal Crown",
            subtitle: 'Interactive 3D Story Artifact',
            description:
              'Examine the five smooth stones and shepherd’s sling alongside David’s royal crown.',
            proceduralType: 'royal-harp',
            videoSummary:
              'Short coloring reel: Five smooth stones and victory in the Valley of Elah.',
          },
        },
      },
      {
        spreadIndex: 3,
        label: 'Story Quiz, Certificate & Memory Verse (p. 48–50)',
        leftPage: {
          pageNumber: 48,
          runningHeader: 'ACTIVITY · HOW WELL DO YOU KNOW DAVID?',
          heading: '6-Question Story Quiz',
          bodyLines: [
            '1. What instrument did David play?',
            '2. How many smooth stones did he choose?',
            '3. Who was David’s big enemy?',
            '4. Who anointed David as king?',
            '5. Which city became his capital?',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'Quiz & Favorite Part Reflection · Page 48',
        },
        rightPage: {
          pageNumber: 49,
          runningHeader: 'COMPLETION CERTIFICATE · PAGE 49–50',
          heading: 'King David Story Certificate',
          bodyLines: [
            'Awarded upon completing all 51 pages',
            'of The Story of King David Coloring Book.',
            '',
            'Includes My Bible Memory Verse Scroll:',
            '“Read it. Say it. Remember it!” (p. 50)',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'Certificate & Memory Verse Scroll · p. 49–50',
        },
      },
    ],
  },
  {
    id: 'little-space-thoughts',
    slug: 'a-little-space-for-your-thoughts',
    status: 'published',
    title: 'A Little Space for Your Thoughts',
    subtitle: 'Guided Journal',
    author: 'NJ STUDIO Editorial',
    categoryId: 'notes-journals',
    categoryLabel: 'Notes & Journals',
    subcategoryId: 'guided-journals',
    subcategoryLabel: 'Guided Journals',
    releaseBadge: 'Best Seller',
    isFeatured: true,
    isHeroFeatured: true,
    shortDescription:
      'An heirloom guided journal with quiet prompts, wide margins, and space to breathe.',
    editorialDescription:
      'Crafted as a sanctuary for unhurried reflection, A Little Space for Your Thoughts pairs tactile cream pages with gentle morning and evening prompts. Rotate the 3D edition, open its forest-green cloth spine, and inspect the signature brass fountain pen study inside.',
    coverTheme: {
      coverColor: '#F3ECE2',
      spineColor: '#203B30',
      backColor: '#ECE4D8',
      textColor: '#203B30',
      accentColor: '#765A4A',
      foilColor: '#C5A46D',
      isPlaceholderArtwork: true,
      placeholderLabel: 'Placeholder Cover · Ready for Final Jacket Art',
    },
    physicalDimensionsRatio: {
      width: 1.48,
      height: 2.08,
      thickness: 0.24,
    },
    physicalEdition: {
      available: true,
      binding: 'Clothbound Hardcover · Smyth-Sewn Spine',
      pageCount: 224,
      dimensions: '148 × 210 mm (A5)',
      paperStock: '120 gsm Munken Pure Ivory',
      isbn: '978-1-998412-01-4',
      priceDisplay: '₹299',
      priceNumeric: 299,
      marketplaceLabel: 'Purchase via External Print Partner',
      marketplaceUrl: 'https://bookshop.org',
      fulfillmentNote:
        'Physical copies are printed and fulfilled by our external retail & print-on-demand partners.',
    },
    digitalEdition: {
      available: true,
      format: 'Interactive Hyperlinked PDF (GoodNotes & Print Ready)',
      fileSize: '18.4 MB',
      compatibility: 'iPad, Kindle Scribe, reMarkable, Desktop & A5 Home Print',
      priceDisplay: '₹149',
      priceNumeric: 149,
      marketplaceLabel: 'Purchase Digital PDF Edition',
      purchaseUrl: 'https://gumroad.com',
      sampleNote: 'Includes interactive 3D preview spread and printable prompt template.',
    },
    spreads: [
      {
        spreadIndex: 0,
        label: 'Opening Dedication & Morning Margin',
        leftPage: {
          pageNumber: 1,
          runningHeader: 'NJ STUDIO · GUIDED JOURNAL',
          heading: 'A Quiet Threshold',
          bodyLines: [
            'Before the pace of the day begins,',
            'leave a single margin unhurried.',
            '',
            'Write without editing.',
            'Notice what lingers when the noise',
            'settles into ink and paper.',
          ],
          illustrationStyle: 'journal-prompt',
          illustrationCaption: 'Morning Reflection Prompt · Page 01',
        },
        rightPage: {
          pageNumber: 2,
          runningHeader: 'INTERACTIVE STUDY · OBJECT 01',
          heading: 'The Brass Nib & Inkwell',
          bodyLines: [
            'Prompt: What small detail from today',
            'deserves to be remembered a year from now?',
            '',
            'Tap the illustrated studio emblem below',
            'to inspect the 3D Fountain Pen & Inkwell',
            'or watch the quiet studio reel.',
          ],
          illustrationStyle: 'journal-prompt',
          illustrationCaption: 'Tap Illustration · Open 3D Pen & Inkwell',
          interactiveObject: {
            title: 'Studio Brass Fountain Pen & Inkwell',
            subtitle: 'Interactive 3D Keepsake Study',
            description:
              'A weighted solid-brass writing instrument and fluted glass inkwell modelled to celebrate deliberate, unhurried handwriting.',
            proceduralType: 'fountain-pen',
            videoSummary:
              'Short editorial film: Ink flowing onto 120 gsm Munken ivory paper inside the NJ STUDIO bindery.',
          },
        },
      },
      {
        spreadIndex: 1,
        label: 'Midday Pause & Seasonal Notes',
        leftPage: {
          pageNumber: 44,
          runningHeader: 'CHAPTER II · STILLNESS',
          heading: 'Three Quiet Observations',
          bodyLines: [
            '1. A sound you noticed only after pausing.',
            '2. A conversation that brought warmth.',
            '3. One task you can gently release.',
            '',
            '────────────────────────────',
            'Date: ____________   Season: ________',
          ],
          illustrationStyle: 'botanical',
          illustrationCaption: 'Lined Reflection Spread',
        },
        rightPage: {
          pageNumber: 45,
          runningHeader: 'INTERACTIVE STUDY · OBJECT 02',
          heading: 'Pressed Olive & Lantern',
          bodyLines: [
            'Evening light changes the texture of a',
            'familiar room. Keep an honest record',
            'of what felt grounding this week.',
            '',
            'Tap the botanical frame to inspect',
            'the interactive Brass Study Lantern.',
          ],
          illustrationStyle: 'lantern',
          illustrationCaption: 'Tap Illustration · Inspect 3D Brass Lantern',
          interactiveObject: {
            title: 'Evening Reading Lantern',
            subtitle: 'Interactive 3D Desk Artifact',
            description:
              'Warm brushed-brass desk lantern crafted for late-evening journaling sessions.',
            proceduralType: 'botanical-lantern',
            videoSummary:
              'Short studio reel: Candlelit desk rituals and seasonal journaling layouts.',
          },
        },
      },
      {
        spreadIndex: 2,
        label: 'Closing Colophon & Index',
        leftPage: {
          pageNumber: 218,
          runningHeader: 'INDEX OF THOUGHTS',
          heading: 'Pages Worth Returning To',
          bodyLines: [
            'Page ____  ·  A turning point',
            'Page ____  ·  A letter never sent',
            'Page ____  ·  Something unexpectedly kind',
            'Page ____  ·  An idea for next autumn',
          ],
        },
        rightPage: {
          pageNumber: 219,
          runningHeader: 'COLOPHON · NJ STUDIO',
          heading: 'A Little Space for Every Story',
          bodyLines: [
            'Typeset in Cormorant Garamond &',
            'Plus Jakarta Sans.',
            '',
            'Published by NJ STUDIO.',
            'First Edition · Interactive 3D Specimen.',
          ],
        },
      },
    ],
  },
  {
    id: 'mystery-box-whats-inside',
    slug: 'mystery-box-whats-inside',
    status: 'published',
    title: "Mystery Box: What's Inside?",
    subtitle: 'Interactive Puzzle & Discovery Book',
    author: 'NJ STUDIO Mystery Workshop',
    categoryId: 'mystery-discovery',
    categoryLabel: 'Mystery & Discovery',
    subcategoryId: 'mystery-box',
    subcategoryLabel: 'Mystery Box',
    releaseBadge: 'New Arrival',
    isFeatured: true,
    shortDescription:
      'An illustrated puzzle volume filled with locked compartments, ciphers, and hidden clues.',
    editorialDescription:
      "Every spread of Mystery Box: What's Inside? conceals a riddle, a folded paper diagram, or a brass mechanism waiting to be decoded. Turn the 3D pages to uncover the carved puzzle box and skeleton key.",
    coverTheme: {
      coverColor: '#D5B2B0',
      spineColor: '#765A4A',
      backColor: '#C99595',
      textColor: '#2C221E',
      accentColor: '#203B30',
      foilColor: '#F8F4EF',
      isPlaceholderArtwork: true,
      placeholderLabel: 'Placeholder Cover · Ready for Final Jacket Art',
    },
    physicalDimensionsRatio: {
      width: 1.52,
      height: 2.08,
      thickness: 0.26,
    },
    physicalEdition: {
      available: true,
      binding: 'Matte Soft-Touch Hardcover · Foil Stamped',
      pageCount: 168,
      dimensions: '165 × 225 mm',
      paperStock: '140 gsm Uncoated Archival Paper',
      isbn: '978-1-998412-04-5',
      priceDisplay: '₹349',
      priceNumeric: 349,
      marketplaceLabel: 'Purchase via External Print Partner',
      marketplaceUrl: 'https://bookshop.org',
      fulfillmentNote:
        'Physical editions are stocked and shipped through external marketplace partners.',
    },
    digitalEdition: {
      available: true,
      format: 'Interactive Puzzle PDF + Printable Cipher Sheets',
      fileSize: '26.2 MB',
      compatibility: 'Desktop, Tablet & Printable A4/Letter Kit',
      priceDisplay: '₹169',
      priceNumeric: 169,
      marketplaceLabel: 'Purchase Digital Puzzle Pack',
      purchaseUrl: 'https://gumroad.com',
      sampleNote: 'Includes interactive cipher wheel and clue archive.',
    },
    spreads: [
      {
        spreadIndex: 0,
        label: 'Case File 01 · The Locked Parcel',
        leftPage: {
          pageNumber: 8,
          runningHeader: 'CASE FILE 01 · THE PARCEL',
          heading: 'Three Turns of the Key',
          bodyLines: [
            'The parcel arrived without a return address,',
            'tied in dusty-rose twine and sealed with',
            'a stamped brass compass.',
            '',
            'Clue I: Count the notches along the',
            'inner bezel before turning the latch.',
          ],
          illustrationStyle: 'mystery-clue',
          illustrationCaption: 'Cipher Diagram · Clues 01–03',
        },
        rightPage: {
          pageNumber: 9,
          runningHeader: 'INTERACTIVE ARTIFACT · 01',
          heading: 'The Rosewood Puzzle Box',
          bodyLines: [
            'Look closely at the brass inlay along',
            'the lid. Somewhere inside rests the',
            'first brass key of the archive.',
            '',
            'Tap the artifact diagram to rotate',
            'the 3D Mystery Box & Skeleton Key.',
          ],
          illustrationStyle: 'mystery-clue',
          illustrationCaption: 'Tap Illustration · Open 3D Mystery Box',
          interactiveObject: {
            title: 'Rosewood Puzzle Box & Brass Key',
            subtitle: 'Interactive 3D Mystery Artifact',
            description:
              'Examine the carved box, rotating brass lock escutcheon, and antique skeleton key from every angle.',
            proceduralType: 'mystery-box',
            videoSummary:
              'Short mystery teaser: Unlocking the first brass mechanism inside the NJ STUDIO archive.',
          },
        },
      },
      {
        spreadIndex: 1,
        label: 'Case File 02 · The Conservatory Clue',
        leftPage: {
          pageNumber: 54,
          runningHeader: 'CASE FILE 02 · CONSERVATORY',
          heading: 'Under Glass & Fern',
          bodyLines: [
            'Beneath the glasshouse bench, the',
            'botanist left a lantern still warm',
            'and a torn map margin.',
          ],
          illustrationStyle: 'botanical',
        },
        rightPage: {
          pageNumber: 55,
          runningHeader: 'INTERACTIVE ARTIFACT · 02',
          heading: 'The Glasshouse Lantern',
          bodyLines: [
            'Hold the lantern near the cipher sheet',
            'to reveal the faint watermark initials.',
          ],
          illustrationStyle: 'lantern',
          illustrationCaption: 'Tap Illustration · Inspect 3D Lantern',
          interactiveObject: {
            title: 'Conservatory Brass Lantern',
            subtitle: 'Interactive 3D Discovery Prop',
            description:
              'A warm brass field lantern illuminating hidden markings across the conservatory map.',
            proceduralType: 'botanical-lantern',
            videoSummary:
              'Short animated clue reel: Hidden conservatory markings revealed by lamplight.',
          },
        },
      },
    ],
  },
  {
    id: 'noahs-ark-journey-of-faith',
    slug: 'noahs-ark-a-journey-of-faith',
    status: 'published',
    title: "Noah's Ark — A Journey of Faith",
    subtitle: 'Illustrated Activity & Story Keepsake',
    author: 'NJ STUDIO Faith Collection',
    categoryId: 'faith-spirituality',
    categoryLabel: 'Faith & Spirituality',
    subcategoryId: 'bible-activity-books',
    subcategoryLabel: 'Bible Activity Books',
    releaseBadge: 'Best Seller',
    isFeatured: true,
    shortDescription:
      'A richly illustrated biblical journey combining storytelling, family activities, and timeless hope.',
    editorialDescription:
      "Designed for shared family reading and quiet reflection, Noah's Ark — A Journey of Faith pairs serene sage-and-ochre spreads with interactive storytelling. Open the book to inspect the hand-carved 3D Wooden Ark & Olive-Branch Dove.",
    coverTheme: {
      coverColor: '#8E957A',
      spineColor: '#203B30',
      backColor: '#7E866B',
      textColor: '#F8F4EF',
      accentColor: '#E7C2C0',
      foilColor: '#F3E5C8',
      isPlaceholderArtwork: true,
      placeholderLabel: 'Placeholder Cover · Ready for Final Jacket Art',
    },
    physicalDimensionsRatio: {
      width: 1.56,
      height: 2.08,
      thickness: 0.22,
    },
    physicalEdition: {
      available: true,
      binding: 'Heirloom Hardcover · Matte Linen Finish',
      pageCount: 128,
      dimensions: '190 × 245 mm',
      paperStock: '150 gsm Warm Cream Art Paper',
      isbn: '978-1-998412-07-6',
      priceDisplay: '₹329',
      priceNumeric: 329,
      marketplaceLabel: 'Purchase via External Print Partner',
      marketplaceUrl: 'https://bookshop.org',
      fulfillmentNote:
        'Printed and fulfilled externally by our publishing retail partners.',
    },
    digitalEdition: {
      available: true,
      format: 'Illustrated Digital Edition + Printable Activity Pages',
      fileSize: '31.5 MB',
      compatibility: 'iPad, Desktop PDF & Home Colouring Sheets',
      priceDisplay: '₹149',
      priceNumeric: 149,
      marketplaceLabel: 'Purchase Digital Activity Edition',
      purchaseUrl: 'https://gumroad.com',
      sampleNote: 'Includes printable colouring plates and family discussion cards.',
    },
    spreads: [
      {
        spreadIndex: 0,
        label: 'Chapter I · Timber, Rain & Promise',
        leftPage: {
          pageNumber: 12,
          runningHeader: 'PART I · THE TIMBER HULL',
          heading: 'Built in Quiet Obedience',
          bodyLines: [
            'Long before the first cloud gathered',
            'above the valley, cedar beams were',
            'planed, joined, and sealed with pitch.',
            '',
            'Faith begins in ordinary mornings,',
            'one timber placed beside another.',
          ],
          illustrationStyle: 'ark-vignette',
          illustrationCaption: 'Scripture Meditation · Genesis 6',
        },
        rightPage: {
          pageNumber: 13,
          runningHeader: 'INTERACTIVE STUDY · THE ARK',
          heading: 'The Carved Cedar Ark & Dove',
          bodyLines: [
            'Explore the crafted wooden ark vessel',
            'rising upon calm stylized waters, crowned',
            'with the returning olive-branch dove.',
            '',
            'Tap the vessel illustration to open the',
            'interactive 3D Ark model.',
          ],
          illustrationStyle: 'ark-vignette',
          illustrationCaption: 'Tap Illustration · Open 3D Noah’s Ark',
          interactiveObject: {
            title: "Hand-Carved Wooden Noah's Ark",
            subtitle: 'Interactive 3D Story Sculpture',
            description:
              'A warm cedar-and-walnut sculptural study of the Ark with tiered cabin deck, carved waves, and hovering olive-branch dove.',
            proceduralType: 'noahs-ark',
            videoSummary:
              'Short illustrated story reel: Forty days of rain giving way to morning light and the olive branch.',
          },
        },
      },
      {
        spreadIndex: 1,
        label: 'Chapter II · The Olive Branch & Rainbow',
        leftPage: {
          pageNumber: 64,
          runningHeader: 'PART II · RENEWAL',
          heading: 'Sign of the Covenant',
          bodyLines: [
            'At evening the dove returned, and in',
            'her beak was a freshly plucked olive leaf.',
            '',
            'Activity: Sketch three signs of quiet',
            'hope you noticed this season.',
          ],
          illustrationStyle: 'scripture',
        },
        rightPage: {
          pageNumber: 65,
          runningHeader: 'FAMILY ACTIVITY PLATE',
          heading: 'The Peace Chalice & Scroll',
          bodyLines: [
            'A quiet blessing page crafted for',
            'shared family reflection and colouring.',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'Tap Illustration · Inspect 3D Peace Emblem',
          interactiveObject: {
            title: 'Olive Wood Cross & Scripture Scroll',
            subtitle: 'Interactive 3D Devotional Emblem',
            description:
              'Carved olive wood emblem paired with a linen-tied keepsake scroll.',
            proceduralType: 'prayer-chalice',
            videoSummary:
              'Short devotional reel: Guided family scripture reflection and colouring plate preview.',
          },
        },
      },
    ],
  },
  {
    id: 'secret-garden-almanac',
    slug: 'the-secret-garden-almanac',
    status: 'published',
    title: 'The Secret Garden Almanac',
    subtitle: 'Botanical Mystery & Field Guide',
    author: 'NJ STUDIO Discovery Press',
    categoryId: 'mystery-discovery',
    categoryLabel: 'Mystery & Discovery',
    subcategoryId: 'secret-garden',
    subcategoryLabel: 'Secret Garden',
    releaseBadge: 'Collector Edition',
    isFeatured: true,
    shortDescription:
      'Pressed-leaf ciphers, walled-garden maps, and a year-round mystery tucked among blooms.',
    editorialDescription:
      'Follow the forgotten caretaker’s marginalia across four seasons of a walled English conservatory. Includes hidden botanical riddles and an interactive 3D glasshouse lantern.',
    coverTheme: {
      coverColor: '#203B30',
      spineColor: '#765A4A',
      backColor: '#192E25',
      textColor: '#F8F4EF',
      accentColor: '#92977B',
      foilColor: '#E7C2C0',
      isPlaceholderArtwork: true,
      placeholderLabel: 'Placeholder Cover · Ready for Final Jacket Art',
    },
    physicalDimensionsRatio: {
      width: 1.48,
      height: 2.08,
      thickness: 0.23,
    },
    physicalEdition: {
      available: true,
      binding: 'Forest Linen Hardcover · Ribbon Marker',
      pageCount: 192,
      dimensions: '155 × 215 mm',
      paperStock: '130 gsm Natural Cotton Blend',
      isbn: '978-1-998412-09-0',
      priceDisplay: '₹299',
      priceNumeric: 299,
      marketplaceLabel: 'Purchase via External Print Partner',
      marketplaceUrl: 'https://bookshop.org',
      fulfillmentNote:
        'Fulfilled via external retail & print-on-demand booksellers.',
    },
    digitalEdition: {
      available: true,
      format: 'Illustrated PDF + Printable Herbarium Cards',
      fileSize: '22.0 MB',
      compatibility: 'Tablet, E-Reader & Desktop',
      priceDisplay: '₹129',
      priceNumeric: 129,
      marketplaceLabel: 'Purchase Digital Almanac',
      purchaseUrl: 'https://gumroad.com',
      sampleNote: 'Includes seasonal field note sheets for home printing.',
    },
    spreads: [
      {
        spreadIndex: 0,
        label: 'Spring Entry · The Iron Gate',
        leftPage: {
          pageNumber: 14,
          runningHeader: 'SPRING FOLIO · GATEHOUSE',
          heading: 'Beyond the Ivy Latch',
          bodyLines: [
            'Only when the evening sun strikes the',
            'south wall do the carved numbers behind',
            'the climbing rosemary appear.',
          ],
          illustrationStyle: 'botanical',
        },
        rightPage: {
          pageNumber: 15,
          runningHeader: 'INTERACTIVE STUDY · LANTERN',
          heading: 'The Walled Garden Lantern',
          bodyLines: [
            'Inspect the brass conservatory lantern',
            'carried along the gravel paths at dusk.',
          ],
          illustrationStyle: 'lantern',
          illustrationCaption: 'Tap Illustration · Inspect 3D Lantern',
          interactiveObject: {
            title: 'Walled Garden Brass Lantern',
            subtitle: 'Interactive 3D Botanical Artifact',
            description:
              'Brass frame lantern wrapped in stylized olive-sage foliage.',
            proceduralType: 'botanical-lantern',
            videoSummary:
              'Short garden vignette: Morning mist lifting over the secret conservatory beds.',
          },
        },
      },
    ],
  },
  {
    id: 'quiet-morning-prayer-journal',
    slug: 'quiet-morning-prayer-journal',
    status: 'published',
    title: 'Quiet Morning Prayer Journal',
    subtitle: '90-Day Devotional & Gratitude Space',
    author: 'NJ STUDIO Faith Collection',
    categoryId: 'faith-spirituality',
    categoryLabel: 'Faith & Spirituality',
    subcategoryId: 'prayer-journals',
    subcategoryLabel: 'Prayer Journals',
    releaseBadge: 'New Arrival',
    isFeatured: false,
    shortDescription:
      'Gentle scripture prompts, gratitude margins, and serene morning pages for ninety days.',
    editorialDescription:
      'Bound in warm blush linen with subtle sage accents, Quiet Morning Prayer Journal creates a daily ritual of gratitude, scripture meditation, and unhurried prayer.',
    coverTheme: {
      coverColor: '#E7C2C0',
      spineColor: '#92977B',
      backColor: '#DCB5B3',
      textColor: '#203B30',
      accentColor: '#765A4A',
      foilColor: '#203B30',
      isPlaceholderArtwork: true,
      placeholderLabel: 'Placeholder Cover · Ready for Final Jacket Art',
    },
    physicalDimensionsRatio: {
      width: 1.46,
      height: 2.08,
      thickness: 0.21,
    },
    physicalEdition: {
      available: true,
      binding: 'Blush Linen Hardcover · Lay-Flat Binding',
      pageCount: 200,
      dimensions: '148 × 210 mm (A5)',
      paperStock: '120 gsm Cream Archival',
      isbn: '978-1-998412-11-3',
      priceDisplay: '₹249',
      priceNumeric: 249,
      marketplaceLabel: 'Purchase via External Print Partner',
      marketplaceUrl: 'https://bookshop.org',
      fulfillmentNote:
        'Fulfilled via external publishing retail partners.',
    },
    digitalEdition: {
      available: true,
      format: 'Hyperlinked GoodNotes & Printable PDF',
      fileSize: '15.8 MB',
      compatibility: 'iPad, Tablet & Printable A5',
      priceDisplay: '₹99',
      priceNumeric: 99,
      marketplaceLabel: 'Purchase Digital Prayer Journal',
      purchaseUrl: 'https://gumroad.com',
      sampleNote: 'Includes 90 hyperlinked daily prayer tabs.',
    },
    spreads: [
      {
        spreadIndex: 0,
        label: 'Day 01 · Morning Stillness',
        leftPage: {
          pageNumber: 6,
          runningHeader: 'MORNING PRAYER · DAY 01',
          heading: 'Be Still & Begin',
          bodyLines: [
            'Morning Gratitude:',
            '____________________________________',
            'Scripture to Carry Today:',
            '____________________________________',
          ],
          illustrationStyle: 'scripture',
        },
        rightPage: {
          pageNumber: 7,
          runningHeader: 'INTERACTIVE KEEPSAKE',
          heading: 'Olive Wood Emblem & Scroll',
          bodyLines: [
            'Tap the emblem below to inspect the',
            '3D Olive Wood Cross & Keepsake Scroll.',
          ],
          illustrationStyle: 'scripture',
          illustrationCaption: 'Tap Illustration · Inspect 3D Keepsake',
          interactiveObject: {
            title: 'Olive Wood Cross & Linen Scroll',
            subtitle: 'Interactive 3D Faith Keepsake',
            description:
              'Tactile olive wood cross resting beside a ribbon-bound scripture scroll.',
            proceduralType: 'prayer-chalice',
            videoSummary:
              'Short peaceful reflection reel: Morning light across linen pages.',
          },
        },
      },
    ],
  },
  {
    id: 'paper-lantern-chronicles',
    slug: 'the-paper-lantern-chronicles',
    status: 'published',
    title: 'The Paper Lantern Chronicles',
    subtitle: 'Original Illustrated Stories',
    author: 'NJ STUDIO Storytellers',
    categoryId: 'stories-inspiration',
    categoryLabel: 'Stories & Inspiration',
    subcategoryId: 'illustrated-stories',
    subcategoryLabel: 'Illustrated Stories',
    releaseBadge: 'Studio Classic',
    isFeatured: true,
    shortDescription:
      'Twelve interconnected illustrated fables about makers, wanderers, and quiet courage.',
    editorialDescription:
      'Set in a coastal town lit by folded paper lanterns, these twelve original stories celebrate small acts of wonder and creative perseverance.',
    coverTheme: {
      coverColor: '#765A4A',
      spineColor: '#203B30',
      backColor: '#664D3F',
      textColor: '#F8F4EF',
      accentColor: '#E7C2C0',
      foilColor: '#F3E5C8',
      isPlaceholderArtwork: true,
      placeholderLabel: 'Placeholder Cover · Ready for Final Jacket Art',
    },
    physicalDimensionsRatio: {
      width: 1.5,
      height: 2.08,
      thickness: 0.25,
    },
    physicalEdition: {
      available: true,
      binding: 'Warm Walnut Cloth Hardcover · Gold Foil',
      pageCount: 240,
      dimensions: '152 × 220 mm',
      paperStock: '135 gsm Warm Ivory Book Paper',
      isbn: '978-1-998412-14-4',
      priceDisplay: '₹339',
      priceNumeric: 339,
      marketplaceLabel: 'Purchase via External Print Partner',
      marketplaceUrl: 'https://bookshop.org',
      fulfillmentNote:
        'Fulfilled via external retail & print-on-demand partners.',
    },
    digitalEdition: {
      available: true,
      format: 'Illustrated ePub & High-Res PDF',
      fileSize: '24.5 MB',
      compatibility: 'Apple Books, Kindle, Tablet & Desktop',
      priceDisplay: '₹149',
      priceNumeric: 149,
      marketplaceLabel: 'Purchase Digital Story Edition',
      purchaseUrl: 'https://gumroad.com',
      sampleNote: 'Includes high-resolution chapter frontispieces.',
    },
    spreads: [
      {
        spreadIndex: 0,
        label: 'Story I · The Folded Crane',
        leftPage: {
          pageNumber: 10,
          runningHeader: 'STORY I · THE LANTERN MAKER',
          heading: 'Wings of Ivory Paper',
          bodyLines: [
            'Every autumn, the lantern maker folded',
            'a single crane from the leftover corners',
            'of her finest mulberry paper and set it',
            'upon the harbour sill.',
          ],
          illustrationStyle: 'lantern',
        },
        rightPage: {
          pageNumber: 11,
          runningHeader: 'INTERACTIVE STORY PROP',
          heading: 'The Brass & Ivory Crane',
          bodyLines: [
            'Tap the illustration to rotate the',
            'sculpted 3D Origami Crane keepsake.',
          ],
          illustrationStyle: 'lantern',
          illustrationCaption: 'Tap Illustration · Inspect 3D Paper Crane',
          interactiveObject: {
            title: 'Sculpted Origami Paper Crane',
            subtitle: 'Interactive 3D Story Keepsake',
            description:
              'A geometric folded-paper sculpture hovering above a warm walnut pedestal.',
            proceduralType: 'origami-crane',
            videoSummary:
              'Short animated fable reel: Paper lanterns drifting above the quiet harbour.',
          },
        },
      },
    ],
  },
];

export const PUBLISHED_BOOKS = BOOKS_CATALOGUE.filter((b) => b.status === 'published');
