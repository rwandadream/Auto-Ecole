# Améliorations de l'application Auto-École (PWA)

Voici la liste des corrections et améliorations à apporter, organisées par module. Traite chaque section comme une tâche distincte.

---

## 1. Module Factures

### 1.1 Logique des avances payées
- Ajouter la gestion des **avances payées** par l'élève.
- Les avances doivent être **calculées et déduites automatiquement** du montant total de la facture.
- Afficher clairement sur la facture : montant total, avances déjà payées, **reste à payer**.

### 1.2 Nettoyage de l'interface
- **Supprimer le bouton "Type de formation"** du formulaire de facture.

### 1.3 Bug bloquant à corriger
- À la création d'une facture, une erreur s'affiche : **« Accès refusé par la politique de sécurité »**.
- Vérifier et corriger les politiques de sécurité (RLS / permissions) sur les tables concernées pour que la création de facture fonctionne pour les utilisateurs autorisés.

---

## 2. Modal Bordereau

### 2.1 Titre
- Renommer le titre en **« Bordereau d'examen de conduite »** (ou **« Code »** tout court selon le type d'examen).
- Supprimer le mot **« automobile »** du titre.

### 2.2 Champs à supprimer
- Supprimer le **numéro de téléphone**.
- Supprimer la mention **« Abidjan, Côte d'Ivoire »**.
- Supprimer les deux blocs/modals en bas : **« Inspecteur du permis »** et **« Chef d'établissement »**.
- Supprimer le champ **numéro de téléphone facultatif**, ainsi que les champs **inspecteur** et **véhicule**.

### 2.3 Numéro de dossier
- Le numéro de dossier doit contenir le **numéro de CNI, de passeport ou le numéro consulaire** de l'élève.

### 2.4 Règle métier : éligibilité au bordereau
- **Seuls les élèves ayant soldé la totalité de leurs paiements** peuvent être inscrits sur un bordereau.
- Ajouter une vérification du statut de paiement avant l'ajout d'un élève, avec un message clair si l'élève n'a pas tout payé.

---

## 3. Champs facultatifs

Rendre **facultatifs** (non obligatoires) les champs suivants :
- **Parrainé**
- **Email**
- **Adresses**
- **Véhicule** dans le formulaire « Planifier une séance »

---

## 4. Dashboard & Comptabilité

- Afficher sur le dashboard **l'ensemble des entrées et sorties d'argent** (flux financiers) liées aux élèves et aux factures.
- Créer une section **« Comptabilité »** dédiée, avec ses propres données à part :
  - Total des entrées (paiements, avances)
  - Total des sorties (dépenses)
  - Solde / bilan

---

## 5. Types de permis (gestion dynamique)

- Permettre à **l'admin de créer, modifier et supprimer lui-même tous les types de permis** (CRUD complet).
- Les types de permis enregistrés par l'admin doivent être **automatiquement disponibles et pris en compte partout** où cette information est utilisée dans l'app : inscription élève, factures, bordereaux, planification de séances, filtres, etc.
- Remplacer toute liste de types de permis codée en dur par cette source de données dynamique.

---

## 6. Bugs & Améliorations techniques

### 6.1 Scanner
- Le **scanner ne fonctionne pas correctement** : diagnostiquer et corriger (permissions caméra, compatibilité navigateur, bibliothèque de scan).

### 6.2 Responsive
- Corriger l'affichage responsive : **certains modals et boutons ne s'affichent pas correctement** sur certaines tailles d'écran (mobile, tablette).
- Vérifier tous les modals : débordements, boutons coupés ou inaccessibles, scroll interne.

### 6.3 PWA
- L'application doit être une **PWA complète** :
  - Manifest valide (nom, icônes, thème)
  - Service worker fonctionnel
  - Installable sur mobile et desktop
  - Comportement correct hors ligne (au minimum un fallback)

---

## Priorités suggérées

1. 🔴 Bug bloquant : erreur « accès refusé » sur les factures
2. 🔴 Logique des avances sur les factures
3. 🟠 Règle bordereau : uniquement les élèves à jour de paiement
4. 🟠 Nettoyage du modal bordereau + numéro de dossier (CNI/passeport/consulaire)
5. 🟡 Types de permis dynamiques gérés par l'admin
6. 🟡 Dashboard flux financiers + section comptabilité
7. 🟡 Champs facultatifs
8. 🟢 Scanner, responsive, PWA