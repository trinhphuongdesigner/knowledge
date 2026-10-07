const layout = {
  title: "Knowledge — Learn with flashcards",
  description: "Review IT and English with flashcards",
  footer: {
    about: "About",
    terms: "Terms",
    privacy: "Privacy",
    ecosystem: "Trinh Phuong's ecosystem",
    bongDaTuNhi: "Bóng Đá Tú Nhi",
  },
  header: {
    search: "Search",
    searchTitle: "Search (/)",
    about: "About",
    login: "Sign in",
  },
  theme: {
    label: "Appearance",
    system: "System",
    light: "Light",
    dark: "Dark",
  },
  userMenu: {
    account: "Account",
    review: "Review today",
    library: "Library",
    search: "Search",
    about: "About",
    accountSettings: "Account settings",
    admin: "Admin",
    signOut: "Sign out",
  },
  install: {
    button: "Install app",
    iosAria: "How to install the app on iPhone",
    iosTitle: "Install Knowledge on iPhone",
    step1: "Tap the **Share** button in your browser (or the **···** menu → Share).",
    step2: "Choose **Add to Home Screen**, then tap **Add**.",
    iosNote: "Can't see \"Add to Home Screen\"? Scroll to the bottom of the share sheet, or tap \"More\".",
  },
  offline: "You're offline. Some features may not be available.",
  home: {
    greeting: "Hello 👋",
    greetingNamed: "Hello, {name} 👋",
    heading: "What shall we **review** today?",
    subtitle: "Pick a deck to review or create a new one.",
    explore: "Explore the library",
    emptyFilteredTitle: "No matching decks found",
    emptyTitle: "No decks yet",
    emptyFilteredDescription: "Try a different keyword or filter.",
    emptyDescription: "Create your first deck to start learning with flashcards.",
    saved: "Saved library",
    inProgress: "Continue learning",
  },
  about: {
    metaTitle: "About — Knowledge",
    metaDescription:
      "Knowledge is a flashcard learning app: flip cards, spaced repetition, quizzes, a handwriting board, a shared library and offline study.",
    badge: "About",
    heroTitle: "Remember more with Knowledge",
    heroBody:
      "Knowledge is a flashcard app for IT knowledge, English vocabulary and anything else you want to remember. Create cards, review at the right time, and share a library of decks with the community.",
    ctaHome: "Go to my page",
    ctaLibrary: "Browse the library",
    ctaStart: "Get started for free",
    ctaLogin: "Sign in",
    featuresTitle: "Key features",
    newBadge: "New",
    stepsTitle: "How to get started",
    features: {
      cards: {
        title: "Flashcards & decks",
        body: "Create decks by category and level. Each card has a question, an answer and an explanation (Markdown supported). View a deck as a detailed list or as flip cards, and star the cards that need attention.",
      },
      progress: {
        title: "Pick up where you left off",
        body: "Decks you are partway through sit at the top of your home page, with a progress bar and a reminder to take the quiz once every card is known. After each round, the app suggests the right next step.",
      },
      srs: {
        title: "Spaced repetition (SRS)",
        body: "The system schedules each card's review based on how well you remember it; review by flipping cards or typing the word. Words you keep forgetting are marked “hard” and cleared once you recall them reliably. Set your own daily goal and track streaks and statistics.",
      },
      modes: {
        title: "Many practice modes",
        body: "Multiple choice, typing the answer, matching, listen-and-choose and fill in the blank. Each mode suits a different way of memorizing.",
      },
      vocab: {
        title: "Learn English vocabulary",
        body: "English categories suggest pronunciation, part of speech, meaning and examples, with a pronunciation button and quick AI suggestions when adding words. Ready-made IPA chart decks cover monophthongs, diphthongs and consonants.",
      },
      board: {
        title: "Handwriting board",
        body: "Open a floating chalkboard on any page to sketch, practise writing or take notes with a mouse, finger or pen. Pick colours and stroke sizes, erase, undo and download a PNG.",
      },
      importExport: {
        title: "Import & export",
        body: "Bulk import from CSV, Excel or Markdown (with a template and preview). Export a deck to a file at any time.",
      },
      library: {
        title: "Shared library",
        body: "Browse published decks and search by name or category. Start learning right away without writing everything yourself.",
      },
      saveCopy: {
        title: "Save a reference or copy",
        body: "Save a deck to your library (always up to date with the original), or make your own copy to edit freely.",
      },
      share: {
        title: "Share with a link",
        body: "Each deck can be private, shared by link, or published to the library after an admin approves it. Links shared on social media show a preview image with the logo.",
      },
      reminders: {
        title: "Daily study reminders",
        body: "Turn on push notifications: on days you haven't studied and cards are due, the app reminds you once in the evening. Switch it on or off anytime in account settings.",
      },
      offline: {
        title: "Install as an app, learn offline",
        body: "Install on your phone or computer as an app (PWA). Light/dark themes, and it works well at every screen size.",
      },
    },
    steps: {
      create: {
        title: "Create or save a deck",
        body: "Write your own, import from a file, or take a ready-made deck from the library.",
      },
      study: {
        title: "Learn & practice",
        body: "Flip cards, mark the ones you know, then take a quiz to lock in what you learned.",
      },
      review: {
        title: "Review at the right time",
        body: "Open “Review today” every day to remember more with just a few minutes.",
      },
    },
  },
  board: {
    open: "Open board",
    title: "Board",
    hasContent: "The board has notes",
    tool: "Tool",
    chalk: "Chalk",
    eraser: "Eraser",
    colors: "Chalk colour",
    color: { white: "White", yellow: "Yellow", pink: "Pink", dark: "Black" },
    size: "Stroke size",
    sizes: { xs: "Extra thin", s: "Thin", m: "Medium", l: "Thick" },
    picker: { open: "More colours", title: "Pick a colour", sv: "Saturation and brightness", hue: "Hue", hex: "Hex", recent: "Recent colours" },
    eraserSize: "Eraser size",
    background: "Board colour",
    bg: { green: "Green", black: "Black", white: "White" },
    undo: "Undo (Ctrl+Z)",
    clear: "Clear all",
    download: "Download PNG",
    canvasAria: "Drawing board — draw with a mouse, finger or stylus",
  },
};

export default layout;
