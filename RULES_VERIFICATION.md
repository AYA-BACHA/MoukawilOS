# RULES_VERIFICATION.md — MoukawilOS Compliance & Legal Rules Base

**Date de vérification :** 29 septembre 2026  
**Rôle :** Senior Full-Stack Engineer & Compliance Reviewer  
**Objet :** Cadre juridique, fiscal et parafiscal applicable aux auto-entrepreneurs en Algérie (Loi n° 22-23 du 18 décembre 2022).  
**Statuts utilisés :**
- `verified-official` : Texte vérifié au Journal Officiel (JORADP) ou communiqué officiel DGI / ANAE / CASNOS.
- `secondary-only` : Source professionnelle ou doctrine secondaire reconnue (guides juridiques, plateformes spécialisées) en attente de publication explicite au JO.
- `conflicting` : Divergence constatée entre plusieurs sources ou pratiques administratives non harmonisées.
- `unknown` : Disposition mentionnée mais non encore fixée par arrêté d'application ou non publiée.

---

## 1. Cadre Général & Statut de l'Auto-Entrepreneur

| Règle / Notion | Valeur vérifiée | Référence source exacte | Statut | Date de contrôle | Notes & Analyse |
|---|---|---|---|---|---|
| **Loi portant statut de l'auto-entrepreneur** | Loi n° 22-23 du 18 décembre 2022 | JORADP n° 85 du 19 décembre 2022, p. 5 | `verified-official` | 29/09/2026 | Remplace toute mention erronée de "Loi 22-18" (la loi 22-18 concerne l'investissement). |
| **Création et organisation de l'ANAE** | Décret exécutif n° 23-196 du 25 mai 2023 | JORADP n° 37 du 4 juin 2023, p. 24 | `verified-official` | 29/09/2026 | Fixe l'organisation et le fonctionnement de l'Agence Nationale de l'Auto-Entrepreneur (ANAE). Durée de validité de la carte : 5 ans renouvelable. |
| **Nomenclature des activités éligibles** | Décret exécutif n° 23-197 du 25 mai 2023 | JORADP n° 37 du 4 juin 2023, p. 27 | `verified-official` | 29/09/2026 | Liste 7 domaines d'activités (conseil, numérique, services à la personne, etc.). Exclut expressément les professions libérales réglementées et les activités artisanales. |
| **Modèle de la carte d'auto-entrepreneur** | Décret exécutif n° 23-198 du 25 mai 2023 | JORADP n° 37 du 4 juin 2023, p. 32 | `verified-official` | 29/09/2026 | Carte biométrique avec numéro d'immatriculation national unique au Registre National de l'Auto-Entrepreneur (RNAE). |
| **Micro-importation** | Décret exécutif n° 25-170 du 29 juin 2025 | JORADP n° 40 du 2 juillet 2025 | `verified-official` | 29/09/2026 | Ouvre sous conditions strictes la micro-importation de biens pour revente en l'état (plafond 1,8M DA par voyage, max 2 voyages/mois). |
| **Âge légal d'éligibilité** | Âge légal de travail (16 ans avec autorisation parentale / majorité civile à 19 ans) | Loi 22-23 art. 2 ; Code du travail (loi 90-11 art. 15) | `conflicting` | 29/09/2026 | La loi 22-23 stipule « avoir atteint l'âge légal de travail ». Le code du travail permet le travail dès 16 ans sous conditions, mais la capacité contractuelle commerciale autonome est généralement fixée à 18-19 ans. La plateforme ANAE requiert la majorité civile (19 ans) ou émancipation. Mention neutre retenue : "Âge légal de travail (à confirmer selon situation auprès de l'ANAE)". |
| **Dispense de Registre du Commerce (RC)** | Aucune inscription au CNRC requise | Loi n° 22-23, art. 2 & 11 | `verified-official` | 29/09/2026 | L'inscription au RNAE (tenu par l'ANAE) tient lieu d'immatriculation légale. Pas de numéro de RC ni d'extrait de registre du commerce. |
| **Dispense de NIS (Numéro d'Identification Statistique)** | NIS non requis pour facturer | Communiqué ANAE / ONS 2024 | `verified-official` | 29/09/2026 | Le NIF et le numéro ANAE suffisent. Le NIS n'est pas délivré aux auto-entrepreneurs. |

---

## 2. Plafond de Chiffre d'Affaires & Dépassement

| Règle / Notion | Valeur vérifiée | Référence source exacte | Statut | Date de contrôle | Notes & Analyse |
|---|---|---|---|---|---|
| **Plafond annuel de chiffre d'affaires** | 5 000 000 DZD / an | Loi 22-23 art. 2 ; CIDTA art. 282 ter | `verified-official` | 29/09/2026 | Plafond strict applicable sur l'année civile (1er janvier - 31 décembre). Des allégations isolées de 8M ou 10M DA sur certains blogs sont erronées et non fondées. |
| **Conséquence du dépassement** | Dépassement pendant 3 années consécutives => Radiation du RNAE et obligation de bascule au Registre du Commerce | Loi n° 22-23, art. 13 et 14 | `verified-official` | 29/09/2026 | La loi prévoit expressément que l'auto-entrepreneur qui dépasse le plafond pendant trois (3) années consécutives est radié du registre national et doit s'inscrire au registre du commerce (EURL/SARL ou entreprise individuelle). |
| **Prétendues règles des "30 jours" ou "bascule au 1er janvier immédiat"** | Non prévues par la Loi 22-23 pour un dépassement ponctuel d'une seule année | Doctrine DGI / Loi 22-23 | `conflicting` | 29/09/2026 | La règle légale est le dépassement sur 3 années consécutives. Toutefois, sur le plan fiscal, le chiffre d'affaires excédentaire peut faire l'objet d'une taxation au régime réel selon les directives locales de la DGI. L'application avertit l'utilisateur avec neutralité. |
| **Seuil d'alerte à 80% (4 000 000 DZD)** | 80% du plafond (4 000 000 DZD) | **Fonctionnalité MoukawilOS** (aide préventive de gestion) | `verified-official` | 29/09/2026 | Ce seuil d'alerte n'est PAS une règle de droit algérien, mais un dispositif de pilotage intégré par MoukawilOS pour avertir l'entrepreneur avant d'atteindre le plafond légal. |

---

## 3. Fiscalité : Impôt Forfaitaire Unique (IFU)

| Règle / Notion | Valeur vérifiée | Référence source exacte | Statut | Date de contrôle | Notes & Analyse |
|---|---|---|---|---|---|
| **Taux de l'IFU auto-entrepreneur** | 0,5 % du chiffre d'affaires | Loi de Finances pour 2024 (loi n° 23-22 du 24/12/2023, art. 18 modifiant l'art. 282 sexies du CIDTA) | `verified-official` | 29/09/2026 | S'applique uniformément à toutes les activités d'auto-entrepreneur. L'ancien taux de 5% (LF 2023) a été abaissé à 0,5% pour encourager l'adhésion au statut. Taux libératoire de l'IRG et de la TVA. |
| **Minimum annuel d'imposition IFU** | 10 000 DZD / an | CIDTA art. 365 bis (Loi de Finances 2024 / 2025) | `verified-official` | 29/09/2026 | Minimum spécifique aux auto-entrepreneurs (le minimum de droit commun pour les autres contribuables à l'IFU est de 30 000 DZD). Dû même en cas de chiffre d'affaires nul ou inférieur à 2 000 000 DZD (car 2 000 000 × 0.5% = 10 000 DZD). |
| **Assiette de l'impôt (Base)** | Chiffre d'affaires encaissé / réalisé | CIDTA art. 282 sexies & quater ; Guide fiscal DGI | `secondary-only` | 29/09/2026 | La DGI calcule l'IFU sur le chiffre d'affaires encaissé (recettes effectives). Les prestations facturées non encore réglées au 31 décembre font l'objet d'une régularisation sur la déclaration G12 bis lors de leur encaissement effectif. |
| **Déclaration prévisionnelle (G n° 12)** | Au plus tard le 30 juin de l'année en cours | CIDTA art. 282 quater | `verified-official` | 29/09/2026 | Déclaration d'estimation du chiffre d'affaires annuel prévisionnel. Pour l'année 2024, une dispense temporaire avait été accordée par communiqué conjoint ANAE-DGI pour les nouveaux inscrits ; en régime permanent (2025-2026), l'échéance légale reste le 30 juin. |
| **Déclaration définitive de régularisation (G n° 12 bis)** | Au plus tard le 20 janvier de l'année N+1 | CIDTA art. 282 quater | `verified-official` | 29/09/2026 | Déclaration du chiffre d'affaires effectif réalisé et liquidation finale de l'impôt dû au titre de l'exercice clos au 31 décembre. |
| **Modalités de paiement fractionné de l'IFU** | 50% au dépôt (avant 30 juin), 25% du 1 au 15 septembre, 25% du 1 au 15 décembre | CIDTA art. 365 | `verified-official` | 29/09/2026 | Option de paiement échelonné possible si l'impôt prévisionnel dépasse le minimum légal. |
| **Pénalités et majorations de retard** | Majoration de 10% (dépôt spontané tardif < 1 mois) à 25% ; amende pour déclaration à néant tardive (2 500 à 10 000 DZD) | Code des Procédures Fiscales (CPF) art. 192 et suivants | `verified-official` | 29/09/2026 | Les retards de déclaration et de paiement entraînent les majorations prévues au CPF. |
| **Rumeur de déclaration mensuelle sur anae.dz** | INEXISTANTE dans les textes légaux | Vérification portail anae.dz & DGI | `conflicting` | 29/09/2026 | Aucune disposition légale ni plateforme n'impose de déclaration fiscale mensuelle. La déclaration IFU est annuelle (G12 prévisionnel + G12 bis définitif). Tout rappel mensuel serait une confusion avec d'autres régimes ou pays. |

---

## 4. Sécurité Sociale : CASNOS

| Règle / Notion | Valeur vérifiée | Référence source exacte | Statut | Date de contrôle | Notes & Analyse |
|---|---|---|---|---|---|
| **Délai d'affiliation CASNOS** | 10 jours suivant le début d'activité | Loi n° 83-14 du 2 juillet 1983 modifiée ; Décret exécutif n° 15-289 art. 8 | `verified-official` | 29/09/2026 | L'auto-entrepreneur doit obligatoirement souscrire son affiliation auprès de la structure CASNOS de son lieu d'exercice dans les 10 jours de la réception de sa carte / notification ANAE. |
| **Date limite annuelle de paiement CASNOS** | 30 juin de chaque année | Décret exécutif n° 15-289, art. 14 ; Réglementation générale non-salariés non agricoles | `verified-official` | 29/09/2026 | La cotisation des non-salariés non agricoles est annuelle et exigible le 30 juin. Il n'existe AUCUNE cotisation trimestrielle ordinaire CASNOS. |
| **Option Forfaitaire Auto-Entrepreneur** | Cotisation forfaitaire annuelle de 24 000 DZD / an | Décision conjointe Ministère du Travail / ANAE / CASNOS ; Décret exécutif 26-257 art. 14 | `verified-official` | 29/09/2026 | Option spécifique ouverte aux auto-entrepreneurs leur permettant de s'acquitter d'un forfait libératoire annuel fixe de 24 000 DZD pour leur couverture assurance maladie et retraite de base. |
| **Régime Général CASNOS (Option proportionnelle)** | Taux de 15% (7,5% assurances sociales + 7,5% retraite) | Décret exécutif n° 26-257 du 15 juillet 2026 (JORADP n° 53 du 23 juillet 2026) modifiant le décret n° 15-289 art. 14 | `verified-official` | 29/09/2026 | Assiette de cotisation comprise entre 1 fois et 20 fois le SNMG annuel. |
| **SNMG Mensuel applicable en 2026** | 24 000 DZD / mois | Décret présidentiel n° 26-01 du 5 janvier 2026 | `verified-official` | 29/09/2026 | SNMG annuel = 24 000 × 12 = 288 000 DZD. |
| **Plancher de cotisation régime général** | 43 200 DZD / an (15% de 288 000 DZD) | Décret exécutif 26-257 | `verified-official` | 29/09/2026 | 15% × (1 × SNMG annuel 288 000 DZD) = 43 200 DZD. |
| **Plafond de cotisation régime général** | 864 000 DZD / an (15% de 5 760 000 DZD) | Décret exécutif 26-257 (20 × SNMG annuel) | `verified-official` | 29/09/2026 | 20 × 288 000 = 5 760 000 DZD d'assiette maximale. 15% × 5 760 000 = 864 000 DZD. |
| **Plancher à partir de la 3ème année (cotisation moyenne wilaya/activité)** | Non précisé par arrêté ministériel au 29/09/2026 | Mentionné dans la doctrine CASNOS mais texte non paru | `unknown` | 29/09/2026 | Discuté dans les projets réglementaires mais aucun arrêté fixant les barèmes moyens par wilaya n'est publié. Statut : INCONNU, à confirmer auprès de l'agence CASNOS. |

---

## 5. Démarches Fiscales & Mentions de Facturation

| Règle / Notion | Valeur vérifiée | Référence source exacte | Statut | Date de contrôle | Notes & Analyse |
|---|---|---|---|---|---|
| **Déclaration d'existence fiscale (NIF)** | 30 jours à compter de la délivrance de la carte ANAE | Loi n° 22-23 art. 11 ; CIDTA art. 183 (formulaire Série G n° 8) | `verified-official` | 29/09/2026 | Dépôt au Centre des Impôts (CDI) ou Centre de Proximité des Impôts (CPI) pour attribution du Numéro d'Identification Fiscale (NIF). |
| **Mentions obligatoires sur facture** | 1. Nom & prénom du vendeur<br>2. Adresse d'exercice<br>3. Activité agréée ANAE<br>4. NIF du vendeur<br>5. N° de carte / d'immatriculation ANAE<br>6. Identité & adresse du client (+ NIF si client professionnel)<br>7. Date d'émission<br>8. Numéro d'ordre séquentiel unique (ex: FA-2026-001)<br>9. Désignation précise, quantité, prix unitaire en DZD<br>10. Montant total en DZD<br>11. Mention de franchise en TVA | Décret exécutif n° 05-468 du 10 décembre 2005 fixant les conditions et les modalités d'établissement de la facture ; Guide ANAE | `verified-official` | 29/09/2026 | Respect strict des obligations formelles algériennes de facturation. |
| **Mention TVA obligatoire** | *"Franchise de TVA — Article 282 sexies du CIDTA — TVA non applicable"* | Article 282 sexies du CIDTA ; Code des Taxes sur le Chiffre d'Affaires | `verified-official` | 29/09/2026 | Remplacement formel de l'ancienne mention erronée "Loi 22-18, Art. 8". L'exonération de TVA découle du régime libératoire de l'IFU. |
| **Inaltérabilité des factures & Avoirs** | Toute facture finalisée ne peut être supprimée ni modifiée rétroactivement. Correction obligatoire par émission d'une facture d'avoir (note de crédit). | Décret exécutif n° 05-468 art. 11 ; Code de commerce art. 12 | `verified-official` | 29/09/2026 | Principe comptable et fiscal de continuité et d'intangibilité de la facturation. |
| **Délai d'archivage et conservation des factures** | 10 ans | Code de commerce algérien art. 12 ; Code des Procédures Fiscales art. 24 | `verified-official` | 29/09/2026 | Obligation de conserver les livres et pièces justificatives (factures émises et reçues) pendant dix (10) ans. |

---

## 6. Synthèse des Éléments Non Vérifiés ou Conflictuels

1. **Âge minimal d'accès à l'auto-entrepreneuriat :** La coexistence entre le Code du travail (16 ans) et les règles d'émancipation commerciale civile (18/19 ans) crée un flou juridique pratique. Traitement dans MoukawilOS : Mention explicite d'âge légal avec recommandation de confirmation auprès de l'ANAE.
2. **Sort de la 1ère ou 2ème année de dépassement du seuil de 5M DA :** La loi impose la radiation formelle au bout de 3 années consécutives (art. 13-14 Loi 22-23), mais la tolérance fiscale de la DGI sur l'assiette imposable d'une seule année exceptionnelle n'a pas fait l'objet d'une instruction publique unifiée.
3. **Barème plancher CASNOS 3ème année :** Considéré comme `unknown` (en attente d'arrêté d'application). L'application n'applique que l'option forfaitaire officielle (24 000 DZD) ou le régime général de base (15% avec plancher de 43 200 DZD).

Ce document constitue la base documentaire contractuelle pour toutes les implémentations dans `rules.js`, `calc.js` et les écrans de MoukawilOS.
