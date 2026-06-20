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
