/**
 * MoukawilOS — Legal, Tax & Compliance Rules Base
 * Single Source of Truth for Algerian Auto-Entrepreneur regulations (Loi n° 22-23 du 18 décembre 2022).
 * All monetary amounts in DZD.
 * Last verified date: 2026-09-29.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MoukawilRules = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  const RULES_DATA = [
    {
      id: 'annualCeiling',
      label: 'Plafond annuel de chiffre d\'affaires',
      value: 5000000,
      unit: 'DZD/an',
      appliesFrom: '2023-01-01',
      source: {
        text: 'Loi n° 22-23 du 18 décembre 2022 portant statut de l\'auto-entrepreneur',
        ref: 'Art. 2 & CIDTA Art. 282 ter',
        url: 'https://www.joradp.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Plafond strict annuel civil. Toute affirmation de plafonds à 8M ou 10M est non fondée.'
    },
    {
      id: 'ceilingConsecutiveYears',
      label: 'Années consécutives de dépassement entraînant radiation',
      value: 3,
      unit: 'années',
      appliesFrom: '2023-01-01',
      source: {
        text: 'Loi n° 22-23 du 18 décembre 2022',
        ref: 'Art. 13 & 14',
        url: 'https://www.joradp.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Le dépassement pendant 3 années consécutives entraîne la radiation du registre national et l\'obligation d\'inscription au registre du commerce.'
    },
    {
      id: 'ifuRate',
      label: 'Taux de l\'Impôt Forfaitaire Unique (IFU)',
      value: 0.005, // 0.5%
      unit: 'taux (0,5%)',
      appliesFrom: '2024-01-01',
      source: {
        text: 'Loi de Finances pour 2024 (Loi n° 23-22), modifiant le CIDTA',
        ref: 'Art. 18 LF 2024 / Art. 282 sexies CIDTA',
        url: 'https://www.mfdgi.gov.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Applicable à toutes les activités d\'auto-entrepreneur. Taux libératoire d\'IRG et de TVA.'
    },
    {
      id: 'ifuMinimum',
      label: 'Minimum annuel d\'imposition IFU auto-entrepreneur',
      value: 10000,
      unit: 'DZD/an',
      appliesFrom: '2024-01-01',
      source: {
        text: 'Code des Impôts Directs et Taxes Assimilées (CIDTA)',
        ref: 'Art. 365 bis CIDTA (LF 2024/2025)',
        url: 'https://www.mfdgi.gov.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Dû même en cas de chiffre d\'affaires nul. Distinct du minimum de droit commun (30 000 DZD) réservé aux autres régimes.'
    },
    {
      id: 'ifuBasis',
      label: 'Assiette d\'imposition IFU',
      value: 'Chiffre d\'affaires encaissé',
      unit: 'recettes réelles',
      appliesFrom: '2023-01-01',
      source: {
        text: 'CIDTA Art. 282 sexies & Doctrine DGI Jibayatic',
        ref: 'Art. 282 sexies & quater',
        url: 'https://www.mfdgi.gov.dz'
      },
      status: 'secondary-only',
      lastChecked: '2026-09-29',
      notes: 'Les déclarations portent sur le montant effectif des encaissements encaissés au cours de l\'exercice.'
    },
    {
      id: 'g12Deadline',
      label: 'Date limite déclaration prévisionnelle IFU (Série G n° 12)',
      value: '30 juin',
      unit: 'date annuelle',
      appliesFrom: '2024-01-01',
      source: {
        text: 'Code des Impôts Directs et Taxes Assimilées',
        ref: 'Art. 282 quater CIDTA',
        url: 'https://www.mfdgi.gov.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Souscription de la déclaration prévisionnelle et paiement de l\'impôt au plus tard le 30 juin.'
    },
    {
      id: 'g12bisDeadline',
      label: 'Date limite déclaration définitive de régularisation (Série G n° 12 bis)',
      value: '20 janvier (N+1)',
      unit: 'date annuelle',
      appliesFrom: '2024-01-01',
      source: {
        text: 'Code des Impôts Directs et Taxes Assimilées',
        ref: 'Art. 282 quater CIDTA',
        url: 'https://www.mfdgi.gov.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Déclaration du chiffre d\'affaires effectif de l\'année écoulée et régularisation de l\'impôt avant le 20 janvier.'
    },
    {
      id: 'ifuInstalments',
      label: 'Modalités de fractionnement du paiement IFU',
      value: '50% au 30 juin, 25% (1-15 sept), 25% (1-15 déc)',
      unit: 'échéancier fractionné',
      appliesFrom: '2024-01-01',
      source: {
        text: 'Code des Impôts Directs et Taxes Assimilées',
        ref: 'Art. 365 CIDTA',
        url: 'https://www.mfdgi.gov.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Option de paiement en 3 fractions si montant supérieur au minimum légal.'
    },
    {
      id: 'casnosFlat',
      label: 'Option forfaitaire annuelle CASNOS auto-entrepreneur',
      value: 24000,
      unit: 'DZD/an',
      appliesFrom: '2024-01-01',
      source: {
        text: 'Décision conjointe Ministère du Travail / CASNOS / ANAE & Décret exécutif 26-257',
        ref: 'Art. 14 modifiant décret 15-289',
        url: 'https://www.casnos.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Option forfaitaire annuelle ouverte aux auto-entrepreneurs pour couverture sociale et retraite de base.'
    },
    {
      id: 'casnosRate',
      label: 'Taux régime général CASNOS (proportionnel)',
      value: 0.15, // 15%
      unit: 'taux (15%)',
      appliesFrom: '2015-01-01',
      source: {
        text: 'Décret exécutif n° 26-257 du 15 juillet 2026 modifiant le décret 15-289',
        ref: 'Art. 14 (7,5% assurances sociales + 7,5% retraite)',
        url: 'https://www.joradp.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Taux de 15% applicable sur l\'assiette déclarée en option proportionnelle de droit commun.'
    },
    {
      id: 'casnosSnmgMonthly',
      label: 'Montant mensuel du SNMG de référence',
      value: 24000,
      unit: 'DZD/mois',
      appliesFrom: '2026-01-01',
      source: {
        text: 'Décret présidentiel n° 26-01 portant revalorisation du SNMG',
        ref: 'Art. 1',
        url: 'https://www.joradp.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'SNMG en vigueur en 2026 fixé à 24 000 DZD par mois (SNMG annuel = 288 000 DZD).'
    },
    {
      id: 'casnosBaseMin',
      label: 'Assiette minimale annuelle CASNOS (1x SNMG annuel)',
      value: 288000,
      unit: 'DZD/an',
      appliesFrom: '2026-01-01',
      source: {
        text: 'Décret exécutif n° 26-257 du 15 juillet 2026',
        ref: 'Art. 14 (1x SNMG annuel)',
        url: 'https://www.casnos.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Cotisation minimale correspondante : 15% × 288 000 = 43 200 DZD/an.'
    },
    {
      id: 'casnosBaseMax',
      label: 'Assiette maximale annuelle CASNOS (20x SNMG annuel)',
      value: 5760000,
      unit: 'DZD/an',
      appliesFrom: '2026-01-01',
      source: {
        text: 'Décret exécutif n° 26-257 du 15 juillet 2026',
        ref: 'Art. 14 (20x SNMG annuel)',
        url: 'https://www.casnos.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Cotisation maximale correspondante : 15% × 5 760 000 = 864 000 DZD/an.'
    },
    {
      id: 'casnosDeadline',
      label: 'Date limite annuelle de paiement CASNOS (non agricole)',
      value: '30 juin',
      unit: 'date annuelle',
      appliesFrom: '2015-01-01',
      source: {
        text: 'Décret exécutif n° 15-289 relatif à la sécurité sociale des non-salariés',
        ref: 'Art. 14',
        url: 'https://www.casnos.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Paiement annuel en une seule fois avant le 30 juin. Aucune échéance trimestrielle ordinaire.'
    },
    {
      id: 'casnosAffiliationDays',
      label: 'Délai légal d\'affiliation CASNOS après début d\'activité',
      value: 10,
      unit: 'jours',
      appliesFrom: '1983-07-02',
      source: {
        text: 'Loi n° 83-14 du 2 juillet 1983 modifiée & Décret 15-289',
        ref: 'Art. 8 Décret 15-289',
        url: 'https://www.casnos.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Obligation de souscrire la déclaration d\'affiliation dans les 10 jours de notification de la carte.'
    },
    {
      id: 'nifDeclarationDays',
      label: 'Délai légal déclaration d\'existence fiscale (NIF)',
      value: 30,
      unit: 'jours',
      appliesFrom: '2023-01-01',
      source: {
        text: 'Loi n° 22-23 portant statut de l\'auto-entrepreneur & CIDTA',
        ref: 'Loi 22-23 Art. 11 / CIDTA Art. 183 (Série G n° 8)',
        url: 'https://www.mfdgi.gov.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Dépôt de la déclaration d\'existence au Centre des Impôts compétent dans les 30 jours de la réception de la carte.'
    },
    {
      id: 'invoiceMandatoryMentions',
      label: 'Mentions obligatoires sur facture auto-entrepreneur',
      value: [
        'Nom et prénom du vendeur',
        'Adresse d\'exercice',
        'Activité agréée ANAE',
        'Numéro d\'Identification Fiscale (NIF, 15 chiffres)',
        'Numéro de carte / d\'immatriculation ANAE',
        'Identité et adresse du client (+ NIF si client professionnel)',
        'Date d\'émission de la facture',
        'Numéro séquentiel unique et chronologique (ex: FA-2026-001)',
        'Désignation précise des prestations, quantité, prix unitaire en DZD',
        'Montant total en DZD',
        'Mention de franchise en TVA'
      ],
      unit: 'liste obligatoire',
      appliesFrom: '2005-12-10',
      source: {
        text: 'Décret exécutif n° 05-468 fixant les conditions et modalités d\'établissement de la facture & Guide ANAE',
        ref: 'Décret 05-468 Art. 4 à 11',
        url: 'https://www.joradp.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Conformité stricte aux exigences algériennes de facturation. Les factures émises ne peuvent être modifiées.'
    },
    {
      id: 'vatMention',
      label: 'Mention légale obligatoire d\'exonération de TVA',
      value: 'Franchise de TVA — Article 282 sexies du CIDTA — TVA non applicable',
      unit: 'mention légale',
      appliesFrom: '2024-01-01',
      source: {
        text: 'Code des Impôts Directs et Taxes Assimilées (CIDTA)',
        ref: 'Art. 282 sexies CIDTA',
        url: 'https://www.mfdgi.gov.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Remplace l\'ancienne mention erronée "Loi 22-18, Art. 8". L\'exonération découle du régime libératoire IFU.'
    },
    {
      id: 'recordKeepingYears',
      label: 'Durée légale obligatoire de conservation des factures et pièces',
      value: 10,
      unit: 'ans',
      appliesFrom: '1975-09-26',
      source: {
        text: 'Code de commerce algérien & Code des Procédures Fiscales',
        ref: 'Code de commerce Art. 12 / CPF Art. 24',
        url: 'https://www.joradp.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Conservation des pièces comptables et justificatives pendant dix années.'
    },
    {
      id: 'nisRequired',
      label: 'Exigence de Numéro d\'Identification Statistique (NIS)',
      value: false,
      unit: 'dispense',
      appliesFrom: '2024-01-01',
      source: {
        text: 'Communiqué conjoint ANAE / Office National des Statistiques (ONS)',
        ref: 'Guide officiel ANAE 2024',
        url: 'https://anae.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'Le NIS n\'est pas requis pour les auto-entrepreneurs; le NIF et l\'immatriculation ANAE suffisent.'
    },
    {
      id: 'rcRequired',
      label: 'Exigence de Registre du Commerce (CNRC)',
      value: false,
      unit: 'dispense',
      appliesFrom: '2023-01-01',
      source: {
        text: 'Loi n° 22-23 portant statut de l\'auto-entrepreneur',
        ref: 'Art. 2 & 11',
        url: 'https://www.joradp.dz'
      },
      status: 'verified-official',
      lastChecked: '2026-09-29',
      notes: 'L\'auto-entrepreneur est expressément dispensé de l\'immatriculation au registre du commerce.'
    },
    {
      id: 'casnosThirdYearFloor',
      label: 'Plancher de cotisation CASNOS à partir de la 3ème année (moyenne wilaya)',
      value: 'Non fixé par arrêté ministériel',
      unit: 'barème en attente',
      appliesFrom: 'Non précisé',
      source: {
        text: 'Doctrine générale CASNOS',
        ref: 'Arrêté d\'application non paru au JO',
        url: 'https://www.casnos.dz'
      },
      status: 'unknown',
      lastChecked: '2026-09-29',
      notes: 'Discuté dans les réformes mais aucun barème moyen officiel publié. Statut : inconnu, à confirmer auprès de la CASNOS.'
    }
  ];

  // Build indexed map
  const rulesMap = {};
  RULES_DATA.forEach(rule => {
    rulesMap[rule.id] = Object.freeze(rule);
  });

  const MoukawilRules = {
    rules: Object.freeze(rulesMap),
    rulesList: Object.freeze([...RULES_DATA]),
    getRule: function (id) {
      if (!rulesMap[id]) {
        console.warn('Unknown rule requested from MoukawilRules:', id);
        return null;
      }
      return rulesMap[id];
    },
    getAllRules: function () {
      return [...RULES_DATA];
    }
  };

  return Object.freeze(MoukawilRules);
});
