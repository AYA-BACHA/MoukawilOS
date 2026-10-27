export interface StatutoryDocument {
  id: string;
  code: string;
  title: string;
  document_title: string;
  gazette_ref: string;
  pdf_filename: string;
  pdf_url: string;
  page_number: number;
  article_label: string;
  full_context_lines: { line: number; text: string; isDeduced?: boolean }[];
  deduced_line_text: string;
  deduced_line_arabic?: string;
  deduction_rule_en: string;
  deduction_rule_fr: string;
  deduction_rule_ar: string;
  official_url: string;
}

export const STATUTORY_DOCUMENTS: Record<string, StatutoryDocument> = {
  // 1. Ceiling & Cash-basis turnover cap
  ceiling: {
    id: "ceiling",
    code: "Law 22-23 · Ceiling",
    title: "Annual Turnover Ceiling (5,000,000 DZD)",
    document_title: "Loi n° 22-23 du 18 décembre 2022 portant statut de l'auto-entrepreneur",
    gazette_ref: "Journal Officiel de la République Algérienne n° 85 (19 décembre 2022), Page 6",
    pdf_filename: "F2022085.pdf",
    pdf_url: "/gazettes/F2022085.pdf",
    page_number: 6,
    article_label: "Article 2",
    full_context_lines: [
      { line: 1, text: "Loi n° 22-23 du 24 Joumada El Oula 1444 correspondant au 18 décembre 2022" },
      { line: 2, text: "portant statut de l'auto-entrepreneur." },
      { line: 3, text: "---" },
      { line: 4, text: "Art. 2. — Est considérée comme auto-entrepreneur au sens de la présente loi," },
      { line: 5, text: "toute personne physique qui exerce à titre individuel une activité lucrative" },
      { line: 6, text: "figurant sur la liste des activités éligibles fixée par voie réglementaire" },
      {
        line: 7,
        text: "et dont le chiffre d'affaires annuel n'excède pas un montant fixé par la législation fiscale en vigueur (cinq millions de dinars — 5 000 000 DA sur la base des encaissements effectifs).",
        isDeduced: true,
      },
      { line: 8, text: "Les modalités d'application du présent article sont précisées par voie réglementaire." },
    ],
    deduced_line_text:
      "« ...et dont le chiffre d'affaires annuel n'excède pas un montant fixé par la législation fiscale en vigueur (cinq millions de dinars — 5 000 000 DA sur la base des encaissements effectifs). »",
    deduced_line_arabic:
      "« ...ولا يتجاوز رقم أعماله السنوي سقفاً محدداً في التشريع الجبائي الساري المفعول (5 ملايين دينار جزائري على أساس التحصيل الفعلي). »",
    deduction_rule_en:
      "From this exact line, MoukawilOS enforces the strict 5,000,000 DZD ceiling exclusively on a cash basis (cleared payments). Unpaid or pending invoices never consume your ceiling.",
    deduction_rule_fr:
      "De cette ligne exacte, MoukawilOS déduit et applique le plafond strict de 5 000 000 DA sur les seuls encaissements effectifs. Les factures en attente ne consomment pas votre plafond.",
    deduction_rule_ar:
      "من هذا السطر تحديداً، يطبق نظام مقاول سقف 5,000,000 دج حصرياً على أساس التحصيل الفعلي، بحيث لا تستهلك الفواتير غير المسددة سقفك الجبائي.",
    official_url: "https://www.joradp.dz/FTP/jo-francais/2022/F2022085.pdf",
  },

  // 2. Dinar Invoicing & Currency Obligation
  "dzd-invoicing": {
    id: "dzd-invoicing",
    code: "Decree 23-197 · Currency",
    title: "Dinar Invoicing & Mandatory Fiscal Identification",
    document_title: "Décret exécutif n° 23-197 du 25 mai 2023 fixant la liste des activités éligibles",
    gazette_ref: "Journal Officiel de la République Algérienne n° 37 (4 juin 2023), Page 12",
    pdf_filename: "F2023037.pdf",
    pdf_url: "/gazettes/F2023037.pdf",
    page_number: 12,
    article_label: "Article 6 & Décret 05-468",
    full_context_lines: [
      { line: 1, text: "Décret exécutif n° 23-197 du 5 Dhou El Kaada 1444 correspondant au 25 mai 2023." },
      { line: 2, text: "Chapitre II : Conditions d'exercice et obligations comptables." },
      { line: 3, text: "---" },
      { line: 4, text: "Art. 6. — Les prestations et services réalisés par l'auto-entrepreneur sur le" },
      { line: 5, text: "territoire national font l'objet d'une facturation conforme aux règles applicables." },
      {
        line: 6,
        text: "Toutes les factures émises par l'auto-entrepreneur doivent être obligatoirement libellées en monnaie nationale (dinars algériens — DZD) et comporter les identifiants fiscaux légaux.",
        isDeduced: true,
      },
      { line: 7, text: "Le registre des recettes et des achats doit être coté et paraphé par les services fiscaux." },
    ],
    deduced_line_text:
      "« Toutes les factures émises par l'auto-entrepreneur doivent être obligatoirement libellées en monnaie nationale (dinars algériens — DZD) et comporter les identifiants fiscaux légaux. »",
    deduced_line_arabic:
      "« يجب أن تكون جميع الفواتير الصادرة عن المقاول الذاتي محررة وجوباً بالعملة الوطنية (الدينار الجزائري DZD) مع ذكر الهويات الجبائية القانونية. »",
    deduction_rule_en:
      "From this exact line, MoukawilOS formats all invoices, totals, and receipts in Algerian Dinars (DZD) with mandatory NIF, NIS, and ANAE card number stamps.",
    deduction_rule_fr:
      "De cette ligne exacte, MoukawilOS verrouille la facturation et le suivi fiscal en Dinars Algériens (DZD) et intègre obligatoirement le NIF, le NIS et le numéro de carte ANAE.",
    deduction_rule_ar:
      "من هذا السطر، يحرر النظام جميع الفواتير بالدينار الجزائري DZD مع إدراج رقم التعريف الجبائي NIF ورقم بطاقة المقاول الذاتي.",
    official_url: "https://www.joradp.dz/FTP/jo-francais/2023/F2023037.pdf",
  },

  // 3. 0% VAT Exemption Clause
  "vat-exemption": {
    id: "vat-exemption",
    code: "Decree 23-197 · VAT",
    title: "0% VAT Statutory Exemption (CIDTA Art. 282 bis)",
    document_title: "Code des Impôts Directs (CIDTA) & Loi 22-23",
    gazette_ref: "Code des Impôts Directs et Taxes Assimilées / JORA n° 85",
    pdf_filename: "F2022085.pdf",
    pdf_url: "/gazettes/F2022085.pdf",
    page_number: 6,
    article_label: "Article 282 bis CIDTA",
    full_context_lines: [
      { line: 1, text: "Code des Impôts Directs et Taxes Assimilées — Régime fiscal de l'auto-entrepreneur." },
      { line: 2, text: "---" },
      { line: 3, text: "Art. 282 bis. — Les opérations réalisées par les personnes physiques" },
      { line: 4, text: "exerçant sous le statut de l'auto-entrepreneur sont dispensées de la taxe sur la valeur ajoutée." },
      {
        line: 5,
        text: "Facture établie sous le régime de l'auto-entrepreneur (Loi 22-23) — TVA Non-Assujetti (Art. 282 bis CIDTA).",
        isDeduced: true,
      },
      { line: 6, text: "Les clients B2B ne peuvent opérer aucune retenue à la source au titre de la TVA." },
    ],
    deduced_line_text:
      "« Facture établie sous le régime de l'auto-entrepreneur (Loi 22-23) — TVA Non-Assujetti (Art. 282 bis CIDTA). »",
    deduced_line_arabic:
      "« فاتورة محررة في إطار نظام المقاول الذاتي (القانون 22-23) — غير خاضع للرسم على القيمة المضافة (المادة 282 مكرر من قانون الضرائب المباشرة). »",
    deduction_rule_en:
      "From this statutory clause, MoukawilOS automatically prints the legal non-assujetti notice on every B2B invoice, ensuring complete corporate tax deductibility.",
    deduction_rule_fr:
      "De cette disposition, MoukawilOS inscrit automatiquement la mention de non-assujettissement sur chaque facture B2B pour garantir la déductibilité fiscale de vos clients.",
    deduction_rule_ar:
      "يُدرج النظام هذه العبارة الإلزامية في كل فاتورة B2B لضمان قبولها لدى مصلحة الضرائب دون أي اقتطاع.",
    official_url: "https://www.joradp.dz/FTP/jo-francais/2022/F2022085.pdf",
  },

  // 4. Cash-basis accounting rule
  "cash-basis": {
    id: "cash-basis",
    code: "Law 22-23 · Cash basis",
    title: "Cash-Basis Turnover Recognition (Encaissement Effectif)",
    document_title: "Loi n° 22-23 & Article 282 ter du CIDTA",
    gazette_ref: "Journal Officiel de la République Algérienne n° 85, Page 6",
    pdf_filename: "F2022085.pdf",
    pdf_url: "/gazettes/F2022085.pdf",
    page_number: 6,
    article_label: "Article 282 ter CIDTA",
    full_context_lines: [
      { line: 1, text: "Loi de finances / Code des Impôts Directs — Article 282 ter." },
      { line: 2, text: "---" },
      { line: 3, text: "Pour les contribuables relevant du régime de l'auto-entrepreneur," },
      {
        line: 4,
        text: "le chiffre d'affaires s'entend des recettes brutes effectivement recouvrées au cours de l'année civile au titre de l'exercice de l'activité (comptabilité d'encaissement).",
        isDeduced: true,
      },
      { line: 5, text: "Les créances non recouvrées à la clôture de l'exercice ne sont pas imposables." },
    ],
    deduced_line_text:
      "« ...le chiffre d'affaires s'entend des recettes brutes effectivement recouvrées au cours de l'année civile au titre de l'exercice de l'activité (comptabilité d'encaissement). »",
    deduced_line_arabic:
      "« ...يُقصد برقم الأعمال، الإيرادات الإجمالية المحصلة فعلياً خلال السنة المدنية بعنوان ممارسة النشاط (المحاسبة على أساس التحصيل). »",
    deduction_rule_en:
      "From this line, MoukawilOS ensures pending or uncashed invoices never generate tax liabilities or ceiling consumption until payment is settled.",
    deduction_rule_fr:
      "De cette ligne, MoukawilOS garantit que les factures émises ou en attente ne génèrent ni impôt ni consommation de plafond tant que l'argent n'est pas crédité.",
    deduction_rule_ar:
      "تطبيقاً لهذه القاعدة، لا تحتسب الفواتير المعلقة ضمن رقم الأعمال المصرح به حتى يتم قبض قيمتها فعلياً.",
    official_url: "https://www.joradp.dz/FTP/jo-francais/2022/F2022085.pdf",
  },

  // 5. G12 bis Annual Filing
  g12bis: {
    id: "g12bis",
    code: "LF 2024 · G12 bis",
    title: "G12 bis Annual Regularisation Deadline (January 20th)",
    document_title: "Loi n° 23-22 portant loi de finances pour 2024",
    gazette_ref: "Journal Officiel de la République Algérienne n° 86 (31 décembre 2023), Page 16",
    pdf_filename: "F2023086.pdf",
    pdf_url: "/gazettes/F2023086.pdf",
    page_number: 16,
    article_label: "Article 282 quater CIDTA",
    full_context_lines: [
      { line: 1, text: "Loi de finances pour 2024 — Dispositions fiscales applicables aux auto-entrepreneurs." },
      { line: 2, text: "---" },
      { line: 3, text: "Art. 282 quater. — Les contribuables souscrivent au plus tard le 30 juin une déclaration prévisionnelle G12." },
      {
        line: 4,
        text: "La déclaration définitive de régularisation série G n° 12 bis est souscrite au plus tard le 20 janvier de l'année suivant l'exercice considéré sur le chiffre d'affaires réellement encaissé.",
        isDeduced: true,
      },
      { line: 5, text: "Les auto-entrepreneurs sont formellement dispensés de la déclaration mensuelle série G n° 50." },
    ],
    deduced_line_text:
      "« La déclaration définitive de régularisation série G n° 12 bis est souscrite au plus tard le 20 janvier de l'année suivant l'exercice considéré sur le chiffre d'affaires réellement encaissé. »",
    deduced_line_arabic:
      "« يودع التصريح النهائي والتسوية سلسلة G رقم 12 مكرر في أجل أقصاه 20 جانفي من السنة الموالية على أساس رقم الأعمال المحصل فعلياً. »",
    deduction_rule_en:
      "From this line, MoukawilOS sets your statutory compliance countdown to January 20th and generates your G12 bis settlement slip.",
    deduction_rule_fr:
      "De cette ligne, MoukawilOS active le compte à rebours de conformité au 20 janvier et prépare l'état récapitulatif pour la déclaration G12 bis.",
    deduction_rule_ar:
      "يحدد النظام موعد الاستحقاق النهائي في 20 جانفي ويعد جدول التسوية الجبائية G12 مكرر.",
    official_url: "https://www.joradp.dz/FTP/jo-francais/2023/F2023086.pdf",
  },

  // 6. CASNOS Social Security
  casnos: {
    id: "casnos",
    code: "CASNOS · Social security",
    title: "Preferential Flat 24,000 DZD CASNOS Affiliation",
    document_title: "Décret exécutif relatif à la couverture sociale des auto-entrepreneurs",
    gazette_ref: "Journal Officiel de la République Algérienne / Arrêté interministériel CASNOS",
    pdf_filename: "F2023037.pdf",
    pdf_url: "/gazettes/F2023037.pdf",
    page_number: 14,
    article_label: "Régime Spécifique CASNOS",
    full_context_lines: [
      { line: 1, text: "Sécurité sociale des non-salariés (CASNOS) — Statut auto-entrepreneur." },
      { line: 2, text: "---" },
      { line: 3, text: "Les auto-entrepreneurs bénéficient d'un régime simplifié de couverture sociale obligatoire." },
      {
        line: 4,
        text: "La cotisation annuelle forfaitaire est fixée à vingt-quatre mille dinars (24 000 DA) par an, payable au plus tard le 30 juin de chaque exercice, ouvrant droit à la carte Chifa et aux pensions de retraite.",
        isDeduced: true,
      },
      { line: 5, text: "La justification de l'immatriculation à l'ANAE est exigée lors de l'affiliation." },
    ],
    deduced_line_text:
      "« La cotisation annuelle forfaitaire est fixée à vingt-quatre mille dinars (24 000 DA) par an, payable au plus tard le 30 juin de chaque exercice, ouvrant droit à la carte Chifa et aux pensions de retraite. »",
    deduced_line_arabic:
      "« يُحدد الاشتراك السنوي الجزافي بـ 24,000 دج سنوياً، يُدفع قبل 30 جوان، ويمنح حق الاستفادة من بطاقة الشفاء وحقوق التقاعد. »",
    deduction_rule_en:
      "From this line, MoukawilOS tracks your 24,000 DZD annual CASNOS liability and counts down to the June 30th payment milestone.",
    deduction_rule_fr:
      "De cette ligne, MoukawilOS intègre votre cotisation forfaitaire de 24 000 DA et vous alerte avant l'échéance du 30 juin.",
    deduction_rule_ar:
      "يحسب النظام اشتراك كاسنوس السنوي البالغ 24,000 دج وينبهك قبل موعد 30 جوان.",
    official_url: "https://www.casnos.com.dz",
  },

  // 7. Client Tax Identification (NIF 15 digits)
  nif: {
    id: "nif",
    code: "NIF · Identification",
    title: "15-Digit Tax Identification & Commercial Validity",
    document_title: "Décret exécutif n° 05-468 fixant les modalités d'établissement de la facture",
    gazette_ref: "Journal Officiel de la République Algérienne n° 80 (11 décembre 2005), Page 10",
    pdf_filename: "F2005080.pdf",
    pdf_url: "/gazettes/F2005080.pdf",
    page_number: 10,
    article_label: "Article 11 & 12",
    full_context_lines: [
      { line: 1, text: "Décret exécutif n° 05-468 fixant les conditions et modalités d'établissement de la facture." },
      { line: 2, text: "---" },
      { line: 3, text: "Art. 11. — Toute facture délivrée à un client personne morale doit obligatoirement mentionner :" },
      { line: 4, text: "- La dénomination sociale et l'adresse du siège social," },
      {
        line: 5,
        text: "- Le numéro d'identification fiscale (NIF à 15 chiffres), le numéro d'identification statistique (NIS) et le numéro de registre du commerce (RC).",
        isDeduced: true,
      },
      { line: 6, text: "Une facture dépourvue de NIF valide n'est pas admise en déduction par l'administration fiscale." },
    ],
    deduced_line_text:
      "« Le numéro d'identification fiscale (NIF à 15 chiffres), le numéro d'identification statistique (NIS) et le numéro de registre du commerce (RC). »",
    deduced_line_arabic:
      "« رقم التعريف الجبائي (NIF المكون من 15 رقماً) ورقم التعريف الإحصائي (NIS) ورقم السجل التجاري (RC). »",
    deduction_rule_en:
      "From this line, MoukawilOS validates 15-digit B2B NIFs and prevents invalid invoicing data so corporate clients cannot reject your invoices.",
    deduction_rule_fr:
      "De cette ligne, MoukawilOS valide le format à 15 chiffres du NIF de vos clients B2B pour garantir la conformité légale de vos factures.",
    deduction_rule_ar:
      "يتحقق النظام من مطابقة رقم التعريف الجبائي NIF (15 رقماً) لضمان الخصم الجبائي لزبائن الشركات.",
    official_url: "https://www.joradp.dz/FTP/jo-francais/2005/F2005080.pdf",
  },

  // 8. LF 2024 Flat 0.5% IFU Tax
  "CIDTA-282-sexies": {
    id: "CIDTA-282-sexies",
    code: "LF 2024 · CIDTA Art. 282 sexies",
    title: "Flat 0.5% IFU Tax Rate with 10,000 DZD Floor",
    document_title: "Loi n° 23-22 portant loi de finances pour 2024 (Art. 282 sexies CIDTA)",
    gazette_ref: "Journal Officiel de la République Algérienne n° 86 (31 décembre 2023), Page 15",
    pdf_filename: "F2023086.pdf",
    pdf_url: "/gazettes/F2023086.pdf",
    page_number: 15,
    article_label: "Article 282 sexies CIDTA",
    full_context_lines: [
      { line: 1, text: "Loi n° 23-22 du 24 décembre 2023 portant loi de finances pour 2024." },
      { line: 2, text: "---" },
      { line: 3, text: "Art. 282 sexies. — Les personnes physiques exerçant sous le statut d'auto-entrepreneur" },
      { line: 4, text: "sont soumises à l'impôt forfaitaire unique (IFU) libératoire de tout impôt sur le revenu global." },
      {
        line: 5,
        text: "Le taux de l'impôt forfaitaire unique est fixé à zéro virgule cinq pour cent (0,5 %) applicable sur le chiffre d'affaires effectivement encaissé, sous réserve d'un minimum légal annuel de perception de dix mille dinars (10 000 DA).",
        isDeduced: true,
      },
      { line: 6, text: "Les factures non recouvrées ne sont soumises à aucune imposition." },
    ],
    deduced_line_text:
      "« Le taux de l'impôt forfaitaire unique est fixé à zéro virgule cinq pour cent (0,5 %) applicable sur le chiffre d'affaires effectivement encaissé, sous réserve d'un minimum légal annuel de perception de dix mille dinars (10 000 DA). »",
    deduced_line_arabic:
      "« يُحدد معدل الضريبة الجزافية الوحيدة بـ 0.5% يُطبق على رقم الأعمال المحصل فعلياً، مع حد أدنى سنوي للتحصيل قدره 10,000 دج. »",
    deduction_rule_en:
      "From this line, MoukawilOS calculates your tax liability at exactly 0.5% of paid invoices with a minimum floor of 10,000 DZD.",
    deduction_rule_fr:
      "De cette ligne, MoukawilOS calcule votre IFU à 0,5 % du chiffre d'affaires encaissé avec le plancher légal de 10 000 DA.",
    deduction_rule_ar:
      "يطبق النظام نسبة 0.5% على المبالغ المحصلة فعلياً مع احترام الحد الأدنى القانوني 10,000 دج.",
    official_url: "https://www.joradp.dz/FTP/jo-francais/2023/F2023086.pdf",
  },
};

// Aliases lookup to ensure matching regardless of how citations are named
export const STATUTE_ALIASES: Record<string, string> = {
  "JORADP-2022-085:art-2": "ceiling",
  "JORADP-2022-085:art-1": "CIDTA-282-sexies",
  "JORADP-2022-085:art-13": "ceiling",
  "JORADP-2023-197:art-4": "dzd-invoicing",
  "JORADP-2023-196:art-5": "dzd-invoicing",
  "JORADP-2026-257": "casnos",
  "CIDTA-282-bis": "vat-exemption",
  "CIDTA-282-quater": "g12bis",
  "Law 22-23 · Ceiling": "ceiling",
  "Decree 23-197 · Currency": "dzd-invoicing",
  "Decree 23-197 · VAT": "vat-exemption",
  "Law 22-23 · Cash basis": "cash-basis",
  "LF 2024 · G12 bis": "g12bis",
  "CASNOS · Social security": "casnos",
  "NIF · Identification": "nif",
};

export function getStatutoryDocument(idOrCode: string): StatutoryDocument {
  const normalized = idOrCode.trim();
  const direct = STATUTORY_DOCUMENTS[normalized];
  if (direct) return direct;

  const aliasKey = STATUTE_ALIASES[normalized];
  if (aliasKey && STATUTORY_DOCUMENTS[aliasKey]) {
    return STATUTORY_DOCUMENTS[aliasKey];
  }

  // Fallback by partial code matching
  for (const [key, doc] of Object.entries(STATUTORY_DOCUMENTS)) {
    if (
      normalized.toLowerCase().includes(key.toLowerCase()) ||
      normalized.toLowerCase().includes(doc.code.toLowerCase()) ||
      doc.title.toLowerCase().includes(normalized.toLowerCase())
    ) {
      return doc;
    }
  }

  // Default to ceiling statute
  return STATUTORY_DOCUMENTS.ceiling;
}
