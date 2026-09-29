/**
 * MoukawilOS — Calculation Engine (Pure functions, no DOM)
 * Computes IFU tax, CASNOS contributions, ceiling thresholds, and compliance calendars.
 * Works seamlessly in Node.js (testing) and in the browser.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const rules = require('./rules');
    module.exports = factory(rules);
  } else {
    root.MoukawilCalc = factory(root.MoukawilRules);
  }
})(typeof self !== 'undefined' ? self : this, function (MoukawilRules) {

  // Fallback safe rule getter
  function getRuleValue(id, fallback) {
    if (MoukawilRules && typeof MoukawilRules.getRule === 'function') {
      const rule = MoukawilRules.getRule(id);
      if (rule && rule.value !== undefined) return rule.value;
    }
    return fallback;
  }

  function formatDZD(amount) {
    if (!amount && amount !== 0) return '0 DZD';
    const str = Math.round(amount).toString();
    const parts = [];
    for (let i = str.length; i > 0; i -= 3) {
      parts.unshift(str.slice(Math.max(0, i - 3), i));
    }
    return parts.join(' ') + ' DZD';
  }

  /**
   * 1. computeIFU(turnover)
   * Formula: max(turnover * ifuRate, ifuMinimum)
   * ifuRate = 0.005 (0.5%)
   * ifuMinimum = 10 000 DZD
   */
  function computeIFU(turnover) {
    const safeTurnover = Math.max(0, Number(turnover) || 0);
    const rate = getRuleValue('ifuRate', 0.005);
    const minimum = getRuleValue('ifuMinimum', 10000);

    const calculated = Math.round(safeTurnover * rate);
    const amount = Math.max(calculated, minimum);
    const minimumApplied = calculated < minimum;

    let formula = '';
    if (minimumApplied) {
      formula = `max(${formatDZD(safeTurnover)} × ${(rate * 100).toFixed(1)}% = ${formatDZD(calculated)}, minimum légal ${formatDZD(minimum)}) = ${formatDZD(amount)}`;
    } else {
      formula = `${formatDZD(safeTurnover)} × ${(rate * 100).toFixed(1)}% = ${formatDZD(amount)}`;
    }

    return {
      turnover: safeTurnover,
      rate,
      minimum,
      calculated,
      amount,
      minimumApplied,
      formula
    };
  }

  /**
   * 2. computeCasnos({ option, assiette })
   * Options:
   * - 'flat': 24 000 DZD/year flat fee for auto-entrepreneurs
   * - 'general': 15% of annual net income / declared base, clamped to [baseMin, baseMax]
   *   baseMin = 1x SNMG annual (288 000 DZD) => 43 200 DZD contribution
   *   baseMax = 20x SNMG annual (5 760 000 DZD) => 864 000 DZD contribution
   */
  function computeCasnos(params) {
    const opts = params || {};
    const option = opts.option === 'general' ? 'general' : 'flat';
    const flatAmount = getRuleValue('casnosFlat', 24000);
    const rate = getRuleValue('casnosRate', 0.15);
    const baseMin = getRuleValue('casnosBaseMin', 288000);
    const baseMax = getRuleValue('casnosBaseMax', 5760000);
    const minContribution = Math.round(baseMin * rate); // 43 200 DZD
    const maxContribution = Math.round(baseMax * rate); // 864 000 DZD

    if (option === 'flat') {
      return {
        option: 'flat',
        assiette: 0,
        clampedAssiette: 0,
        rate: 0,
        amount: flatAmount,
        min: flatAmount,
        max: flatAmount,
        isClampedFloor: false,
        isClampedCeiling: false,
        formula: `Option forfaitaire auto-entrepreneur : ${formatDZD(flatAmount)}/an (taux libératoire pour couverture sociale & retraite)`
      };
    }

    const rawAssiette = Math.max(0, Number(opts.assiette) || 0);
    let clampedAssiette = rawAssiette;
    let isClampedFloor = false;
    let isClampedCeiling = false;

    if (rawAssiette < baseMin) {
      clampedAssiette = baseMin;
      isClampedFloor = true;
    } else if (rawAssiette > baseMax) {
      clampedAssiette = baseMax;
      isClampedCeiling = true;
    }

    const amount = Math.round(clampedAssiette * rate);

    let formula = '';
    if (isClampedFloor) {
      formula = `15% × assiette minimale légale ${formatDZD(baseMin)} (1× SNMG annuel) = ${formatDZD(amount)} (assiette déclarée ${formatDZD(rawAssiette)} inférieure au plancher)`;
    } else if (isClampedCeiling) {
      formula = `15% × assiette maximale légale ${formatDZD(baseMax)} (20× SNMG annuel) = ${formatDZD(amount)} (assiette déclarée ${formatDZD(rawAssiette)} plafonnée)`;
    } else {
      formula = `15% × assiette ${formatDZD(clampedAssiette)} = ${formatDZD(amount)}`;
    }

    return {
      option: 'general',
      assiette: rawAssiette,
      clampedAssiette,
      rate,
      amount,
      min: minContribution,
      max: maxContribution,
      isClampedFloor,
      isClampedCeiling,
      formula
    };
  }

  /**
   * 3. thresholdStatus(revenueByYear, targetYear)
   * Tracks annual ceiling compliance (5 000 000 DZD/year)
   * and consecutive years count (Loi 22-23 Art. 13-14).
   *
   * revenueByYear can be:
   * - an Object: { 2024: 4500000, 2025: 5200000, 2026: 1850000 }
   * - an Array of yearly revenues in chronological order: [3000000, 5200000, 5100000]
   * - a Number (single current revenue)
   */
  function thresholdStatus(revenueByYear, targetYear) {
    const ceiling = getRuleValue('annualCeiling', 5000000);
    const maxConsecutiveYears = getRuleValue('ceilingConsecutiveYears', 3);

    let currentRevenue = 0;
    let history = [];

    if (typeof revenueByYear === 'number') {
      currentRevenue = revenueByYear;
      history = [{ year: targetYear || 2026, revenue: currentRevenue }];
    } else if (Array.isArray(revenueByYear)) {
      history = revenueByYear.map((val, idx) => ({
        year: (targetYear || 2026) - (revenueByYear.length - 1 - idx),
        revenue: Number(val) || 0
      }));
      currentRevenue = history.length > 0 ? history[history.length - 1].revenue : 0;
    } else if (revenueByYear && typeof revenueByYear === 'object') {
      const years = Object.keys(revenueByYear).map(Number).sort((a, b) => a - b);
      history = years.map(y => ({ year: y, revenue: Number(revenueByYear[y]) || 0 }));
      const activeYear = targetYear || (years.length > 0 ? years[years.length - 1] : 2026);
      currentRevenue = Number(revenueByYear[activeYear]) || 0;
    }

    const percent = Math.round((currentRevenue / ceiling) * 100);
    const exceeded = currentRevenue > ceiling;

    // Consecutive-year counter ending at current year
    let consecutiveYearsAbove = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].revenue > ceiling) {
        consecutiveYearsAbove++;
      } else {
        break;
      }
    }

    // MoukawilOS preventative product alert at 80% (4 000 000 DZD)
    const alert80Threshold = ceiling * 0.8;
    const isAlert80Reached = percent >= 80 && !exceeded;

    let warningConsecutive = '';
    if (consecutiveYearsAbove >= maxConsecutiveYears) {
      warningConsecutive = `Plafond dépassé pendant ${consecutiveYearsAbove} années consécutives : radiation obligatoire du Registre National de l'Auto-Entrepreneur et bascule obligatoire au Registre du Commerce (Loi 22-23 Art. 13-14).`;
    } else if (consecutiveYearsAbove > 0) {
      warningConsecutive = `Plafond annuel dépassé pour la ${consecutiveYearsAbove}${consecutiveYearsAbove === 1 ? 'ère' : 'ème'} année consécutive (${consecutiveYearsAbove}/${maxConsecutiveYears} années avant radiation du statut ANAE).`;
    } else if (isAlert80Reached) {
      warningConsecutive = `[Fonctionnalité MoukawilOS] Alerte préventive : 80% du plafond atteint (${formatDZD(currentRevenue)} / ${formatDZD(ceiling)}).`;
    } else {
      warningConsecutive = `Revenu sous le plafond annuel légal (${percent}% de ${formatDZD(ceiling)}).`;
    }

    return {
      currentRevenue,
      ceiling,
      percent,
      exceeded,
      consecutiveYearsAbove,
      maxConsecutiveYears,
      isAlert80Reached,
      alert80Threshold,
      warningConsecutive,
      legalConsequence: consecutiveYearsAbove >= maxConsecutiveYears
    };
  }

  /**
   * 4. buildCalendar(year, demoDate)
   * Builds the verified official administrative obligations calendar.
   */
  function buildCalendar(year, demoDateStr) {
    const calYear = year || 2026;
    const demoDate = demoDateStr ? new Date(demoDateStr) : new Date('2026-09-29');

    const obligations = [
      {
        id: 'ob-nif',
        title: 'Déclaration d\'existence fiscale (NIF)',
        type: 'fiscal',
        dueDateStr: `${calYear}-02-15`, // e.g. within 30 days of registration
        displayDeadline: 'Sous 30 jours de la carte ANAE',
        status: 'completed',
        form: 'Série G n° 8',
        authority: 'Centre des Impôts (CDI / CPI)',
        legalRef: 'Loi 22-23 Art. 11 / CIDTA Art. 183',
        verified: true,
        sourceStatus: 'verified-official',
        description: 'Dépôt de la déclaration d\'existence fiscale pour attribution du NIF à 15 chiffres.'
      },
      {
        id: 'ob-g12',
        title: 'Déclaration prévisionnelle IFU (G n° 12)',
        type: 'tax',
        dueDateStr: `${calYear}-06-30`,
        displayDeadline: `30 juin ${calYear}`,
        status: 'completed',
        form: 'Série G n° 12',
        authority: 'DGI (Direction Générale des Impôts)',
        legalRef: 'CIDTA Art. 282 quater',
        verified: true,
        sourceStatus: 'verified-official',
        description: 'Déclaration du chiffre d\'affaires prévisionnel annuel et paiement de l\'acompte IFU (ou paiement intégral).'
      },
      {
        id: 'ob-casnos',
        title: 'Cotisation annuelle CASNOS',
        type: 'social',
        dueDateStr: `${calYear}-06-30`,
        displayDeadline: `30 juin ${calYear}`,
        status: 'completed',
        form: 'Appel de cotisation annuel',
        authority: 'CASNOS (Sécurité sociale des non-salariés)',
        legalRef: 'Décret exécutif 15-289 Art. 14 & Décret 26-257',
        verified: true,
        sourceStatus: 'verified-official',
        description: 'Paiement annuel unique (Forfait auto-entrepreneur 24 000 DZD ou régime général 15%). Aucune échéance trimestrielle ordinaire.'
      },
      {
        id: 'ob-ifu-acompte2',
        title: 'Paiement 2ème fraction IFU (en cas d\'échelonnement)',
        type: 'tax',
        dueDateStr: `${calYear}-09-15`,
        displayDeadline: `15 septembre ${calYear}`,
        status: 'completed',
        form: 'Bordereau avis de versement G50',
        authority: 'Recette des Impôts',
        legalRef: 'CIDTA Art. 365',
        verified: true,
        sourceStatus: 'verified-official',
        description: 'Paiement de la 2ème tranche de 25% si option de fractionnement retenue au 30 juin.'
      },
      {
        id: 'ob-ifu-acompte3',
        title: 'Paiement 3ème fraction IFU (en cas d\'échelonnement)',
        type: 'tax',
        dueDateStr: `${calYear}-12-15`,
        displayDeadline: `15 décembre ${calYear}`,
        status: 'upcoming',
        form: 'Bordereau avis de versement G50',
        authority: 'Recette des Impôts',
        legalRef: 'CIDTA Art. 365',
        verified: true,
        sourceStatus: 'verified-official',
        description: 'Paiement du solde de 25% si option de fractionnement retenue.'
      },
      {
        id: 'ob-g12bis',
        title: 'Déclaration définitive de régularisation IFU (G n° 12 bis)',
        type: 'tax',
        dueDateStr: `${calYear + 1}-01-20`,
        displayDeadline: `20 janvier ${calYear + 1}`,
        status: 'upcoming',
        form: 'Série G n° 12 bis',
        authority: 'DGI (Direction Générale des Impôts)',
        legalRef: 'CIDTA Art. 282 quater',
        verified: true,
        sourceStatus: 'verified-official',
        description: 'Déclaration du chiffre d\'affaires effectif annuel réalisé au 31 décembre et régularisation de l\'impôt définitif dû.'
      }
    ];

    // Compute relative temporal status based on demoDate
    obligations.forEach(ob => {
      const d = new Date(ob.dueDateStr);
      const diffDays = Math.round((d - demoDate) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // Past deadline
        if (ob.status !== 'completed') {
          ob.status = 'overdue';
          ob.badge = 'En retard';
        } else {
          ob.badge = 'Accomplie';
        }
      } else if (diffDays <= 30) {
        ob.status = 'due-soon';
        ob.badge = `Dans ${diffDays} jours`;
      } else {
        ob.status = 'upcoming';
        ob.badge = 'À venir';
      }
    });

    return obligations;
  }

  const MoukawilCalc = {
    computeIFU,
    computeCasnos,
    thresholdStatus,
    buildCalendar,
    formatDZD
  };

  return Object.freeze(MoukawilCalc);
});
