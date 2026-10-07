const layout = {
  title: "Knowledge — Apprendre avec des flashcards",
  description: "Révisez l’informatique et l’anglais avec des flashcards",
  footer: {
    about: "À propos",
    terms: "Conditions",
    privacy: "Confidentialité",
    ecosystem: "L’écosystème de Trinh Phuong",
    bongDaTuNhi: "Bóng Đá Tú Nhi",
  },
  header: {
    search: "Rechercher",
    searchTitle: "Rechercher (/)",
    about: "À propos",
    login: "Se connecter",
  },
  theme: {
    label: "Apparence",
    system: "Système",
    light: "Clair",
    dark: "Sombre",
  },
  userMenu: {
    account: "Compte",
    review: "Réviser aujourd’hui",
    library: "Bibliothèque",
    search: "Rechercher",
    about: "À propos",
    accountSettings: "Paramètres du compte",
    admin: "Administration",
    signOut: "Se déconnecter",
  },
  install: {
    button: "Installer l’application",
    iosAria: "Comment installer l’application sur iPhone",
    iosTitle: "Installer Knowledge sur iPhone",
    step1: "Appuyez sur le bouton **Partager** de votre navigateur (ou sur le menu **···** → Partager).",
    step2: "Choisissez **Sur l’écran d’accueil**, puis appuyez sur **Ajouter**.",
    iosNote: "Vous ne voyez pas « Sur l’écran d’accueil » ? Faites défiler le menu de partage jusqu’en bas, ou appuyez sur « Plus ».",
  },
  offline: "Vous êtes hors ligne. Certaines fonctionnalités peuvent être indisponibles.",
  home: {
    greeting: "Bonjour 👋",
    greetingNamed: "Bonjour, {name} 👋",
    heading: "Que **réviser** aujourd’hui ?",
    subtitle: "Choisissez un paquet à réviser ou créez-en un nouveau.",
    explore: "Explorer la bibliothèque",
    emptyFilteredTitle: "Aucun paquet correspondant",
    emptyTitle: "Aucun paquet pour le moment",
    emptyFilteredDescription: "Essayez un autre mot-clé ou un autre filtre.",
    emptyDescription: "Créez votre premier paquet pour commencer à apprendre avec des flashcards.",
    saved: "Bibliothèque enregistrée",
    inProgress: "Continuer l’apprentissage",
  },
  about: {
    metaTitle: "À propos — Knowledge",
    metaDescription:
      "Knowledge est une application de cartes mémoire : cartes à retourner, répétition espacée, quiz, tableau d'écriture, bibliothèque partagée et étude hors ligne.",
    badge: "À propos",
    heroTitle: "Retenez plus avec Knowledge",
    heroBody:
      "Knowledge est une application de flashcards pour les connaissances en informatique, le vocabulaire anglais et tout ce que vous souhaitez retenir. Créez des cartes, révisez au bon moment et partagez des paquets via une bibliothèque communautaire.",
    ctaHome: "Aller à ma page",
    ctaLibrary: "Parcourir la bibliothèque",
    ctaStart: "Commencer gratuitement",
    ctaLogin: "Se connecter",
    featuresTitle: "Fonctionnalités clés",
    newBadge: "Nouveau",
    stepsTitle: "Pour bien démarrer",
    features: {
      cards: {
        title: "Flashcards et paquets",
        body: "Créez des paquets par catégorie et par niveau. Chaque carte a une question, une réponse et une explication (Markdown pris en charge). Affichez un paquet en liste détaillée ou en cartes à retourner, et marquez d'une étoile les cartes à surveiller.",
      },
      progress: {
        title: "Reprenez là où vous en étiez",
        body: "Les paquets en cours apparaissent en haut de l'accueil, avec une barre de progression et un rappel de passer le quiz une fois toutes les cartes connues. Après chaque tour, l'application propose l'étape suivante adaptée.",
      },
      srs: {
        title: "Répétition espacée (SRS)",
        body: "Le système planifie la révision de chaque carte selon votre mémorisation ; révisez en retournant les cartes ou en tapant le mot. Les mots souvent oubliés sont marqués « difficiles » puis retirés quand vous les retenez durablement. Fixez votre objectif quotidien et suivez séries et statistiques.",
      },
      modes: {
        title: "De nombreux modes d’entraînement",
        body: "Choix multiple, saisie de la réponse, association, écoute puis choix, et texte à trous. Chaque mode convient à une façon différente de mémoriser.",
      },
      vocab: {
        title: "Apprendre le vocabulaire anglais",
        body: "Les catégories d'anglais proposent prononciation, nature du mot, sens et exemples, avec un bouton de prononciation et des suggestions IA rapides à l'ajout. Des paquets prêts à l'emploi couvrent l'alphabet phonétique (API) : monophtongues, diphtongues et consonnes.",
      },
      board: {
        title: "Tableau d'écriture",
        body: "Ouvrez un tableau flottant sur n'importe quelle page pour griffonner, vous entraîner à écrire ou prendre des notes à la souris, au doigt ou au stylet. Choisissez couleurs et épaisseurs, effacez, annulez et téléchargez en PNG.",
      },
      importExport: {
        title: "Import et export",
        body: "Importez en masse depuis CSV, Excel ou Markdown (avec modèle et aperçu). Exportez un paquet vers un fichier à tout moment.",
      },
      library: {
        title: "Bibliothèque partagée",
        body: "Parcourez les paquets publiés et recherchez par nom ou par catégorie. Commencez à apprendre tout de suite, sans tout rédiger vous-même.",
      },
      saveCopy: {
        title: "Enregistrer une référence ou une copie",
        body: "Enregistrez un paquet dans votre bibliothèque (toujours à jour par rapport à l’original) ou faites votre propre copie pour la modifier librement.",
      },
      share: {
        title: "Partager avec un lien",
        body: "Chaque paquet peut être privé, partagé par lien ou publié dans la bibliothèque après validation d'un administrateur. Les liens partagés sur les réseaux sociaux affichent un aperçu avec le logo.",
      },
      reminders: {
        title: "Rappels quotidiens",
        body: "Activez les notifications push : les jours où vous n'avez pas étudié et où des cartes sont à réviser, l'application vous le rappelle une fois en soirée. Activez-les ou désactivez-les à tout moment dans les paramètres du compte.",
      },
      offline: {
        title: "Installer comme application, apprendre hors ligne",
        body: "Installez l’application (PWA) sur votre téléphone ou votre ordinateur. Thèmes clair et sombre, et un affichage adapté à toutes les tailles d’écran.",
      },
    },
    steps: {
      create: {
        title: "Créez ou enregistrez un paquet",
        body: "Rédigez le vôtre, importez-le depuis un fichier, ou prenez un paquet prêt à l’emploi dans la bibliothèque.",
      },
      study: {
        title: "Apprenez et entraînez-vous",
        body: "Retournez les cartes, marquez celles que vous connaissez, puis passez un quiz pour consolider vos acquis.",
      },
      review: {
        title: "Révisez au bon moment",
        body: "Ouvrez « Réviser aujourd’hui » chaque jour pour retenir davantage en quelques minutes seulement.",
      },
    },
  },
  board: {
    open: "Ouvrir le tableau",
    title: "Tableau",
    hasContent: "Le tableau contient des notes",
    tool: "Outil",
    chalk: "Craie",
    eraser: "Brosse",
    colors: "Couleur de craie",
    color: { white: "Blanc", yellow: "Jaune", pink: "Rose", dark: "Noir" },
    size: "Épaisseur du trait",
    sizes: { xs: "Très fin", s: "Fin", m: "Moyen", l: "Épais" },
    picker: { open: "Autres couleurs", title: "Choisir une couleur", sv: "Saturation et luminosité", hue: "Teinte", hex: "Hex", recent: "Couleurs récentes" },
    eraserSize: "Taille de la brosse",
    background: "Couleur du tableau",
    bg: { green: "Vert", black: "Noir", white: "Blanc" },
    undo: "Annuler (Ctrl+Z)",
    clear: "Tout effacer",
    download: "Télécharger en PNG",
    canvasAria: "Tableau de dessin — écrivez à la souris, au doigt ou au stylet",
  },
};

export default layout;
