/**
 * Politique de confidentialité et Conditions d’utilisation (traduction française). Structure et clés identiques à en/legal.ts.
 * Balisage dans les chaînes : `**gras**`, `code`, [libellé](linkKey), {mail}. Les clés ne se traduisent pas.
 */
const legal = {
  common: {
    home: "Accueil",
    updated: "Dernière mise à jour : {date}",
    toc: "Sommaire",
    seeAlso: "Voir aussi :",
    privacy: "Politique de confidentialité",
    terms: "Conditions d’utilisation",
    about: "À propos",
  },
  privacy: {
    metaTitle: "Politique de confidentialité — Knowledge",
    metaDescription:
      "Quelles données Knowledge collecte, à quoi elles servent, avec qui elles sont partagées, combien de temps elles sont conservées, et vos droits sur vos données personnelles.",
    title: "Politique de confidentialité",
    intro:
      "Knowledge respecte votre vie privée. Cette page explique clairement quelles données nous collectons, pourquoi nous les utilisons, avec qui nous les partageons, combien de temps nous les conservons et quels droits vous avez sur vos données.",
    sections: {
      scope: {
        title: "Champ d’application",
        p1: "La présente politique s’applique à l’application web Knowledge (y compris lorsqu’elle est installée en tant que PWA), disponible à l’adresse knowledge.gutanembroidery.com — une application d’apprentissage par flashcards développée et exploitée par Trinh Phuong, personne physique (ci-après « nous »).",
        p2: "En vous connectant et en utilisant Knowledge, vous confirmez avoir lu et accepté la manière dont nous traitons les données personnelles décrite ci-dessous. Si vous n’êtes pas d’accord, veuillez ne pas utiliser le service.",
      },
      dataCollected: {
        title: "Données que nous collectons",
        p1: "**a) Depuis votre compte Google lors de la connexion** (via Firebase Authentication) : adresse e-mail, nom d’affichage, URL de la photo de profil et identifiant du compte Google. Nous ne demandons que les autorisations de base `openid`, `email` et `profile`. Nous ne recevons **pas** votre mot de passe Google et ne demandons l’accès ni à Gmail, ni à Drive, ni aux Contacts, ni à l’Agenda, ni à aucune autre donnée Google.",
        p2: "**b) Informations de profil que vous saisissez vous-même** lors de la création de votre profil ou sur la page Compte : nom complet, année de naissance, genre, langue maternelle, choix d’avatar, objectif d’étude quotidien et paramètres de rappel.",
        p3: "**c) Contenu que vous créez** : paquets, cartes (questions, réponses, explications, prononciation, etc.), données que vous importez depuis des fichiers CSV/Excel/Markdown, et mode de partage de chaque paquet.",
        p4: "**d) Données d’apprentissage** : progression des révisions, calendrier de répétition espacée (SRS), cartes étoilées, résultats de quiz, cartes révisées par jour, séries d’étude, paquets enregistrés depuis la bibliothèque et nombre quotidien de suggestions IA utilisées.",
        p5: "**e) Données techniques** :",
        list: {
          i1: "Cookie de session et informations sur le navigateur (user agent) pour chaque session.",
          i2: "Adresse IP et e-mail des tentatives de connexion, utilisés uniquement pour la limitation de débit et la prévention des abus.",
          i3: "Détails d’abonnement Web Push (endpoint et clés de chiffrement émises par le navigateur) — uniquement si vous activez les notifications sur cet appareil.",
          i4: "Notifications dans l’application qui vous sont envoyées (rappels de révision, résultats de validation des paquets, avis système).",
        },
        p6: "Nous ne collectons ni données de localisation, ni contacts, ni données biométriques ou de paiement, et nous n’utilisons aucun traceur publicitaire tiers.",
      },
      purposes: {
        title: "Utilisation de vos données",
        list: {
          i1: "Création et gestion de votre compte, authentification des connexions et sécurisation de votre session.",
          i2: "Fourniture des fonctionnalités d’apprentissage : enregistrement des cartes, planification des révisions, statistiques, séries d’étude, bibliothèque et partage.",
          i3: "Envoi des notifications dans l’application et push que vous avez activées (vous pouvez les désactiver à tout moment).",
          i4: "Personnalisation de votre expérience (par exemple : votre nom et votre photo de profil dans l’interface, et votre langue maternelle pour suggérer le sens des mots).",
          i5: "Application des limites d’utilisation, et détection et prévention des abus, des fraudes et des accès non autorisés.",
          i6: "Modération des contenus publiés dans la bibliothèque publique.",
          i7: "Exploitation, sauvegarde, dépannage et amélioration du service à partir de chiffres agrégés.",
        },
      },
      googleData: {
        title: "Données reçues de Google",
        p1: "Knowledge ne demande que les autorisations de base `openid`, `email` et `profile` pour vous connecter. Ces données servent uniquement à identifier votre compte et à afficher votre nom et votre photo de profil dans l’application ; elles ne sont ni vendues, ni utilisées à des fins publicitaires, ni utilisées pour entraîner des modèles d’IA ou d’apprentissage automatique, ni transférées à des tiers autres que les fournisseurs d’infrastructure listés à la section 5.",
        p2: "L’utilisation et le transfert par Knowledge des informations reçues des API Google respectent la [Politique relative aux données utilisateur des services d’API Google](googleApiPolicy), y compris les exigences d’utilisation limitée.",
      },
      sharing: {
        title: "Partage des données et sous-traitants",
        p1: "Nous **ne vendons pas** les données personnelles. Les données ne sont traitées que par les prestataires nécessaires au fonctionnement de l’application :",
        list: {
          i1: "**Google Firebase Authentication** — connexion avec Google.",
          i2: "**Vercel** — hébergement et exécution de l’application web.",
          i3: "**Supabase** — base de données PostgreSQL (serveurs situés à Singapour).",
          i4: "**Anthropic** — uniquement lorsque vous cliquez sur une suggestion IA : nous envoyons seulement le mot/terme que vous modifiez pour obtenir une suggestion, jamais votre e-mail, votre nom ni les données de votre compte.",
          i5: "**Free Dictionary API (dictionaryapi.dev)** — recherche la prononciation et le sens des mots anglais ; seul le mot recherché est envoyé.",
          i6: "**Services de notifications push des navigateurs** (Google, Apple, Mozilla, Microsoft, etc.) — acheminent le contenu des notifications vers les appareils sur lesquels vous les avez activées.",
        },
        p2: "**Contenu que vous choisissez de partager :** les paquets en mode « partage par lien » peuvent être consultés par toute personne disposant du lien ; les paquets publics (une fois approuvés) apparaissent dans la bibliothèque publique avec votre **nom d’affichage**, et les autres utilisateurs peuvent les enregistrer ou les copier pour étudier. Votre e-mail n’est jamais affiché aux autres utilisateurs.",
        p3: "Nous pouvons divulguer des données à la demande valable d’une autorité publique compétente, conformément à la loi.",
      },
      international: {
        title: "Stockage et transfert international des données",
        p1: "Les fournisseurs listés ci-dessus hébergent leurs serveurs en dehors du Vietnam (notamment à Singapour et aux États-Unis). En utilisant le service, vous acceptez que vos données puissent être stockées et traitées dans ces pays. Nous ne choisissons que des fournisseurs dotés de mesures de sécurité appropriées et ne transférons que les données nécessaires à chaque finalité.",
      },
      cookies: {
        title: "Cookies et stockage sur l’appareil",
        list: {
          i1: "**Cookie de session** (obligatoire) : vous maintient connecté jusqu’à 30 jours après votre dernière utilisation ; le cookie est défini avec l’attribut `HttpOnly` et ne peut pas être lu par JavaScript.",
          i2: "**Stockage du navigateur** (localStorage, cache du service worker) : conserve le thème clair/sombre et des ressources afin que l’application s’ouvre rapidement et fonctionne hors ligne.",
          i3: "Nous n’utilisons ni cookies publicitaires ni cookies de suivi tiers.",
        },
      },
      retention: {
        title: "Durée de conservation",
        list: {
          i1: "Compte, profil, paquets et progression d’apprentissage : conservés jusqu’à ce que vous les supprimiez ou nous demandiez de supprimer votre compte.",
          i2: "Sessions : supprimées automatiquement à leur expiration ou lorsque vous vous déconnectez.",
          i3: "Historique de connexion (IP, e-mail) et compteurs d’utilisation de l’IA : supprimés automatiquement après 30 jours.",
          i4: "Statistiques d’étude quotidiennes : supprimées automatiquement après environ 400 jours.",
          i5: "Notifications dans l’application : supprimées après 30 jours si elles sont lues, et après 90 jours au plus tard.",
        },
        p1: "Les sauvegardes de la base de données (le cas échéant) sont écrasées selon le cycle du fournisseur d’infrastructure.",
      },
      security: {
        title: "Sécurité",
        p1: "Toutes les connexions utilisent HTTPS. Les jetons de session ne résident que dans votre cookie ; le serveur n’en stocke qu’un hachage (SHA-256), de sorte qu’ils ne peuvent pas être réutilisés même si la base de données était exposée. Les tentatives de connexion sont limitées en débit, les requêtes d’écriture sont vérifiées quant à leur origine, et seuls les administrateurs peuvent accéder aux outils d’administration (toutes les actions d’administration sont consignées dans un journal d’audit).",
        p2: "Aucun système n’est absolument sûr. En cas d’incident affectant des données personnelles, nous en informerons les utilisateurs concernés et les autorités compétentes comme l’exige la loi.",
      },
      rights: {
        title: "Vos droits",
        p1: "En vertu du droit vietnamien relatif à la protection des données personnelles, vous avez le droit de :",
        list: {
          i1: "**Être informé et accéder** : consulter l’ensemble de votre profil et de votre contenu dans l’application.",
          i2: "**Rectifier** : mettre à jour votre profil sur la page [Compte](account) ; modifier ou supprimer des paquets à tout moment.",
          i3: "**Recevoir une copie de vos données** : télécharger toutes vos données au format JSON avec le bouton d’export des données de la page Compte ; exporter chaque paquet en CSV/Excel/Markdown.",
          i4: "**Retirer votre consentement / limiter le traitement** : désactiver les notifications push, révoquer l’accès de Knowledge sur la [page des connexions de votre compte Google](googleConnections), ou cesser d’utiliser le service.",
          i5: "**Supprimer vos données** : envoyez une demande de suppression de compte à {mail} depuis l’adresse e-mail de connexion. Nous supprimons votre compte ainsi que tous les paquets, cartes, progressions d’apprentissage et notifications associés dans un délai de 30 jours. Remarque : vos paquets publics sont également retirés de la bibliothèque ; les copies que d’autres personnes ont faites auparavant appartiennent à leurs propres comptes.",
          i6: "**Déposer une réclamation** : contactez-nous d’abord ; si le résultat n’est pas satisfaisant, vous pouvez saisir l’autorité publique compétente.",
        },
      },
      children: {
        title: "Enfants",
        p1: "Knowledge n’est pas destiné aux enfants de moins de 13 ans. Les utilisateurs de moins de 16 ans doivent obtenir le consentement d’un parent ou tuteur avant de l’utiliser. Si vous êtes parent et pensez que votre enfant a fourni des données sans consentement, veuillez contacter {mail} afin que nous les supprimions.",
      },
      changes: {
        title: "Modifications de la présente politique",
        p1: "Nous pouvons mettre à jour la présente politique lorsque le service évolue. La date de mise à jour est toujours indiquée en haut de la page ; pour les changements importants, nous vous en informerons dans l’application avant leur entrée en vigueur. La poursuite de l’utilisation du service après la date d’effet vaut acceptation de la nouvelle politique.",
      },
      contact: {
        title: "Contact",
        p1: "Pour toute question ou demande concernant les données personnelles, écrivez à {mail}. Nous répondons sous 7 jours ouvrés.",
      },
    },
  },
  terms: {
    metaTitle: "Conditions d’utilisation — Knowledge",
    metaDescription:
      "Les conditions d’utilisation de Knowledge : comptes, contenu des utilisateurs, bibliothèque publique, règles de conduite et limitation de responsabilité.",
    title: "Conditions d’utilisation",
    intro:
      "Veuillez lire attentivement les conditions ci-dessous avant d’utiliser Knowledge. Elles expliquent vos droits et responsabilités ainsi que la manière dont nous exploitons le service.",
    sections: {
      acceptance: {
        title: "Acceptation des conditions",
        p1: "Knowledge est une application d’apprentissage par flashcards développée et exploitée par Trinh Phuong, personne physique (« nous »). En vous connectant ou en utilisant Knowledge, vous acceptez les présentes Conditions d’utilisation et la [Politique de confidentialité](privacy).",
        p2: "Si vous n’êtes pas d’accord avec une partie quelconque des conditions, veuillez cesser d’utiliser le service.",
      },
      account: {
        title: "Comptes",
        list: {
          i1: "Vous vous connectez avec un compte Google ; un compte Knowledge est créé automatiquement lors de votre première connexion.",
          i2: "Vous devez avoir au moins 13 ans ; si vous avez moins de 16 ans, vous avez besoin du consentement d’un parent ou tuteur.",
          i3: "Les informations de profil que vous fournissez doivent être exactes ; votre nom d’affichage ne doit pas usurper l’identité d’une autre personne ou organisation.",
          i4: "Vous êtes responsable de la protection de votre compte Google et de toute activité sur votre compte Knowledge. Informez-nous immédiatement si vous constatez un accès non autorisé.",
        },
      },
      service: {
        title: "Le service et les limites d’utilisation",
        p1: "Knowledge est actuellement fourni gratuitement. Pour garantir l’équité et la stabilité, chaque compte est soumis à des limites d’utilisation (nombre de paquets, nombre de cartes, nombre de paquets enregistrés depuis la bibliothèque, suggestions IA quotidiennes, etc.). Ces limites peuvent être ajustées au fil du temps.",
        p2: "Nous pouvons ajouter, modifier ou interrompre toute fonctionnalité à tout moment. Pour les changements qui affectent significativement vos données, nous nous efforcerons de vous prévenir à l’avance afin que vous puissiez les exporter.",
      },
      yourContent: {
        title: "Votre contenu",
        p1: "Vous conservez la propriété des paquets et des cartes que vous créez. Pour exploiter le service, vous nous accordez le droit de stocker, sauvegarder, traiter techniquement et afficher ce contenu à votre intention et à celle des personnes avec lesquelles vous choisissez de le partager.",
        p2: "Chaque paquet dispose de trois modes :",
        list: {
          i1: "**Privé** : vous seul pouvez le consulter.",
          i2: "**Partage par lien** : toute personne disposant du lien peut le consulter, même sans être connectée.",
          i3: "**Public** : une fois approuvé par un administrateur, le paquet apparaît dans la bibliothèque publique avec votre nom d’affichage.",
        },
        p3: "Lorsque vous partagez par lien ou publiquement, vous acceptez que d’autres utilisateurs puissent le consulter, l’enregistrer dans leur bibliothèque et en faire une copie pour un usage d’étude personnel et non commercial. Une copie déjà réalisée appartient au compte de la personne qui l’a faite et n’est pas affectée lorsque vous modifiez ou supprimez l’original.",
        p4: "Vous déclarez disposer du droit légal sur le contenu que vous téléversez (œuvre personnelle, utilisation autorisée ou usage loyal) et vous êtes seul responsable de ce contenu.",
      },
      rules: {
        title: "Règles d’utilisation",
        p1: "Vous ne pouvez pas utiliser Knowledge pour :",
        list: {
          i1: "Publier du contenu qui enfreint le droit vietnamien ou porte atteinte aux droits de propriété intellectuelle ou à la vie privée d’autrui.",
          i2: "Publier du contenu pornographique, violent, haineux, discriminatoire, harcelant ou frauduleux, ou de la désinformation nuisible.",
          i3: "Publier sans autorisation des données personnelles d’autres personnes (numéros de téléphone, pièces d’identité, comptes, etc.).",
          i4: "Diffuser des logiciels malveillants, du spam, de la publicité non autorisée ou des liens frauduleux.",
          i5: "Obtenir un accès non autorisé, rechercher des vulnérabilités, dépasser les limites, extraire des données automatiquement ou surcharger le système.",
          i6: "Usurper l’identité d’une autre personne ou d’un administrateur.",
        },
      },
      moderation: {
        title: "Modération et traitement des infractions",
        p1: "Les administrateurs ont le droit d’approuver ou de refuser les paquets soumis à publication, de retirer des paquets de la bibliothèque publique, de marquer des paquets comme étant à la une, et de repasser les paquets en infraction dans un mode non public.",
        p2: "Lorsque nous détectons une infraction, nous pouvons supprimer du contenu, restreindre des fonctionnalités, **suspendre** ou **supprimer** le compte — selon la gravité, et sans préavis en cas d’infraction grave. Un compte suspendu est déconnecté de tous les appareils et ne peut pas se connecter tant qu’il n’est pas réactivé. Si vous estimez qu’une décision est erronée, vous pouvez répondre via {mail}.",
        p3: "Les catégories de paquets sont gérées par les administrateurs pour l’ensemble du système.",
      },
      aiDictionary: {
        title: "Suggestions IA et dictionnaire",
        p1: "Les suggestions de l’IA, ainsi que la prononciation, le sens et les exemples obtenus auprès de services externes, sont fournis à titre indicatif et peuvent être inexacts. Veuillez les vérifier avant de les enregistrer dans une carte. Nous ne sommes pas responsables des erreurs dans le contenu suggéré.",
      },
      intellectualProperty: {
        title: "Propriété intellectuelle de Knowledge",
        p1: "L’interface, le code source, la marque Knowledge et les paquets d’exemple que nous compilons nous appartiennent. Vous pouvez utiliser les paquets d’exemple pour votre étude personnelle ; vous ne pouvez pas les copier en masse, les revendre ou les redistribuer à des fins commerciales sans notre consentement écrit.",
      },
      disclaimer: {
        title: "Exclusion de garanties",
        p1: "Knowledge est fourni « en l’état » et « selon disponibilité ». Nous nous efforçons de maintenir le service stable et sécurisé, mais ne garantissons pas qu’il sera ininterrompu, exempt d’erreurs, ou qu’il produira un résultat d’apprentissage particulier. Nous vous recommandons d’exporter régulièrement vos données importantes afin d’en conserver votre propre copie.",
      },
      liability: {
        title: "Limitation de responsabilité",
        p1: "Dans la mesure permise par la loi, nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs (y compris la perte de données et l’interruption de l’apprentissage) découlant de l’utilisation ou de l’impossibilité d’utiliser le service, du contenu publié par d’autres utilisateurs ou de services tiers. Cela n’exclut pas la responsabilité qui ne peut être exclue par la loi.",
      },
      termination: {
        title: "Résiliation",
        p1: "Vous pouvez cesser d’utiliser le service à tout moment et demander la suppression de votre compte comme décrit dans la [Politique de confidentialité](privacyRights). Nous pouvons mettre fin au service pour un compte qui enfreint les présentes Conditions, ou interrompre l’ensemble du service moyennant un préavis raisonnable.",
      },
      changes: {
        title: "Modifications des conditions",
        p1: "Nous pouvons mettre à jour les présentes Conditions. La date de mise à jour est toujours indiquée en haut de la page ; pour les changements importants, nous vous en informerons dans l’application. La poursuite de l’utilisation du service après la date d’effet vaut acceptation des nouvelles Conditions.",
      },
      governingLaw: {
        title: "Droit applicable et règlement des litiges",
        p1: "Les présentes Conditions sont régies par les lois de la République socialiste du Viêt Nam. Tout litige sera d’abord réglé par la négociation ; à défaut, il sera tranché par l’autorité compétente conformément au droit vietnamien.",
      },
      contact: {
        title: "Contact",
        p1: "Pour toute question sur les Conditions d’utilisation, écrivez à {mail}.",
      },
    },
  },
};

export default legal;
