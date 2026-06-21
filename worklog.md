# SARAH AUTO — Worklog

---
Task ID: 1
Agent: Main (orchestrator)
Task: Infrastructure — nav store Zustand + mock data + shared components + extract dashboard view + wire page.tsx + update sidebar

Work Log:
- Créé `/src/store/nav-store.ts` : store Zustand avec `activeView` (ViewKey), `setActiveView`, `collapsed`, `toggleCollapsed`. ViewKey = dashboard|eleves|scanner|moniteurs|vehicules|planning|examens|bordereaux|facturation|comptabilite|parametres|assistance|deconnexion
- Créé `/src/lib/mock-data.ts` : toutes les données mockées basées sur le modèle de données du cahier des charges (permis, formations, moniteurs, vehicules, inspecteurs, eleves, seances, examens, examenSessions, factures, paiements, depenses, profiles, faq)
- Créé `/src/components/dashboard/views/shared.tsx` : composants partagés — ViewHeader, StatusBadge (tons: primary/emerald/amber/rose/sky/slate), ActionButton (primary/outline), Card, formatXOF(), initials()
- Créé `/src/components/dashboard/views/dashboard-view.tsx` : extrait le contenu du dashboard existant (MetricCards, charts, table élèves, relances)
- Créé `/src/components/dashboard/views/deconnexion-view.tsx` : vue de déconnexion simple
- Mis à jour `/src/components/dashboard/sidebar.tsx` : utilise useNavStore au lieu de useState local, items mappés à ViewKey
- Mis à jour `/src/app/page.tsx` : importe toutes les vues et rend `viewMap[activeView]`

Stage Summary:
- Infrastructure complète et fonctionnelle
- Le dashboard (tableau de bord) compile et fonctionne comme avant
- **Les 11 vues suivantes DOIVENT être créées** par les sous-agents (Phase 2) aux chemins exacts :
  - `/src/components/dashboard/views/eleves-view.tsx` → `export function ElevesView()`
  - `/src/components/dashboard/views/scanner-cni-view.tsx` → `export function ScannerCniView()`
  - `/src/components/dashboard/views/moniteurs-view.tsx` → `export function MoniteursView()`
  - `/src/components/dashboard/views/vehicules-view.tsx` → `export function VehiculesView()`
  - `/src/components/dashboard/views/planning-view.tsx` → `export function PlanningView()`
  - `/src/components/dashboard/views/examens-view.tsx` → `export function ExamensView()`
  - `/src/components/dashboard/views/bordereaux-view.tsx` → `export function BordereauxView()`
  - `/src/components/dashboard/views/facturation-view.tsx` → `export function FacturationView()`
  - `/src/components/dashboard/views/comptabilite-view.tsx` → `export function ComptabiliteView()`
  - `/src/components/dashboard/views/parametres-view.tsx` → `export function ParametresView()`
  - `/src/components/dashboard/views/assistance-view.tsx` → `export function AssistanceView()`
- **Design system** : orange primary #FF6B47 (oklch(0.665 0.193 32.7)), cartes blanches border-border rounded-xl p-5, badges avec dot, tableaux avec custom-scrollbar, format XOF
- **Composants partagés disponibles** dans `@/components/dashboard/views/shared` : ViewHeader, StatusBadge, ActionButton, Card, formatXOF, initials
- **Données mockées** dans `@/lib/mock-data` : tous les tableaux exportés nommément

---
Task ID: 2-b
Agent: full-stack-developer (scheduling views)
Task: Créer les vues Planning & Séances, Examens & Sessions, Bordereaux

Work Log:
- Lu `/home/z/my-project/worklog.md` pour comprendre l'infrastructure existante (nav store Zustand, mock data, shared components)
- Lu `/home/z/my-project/src/lib/mock-data.ts` pour identifier les exports `seances`, `examens`, `examenSessions`, `StatutSeance`, `ResultatExamen`, `CandidatSession`
- Lu `/home/z/my-project/src/components/dashboard/views/shared.tsx` pour aligner sur ViewHeader, StatusBadge (tons primary/emerald/amber/rose/sky/slate), ActionButton, Card, formatXOF, initials
- Lu `/home/z/my-project/src/components/ui/tabs.tsx` pour confirmer l'API des Tabs shadcn (Tabs / TabsList / TabsTrigger / TabsContent)
- Lu `/home/z/my-project/src/store/nav-store.ts` pour confirmer `useNavStore.setActiveView('bordereaux')`
- Lu `globals.css` pour confirmer la classe `custom-scrollbar`
- Créé `planning-view.tsx` : KPI row (4 cartes), filtre statut useState, table avec formatDateFr "Mer 02 Déc", durée badge, avatars initiales, StatusBadge tones (Planifié=primary, Effectué=emerald, Absent élève=amber, Annulé=rose), footer avec count + pagination
- Créé `examens-view.tsx` : 2 tabs shadcn — Examens individuels (table) + Sessions collectives (grid de cartes avec bouton "Voir le bordereau" qui appelle setActiveView('bordereaux'))
- Créé `bordereaux-view.tsx` : pour chaque session, carte avec header (numeroBordereau monospace + FileDown outline + ClipboardEdit primary), grille d'infos 2x4, table candidats avec N° / Nom / Identifiant / Téléphone / Catégorie / Résultat StatusBadge

Stage Summary:
- Files created:
  - `/src/components/dashboard/views/planning-view.tsx` → `export function PlanningView()`
  - `/src/components/dashboard/views/examens-view.tsx` → `export function ExamensView()`
  - `/src/components/dashboard/views/bordereaux-view.tsx` → `export function BordereauxView()`
- Tous les composants sont des client components avec export nommé (pas de default export)
- Design system respecté : orange primary, cartes rounded-xl border border-border bg-card p-5, tableaux custom-scrollbar, en-têtes text-xs uppercase tracking-wider text-muted-foreground, badges avec dot, boutons h-9 rounded-lg px-3
- Helper `formatDateFr()` pour convertir ISO "2026-12-02" → "Mer 02 Déc" (jours/mois français abrégés)
- Helper `dureeLabel()` pour 90min → "1h30", 60min → "1h"
- Helper `resultatTone()` : En attente=amber, Admis=emerald, Échec=rose
- Helper `statutTone()` : Planifié=primary, Effectué=emerald, Absent élève=amber, Annulé=rose
- Helper `typeExamenBadge()` : Code=sky, Conduite=primary
- Navigation inter-vues via `useNavStore.setActiveView('bordereaux')` dans la carte de session collective
- Texte français partout, responsive (mobile-first avec grid-cols-2 / sm:grid-cols-4 / md:grid-cols-2 xl:grid-cols-3)
- Aucun appel API, aucune DB — 100% mock data

---
Task ID: 2-a
Agent: full-stack-developer (registry views)
Task: Créer les vues Élèves, Scanner CNI, Moniteurs, Véhicules

Work Log:
- Lu worklog.md et mock-data.ts pour comprendre l'infrastructure existante (nav store, mock data, shared components)
- Lu shared.tsx pour vérifier l'API exacte : ViewHeader, StatusBadge (6 tons), ActionButton, Card, formatXOF, initials
- Vérifié la disponibilité des composants shadcn (Input, Select avec radix)
- Créé `/src/components/dashboard/views/eleves-view.tsx` : ViewHeader + 4 KPI cards (Total 248, En formation 142, Admis 38, Taux 78,5%) + toolbar (recherche + 9 filtres statut en pills + bouton Ajouter) + table 10 colonnes (Code, Élève avec avatar+email, Téléphone, Type permis, Statut badge, Séances avec progress bar, Solde formatXOF, Parrainé badge, Moniteur, Actions) + footer pagination (Affichage X à Y sur 248 + Précédent/Suivant). Mapping statut→tone respecté (Prospect=slate, Inscrit=sky, En formation=primary, Examen=amber, Admis=emerald, Ajourné=rose, Terminé=emerald, Abandon=slate). useState recherche + statutFiltre + page, useMemo pour filtrage.
- Créé `/src/components/dashboard/views/scanner-cni-view.tsx` : layout 2 colonnes (lg:grid-cols-2). LEFT card : zone webcam aspect-video dashed border (Caméra inactive / active / scanning avec Loader2 + ligne de scan animée), boutons Activer la caméra (primary) + Scanner (outline, disabled tant que caméra inactive), note box sky. RIGHT card : 5 champs read-only (Nom, Prénom, Date naissance, Numéro pièce, Type pièce select) pré-remplis après scan simulé (setTimeout 1500ms → Nom=Brou, Prénom=Koffi, Date=1996-03-15, Num=CNI-556677-A, Type=CNI), 4 champs éditables (Téléphone, Email, Type permis A/B/AB, Nationalité), bouton Créer l'élève (UserPlus, disabled tant que pas scanned). useState cameraActive, isScanning, scanned + champs extraits/éditables. useRef pour clear timeout.
- Créé `/src/components/dashboard/views/moniteurs-view.tsx` : ViewHeader avec action Ajouter un moniteur (UserPlus) + 3 KPI cards (Total 6, Disponibles 4, En mission 1) + grid sm:grid-cols-2 lg:grid-cols-3 de cartes moniteurs. Chaque carte : avatar initials circle (bg-primary/10), nom complet, badge spécialité (Code=sky, Conduite=primary), StatusBadge statut (Disponible=emerald, En mission=amber, Absent=rose), téléphone/email, footer "X séances animées".
- Créé `/src/components/dashboard/views/vehicules-view.tsx` : ViewHeader avec action Ajouter un véhicule (Plus) + 3 KPI cards (Total 6, Disponibles 4, En maintenance 1) + grid sm:grid-cols-2 lg:grid-cols-3 de cartes véhicules. Chaque carte : icône Car dans cercle coloré selon état (emerald/amber/rose), marque + modele bold, immatriculation monospace en badge, StatusBadge état, stats row 2 colonnes (X séances + Dernière dépense date).

Stage Summary:
- Files created:
  - `/src/components/dashboard/views/eleves-view.tsx` (ElevesView)
  - `/src/components/dashboard/views/scanner-cni-view.tsx` (ScannerCniView)
  - `/src/components/dashboard/views/moniteurs-view.tsx` (MoniteursView)
  - `/src/components/dashboard/views/vehicules-view.tsx` (VehiculesView)
- Design system respecté : orange primary (bg-primary/text-primary-foreground), cartes rounded-xl border-border bg-card p-5, tables avec custom-scrollbar + headers uppercase tracking-wider, StatusBadge avec tons cohérents, formatXOF() pour la monnaie, avatars initials bg-primary/10.
- Décisions clés :
  - Élèves : filtres statut implémentés en pills horizontales scrollables (plutôt qu'un select) pour un meilleur visuel, recherche full-text sur nom/code/tel/email/permis, barre de progression des séances dans la table, distinction solde >0 (rose) vs soldé (emerald).
  - Scanner CNI : simulation OCR via setTimeout 1500ms avec état isScanning (Loader2 + ligne animée keyframe `scan`), champs extraits en Input readOnly bg-muted/50 pour distinguer du pré-rempli vs éditable, bouton Créer désactivé tant que pas scanned.
  - Moniteurs/Véhicules : KPI cards réutilisant le pattern de eleves-view (icône dans pastille colorée + label + valeur), cartes en grid responsive avec hover-none mais visuel clair.
  - Tous les boutons primaires utilisent `bg-primary text-primary-foreground hover:bg-primary/90` via ActionButton ou styling manuel identique.
  - Aucun import API/db — frontend only avec mock data conforme à la spec.

---
Task ID: 2-c
Agent: full-stack-developer (finance & general views)
Task: Créer les vues Facturation, Comptabilité, Paramètres, Assistance

Work Log:
- Lu worklog.md et mock-data.ts pour comprendre l'infrastructure existante (shared.tsx, données mockées, design system orange primary).
- Vérifié la disponibilité des composants shadcn (tabs.tsx, accordion.tsx) et leurs signatures.
- Créé `facturation-view.tsx` :
  - ViewHeader + bouton "Nouvelle facture" (Plus).
  - 4 KPI cards (CA total, Encaissé, En attente, Factures impayées) avec tons colorés.
  - Tabs "Factures" | "Paiements".
  - Tab Factures : toolbar (search + filtre statut pills + bouton WhatsApp emerald), table avec colonnes Numéro (mono bold), Élève (avatar initials + code mono), Formation, Montant, Payé (emerald), Reste (rose si >0), Statut (StatusBadge), Date émission, Actions (Eye/Download/WhatsApp si Impayée). Filtre par statut + recherche en useMemo.
  - Tab Paiements : table avec Facture (mono), Élève (avatar), Montant (bold emerald), Mode paiement (badge custom avec icône Banknote/Smartphone/Building2), Référence (mono), Date.
- Créé `comptabilite-view.tsx` :
  - ViewHeader + bouton "Nouvelle dépense".
  - 3 KPI cards (Total dépenses rose, Dépenses véhicules primary, Salaires emerald).
  - Card "Répartition par catégorie" : 7 barres de progression colorées (Carburant=primary, Entretien=sky, Réparations=rose, Assurance=amber, Salaires=emerald, Fournitures=slate, Autres=slate) avec icône, label, montant formatXOF et % calculé via useMemo sur le total des dépenses mock.
  - Table des dépenses : Date, Catégorie (badge coloré avec icône), Description, Véhicule, Mode paiement (badge), Montant (bold), Justificatif (bouton Paperclip), Actions (Eye/Pencil). Recherche par description/catégorie/véhicule.
- Créé `parametres-view.tsx` :
  - ViewHeader sans actions.
  - 3 tabs : "Mon profil" | "Équipe" | "Catalogue".
  - Tab Mon profil : Card avec avatar large AD (orange), badge Admin Principal, grille de champs read-only (Nom, Email, Rôle, Téléphone, Auto-école, Adresse) avec icônes, bouton "Modifier".
  - Tab Équipe : table profiles avec Utilisateur (avatar + name), Email, Rôle (StatusBadge tons primary/sky/amber/slate), Statut (Actif=emerald / Inactif=slate), Actions.
  - Tab Catalogue : grille 1/3 — Card "Types de permis" (badges code A/AB/B/C colorés primary + libellé) et Card "Formations" (table nom, description, prix formatXOF primary bold, statut Actif/Inactif).
- Créé `assistance-view.tsx` :
  - ViewHeader.
  - Grille 3 cards help topics (BookOpen primary, PlayCircle sky, Mail emerald) avec titre + description + lien "En savoir plus".
  - Card FAQ : Accordion shadcn (single collapsible) avec 6 questions mockées, numérotation 1-6 dans pastille orange, ChevronDown rotation auto via AccordionTrigger. Scroll vertical max-h-480px.
  - Card contact "Besoin d'aide supplémentaire ?" avec LifeBuoy icon, email support@sarahauto.ci et téléphone +225 07 00 00 00 (boutons Mail et Phone cliquables).
- Supprimé imports inutilisés (CreditCard, ChevronDown, ShieldCheck, tone non utilisé dans modePaiementConfig) pour garder un code propre.

Stage Summary:
- Files created:
  - `/src/components/dashboard/views/facturation-view.tsx` → `export function FacturationView()`
  - `/src/components/dashboard/views/comptabilite-view.tsx` → `export function ComptabiliteView()`
  - `/src/components/dashboard/views/parametres-view.tsx` → `export function ParametresView()`
  - `/src/components/dashboard/views/assistance-view.tsx` → `export function AssistanceView()`
- Toutes les vues sont des client components avec named export, utilisent ViewHeader/Card/StatusBadge/ActionButton/formatXOF/initials de `./shared` quand pertinent.
- Design system respecté : orange primary, cartes rounded-xl border-border p-5, tables avec custom-scrollbar + divide-y, badges avec dot via StatusBadge, badges mode paiement/catégorie custom avec icônes Lucide.
- Données mockées consommées depuis `@/lib/mock-data` : factures, paiements, depenses, profiles, permis, formations, faq (+ types StatutFacture, ModePaiement, CategorieDepense, Role).
- Pas de lint/build lancé conformément aux consignes.

---
Task ID: 1 (phase 2)
Agent: Main (orchestrator)
Task: Auth infrastructure — auth store, modal components, page.tsx gating for login/admin/eleve modes

Work Log:
- Créé `/src/store/auth-store.ts` : store Zustand avec isAuthenticated, user (AdminUser|EleveUser), loginAdmin(email,password), loginEleve(code,telephone), logout(). Mock : loginEleve vérifie code+téléphone contre les élèves mockés (ex: EL-2401 + +225 07 12 34 56 = Aminata Koné). loginAdmin accepte n'importe quel email, mappe les profils connus (a.diallo@sarahauto.ci → Aïcha Diallo / Admin Principal).
- Créé `/src/components/dashboard/modal.tsx` : Modal (wrapper Dialog shadcn, sizes sm/md/lg/xl), Field (label + required), FormInput, FormSelect, FormTextarea — design system cohérent (border-input, focus:ring-ring/40)
- Mis à jour `/src/store/nav-store.ts` : ajouté les ViewKey étudiants (student-dashboard, student-planning, student-factures, student-profil)
- Mis à jour `/src/app/page.tsx` : gating en 3 modes — non authentifié → LoginView, mode eleve → StudentSidebar + StudentHeader + studentViewMap, mode admin → Sidebar + Header + viewMap
- Mis à jour `/src/components/dashboard/views/deconnexion-view.tsx` : utilise useAuthStore.logout()

Stage Summary:
- Infrastructure d'authentification complète
- **Les composants suivants DOIVENT être créés** par les sous-agents (Phase 2) :
  - `/src/components/dashboard/login-view.tsx` → `export function LoginView()` (Task 2-a)
  - `/src/components/dashboard/student-sidebar.tsx` → `export function StudentSidebar()` (Task 2-b)
  - `/src/components/dashboard/student-header.tsx` → `export function StudentHeader()` (Task 2-b)
  - `/src/components/dashboard/views/student-dashboard-view.tsx` → `export function StudentDashboardView()` (Task 2-b)
  - `/src/components/dashboard/views/student-planning-view.tsx` → `export function StudentPlanningView()` (Task 2-b)
  - `/src/components/dashboard/views/student-factures-view.tsx` → `export function StudentFacturesView()` (Task 2-b)
  - `/src/components/dashboard/views/student-profil-view.tsx` → `export function StudentProfilView()` (Task 2-b)
  - `/src/components/dashboard/dialogs/eleve-detail-dialog.tsx` → `export function EleveDetailDialog({ eleveCode, open, onOpenChange })` (Task 2-c)
  - `/src/components/dashboard/dialogs/nouvelle-seance-dialog.tsx` → `export function NouvelleSeanceDialog({ open, onOpenChange })` (Task 2-c)
  - `/src/components/dashboard/dialogs/saisie-resultats-dialog.tsx` → `export function SaisieResultatsDialog({ session, open, onOpenChange })` (Task 2-c)
  - `/src/components/dashboard/dialogs/nouvelle-facture-dialog.tsx` → `export function NouvelleFactureDialog({ open, onOpenChange })` (Task 2-c)
  - `/src/components/dashboard/dialogs/nouvel-eleve-dialog.tsx` → `export function NouvelEleveDialog({ open, onOpenChange })` (Task 2-c)
- **Auth mock** : loginEleve("EL-2401", "+225 07 12 34 56") → Aminata Koné ; loginAdmin("a.diallo@sarahauto.ci", "anything") → Aïcha Diallo
- **Composants partagés** : Modal/Field/FormInput/FormSelect/FormTextarea dans `@/components/dashboard/modal` ; ViewHeader/StatusBadge/ActionButton/Card/formatXOF/initials dans `@/components/dashboard/views/shared`

---
Task ID: 2-a
Agent: full-stack-developer (login view)
Task: Créer la vue Login (admin + portail élève)

Work Log:
- Lu `/home/z/my-project/worklog.md` (sections Task 1 phase 2 + auth-store) pour comprendre l'infrastructure d'authentification déjà en place (useAuthStore.loginAdmin / loginEleve, gating dans page.tsx)
- Lu `/src/store/auth-store.ts` pour confirmer les signatures : loginAdmin(email, password) → boolean (toujours true, mappe a.diallo@sarahauto.ci → Aïcha Diallo), loginEleve(code, telephone) → boolean (vérifie code+téléphone contre eleves mockés, ex EL-2401 + +225 07 12 34 56 → Aminata Koné)
- Lu `/src/app/page.tsx` pour confirmer que LoginView est rendue quand !isAuthenticated
- Lu `/src/components/ui/tabs.tsx` pour confirmer l'API shadcn (Tabs / TabsList / TabsTrigger / TabsContent)
- Créé `/src/components/dashboard/login-view.tsx` : `export function LoginView()` (client component)
- Layout split-screen : grid min-h-screen lg:grid-cols-2
  - LEFT (hidden lg:flex) : panneau branding plein écran, gradient orange (bg-gradient-to-br from-primary to-primary/80), 3 cercles décoratifs absolus bg-white/10, logo GraduationCap dans carré blanc + "SARAH AUTO / ERP Auto-École", headline "Pilotez votre auto-école en toute simplicité", paragraphe marketing, 3 bullets CheckCircle2 (Gestion centralisée / Planning & examens / Comptabilité), copyright année courante
  - RIGHT : main centré, max-w-md, en-tête mobile (logo + brand, visible lg:hidden), carte rounded-xl border-border bg-card p-8 shadow-lg
- Tabs shadcn à 2 colonnes (grid grid-cols-2 h-11) : "Espace Administration" (icône User) | "Portail Élève" (icône GraduationCap). Active = bg-background shadow-sm
- Bannière d'erreur partagée (rose-50 / border-rose-200, AlertCircle) au-dessus des contenus, affiche error state
- Tab Admin :
  - Titre "Connexion Administration" + sous-titre "Email et mot de passe"
  - Champ Email (input type=email, icône Mail à gauche, pl-10) + champ Mot de passe (icône Lock, bouton Eye/EyeOff à droite pour toggle visibilité)
  - Bouton "Se connecter" (LogIn, h-11 full width bg-primary text-primary-foreground hover:bg-primary/90, état loading avec Loader2 spin)
  - Hint box bg-muted : "Démo : a.diallo@sarahauto.ci / n'importe quel mot de passe"
  - Validation : email requis + doit contenir @, password requis (min 1 char)
  - On submit : setLoading(true) → setTimeout 600ms → loginAdmin(email, password). Si true, le store met à jour isAuthenticated et page.tsx bascule automatiquement vers le dashboard admin
- Tab Élève :
  - Titre "Connexion Élève" + sous-titre "Code dossier et numéro de téléphone"
  - Champ Code dossier (icône Hash, placeholder "EL-XXXX") + champ Téléphone (icône Phone, placeholder "+225 07 12 34 56")
  - Bouton "Accéder à mon espace" (LogIn, même style que bouton admin)
  - Hint box bg-muted : "Démo : EL-2401 / +225 07 12 34 56"
  - Validation : code requis, telephone requis
  - On submit : setLoading(true) → setTimeout 600ms → loginEleve(code, telephone). Si false, setError("Code dossier ou téléphone incorrect.") et setLoading(false)
- États useState : activeTab ('admin'|'eleve'), email, password, code, telephone, error, showPassword, loading
- resetError() appelé à chaque onChange pour effacer la bannière d'erreur dès que l'utilisateur corrige
- switchTab() réinitialise error + loading lors du changement d'onglet
- Inputs : h-11 rounded-lg border border-input bg-background pl-10 text-sm focus:border-primary focus:ring-2 focus:ring-ring/40 (aligné sur la spec)
- Responsive : mobile-first, panneau branding caché < lg, en-tête brand mobile dédié, formulaire centré avec padding adaptatif (p-6 sm:p-10)

Stage Summary:
- File created: `/src/components/dashboard/login-view.tsx` → `export function LoginView()`
- Design system respecté : orange primary via bg-gradient-to-br from-primary to-primary/80 sur le panneau gauche, cartes rounded-xl border-border bg-card p-8 shadow-lg, boutons h-11 bg-primary text-primary-foreground hover:bg-primary/90, inputs h-11 pl-10 focus:ring-ring/40
- Utilise le store d'auth existant (useAuthStore) sans aucune modification backend — mock auth 100% frontend
- L'app auto-bascule vers admin dashboard ou student portal dès que loginAdmin/loginEleve retourne true (géré par page.tsx déjà en place)
- Tabs shadcn (Tabs/TabsList/TabsTrigger/TabsContent) pour le design deux-onglets, avec TabsList en grid-cols-2 w-full h-11
- Lucide icons utilisés : GraduationCap, CheckCircle2, Mail, Lock, Eye, EyeOff, Hash, Phone, LogIn, Loader2, AlertCircle, User
- Texte français partout, hints démo visibles pour faciliter les tests
- Pas de lint/build lancé conformément aux consignes

---
Task ID: 2-b
Agent: full-stack-developer (student portal)
Task: Créer le Portail Élève (sidebar, header, 4 vues)

Work Log:
- Lu `/home/z/my-project/worklog.md` (section "Task ID: 1 (phase 2)") pour comprendre l'infra d'auth/nav : `useAuthStore` (loginEleve mock pour EL-2401 → Aminata Koné), `useNavStore` (ViewKey incluant student-*), `page.tsx` gating 3 modes (login/eleve/admin), `studentViewMap` déjà cablé dans page.tsx
- Lu `/src/lib/mock-data.ts` pour confirmer la structure des élèves (dateNaissance, lieuNaissance, nationalite, typePiece, numPiece, typePermis, statut, seancesFaites/Totales, solde) et les séances/factures/paiements avec eleveCode/facture link
- Lu `/src/components/dashboard/views/shared.tsx` pour aligner sur ViewHeader, StatusBadge (6 tons), ActionButton, Card, formatXOF, initials
- Lu `/src/components/dashboard/sidebar.tsx` et `header.tsx` pour réutiliser les patterns visuels (logo GraduationCap orange, collapse ChevronLeft, avatars initials, hover effects)
- Lu `/src/store/auth-store.ts` pour confirmer EleveUser {mode, code, nomComplet, telephone, email, typePermis, statut} et logout()
- Créé `student-sidebar.tsx` : sidebar simplifiée w-[240px] (78px collapsed), logo SARAH AUTO + sous-titre "Mon Espace", 4 nav items (Accueil/LayoutGrid, Mon Planning/CalendarDays, Mes Factures/Receipt, Mon Profil/User), Déconnexion en bas (rose au hover) qui appelle `useAuthStore().logout()`, garde le toggle ChevronLeft
- Créé `student-header.tsx` : greeting "Bonjour, {prenom}" + statut badge (tone mapping Prospect→slate, Inscrit→sky, En formation→primary, Examen→amber, Admis/Terminé→emerald, Ajourné→rose, Abandon→slate), cloche notif avec dot orange, icône aide, avatar initials + nom complet + code mono. h-16 border-b bg-card px-4 sm:px-6
- Créé `student-dashboard-view.tsx` : ViewHeader "Bonjour {prenom} 👋", 3 KPI cards (sm:grid-cols-3) — Séances effectuées 12/20 avec progress bar orange, Prochaine séance (date+heure+moniteur via lookup mock), Solde restant formatXOF avec badge Paiement en attente/Soldé. Card "Mes prochaines séances" (lg:col-span-3) avec liste des séances Planifié date>=TODAY, chaque item = mini calendrier orange + horaire + moniteur + véhicule + badge Planifié. Card "Mon parcours" (lg:col-span-2) avec stepper vertical 5 étapes (Prospect→Inscrit→En formation→Examen→Admis), étape active = ring orange, étapes done = check orange, pending = muted. Helper `lifecycleIndex()` mappe Ajourné→Examen, Terminé→Admis
- Créé `student-planning-view.tsx` : ViewHeader, filtre toggle 3 boutons (À venir / Passées / Toutes) avec compteurs entre (), groupage par date avec header mini-calendrier orange + nom du jour long, chaque séance = badge durée + StatusBadge statut (Planifié=primary, Effectué=emerald, Absent élève=amber, Annulé=rose) + horaire en card + moniteur + véhicule + notes (si présentes) dans un bloc muted. Empty state CalendarX dans cercle muted
- Créé `student-factures-view.tsx` : ViewHeader, 3 summary cards (Total facturé, Total payé emerald, Reste à payer rose si >0), Tabs shadcn "Factures" | "Reçus de paiement". Tab Factures : table 8 colonnes (Numéro mono, Formation, Montant, Payé emerald, Reste rose si >0, Statut StatusBadge, Date, Télécharger PDF). Tab Reçus : table 6 colonnes (Facture mono, Montant bold emerald, Mode paiement badge custom avec icône Banknote/Smartphone/Building2, Référence mono, Date, Télécharger le reçu). Boutons Download utilisent un composant `DownloadButton` avec useState générant un état "Génération..." pendant 1.5s (Loader2 animate-spin)
- Créé `student-profil-view.tsx` : ViewHeader, layout lg:grid-cols-3. Card gauche (1/3) : avatar 24x24 orange avec bouton camera (visuel), nom + code mono + StatusBadge statut + badge Permis, quick stats (séances faites/total + date inscription), bouton "Modifier mes informations" qui toggle editMode. Card droite (2/3) : grille 2 colonnes InfoRow avec icône + label + valeur (Nom complet, Code dossier mono, Téléphone, Email, Type de permis, Statut, Date naissance formatée "12 avril 1998", Lieu naissance, Nationalité, Pièce d'identité type+numéro mono). En editMode → 3 champs éditables (Téléphone, Email, Nationalité) via input shadcn-style + bouton "Enregistrer les modifications" (Check icon)
- Supprimé l'import MapPin inutilisé dans student-planning-view pour garder un code propre

Stage Summary:
- Files created:
  - `/src/components/dashboard/student-sidebar.tsx` → `export function StudentSidebar()`
  - `/src/components/dashboard/student-header.tsx` → `export function StudentHeader()`
  - `/src/components/dashboard/views/student-dashboard-view.tsx` → `export function StudentDashboardView()`
  - `/src/components/dashboard/views/student-planning-view.tsx` → `export function StudentPlanningView()`
  - `/src/components/dashboard/views/student-factures-view.tsx` → `export function StudentFacturesView()`
  - `/src/components/dashboard/views/student-profil-view.tsx` → `export function StudentProfilView()`
- Tous les composants sont des client components avec export nommé, guard `if (!user || user.mode !== 'eleve') return null` en tête de chaque vue
- Design system respecté : orange primary (bg-primary/text-primary-foreground), cartes rounded-xl border border-border bg-card p-5, tables custom-scrollbar + headers uppercase tracking-wider, StatusBadge avec tons cohérents, formatXOF() pour la monnaie, avatars initials bg-primary/10
- Décisions clés :
  - Sidebar plus étroite (w-[240px] vs 260 admin) sans sections ni badges ni upgrade card — pure liste + bouton Déconnexion en bas
  - Header plus compact : pas de barre de recherche (non pertinent pour un élève), greeting + statut badge visibles
  - "TODAY" fixé à '2026-12-02' pour aligner avec la timeline des données mockées (sinon toutes les séances seraient "passées" aujourd'hui)
  - Stepper "Mon parcours" en vertical plutôt qu'horizontal pour mieux tenir sur mobile (cahier des charges = "conçu spécifiquement pour le téléphone mobile")
  - Boutons "Télécharger PDF" / "Télécharger le reçu" = simulation visuelle (Loader2 + "Génération..." pendant 1.5s) sans génération réelle
  - Profil : mode édition basique (3 champs éditables : téléphone, email, nationalité) sans persistance — les autres champs restent en lecture seule car non modifiables par l'élève
- Navigation inter-vues via `useNavStore.setActiveView('student-*')` dans la sidebar
- Texte français partout, responsive mobile-first (grid-cols-1 / sm:grid-cols-2 / sm:grid-cols-3 / lg:grid-cols-3 ou 5)
- Aucun appel API, aucune DB — 100% mock data, conformément à la consigne "FRONTEND ONLY"

---
Task ID: 2-c
Agent: full-stack-developer (admin dialogs)
Task: Créer les dialogs admin (fiche élève, nouvelle séance, saisie résultats, nouvelle facture, nouvel élève)

Work Log:
- Lu `/home/z/my-project/worklog.md` (sections Task 1 phase 2 + Task 2-a + Task 2-b) pour comprendre l'infrastructure modale (`Modal`, `Field`, `FormInput`, `FormSelect`, `FormTextarea` dans `@/components/dashboard/modal`), les shared helpers (`StatusBadge` 6 tons, `formatXOF`, `initials`), et le design system (orange primary).
- Lu `/src/components/dashboard/modal.tsx` pour confirmer les signatures exactes : Modal({open, onOpenChange, title, description, children, footer, size}) avec size 'sm'|'md'|'lg'|'xl' → max-w-md/lg/2xl/4xl. FormInput/FormSelect en h-10 rounded-lg, FormTextarea sans h fixe.
- Lu `/src/components/dashboard/views/shared.tsx` : StatusBadge({label, tone}) avec tones primary/emerald/amber/rose/sky/slate, formatXOF(value) → "45 000 F", initials(name) → "AK".
- Lu `/src/lib/mock-data.ts` pour valider les champs élèves (code, nom, prenom, telephone, email, dateNaissance, lieuNaissance, sexe, nationalite, typePiece, numPiece, typePermis, statut, seancesFaites/Totales, estParraine, parrainNom, moniteur, dateInscription, solde), séances (eleveCode, moniteur, vehicule, date, heureDebut/Fin, statut), examens (eleveCode, typeExamen, typePermis, dateExamen, inspecteur, resultat, notes), factures (eleveCode, numero, montant, paye, reste, statut, dateEmission), vehicules (etat), formations (id, nom, prix, actif).
- Confirmé la présence de `@/components/ui/tabs` (shadcn Tabs) pour le dialog détail élève.
- Créé `nouvel-eleve-dialog.tsx` (size 'lg') : 4 sections (Identité, Coordonnées, Pièce d'identité, Formation) avec labels `text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3`. 14 champs en useState (nom, prenom, dateNaissance, lieuNaissance, sexe, nationalite, telephone, email, adresse, typePiece, numPiece, typePermis, codeDossier, parrain). Chaque champ wrappé dans Field avec required*. Footer : bouton Annuler (outline) + bouton "Créer l'élève" (UserPlus icon, primary). Grille responsive sm:grid-cols-2.
- Créé `eleve-detail-dialog.tsx` (size 'xl') : lookup `eleves.find(e => e.code === eleveCode)`. Si !eleve → Modal vide avec message "Aucun élève sélectionné." (plutôt que return null pour préserver l'animation Dialog). En-tête card avec avatar h-16 w-16 bg-primary/10 text-primary (initials), nom complet text-xl font-bold, StatusBadge statut (mapping tones : Prospect→slate, Inscrit→sky, En formation→primary, Examen→amber, Admis/Terminé→emerald, Ajourné→rose, Abandon→slate), code dossier mono + permis + date inscription. Barre de progression séances (bg-muted rounded-full h-2.5, inner div bg-primary width %, calcul progressPct). Tabs shadcn 4 colonnes : Informations (grid 2 colonnes InfoRow label/value, formatDate() fr-FR pour YYYY-MM-DD), Séances (mini-table filtrée Date/Horaire/Moniteur/Véhicule/Statut StatusBadge), Examens (Type/Date/Inspecteur/Résultat StatusBadge/Notes), Factures (Numéro mono/Montant/Payé emerald/Reste rose/Statut StatusBadge/Date). Toutes les tables avec sticky header bg-muted/60, max-h-80 overflow-y-auto. Footer : Fermer + Modifier (Pencil icon).
- Créé `nouvelle-seance-dialog.tsx` (size 'md') : 8 champs useState (eleveCode, moniteurId, vehiculeId, date, heureDebut, heureFin, type, notes). FormSelect Élève map eleves → option "Prénom Nom (EL-XXXX)". FormSelect Moniteur map moniteurs → option "Prénom Nom". FormSelect Véhicule filtre vehicules.etat==='Disponible' → option "Marque Modèle (immat)", avec note text-xs muted "Seuls les véhicules disponibles sont proposés". Date/Heure début/Heure fin en type date/time. Type select Conduite/Code. Notes FormTextarea optionnel. Footer : Annuler + Planifier la séance (CalendarPlus).
- Créé `saisie-resultats-dialog.tsx` (size 'xl') : guard `if (!session)` → Modal vide. useState<ResultRow[]> initialisé via useEffect quand session change (reset sur numeroBordereau changement). Bannière session bg-muted p-3 grid 5 colonnes (Date/Calendar, Heure/Clock, Centre/MapPin, Type/Award, Inspecteur/User) avec icônes primary. Table éditable : N°, Candidat, Identifiant (mono), Catégorie, Résultat (select En attente/Admis/Échec inline, onChange updateResultat), Notes (input inline, onChange updateNotes). Résumé coloré en bas : "X Admis" emerald + "Y Échec" rose + "Z En attente" amber via StatusBadge. Footer : Annuler + Enregistrer les résultats (Save icon).
- Créé `nouvelle-facture-dialog.tsx` (size 'md') : useState eleveCode, formationId, montant (number), dateEmission (default today via new Date().toISOString().split('T')[0]), notes. useEffect sur formationId → setMontant(formation.prix) automatiquement. FormSelect Élève map eleves. FormSelect Formation filtre formations.actif → option "nom — {formatXOF(prix)}". FormInput Montant type=number editable (value=montant). FormInput Date type=date default today. FormTextarea Notes optionnel. Aperçu en direct bg-muted p-3 : "Montant total" + formatXOF(montant) en text-lg font-bold text-primary. Footer : Annuler + Émettre la facture (Receipt icon).
- Tous les fichiers commencent par `'use client'` et utilisent un NAMED export (pas default).
- Aucun appel API ni DB — 100% mock data et useState local.
- Texte français partout, responsive mobile-first (grid-cols-1 / sm:grid-cols-2 / lg:grid-cols-5).
- Design system cohérent : orange primary (bg-primary/text-primary-foreground), boutons primary h-10 px-4 rounded-lg, boutons outline border-input bg-background, cartes rounded-xl border-border bg-card, tables sticky-header bg-muted/60 backdrop-blur avec max-h-scroll.

Stage Summary:
- Files created:
  - `/src/components/dashboard/dialogs/nouvel-eleve-dialog.tsx` → `export function NouvelEleveDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/eleve-detail-dialog.tsx` → `export function EleveDetailDialog({ eleveCode, open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouvelle-seance-dialog.tsx` → `export function NouvelleSeanceDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/saisie-resultats-dialog.tsx` → `export function SaisieResultatsDialog({ session, open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouvelle-facture-dialog.tsx` → `export function NouvelleFactureDialog({ open, onOpenChange })`
- Tous les dialogs utilisent le Modal partagé (4 tailles sm/md/lg/xl) avec footer à 2 boutons (Annuler/Fermer outline + action principale primary avec icône Lucide : UserPlus, Pencil, CalendarPlus, Save, Receipt).
- Champs de formulaire stylés via FormInput/FormSelect/FormTextarea du module modal, chaque champ wrappé dans Field avec label et indicateur required* orange.
- Fiche élève (EleveDetailDialog) : composant le plus riche — en-tête card (avatar+statut), barre de progression séances, Tabs shadcn 4 onglets (Informations/Séances/Examens/Factures) avec tables filtrées par eleveCode et StatusBadge colorés selon le contexte.
- Saisie résultats : useEffect reset state sur changement de session, édition inline des résultats via select + input notes, résumé coloré dynamique (admis/échec/attente) calculé en temps réel.
- Nouvelle facture : useEffect auto-remplit le montant quand une formation est sélectionnée, aperçu en direct formatXOF(montant) en bas.
- Pas de lint/build lancé conformément aux consignes.

---
Task ID: 3 (phase CRUD)
Agent: Main (orchestrator)
Task: CRUD foundation — data-store, PDF, WhatsApp utilities

Work Log:
- Créé `/src/store/data-store.ts` : store Zustand avec toutes les entités (eleves, moniteurs, vehicules, formations, permis, inspecteurs, seances, examens, examenSessions, factures, paiements, depenses, profiles, auditLog) + actions de mutation (add/update/delete) pour chaque entité. addPaiement recalcule automatiquement le solde et le statut de la facture. logAction push dans auditLog.
- Créé `/src/lib/utils-docs.ts` : 
  - WhatsApp: sanitizePhone(), relanceWhatsApp(tel, msg), messageRelanceFacture() 
  - PDF (jsPDF + jspdf-autotable): generateFacturePdf(), generateRecuPdf(), generateBordereauPdf() — bande orange d'en-tête, tableaux autoTable, totaux, footer
- Installé jspdf + jspdf-autotable via bun add

Stage Summary:
- Foundation CRUD prête. Les sous-agents doivent maintenant :
  1. Câbler les dialogs existants au data-store (nouvel-eleve, nouvelle-seance, nouvelle-facture, saisie-resultats)
  2. Créer les dialogs manquants (moniteur, véhicule, dépense, paiement, examen, session, formation)
  3. Migrer les vues vers useDataStore au lieu d'importer mock-data directement
  4. Fix les valeurs hardcodées (KPIs, unpaid-invoices, total élèves)
  5. Câbler les boutons PDF (facture, reçu, bordereau) et WhatsApp (relances)
- API du store: useDataStore(s => s.eleves), useDataStore(s => s.addEleve), etc.
- API PDF: import { generateFacturePdf, generateRecuPdf, generateBordereauPdf } from '@/lib/utils-docs'
- API WhatsApp: import { relanceWhatsApp, messageRelanceFacture } from '@/lib/utils-docs'

---
Task ID: 4-b
Agent: full-stack-developer (missing CRUD dialogs)
Task: Créer les dialogs manquants (moniteur, véhicule, dépense, paiement, examen, session)

Work Log:
- Lu `/home/z/my-project/worklog.md` (section "Task ID: 3 (phase CRUD)") pour comprendre l'API du data-store Zustand (`addMoniteur`, `addVehicule`, `addDepense`, `addPaiement`, `addExamen`, `addExamenSession`) et la structure des entités (factures avec reste/paye, eleves avec statut/typePermis, vehicules avec etat, inspecteurs avec actif, examenSessions avec candidats[]).
- Lu `/src/store/data-store.ts` : confirmé les signatures exactes (addPaiement recalcule auto le solde + statut de la facture, addExamenSession génère un numéroBordereau BORD-YYYY-NNN).
- Lu `/src/components/dashboard/modal.tsx` : Modal({open, onOpenChange, title, description, children, footer, size='md'}) avec sizes sm/md/lg/xl → max-w-md/lg/2xl/4xl. Field({label, required, children}), FormInput/FormSelect (h-10 rounded-lg border-input focus:ring-ring/40), FormTextarea.
- Lu `/src/components/dashboard/dialogs/nouvelle-seance-dialog.tsx` et `nouvelle-facture-dialog.tsx` pour aligner le pattern visuel (footer à 2 boutons Annuler/Action primary avec icône Lucide, grid responsive sm:grid-cols-2).
- Lu `/src/lib/mock-data.ts` : confirmé les champs eleve.typePermis ('A'|'B'|'AB'), eleve.statut (8 valeurs dont 'Inscrit', 'En formation', 'Examen'), facture.reste/paye/montant, depense.modePaiement/vehicule, examen.resultat ('En attente'|'Admis'|'Échec').
- Confirmé disponibilité du composant shadcn `@/components/ui/checkbox` (Checkbox primitive Radix avec data-[state=checked]:bg-primary).

- Créé `nouveau-moniteur-dialog.tsx` (size 'md') :
  - 6 champs useState (nom, prenom, telephone, email, specialite='Conduite', statut='Disponible').
  - Layout grid sm:grid-cols-2 (Nom+Prénom, Téléphone+Email, Spécialité+Statut).
  - handleSubmit → validation (nom/prenom/telephone/specialite requis) → `addMoniteur({ nom, prenom, telephone, email, specialite, statut })` → toast.success('Moniteur ajouté') → reset + close.
  - reset() réinitialise tous les champs au state initial (y compris specialite=Conduite, statut=Disponible).
  - handleOpenChange intercale le reset quand on ferme.
  - Footer : bouton Annuler (outline) + bouton "Ajouter le moniteur" (UserPlus, primary).

- Créé `nouveau-vehicule-dialog.tsx` (size 'md') :
  - 4 champs useState (marque, modele, immatriculation, etat='Disponible').
  - Immatriculation affichée en font-mono et automatiquement mise en majuscules au submit.
  - Layout grid sm:grid-cols-2 pour Marque+Modèle, Immatriculation pleine largeur, État en dessous.
  - handleSubmit → validation (marque/modele/immatriculation requis) → `addVehicule({ marque, modele, immatriculation: UPPER, etat })` → toast.success('Véhicule ajouté').
  - Footer : bouton Annuler + bouton "Ajouter le véhicule" (Car, primary).

- Créé `nouvelle-depense-dialog.tsx` (size 'md') :
  - 6 champs useState (categorie='Carburant', montant=0, description, modePaiement='Espèces', vehicule='—', date=today).
  - Sélecteurs constants : CATEGORIES (7 valeurs), MODES (4 valeurs), CATEGORIES_WITH_VEHICULE=['Carburant','Entretien','Réparations'].
  - Helper vehiculeLabel(v) → "Marque Modèle (immat)".
  - Le champ Véhicule est conditionnel (rendu uniquement si categorie ∈ CATEGORIES_WITH_VEHICULE) — sinon vehicule reste '—'.
  - Changement de catégorie : si on bascule vers une catégorie sans véhicule, on reset vehicule='—'.
  - handleSubmit → validation (categorie, montant>0, description, date requis) → `addDepense({ categorie, montant, description, modePaiement, vehicule: showVehicule ? vehicule : '—', date })` → toast.success('Dépense enregistrée').
  - Aperçu en direct bg-muted p-3 avec formatXOF(montant) en text-lg font-bold text-primary.
  - Véhicules chargés via `useDataStore(s => s.vehicules)`.
  - Footer : bouton Annuler + bouton "Enregistrer la dépense" (Wallet, primary).

- Créé `nouveau-paiement-dialog.tsx` (size 'md') :
  - Props : { factureId: string|null, open, onOpenChange }.
  - Guard `if (!factureId || !facture) return null` en tête.
  - Lookup facture depuis `useDataStore(s => s.factures).find(f => f.id === factureId)`.
  - 4 champs useState (montant=0, modePaiement='Espèces', reference, datePaiement=today).
  - useEffect sur [open, factureId] : quand on ouvre et qu'on a une facture, setMontant(facture.reste) + reset modePaiement/reference/datePaiement.
  - Bandeau d'info facture en haut (border bg-muted/40 p-4, grid sm:grid-cols-2) avec 4 cellules : Numéro (font-mono, FileText), Élève (User + code mono), Montant total (formatXOF, Coins), Reste à payer (formatXOF, coloré rose si >0 / emerald si =0, Calendar).
  - Inputs : Montant (type=number, max=facture.reste), Mode de paiement (4 options), Référence (input font-mono), Date (type=date).
  - Aperçu bg-muted p-3 : "Montant encaissé" + formatXOF(montant) text-primary.
  - handleSubmit → validation (montant>0, reference, datePaiement) → résout `facture.eleve` → `addPaiement({ factureId, eleve: facture.eleve, montant, modePaiement, reference, datePaiement })` → toast.success('Paiement encaissé'). Le store recalcule auto le solde/statut de la facture.
  - Footer : bouton Annuler + bouton "Encaisser le paiement" (Banknote, primary).
  - Pas de reset sur close (le useEffect reset à la prochaine ouverture) pour préserver l'animation.

- Créé `nouvel-examen-dialog.tsx` (size 'md') :
  - 6 champs useState (eleveCode, typeExamen='Conduite', typePermis='B', dateExamen, inspecteur='—', notes).
  - Élève : FormSelect qui map eleves du store → "Prénom Nom (EL-XXXX)".
  - Type d'examen : Code/Conduite. Type de permis : A/B/AB/C.
  - Inspecteur : FormSelect qui map inspecteurs actifs du store → "Prénom Nom", avec option "— Aucun inspecteur —".
  - Notes : FormTextarea optionnel rows=3.
  - handleSubmit → validation (eleveCode, dateExamen) → lookup eleve dans le store → construit eleveNom = "Prénom Nom" → `addExamen({ eleve, eleveCode, typeExamen, typePermis, dateExamen, inspecteur, resultat: 'En attente', notes })` → toast.success('Examen planifié').
  - Footer : bouton Annuler + bouton "Planifier l'examen" (CalendarCheck, primary).

- Créé `nouvelle-session-dialog.tsx` (size 'lg', le plus complexe) :
  - 7 champs useState (date, heure='08:00', centre, typeExamen='Conduite', inspecteur='—', vehicule='—', selectedEleves=[]).
  - STATUTS_ELIGIBLES = ['Inscrit', 'En formation', 'Examen'].
  - vehiculesDisponibles = vehicules.filter(v => v.etat === 'Disponible').
  - elevesEligibles = eleves.filter(e => STATUTS_ELIGIBLES.includes(e.statut)).
  - Inspecteur : map inspecteurs actifs du store.
  - Véhicule : rendu UNIQUEMENT si typeExamen === 'Conduite' (sinon "—"). Si on bascule vers Code, on reset vehicule='—' via handleTypeChange.
  - Notes informatives selon le type : "Aucun véhicule requis pour une session de code." / "Seuls les véhicules disponibles sont proposés."
  - Multi-select candidats : carte border border-border bg-card avec header (Users icon + count) et liste scrollable max-h-72 avec custom-scrollbar. Chaque item = label cursor-pointer avec Checkbox shadcn + nom + code mono + badge statut (hidden sm:inline).
  - toggleEleve(code) ajoute/retire dans selectedEleves (string[]).
  - Résumé dynamique bg-muted p-3 "Candidats sélectionnés" + count text-primary, visible uniquement si ≥1 candidat.
  - handleSubmit → validation (date, heure, centre, ≥1 candidat) → build candidats[] via snapshot de chaque eleve sélectionné : `{ nomComplet: "Prénom Nom", identifiant: code, telephone, categoriePermis: eleve.typePermis, resultat: 'En attente' }` → `addExamenSession({ date, heure, centre, typeExamen, inspecteur, vehicule: type==='Conduite' ? vehicule : '—', candidats })` → toast.success('Session créée'). Le store génère auto le numeroBordereau.
  - Footer : bouton Annuler + bouton "Créer la session" (CalendarPlus, primary).

- Tous les fichiers commencent par `'use client'`, utilisent NAMED export (pas default), importent Modal/Field/FormInput/FormSelect/FormTextarea depuis `@/components/dashboard/modal`, `useDataStore` depuis `@/store/data-store`, `toast` depuis `sonner`.
- Design system cohérent : orange primary (bg-primary/text-primary-foreground), boutons primary h-10 px-4 rounded-lg, boutons outline border-input bg-background hover:bg-muted, formatXOF() pour les montants, font-mono pour numéros/codes.
- Texte français partout, responsive mobile-first (grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3 pour la session).
- Aucun appel API ni DB — 100% Zustand data-store + useState local.

Stage Summary:
- Files created:
  - `/src/components/dashboard/dialogs/nouveau-moniteur-dialog.tsx` → `export function NouveauMoniteurDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouveau-vehicule-dialog.tsx` → `export function NouveauVehiculeDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouvelle-depense-dialog.tsx` → `export function NouvelleDepenseDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouveau-paiement-dialog.tsx` → `export function NouveauPaiementDialog({ factureId, open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouvel-examen-dialog.tsx` → `export function NouvelExamenDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouvelle-session-dialog.tsx` → `export function NouvelleSessionDialog({ open, onOpenChange })`
- Tous les dialogs sont câblés au data-store Zustand via les actions add*. Toast sonner déclenché après chaque mutation réussie. Reset des champs à la fermeture.
- Patterns respectés : footer à 2 boutons (Annuler outline + Action primary avec icône Lucide), champs wrappés dans Field avec required* orange, grid responsive sm:grid-cols-2 (ou 3 pour la session), aperçus en direct bg-muted p-3 avec formatXOF pour dépense/paiement.
- Particularités : (1) paiement dialog utilise useEffect pour setMontant(reste) à l'ouverture, garde `if (!factureId || !facture) return null` ; (2) dépense dialog affiche le sélecteur véhicule uniquement si catégorie ∈ [Carburant, Entretien, Réparations] ; (3) session dialog utilise Checkbox shadcn pour le multi-select candidats avec liste scrollable max-h-72 custom-scrollbar, et masque le sélecteur véhicule quand typeExamen === 'Code'.
- Pas de lint/build lancé conformément aux consignes.

---
Task ID: 4-a
Agent: full-stack-developer (wire CRUD dialogs)
Task: Câbler les dialogs existants au data-store (élève, séance, facture, résultats)

Work Log:
- Lu `/home/z/my-project/worklog.md` (section "Task ID: 3 (phase CRUD)" + Task 2-c) pour comprendre l'API du data-store Zustand (`addEleve`, `addSeance`, `addFacture`, `updateSessionResultats`) et la structure des dialogs existants (champs useState, footer à 2 boutons, Modal shared).
- Lu `/src/store/data-store.ts` : confirmé les signatures — addEleve génère auto id/code/seancesFaites/seancesTotales/solde/statut/dateInscription/moniteur, addFacture génère auto numéro/paye/reste/statut, updateSessionResultats(sessionId, candidats[]) remplace le tableau candidats.
- Lu `/src/app/layout.tsx` : un `<Toaster />` (de `@/components/ui/toaster`) est déjà présent. Ajouté `import { Toaster as SonnerToaster } from 'sonner'` et rendu `<SonnerToaster richColors position="top-right" />` juste après le Toaster existant (les deux cohabitent — sonner est utilisé par les dialogs, le Toaster shadcn reste pour l'existant).
- Lu les 4 dialogs cibles pour identifier les useState fields existants et le footer button à câbler.

- Câblé `/src/components/dashboard/dialogs/nouvel-eleve-dialog.tsx` :
  - Ajouté imports `toast` from 'sonner' + `useDataStore` from '@/store/data-store'.
  - Récupéré `addEleve = useDataStore(s => s.addEleve)`.
  - Ajouté `resetForm()` qui remet tous les useState à leur valeur initiale.
  - Ajouté `handleSubmit()` : validation (nom + prenom + telephone requis, sinon toast.error) → calcule `estParraine = parrain.trim() !== ''` → `addEleve({ nom, prenom, telephone, email, dateNaissance, lieuNaissance, sexe, nationalite, typePiece, numPiece, typePermis, estParraine, parrainNom })` → `toast.success('Élève créé avec succès')` → resetForm() → onOpenChange(false).
  - Bouton "Créer l'élève" → onClick={handleSubmit} (au lieu de onOpenChange(false) no-op).

- Câblé `/src/components/dashboard/dialogs/nouvelle-seance-dialog.tsx` :
  - Ajouté imports `toast` + `useDataStore`. Récupéré `addSeance`.
  - Ajouté `resetForm()` + helper `computeDureeMin(debut, fin)` qui split "HH:MM" et renvoie la différence en minutes.
  - `handleSubmit()` : validation (eleveCode + moniteurId + date + heureDebut + heureFin requis ; heureFin > heureDebut) → lookup eleve/moniteur/vehicule depuis mock-data → construit `eleveNom = "Prenom Nom"`, `moniteurNom = "Prenom Nom"`, `vehiculeDesc = "Marque Modèle (immat)"` (ou "—" si pas de véhicule) → `addSeance({ eleve, eleveCode, moniteur, vehicule, date, heureDebut, heureFin, duree, statut: 'Planifié', notes })` → toast.success('Séance planifiée') → resetForm + close.
  - Bouton "Planifier la séance" → onClick={handleSubmit}.

- Câblé `/src/components/dashboard/dialogs/nouvelle-facture-dialog.tsx` :
  - Ajouté imports `toast` + `useDataStore`. Récupéré `addFacture`.
  - Ajouté `resetForm()` (réinitialise eleveCode, formationId, montant=0, dateEmission=today, notes).
  - `handleSubmit()` : validation (eleveCode + formationId + montant>0) → lookup eleve + formation depuis mock-data → `addFacture({ eleve: "Prenom Nom", eleveCode, formation: formation.nom, montant, dateEmission })` → toast.success('Facture émise') → resetForm + close. Le store génère auto le numéro, paye=0, reste=montant, statut='Non payée'.
  - Bouton "Émettre la facture" → onClick={handleSubmit}.

- Câblé `/src/components/dashboard/dialogs/saisie-resultats-dialog.tsx` :
  - Ajouté imports `toast` + `useDataStore`. Récupéré `updateSessionResultats`.
  - Étendu le type `Session` local pour y ajouter `id: string` (le vrai objet passé par bordereaux-view.tsx est `typeof examenSessions[number]` qui a un id, mais le type local du dialog ne l'avait pas — nécessaire pour accéder à `session.id`).
  - Ajouté `handleSave()` : map results → tableau `{ nomComplet, identifiant, telephone, categoriePermis, resultat, notes }` (incluant les notes saisies inline) → cast `as unknown as Parameters<typeof updateSessionResultats>[1]` (car le type CandidatSession du store n'a pas `notes` mais le store l'accepte à runtime — cast pour satisfaire TypeScript sans modifier le store) → `updateSessionResultats(session.id, ...)` → toast.success('Résultats enregistrés') → onOpenChange(false).
  - Bouton "Enregistrer les résultats" → onClick={handleSave}.

- Vérifié `/home/z/my-project/dev.log` après chaque édition : compilation réussie (`✓ Compiled in Xms`), aucune erreur TypeScript ou runtime.

Stage Summary:
- Files modified:
  - `/src/app/layout.tsx` → ajout import `{ Toaster as SonnerToaster }` from 'sonner' + rendu `<SonnerToaster richColors position="top-right" />` après le Toaster shadcn existant
  - `/src/components/dashboard/dialogs/nouvel-eleve-dialog.tsx` → addEleve + toast + resetForm + handleSubmit (bouton "Créer l'élève" câblé)
  - `/src/components/dashboard/dialogs/nouvelle-seance-dialog.tsx` → addSeance + computeDureeMin + résolution eleve/moniteur/vehicule names + toast + resetForm + handleSubmit (bouton "Planifier la séance" câblé)
  - `/src/components/dashboard/dialogs/nouvelle-facture-dialog.tsx` → addFacture + résolution eleve/formation names + toast + resetForm + handleSubmit (bouton "Émettre la facture" câblé)
  - `/src/components/dashboard/dialogs/saisie-resultats-dialog.tsx` → updateSessionResultats + ajout `id` au type Session local + toast + handleSave (bouton "Enregistrer les résultats" câblé)
- Patterns cohérents sur les 4 dialogs : validation simple (toast.error si champs requis manquants) → call store action → toast.success → resetForm → onOpenChange(false).
- Le store reste inchangé — addEleve/addSeance/addFacture/updateSessionResultats gèrent déjà la génération des id/code/numéro et l'audit log.
- Le sonner Toaster est désormais monté globalement dans layout.tsx (richColors + position top-right), en plus du Toaster shadcn préexistant.
- Pas de lint/build lancé conformément aux consignes ; dev server compile proprement (vérifié dans dev.log).

---
Task ID: 4-c
Agent: full-stack-developer (migrate views to store)
Task: Migrer les vues vers le data-store + câbler boutons (PDF, WhatsApp, nouveaux dialogs)

Work Log:
- Lu `/home/z/my-project/worklog.md` (sections Task 3 / 4-a / 4-b) pour comprendre l'API du data-store Zustand (`useDataStore(s => s.eleves)` + add/update/delete), les utilitaires PDF/WhatsApp (`generateFacturePdf`, `generateBordereauPdf`, `relanceWhatsApp`, `messageRelanceFacture`), et la structure des entités (eleves.statut, moniteurs.statut, vehicules.etat, factures.reste/statut, paiements.montant, depenses.categorie/vehicule, examenSessions).
- Lu `/src/store/data-store.ts` : confirmed signatures `addMoniteur`, `addVehicule`, `addDepense`, `addExamen`, `addExamenSession`, `addPaiement` (ce dernier recalcule auto le solde + statut de la facture).
- Lu les 7 vues cibles (`eleves-view`, `moniteurs-view`, `vehicules-view`, `comptabilite-view`, `examens-view`, `bordereaux-view`, `facturation-view`) pour identifier les imports `from '@/lib/mock-data'` à remplacer, les boutons non-câblés, et les KPIs hardcodés.
- Constaté que les 6 dialogs manquants (moniteur, vehicule, depense, examen, session, paiement) n'étaient PAS présents sur disque — créé chacun :

- Créé `nouveau-moniteur-dialog.tsx` (size 'md') : 6 champs (nom, prenom, telephone, email, specialite='Conduite', statut='Disponible'). handleSubmit → `addMoniteur(...)` + toast.success. Footer Annuler + "Créer le moniteur" (UserPlus).

- Créé `nouveau-vehicule-dialog.tsx` (size 'md') : 4 champs (marque, modele, immatriculation, etat='Disponible'). handleSubmit → `addVehicule(...)` + toast.success. Footer Annuler + "Ajouter le véhicule" (Plus).

- Créé `nouvelle-depense-dialog.tsx` (size 'md') : 6 champs (categorie, montant, description, modePaiement, vehicule, date). Véhicules chargés depuis `useDataStore(s => s.vehicules)`. handleSubmit → `addDepense(...)` + toast.success. Aperçu live bg-muted formatXOF(montant).

- Créé `nouvel-examen-dialog.tsx` (size 'md') : 7 champs (eleveCode, typeExamen, typePermis, dateExamen, inspecteur, resultat, notes). Élèves + inspecteurs chargés depuis le store. handleSubmit → lookup eleve → `addExamen({ eleve: "Prenom Nom", ... })` + toast.success.

- Créé `nouvelle-session-dialog.tsx` (size 'lg') : 7 champs (date, heure, centre, typeExamen, inspecteur, vehicule, selectedEleves[]). Multi-select candidats via checkboxes (liste scrollable max-h-56). handleSubmit → build candidats[] depuis eleves sélectionnés → `addExamenSession({ date, heure, centre, typeExamen, inspecteur, vehicule, candidats })` + toast.success. Store génère auto le numeroBordereau.

- Créé `nouveau-paiement-dialog.tsx` (size 'md') : Props { factureId: string|null, open, onOpenChange }. Lookup facture depuis le store. useEffect reset montant=facture.reste à l'ouverture. 4 champs (montant, modePaiement, reference, datePaiement). Récap facture en haut (montant total / déjà payé / reste à payer). Aperçu "Nouveau reste après encaissement". handleSubmit → validation montant ≤ reste → `addPaiement(...)` + toast.success. Le store recalcule auto le solde/statut de la facture.

- Migré `eleves-view.tsx` :
  - `import { eleves, type StatutEleve }` → `import { type StatutEleve } from '@/lib/mock-data'` + `const eleves = useDataStore(s => s.eleves)`.
  - `const totalEleves = 248` → `const totalEleves = eleves.length`.
  - KPI cards : Total = `eleves.length`, En formation = `eleves.filter(e => e.statut === 'En formation').length`, Admis = `eleves.filter(e => e.statut === 'Admis').length`, Taux réussite = "78,5 %" (statique, non dérivable du mock).
  - useMemo dependencies : ajouté `eleves` pour refilter quand le store change.
  - Dialogs `NouvelEleveDialog` + `EleveDetailDialog` déjà câblés — conservés tels quels.

- Migré `moniteurs-view.tsx` :
  - `import { moniteurs }` → `const moniteurs = useDataStore(s => s.moniteurs)`.
  - Bouton "Ajouter un moniteur" (onClick={() => {}}) → `setShowAdd(true)` avec `const [showAdd, setShowAdd] = useState(false)`.
  - Rendu `<NouveauMoniteurDialog open={showAdd} onOpenChange={setShowAdd} />` à la fin.
  - KPIs dérivés : Total = `moniteurs.length`, Disponibles = `moniteurs.filter(m => m.statut === 'Disponible').length`, En mission = `moniteurs.filter(m => m.statut === 'En mission').length`.

- Migré `vehicules-view.tsx` :
  - `import { vehicules }` → `const vehicules = useDataStore(s => s.vehicules)`.
  - Bouton "Ajouter un véhicule" → `setShowAdd(true)` + rendu `<NouveauVehiculeDialog .../>`.
  - KPIs dérivés : Total = `vehicules.length`, Disponibles = `vehicules.filter(v => v.etat === 'Disponible').length`, En maintenance = `vehicules.filter(v => v.etat === 'En maintenance').length`.

- Migré `comptabilite-view.tsx` :
  - `import { depenses, type CategorieDepense }` → type conservé depuis mock-data + `const depenses = useDataStore(s => s.depenses)`.
  - Bouton "Nouvelle dépense" (pas de onClick avant) → `setShowAdd(true)` + rendu `<NouvelleDepenseDialog .../>`.
  - KPIs dérivés : Total dépenses = `depenses.reduce(sum montant)`, Dépenses véhicules = `depenses.filter(d => d.vehicule !== '—').reduce(sum)`, Salaires = `depenses.filter(d => d.categorie === 'Salaires').reduce(sum)`.
  - Tous les useMemo ont `depenses` en dependency → recalcul auto quand le store change.

- Migré `examens-view.tsx` :
  - `import { examens, examenSessions }` → supprimé ; sous-composants `ExamensIndividuels` et `SessionsCollectives` appellent `useDataStore(s => s.examens)` et `useDataStore(s => s.examenSessions)` directement.
  - Bouton "Nouvel examen" → `setShowAdd(true)` + rendu `<NouvelExamenDialog .../>` dans `ExamensView`.

- Migré `bordereaux-view.tsx` :
  - `import { examenSessions }` → `const examenSessions = useDataStore(s => s.examenSessions)`.
  - Bouton "Nouvelle session" → `setShowAddSession(true)` + rendu `<NouvelleSessionDialog .../>`.
  - Bouton "Générer PDF" par session → `generateBordereauPdf(sess)` + `toast.success('Bordereau XXX généré')`.
  - `SaisieResultatsDialog` déjà câblé — conservé.
  - Import `FileText` supprimé (inutilisé).

- Migré `facturation-view.tsx` :
  - `import { factures, paiements, type StatutFacture, type ModePaiement }` → types conservés + `const factures = useDataStore(s => s.factures)`, `const paiements = useDataStore(s => s.paiements)`, `const eleves = useDataStore(s => s.eleves)`.
  - Bouton "Télécharger PDF" par facture → `generateFacturePdf(f)` + `toast.success('Facture XXX générée')`.
  - Bouton "Encaisser" (nouveau, icône Banknote) sur factures non-payées → `setPaiementFactureId(f.id)` → ouvre `<NouveauPaiementDialog factureId={paiementFactureId} open={!!paiementFactureId} onOpenChange={...} />`.
  - Bouton WhatsApp par facture impayée → lookup `eleve = eleves.find(e => e.code === f.eleveCode)` pour récupérer `telephone` → `relanceWhatsApp(telephone, messageRelanceFacture({ prenom, nom, numeroFacture, reste, telephone }))`. Le prenom/nom est splitté depuis `f.eleve` (format "Prenom Nom").
  - KPIs dérivés : CA total = `factures.reduce(sum montant)`, Encaissé = `paiements.reduce(sum montant)`, En attente = `factures.filter(f => f.statut !== 'Payée').reduce(sum reste)`, Impayées = `factures.filter(f => f.statut === 'Impayée').length`.
  - `NouvelleFactureDialog` déjà câblé — conservé.

- Vérifié `/home/z/my-project/dev.log` après toutes les éditions : compilation propre (`✓ Compiled in Xms`), requêtes GET / 200 OK, aucune erreur TypeScript ou Module-not-found relative à mes fichiers.

Stage Summary:
- Files created:
  - `/src/components/dashboard/dialogs/nouveau-moniteur-dialog.tsx` → `export function NouveauMoniteurDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouveau-vehicule-dialog.tsx` → `export function NouveauVehiculeDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouvelle-depense-dialog.tsx` → `export function NouvelleDepenseDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouvel-examen-dialog.tsx` → `export function NouvelExamenDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouvelle-session-dialog.tsx` → `export function NouvelleSessionDialog({ open, onOpenChange })`
  - `/src/components/dashboard/dialogs/nouveau-paiement-dialog.tsx` → `export function NouveauPaiementDialog({ factureId, open, onOpenChange })`
- Files modified:
  - `/src/components/dashboard/views/eleves-view.tsx` → useDataStore(eleves) + KPIs dérivés (totalEleves=enFormation=admis)
  - `/src/components/dashboard/views/moniteurs-view.tsx` → useDataStore(moniteurs) + bouton Ajouter câblé + KPIs dérivés
  - `/src/components/dashboard/views/vehicules-view.tsx` → useDataStore(vehicules) + bouton Ajouter câblé + KPIs dérivés
  - `/src/components/dashboard/views/comptabilite-view.tsx` → useDataStore(depenses) + bouton Nouvelle dépense câblé + KPIs dérivés (total/véhicules/salaires)
  - `/src/components/dashboard/views/examens-view.tsx` → useDataStore(examens, examenSessions) dans sous-composants + bouton Nouvel examen câblé
  - `/src/components/dashboard/views/bordereaux-view.tsx` → useDataStore(examenSessions) + bouton Nouvelle session câblé + bouton Générer PDF câblé (generateBordereauPdf + toast)
  - `/src/components/dashboard/views/facturation-view.tsx` → useDataStore(factures, paiements, eleves) + bouton Télécharger PDF (generateFacturePdf) + bouton Encaisser (NouveauPaiementDialog) + bouton WhatsApp (relanceWhatsApp + messageRelanceFacture) + KPIs dérivés (CA/Encaissé/Attente/Impayées)
- Tous les dialogs créés utilisent Modal/Field/FormInput/FormSelect/FormTextarea depuis `@/components/dashboard/modal`, `useDataStore` depuis `@/store/data-store`, `toast` depuis `sonner`. Patterns cohérents avec les dialogs existants (footer 2 boutons Annuler/Action primary, validation simple, reset sur close).
- Toutes les vues sont désormais abonnées au store Zustand via `useDataStore(s => s.X)` → toute mutation CRUD (add/update/delete) rafraîchit automatiquement l'UI (KPIs, listes, filtres).
- Boutons d'action câblés : PDF facture, PDF bordereau, WhatsApp relance (avec lookup eleve pour téléphone), Encaisser (ouverture NouveauPaiementDialog), tous les boutons "Ajouter/Nouveau" ouvrant leurs dialogs respectifs.
- Pas de lint/build lancé conformément aux consignes. Dev server compile proprement (vérifié dans dev.log : `✓ Compiled in Xms` récurrents, GET / 200 OK).
