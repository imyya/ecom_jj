@AGENTS.md
JIIRO — Plateforme e-commerce
Contexte du projet

Ce projet est une plateforme e-commerce de (pas un site vitrine) : catalogue avec variantes, panier, tunnel de commande, paiement local (Wave/Orange Money), gestion de stock, back-office administrateur avec dashboard.

Développé en solo, à temps partiel (le développeur a un emploi à côté). Priorité absolue : livrer un lancement fonctionnel et maintenable avant d'ajouter des fonctionnalités avancées. Ne jamais complexifier au-delà de ce qui est nécessaire pour le périmètre en cours.

Le cahier des charges complet fait 50 sections ; ce fichier résume ce qui est nécessaire pour le lancement et l'évolution immédiate qui suit. Ne pas implémenter les fonctionnalités hors-scope listées en bas sans validation explicite.

Stratégie de lancement — IMPORTANT, affecte l'ordre de développement

Le client a validé un lancement en deux temps. Important : cette stratégie a évolué depuis la première version de ce document — le panier et le tunnel de commande sont maintenant construits DÈS le lancement, pas reportés. Ce qui est reporté, c'est uniquement l'intégration automatisée du paiement.

Sous-phase A — Lancement (panier + compte client + "checkout" qui redirige vers WhatsApp pour la confirmation)

Le site a un vrai panier, un compte client (ou achat en invité), et un tunnel de commande complet (infos client, zone de livraison). Mais à l'étape paiement, au lieu d'une intégration Wave/Orange Money automatisée, le client est redirigé vers WhatsApp avec un message pré-rempli contenant son numéro de commande (pas le détail article par article — un lien wa.me/...?text= a une limite pratique de longueur, donc le détail complet reste consultable dans le back-office, pas dans le message). Jiiro confirme le paiement manuellement dans la conversation WhatsApp, puis marque la commande comme payée dans le back-office.

Deux points d'entrée doivent exister et utiliser le même mécanisme sous-jacent de création de commande, pour garder un suivi cohérent :

Le bouton "Commander via WhatsApp" sur la fiche produit (§20 CDC) — achat rapide d'un seul article, sans passer par le panier.
Le tunnel panier complet (plusieurs articles).

Les deux créent une Order (même avec un seul article) et suivent exactement la même logique de stock ci-dessous — ne jamais avoir un chemin "tracké" et un chemin "pas tracké" en parallèle.

Logique de stock — la partie la plus importante à respecter à la lettre :

À la création de la commande (clic "Commander", avant la redirection WhatsApp), on incrémente reservedStock, on ne touche JAMAIS stock directement à ce moment. La commande est créée avec le statut PAIEMENT_EN_ATTENTE.
Le stock réellement affiché/disponible à l'achat sur le site = stock - reservedStock, jamais juste stock seul — sinon deux clients peuvent réserver le même dernier article.
Ce n'est que lorsque Jiiro confirme le paiement dans le back-office (statut → PAIEMENT_CONFIRME) que le vrai décrément a lieu : stock -= quantité ET reservedStock -= quantité, dans la même transaction.
Nettoyage des réservations abandonnées : rien n'oblige le client à réellement envoyer le message WhatsApp une fois redirigé. Prévoir un mécanisme (job planifié ou vérification au chargement de l'admin) qui annule automatiquement (ANNULEE) les commandes PAIEMENT_EN_ATTENTE de plus de 24-48h et libère leur reservedStock — sinon le stock affiché dérive progressivement vers des ruptures fictives.

L'écran admin de réajustement manuel du stock (sélectionner une variante, +/- une quantité, un motif) reste utile et à construire tôt, mais pour un usage différent de ce qu'on pensait au départ : corrections d'inventaire, vente en boutique physique, casse — pas pour les ventes WhatsApp elles-mêmes, qui sont maintenant trackées automatiquement via le mécanisme ci-dessus.

Sous-phase B — Paiement automatisé (à activer plus tard) Quand le client sera prêt, on remplace la redirection WhatsApp par une vraie intégration Wave/Orange Money via agrégateur (PayDunya/CinetPay/Kkiapay) : le décrément de stock devient déclenché par la confirmation API de l'agrégateur (webhook) plutôt que par une action manuelle de Jiiro dans le back-office. Le reste du flow (panier, tunnel de commande, Order/OrderItem/Payment, statuts) ne change pas.

Stack technique
Framework : Next.js (App Router), TypeScript
Structure du projet : PAS de dossier src/ — app/, components/, features/, lib/, types/, constants/, prisma/ sont tous à la racine. Vérifier l'alias @/* dans tsconfig.json (doit pointer vers ./*, pas ./src/*).
Styling : Tailwind CSS v4 (configuration CSS-first via @theme dans app/globals.css, PAS de fichier tailwind.config.ts)
Composants UI : shadcn/ui (code copié dans components/ui/, pas une dépendance externe — on peut et doit modifier ces fichiers pour matcher le design system). Icônes génériques UI : lucide-react (déjà présent via shadcn). Icônes de marque (réseaux sociaux — Instagram, Facebook, TikTok, WhatsApp) : react-icons/si (lucide ne les a pas toutes).
Base de données : PostgreSQL + Prisma ORM
Validation : Zod
Authentification admin : JWT (cookie httpOnly) + bcrypt
État panier (client) : Zustand + localStorage — utilisé dès la sous-phase A (le panier existe dès le lancement, seul le paiement automatisé est reporté en sous-phase B)
Fonts : Outfit, chargée via next/font/google dans app/layout.tsx (subsets latin + latin-ext pour les accents français), exposée comme variable CSS, mappée dans app/globals.css via @theme.
Paiement : agrégateur ouest-africain (PayDunya, CinetPay ou Kkiapay — à confirmer) pour Wave + Orange Money + carte, à activer en sous-phase B seulement. Ne PAS essayer d'intégrer les API Wave/Orange Money directement.