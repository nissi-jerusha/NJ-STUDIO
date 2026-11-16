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
  | 'origami-crane';

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
      priceDisplay: '$28.00',
      priceNumeric: 28,
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
      priceDisplay: '$14.00',
      priceNumeric: 14,
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
      priceDisplay: '$32.00',
      priceNumeric: 32,
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
      priceDisplay: '$16.00',
      priceNumeric: 16,
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
      priceDisplay: '$30.00',
      priceNumeric: 30,
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
      priceDisplay: '$15.00',
      priceNumeric: 15,
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
      priceDisplay: '$29.00',
      priceNumeric: 29,
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
      priceDisplay: '$14.50',
      priceNumeric: 14.5,
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
      priceDisplay: '$26.00',
      priceNumeric: 26,
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
      priceDisplay: '$12.00',
      priceNumeric: 12,
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
      priceDisplay: '$31.00',
      priceNumeric: 31,
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
      priceDisplay: '$15.00',
      priceNumeric: 15,
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
