# CHANGELOG.md — MoukawilOS Compliance & Regulatory Modernization

**Date :** 29 septembre 2026  
**Auteur :** Senior Full-Stack Engineer & Compliance Reviewer  
**Version :** 2.0.0 (Compliance & Accuracy Edition)  
**Cadre Juridique de Référence :** Loi n° 22-23 du 18 décembre 2022 portant statut de l'auto-entrepreneur (Algérie).

---

## 1. Vue d'Ensemble des Évolutions

Cette version 2.0.0 transforme le prototype MoukawilOS en un outil rigoureusement aligné sur le droit positif algérien, en éradiquant toute invention de taux, de décrets, de délais ou de références textuelles.

Toutes les règles juridiques, fiscales et de sécurité sociale sont désormais centralisées dans une source unique gelée (`rules.js`), et les calculs sont pilotés par un moteur pur sans effet de bord (`calc.js`) testé unitairement (`tests/calc.test.js`).

---

## 2. Détail des Modifications par Écran

### A. Tableau de Bord (Dashboard)
- **Synchronisation dynamique des indicateurs** : Les montants affichés (1 850 000 DZD de chiffre d'affaires 2026, 228 000 DZD pour le mois de septembre, et 127 000 DZD en attente d'encaissement) sont désormais calculés en temps réel à partir de la liste des factures réelles (`invoicesData`), éliminant toute discordance interne.
- **Jauge de seuil légal de CA (5M DA)** : Pilotée dynamiquement par `MoukawilCalc.thresholdStatus()`. Calcul exact de 37% (1 850 000 / 5 000 000).
- **Distinction stricte Produit vs Loi** : L'alerte à 80% (4 000 000 DZD) est expressément labellisée `[Fonctionnalité MoukawilOS]` pour éviter toute confusion avec le droit positif. La conséquence légale de radiation en cas de dépassement sur 3 années consécutives (Art. 13-14 Loi 22-23) est explicitée.
- **Élimination du mythe de la cotisation trimestrielle CASNOS** : Les fausses mentions de "CASNOS quarterly 27 000 DZD" ont été supprimées et remplacées par les échéances officielles issues de `calc.buildCalendar()`.

### B. Écran de Conformité & Calendrier Fiscal (Compliance)
- **Avis de non-responsabilité juridique et fiscal** : Ajout d'une boîte d'avertissement précisant la nature purement informative de l'application et renvoyant vers la DGI, la CASNOS et l'ANAE.
- **Calendrier des obligations réglementaires** :
  - Déclaration prévisionnelle IFU (Série G n° 12) fixée au 30 juin (CIDTA art. 282 quater).
  - Déclaration définitive IFU (Série G n° 12 bis) fixée au 20 janvier N+1.
  - Cotisation CASNOS annuelle unique fixée au 30 juin (Décret 15-289 art. 14).
  - Échéancier fractionné de l'IFU (acompte n°2 au 15 septembre, acompte n°3 au 15 décembre selon CIDTA art. 365).
  - Déclaration d'existence fiscale NIF sous 30 jours (Loi 22-23 art. 11).
- **Fiche synthétique vérifiée** : Mise à jour des taux officiels (IFU à 0,5% pour toutes les activités, minimum d'imposition de 10 000 DZD, CASNOS forfait 24 000 DZD/an ou régime général 15%).
- **Simulateur interactif IFU & CASNOS** : Outil en direct permettant de tester différents chiffres d'affaires, avec application automatique du minimum légal de 10 000 DZD (exemple : 1 850 000 DZD donne un IFU de 10 000 DZD car 1 850 000 × 0.5% = 9 250 DZD < 10 000 DZD) et comparaison entre forfait CASNOS (24 000 DZD) et régime général proportionnel (15% encadré entre 43 200 et 864 000 DZD selon le SNMG 2026 à 24 000 DZD/mois).

### C. Facturation & Avoirs (Invoices & Create Invoice)
- **Numérotation séquentielle stricte** : Génération chronologique automatique au format `FA-YYYY-NNN`.
- **Inaltérabilité des factures finalisées** : Conformément au Décret exécutif n° 05-468 (art. 11), toute facture émise ne peut être modifiée ni supprimée. Le bouton "Modifier" a été remplacé pour les factures finalisées par un bouton **« Établir un avoir rectificatif »**, générant une note de crédit liée (`AV-2026-NNN`).
- **Mentions légales obligatoires conformes** :
  - Vendeur : Nom, prénom, activité déclarée ANAE, adresse, NIF (15 chiffres), N° d'immatriculation ANAE.
  - Client : Nom/Raison sociale, adresse (+ NIF si client professionnel).
  - Numéro séquentiel, date d'émission, date d'échéance.
  - Lignes de prestation détaillées, total en DZD.
  - **Correction de la mention TVA** : Suppression de l'erreur « Loi 22-18, Art. 8 » et remplacement par la mention officielle :
    *« Franchise de TVA — Article 282 sexies du CIDTA — TVA non applicable »*.
  - Mention explicite de dispense de registre du commerce (Loi 22-23 Art. 2 & 11) et rappel de l'obligation d'archivage pendant 10 ans (Code de commerce Art. 12).
- **Blocage préventif à l'émission** : Si le NIF ou le numéro ANAE n'est pas renseigné dans le profil, l'utilisateur est averti et bloqué avec un message d'orientation vers les Paramètres.

### D. Documents Administratifs (Documents)
- **Correction des documents officiels** : Suppression de la mention erronée "Registre de commerce" et remplacement par l'**« Attestation d'inscription au RNAE »** délivrée par l'ANAE (valable 5 ans selon Décret 23-196).
- Maintien des attestations NIF, certificat CASNOS, quittances annuelles et bordereaux G12/G50.

### E. Assistant Réglementaire (Regulatory Assistant)
- **Remplacement des réponses en dur** : Toutes les réponses sont désormais générées dynamiquement à partir de `rules.js`.
- **Sourçage systématique avec badges de statut** : Chaque réponse liste ses règles sources avec leur statut (`verified-official`, `secondary-only`, `conflicting`, `unknown`), l'article légal et un lien officiel.
- **Avertissement de prototype** : Bannière précisant qu'il s'agit d'un prototype scénarisé conforme aux textes officiels.
- **Réponse d'honnêteté intellectuelle (Fallback)** : En cas de question sur un sujet non vérifié ou non indexé dans les textes légaux, l'assistant refuse d'inventer une réponse et fournit les coordonnées et liens vers la DGI, l'ANAE et la CASNOS.

### F. Nouvel Écran : Règles & Sources (Rules & Sources)
- Création d'un écran dédié à la transparence juridique accessible depuis la barre latérale.
- Tableau exhaustif de toutes les règles de `rules.js` avec ID, intitulé, valeur, unité, base légale détaillée, statut de vérification et date de contrôle (29/09/2026).

### G. Paramètres (Settings)
- Ajout de champs dédiés au NIF (15 chiffres) et au numéro de carte ANAE.
- Sélecteur de langue (Français par défaut, English, العربية).

### H. Internationalisation & Accessibilité (i18n & RTL)
- Prise en charge du Français (par défaut), de l'Anglais et de l'Arabe.
- L'arabe active la direction `dir="rtl"` sur l'ensemble de l'interface avec inversion appropriée de la barre latérale, des tableaux et des cartes d'information.

---

## 3. Nouveaux Fichiers Créés

| Fichier | Rôle & Contenu |
|---|---|
| [`rules.js`](file:///c:/Users/HP/Desktop/MoukawilOS/rules.js) | Base unique gelée (frozen) de toutes les règles juridiques, fiscales et sociales algériennes. |
| [`calc.js`](file:///c:/Users/HP/Desktop/MoukawilOS/calc.js) | Moteur de calcul pur (IFU, CASNOS, seuils de CA, calendrier d'échéances). |
| [`tests/calc.test.js`](file:///c:/Users/HP/Desktop/MoukawilOS/tests/calc.test.js) | Suite de tests unitaire Node.js (12/12 cas testés et validés). |
| [`RULES_VERIFICATION.md`](file:///c:/Users/HP/Desktop/MoukawilOS/RULES_VERIFICATION.md) | Matrice de vérification documentaire légale avec statuts et références sources. |
| [`CHANGELOG.md`](file:///c:/Users/HP/Desktop/MoukawilOS/CHANGELOG.md) | Historique exhaustif des modifications et corrections d'alignement légal. |

---

## 4. Résultats des Tests de Calculs

Exécution de `node tests/calc.test.js` :
- `turnover 0 => IFU 10 000 DZD (minimum appliqué)` : **PASS**
- `turnover 1 850 000 => IFU 10 000 DZD (minimum appliqué)` : **PASS**
- `turnover 3 000 000 => IFU 15 000 DZD` : **PASS**
- `turnover 5 000 000 => IFU 25 000 DZD` : **PASS**
- `CASNOS flat => 24 000 DZD` : **PASS**
- `CASNOS assiette sous le plancher (< 288 000) => 43 200 DZD` : **PASS**
- `CASNOS assiette 5 760 000 => 864 000 DZD` : **PASS**
- `CASNOS assiette au-dessus du plafond (> 5 760 000) => 864 000 DZD` : **PASS**
- `Pourcentage du seuil pour 1 850 000 => 37%` : **PASS**
- `5 000 001 => Dépassement détecté` : **PASS**
- `Compteur d'années consécutives (1, 2, 3 ans avec radiation à 3)` : **PASS**
- `Calendrier des obligations officielles sans CASNOS trimestrielle` : **PASS**

**Bilan : 12 / 12 tests réussis (100%).**
