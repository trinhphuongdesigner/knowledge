const study = {
  meta: {
    title: "Étudier les cartes — Knowledge",
  },
  loading: "Préparation de vos cartes…",
  breadcrumb: {
    home: "Accueil",
    study: "Étude",
  },
  filter: {
    aria: "Filtrer les cartes à étudier",
    all: "Toutes",
    starred: "Étoilées ({count})",
    hard: "Mots difficiles ({count})",
  },
  toolbar: {
    shuffle: "Mélanger",
    swap: "Inverser les faces",
    restart: "Recommencer",
  },
  controls: {
    unknown: "À revoir",
    known: "Je sais",
    prev: "Carte précédente",
    next: "Carte suivante",
    flip: "Retourner la carte",
  },
  progress: {
    known: "Connues : {count}",
    unknown: "À revoir : {count}",
    aria: "Progression de l’étude",
  },
  flashcard: {
    ariaBack: "Verso affiché, appuyez pour revenir au recto",
    ariaFront: "Recto affiché, appuyez pour retourner",
    hint: "Touchez pour retourner ↻",
  },
  finished: {
    title: "Terminé !",
    summary: { one: "Vous avez parcouru {count} carte de « {title} ».", other: "Vous avez parcouru les {count} cartes de « {title} »." },
    known: "Connues",
    unknown: "À revoir",
    unmarked: "Non marquées",
    quiz: "Faire un quiz",
    quizHint: "Saisissez les mots pour les retenir plus longtemps",
    restartUnknown: "Étudier les cartes à revoir",
    restartAll: "Tout étudier à nouveau",
    back: "Retour au paquet",
  },
  session: {
    emptyTitle: "Ce paquet ne contient encore aucune carte",
    emptyDescription: "Ajoutez des cartes ou importez-les depuis un fichier pour commencer à étudier.",
    addCards: "Ajouter des cartes",
    import: "Importer depuis un fichier",
    restartTitle: "Recommencer ?",
    restartBody: "Vous reviendrez à la première carte. Vos marques « connue » / « à revoir » sont conservées.",
    cancel: "Annuler",
    restart: "Recommencer",
    question: "Question",
    answer: "Réponse",
    saveFailed: "Impossible d’enregistrer votre progression ; nouvelle tentative plus tard.",
  },
};

export default study;
