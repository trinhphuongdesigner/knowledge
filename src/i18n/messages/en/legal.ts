/**
 * Privacy Policy and Terms of Use. Pages render `privacy.sections` / `terms.sections` in object-key order:
 *  - `title` is the section heading; every other key is rendered in order;
 *  - a string value is a paragraph, an object value is a bullet list (its values are the items).
 * Keys are structural and must NOT be translated — only the string values.
 *
 * Inline markup inside strings (no HTML) — keep it exactly, translate only the visible text:
 *  - `**bold**`, `` `code` `` (do not translate code such as openid, HttpOnly)
 *  - `[label](linkKey)` is a link; translate `label`, keep `linkKey`
 *    (account, privacy, privacyRights, googleConnections, googleApiPolicy)
 *  - `{mail}` is replaced by the contact email link
 *  - in `privacy.intro` / `terms.intro`, "\n" separates paragraphs.
 * Facts, dates, names and numbers must stay identical across languages. Section cross-references
 * ("section 5") must match the order of `privacy.sections`.
 */
const legal = {
  common: {
    home: "Home",
    updated: "Last updated: {date}",
    toc: "Contents",
    seeAlso: "See also:",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    about: "About",
  },
  privacy: {
    metaTitle: "Privacy Policy — Knowledge",
    metaDescription:
      "What data Knowledge collects, what it is used for, who it is shared with, how long it is kept, and your rights over your personal data.",
    title: "Privacy Policy",
    intro:
      "Knowledge respects your privacy. This page explains clearly what data we collect, what we use it for, who we share it with, how long we keep it, and what rights you have over your data.",
    sections: {
      scope: {
        title: "Scope",
        p1: "This policy applies to the Knowledge web app (including when installed as a PWA), available at knowledge.gutanembroidery.com — a flashcard learning app developed and operated by Trinh Phuong, an individual (hereinafter “we”).",
        p2: "By signing in and using Knowledge, you confirm that you have read and agree to how we process personal data as described below. If you do not agree, please do not use the service.",
      },
      dataCollected: {
        title: "Data we collect",
        p1: "**a) From your Google account when you sign in** (via Firebase Authentication): email address, display name, profile picture URL and Google account identifier. We request only the basic `openid`, `email` and `profile` scopes. We do **not** receive your Google password and we do not request access to Gmail, Drive, Contacts, Calendar or any other Google data.",
        p2: "**b) Profile details you enter yourself** when completing your profile or on the Account page: full name, birth year, gender, native language, avatar choice, daily study goal and reminder settings.",
        p3: "**c) Content you create**: study sets, cards (questions, answers, explanations, pronunciation, etc.), data you import from CSV/Excel/Markdown files, and the sharing mode of each set.",
        p4: "**d) Learning data**: review progress, spaced-repetition (SRS) schedule, starred cards, quiz results, cards reviewed per day, study streaks, sets you saved from the library, and your daily AI-suggestion usage count.",
        p5: "**e) Technical data**:",
        list: {
          i1: "Session cookie and browser information (user agent) for each session.",
          i2: "IP address and email of sign-in attempts, used only for rate limiting and abuse prevention.",
          i3: "Web Push subscription details (endpoint and encryption keys issued by the browser) — only if you enable notifications on that device.",
          i4: "In-app notifications sent to you (review reminders, set review results, system notices).",
        },
        p6: "We do not collect location, contacts, biometric or payment data, and we use no third-party advertising trackers.",
      },
      purposes: {
        title: "How we use your data",
        list: {
          i1: "Creating and maintaining your account, authenticating sign-ins, and keeping your session secure.",
          i2: "Providing the learning features: saving cards, scheduling reviews, statistics, study streaks, the library and sharing.",
          i3: "Sending the in-app and push notifications you have turned on (you can turn them off at any time).",
          i4: "Personalising your experience (for example: your name and profile picture in the interface, and your native language to suggest word meanings).",
          i5: "Enforcing usage limits, and detecting and preventing abuse, fraud and unauthorised access.",
          i6: "Moderating content published to the public library.",
          i7: "Operating, backing up, troubleshooting and improving the service based on aggregated figures.",
        },
      },
      googleData: {
        title: "Data received from Google",
        p1: "Knowledge requests only the basic `openid`, `email` and `profile` scopes to sign you in. This data is used only to identify your account and to display your name and profile picture in the app; it is not sold, not used for advertising, not used to train AI or machine-learning models, and not transferred to third parties other than the infrastructure providers listed in section 5.",
        p2: "Knowledge’s use and transfer of information received from Google APIs adheres to the [Google API Services User Data Policy](googleApiPolicy), including the Limited Use requirements.",
      },
      sharing: {
        title: "Data sharing and processors",
        p1: "We **do not sell** personal data. Data is processed only by the service providers necessary to run the app:",
        list: {
          i1: "**Google Firebase Authentication** — sign-in with Google.",
          i2: "**Vercel** — hosting and running the web app.",
          i3: "**Supabase** — PostgreSQL database (servers located in Singapore).",
          i4: "**Anthropic** — only when you click an AI suggestion: we send only the word/term you are editing to get a suggestion, never your email, name or account data.",
          i5: "**Free Dictionary API (dictionaryapi.dev)** — looks up pronunciation and meanings of English words; only the word being looked up is sent.",
          i6: "**Browser push notification services** (Google, Apple, Mozilla, Microsoft, etc.) — deliver notification content to the devices you enabled.",
        },
        p2: "**Content you choose to share:** sets in “share by link” mode can be viewed by anyone with the link; public sets (once approved) appear in the public library together with your **display name**, and other users can save or copy them to study. Your email is never shown to other users.",
        p3: "We may disclose data upon a valid request from a competent state authority in accordance with the law.",
      },
      international: {
        title: "Storage and international transfer of data",
        p1: "The providers listed above host their servers outside Vietnam (such as Singapore and the United States). By using the service, you agree that your data may be stored and processed in these countries. We choose only providers with appropriate security measures and transfer only the data necessary for each purpose.",
      },
      cookies: {
        title: "Cookies and on-device storage",
        list: {
          i1: "**Session cookie** (required): keeps you signed in for up to 30 days from your most recent use; the cookie is set as `HttpOnly` and cannot be read by JavaScript.",
          i2: "**Browser storage** (localStorage, service worker cache): stores the light/dark theme and resources so the app opens quickly and works offline.",
          i3: "We do not use advertising cookies or third-party tracking cookies.",
        },
      },
      retention: {
        title: "Retention period",
        list: {
          i1: "Account, profile, sets and learning progress: kept until you delete them or ask us to delete your account.",
          i2: "Sessions: deleted automatically when they expire or when you sign out.",
          i3: "Sign-in history (IP, email) and AI usage counts: deleted automatically after 30 days.",
          i4: "Daily study statistics: deleted automatically after about 400 days.",
          i5: "In-app notifications: deleted after 30 days if read, and after 90 days at most.",
        },
        p1: "Database backups (if any) are overwritten on the infrastructure provider’s cycle.",
      },
      security: {
        title: "Security",
        p1: "All connections use HTTPS. Session tokens live only in your cookie; the server stores only a hash (SHA-256), so they cannot be reused even if the database is exposed. Sign-in attempts are rate-limited, write requests are origin-checked, and only administrators can access the admin tools (all admin actions are audit-logged).",
        p2: "No system is absolutely secure. If an incident affecting personal data occurs, we will notify affected users and the competent authorities as required by law.",
      },
      rights: {
        title: "Your rights",
        p1: "Under Vietnamese law on personal data protection, you have the right to:",
        list: {
          i1: "**Be informed and access**: view all of your profile and content in the app.",
          i2: "**Rectify**: update your profile on the [Account](account) page; edit or delete sets at any time.",
          i3: "**Receive a copy of your data**: download all your data as JSON using the data export button on the Account page; export each set to CSV/Excel/Markdown.",
          i4: "**Withdraw consent / restrict processing**: turn off push notifications, revoke Knowledge’s access on your [Google account’s connections page](googleConnections), or stop using the service.",
          i5: "**Delete your data**: send an account deletion request to {mail} from your sign-in email. We delete your account together with all related sets, cards, learning progress and notifications within 30 days. Note: your public sets are also removed from the library; copies that other people created earlier belong to their own accounts.",
          i6: "**Complain**: contact us first; if the outcome is unsatisfactory, you may lodge a complaint with the competent state regulator.",
        },
      },
      children: {
        title: "Children",
        p1: "Knowledge is not intended for children under 13. Users under 16 need the consent of a parent or guardian before using it. If you are a parent and believe your child has provided data without consent, please contact {mail} so we can delete it.",
      },
      changes: {
        title: "Changes to this policy",
        p1: "We may update this policy when the service changes. The update date is always shown at the top of the page; for important changes, we will notify you in the app before they take effect. Continuing to use the service after the effective date means you accept the new policy.",
      },
      contact: {
        title: "Contact",
        p1: "For any question or request about personal data, please email {mail}. We reply within 7 business days.",
      },
    },
  },
  terms: {
    metaTitle: "Terms of Use — Knowledge",
    metaDescription:
      "The terms for using Knowledge: accounts, user content, the public library, rules of conduct and limitation of liability.",
    title: "Terms of Use",
    intro:
      "Please read the terms below carefully before using Knowledge. They explain your rights and responsibilities and how we operate the service.",
    sections: {
      acceptance: {
        title: "Acceptance of the terms",
        p1: "Knowledge is a flashcard learning app developed and operated by Trinh Phuong, an individual (“we”). By signing in or using Knowledge, you agree to these Terms of Use and the [Privacy Policy](privacy).",
        p2: "If you do not agree with any part, please stop using the service.",
      },
      account: {
        title: "Accounts",
        list: {
          i1: "You sign in with a Google account; a Knowledge account is created automatically the first time you sign in.",
          i2: "You must be at least 13 years old; if you are under 16, you need the consent of a parent or guardian.",
          i3: "The profile information you provide must be truthful; your display name must not impersonate another person or organisation.",
          i4: "You are responsible for protecting your Google account and for all activity under your Knowledge account. Tell us immediately if you notice unauthorised access.",
        },
      },
      service: {
        title: "The service and usage limits",
        p1: "Knowledge is currently provided free of charge. To ensure fairness and stability, each account has usage limits (number of sets, number of cards, number of sets saved from the library, daily AI suggestions, etc.). Limits may be adjusted over time.",
        p2: "We may add, change or discontinue any feature at any time. For changes that significantly affect your data, we will try to give advance notice so you can export it.",
      },
      yourContent: {
        title: "Your content",
        p1: "You retain ownership of the sets and cards you create. To operate the service, you grant us the right to store, back up, technically process and display that content to you and to the people you choose to share it with.",
        p2: "Each set has three modes:",
        list: {
          i1: "**Private**: only you can view it.",
          i2: "**Share by link**: anyone with the link can view it, even when not signed in.",
          i3: "**Public**: once an administrator approves it, the set appears in the public library together with your display name.",
        },
        p3: "When you share by link or publicly, you agree that other users may view it, save it to their library and make a copy for personal, non-commercial study. A copy that has been made belongs to the copier’s account and is not affected when you edit or delete the original.",
        p4: "You represent that you have the legal right to the content you upload (self-authored, permitted for use, or within fair use) and you are solely responsible for that content.",
      },
      rules: {
        title: "Rules of use",
        p1: "You may not use Knowledge to:",
        list: {
          i1: "Post content that violates Vietnamese law or infringes the intellectual property or privacy rights of others.",
          i2: "Post pornographic, violent, hateful, discriminatory, harassing or fraudulent content, or harmful misinformation.",
          i3: "Post other people’s personal data (phone numbers, identity documents, accounts, etc.) without permission.",
          i4: "Distribute malware, spam, unauthorised advertising or scam links.",
          i5: "Gain unauthorised access, probe for vulnerabilities, exceed limits, scrape data automatically or overload the system.",
          i6: "Impersonate another person or an administrator.",
        },
      },
      moderation: {
        title: "Moderation and handling of violations",
        p1: "Administrators have the right to approve or reject sets submitted for publication, remove sets from the public library, mark sets as featured, and move violating sets back to a non-public mode.",
        p2: "When we detect a violation, we may remove content, restrict features, **suspend** or **delete** the account — depending on severity, and without prior notice for serious violations. A suspended account is signed out of all devices and cannot sign in until it is unsuspended. If you believe a decision is wrong, you can reply via {mail}.",
        p3: "Set categories are managed by administrators for the whole system.",
      },
      aiDictionary: {
        title: "AI suggestions and dictionary",
        p1: "AI suggestions, and pronunciation, meanings and examples obtained from external services, are for reference only and may be inaccurate. Please check them before saving to a card. We are not responsible for errors in suggested content.",
      },
      intellectualProperty: {
        title: "Knowledge’s intellectual property",
        p1: "The interface, source code, the Knowledge brand and the sample sets we compile belong to us. You may use the sample sets for personal study; you may not mass-copy, resell or redistribute them for commercial purposes without our written consent.",
      },
      disclaimer: {
        title: "Disclaimer of warranties",
        p1: "Knowledge is provided “as is” and “as available”. We strive to keep the service stable and secure but do not guarantee that it will be uninterrupted, error-free, or produce any particular learning outcome. You should periodically export important data to keep your own copy.",
      },
      liability: {
        title: "Limitation of liability",
        p1: "To the extent permitted by law, we are not liable for indirect, incidental or consequential damages (including data loss and learning disruption) arising from the use of or inability to use the service, from content posted by other users, or from third-party services. This does not exclude liability that cannot be excluded by law.",
      },
      termination: {
        title: "Termination",
        p1: "You may stop using the service at any time and request account deletion as described in the [Privacy Policy](privacyRights). We may terminate service to an account that violates these Terms, or discontinue the entire service after reasonable advance notice.",
      },
      changes: {
        title: "Changes to the terms",
        p1: "We may update these Terms. The update date is always shown at the top of the page; for important changes, we will notify you in the app. Continuing to use the service after the effective date means you accept the new Terms.",
      },
      governingLaw: {
        title: "Governing law and dispute resolution",
        p1: "These Terms are governed by the laws of the Socialist Republic of Vietnam. Any dispute shall first be resolved through negotiation; if that fails, the dispute shall be resolved by the competent authority in accordance with Vietnamese law.",
      },
      contact: {
        title: "Contact",
        p1: "For any question about the Terms of Use, please email {mail}.",
      },
    },
  },
};

export default legal;
