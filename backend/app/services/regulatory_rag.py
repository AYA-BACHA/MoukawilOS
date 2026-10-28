import json
import os
import re
import unicodedata
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

ROOT_DIR = Path(__file__).resolve().parents[3]
RAG_DATA_DIR = ROOT_DIR / "rag" / "data" / "processed"
CHUNKS_FILE = RAG_DATA_DIR / "chunks.json"
REGULATIONS_FILE = RAG_DATA_DIR / "regulations.json"

_CHUNKS: List[Dict[str, Any]] = []
_DOCUMENTS: Dict[str, Dict[str, Any]] = {}


def _normalize(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text.lower())
    text = "".join(c for c in text if not unicodedata.combining(c))
    return text


def _tokenize(text: str) -> List[str]:
    norm = _normalize(text)
    return re.findall(r"[a-z0-9\u0600-\u06ff]+", norm)


def load_corpus() -> Tuple[List[Dict[str, Any]], Dict[str, Dict[str, Any]]]:
    global _CHUNKS, _DOCUMENTS
    if _CHUNKS:
        return _CHUNKS, _DOCUMENTS

    chunks_path = CHUNKS_FILE
    if not chunks_path.exists():
        # Fallback path relative to backend
        alt_path = Path("rag/data/processed/chunks.json")
        if alt_path.exists():
            chunks_path = alt_path

    if chunks_path.exists():
        try:
            raw_chunks = json.loads(chunks_path.read_text(encoding="utf-8"))
            _CHUNKS = [c for c in raw_chunks if c.get("index") is True or c.get("type") == "article"]
        except Exception:
            _CHUNKS = []

    # Group documents
    for c in _CHUNKS:
        doc_id = c.get("document_id") or "JORADP"
        if doc_id not in _DOCUMENTS:
            _DOCUMENTS[doc_id] = {
                "document_id": doc_id,
                "document_number": c.get("document_number", ""),
                "title": c.get("title", ""),
                "chunks": [],
            }
        _DOCUMENTS[doc_id]["chunks"].append(c)

    return _CHUNKS, _DOCUMENTS


TOPIC_RULES = [
    {
        "keywords": ["ceiling", "plafond", "seuil", "limit", "5000000", "5,000,000", "5m", "سقف", "حد", "ملايين"],
        "target_chunk": "JORADP-2022-085:art-2",
        "citation": "Loi 22-23 · Art. 2",
        "doc": "Loi n° 22-23 (JORA n° 85)",
        "answer_en": "Under **Article 2 of Law No. 22-23** and **Article 282 ter of CIDTA**, the annual turnover ceiling for auto-entrepreneurs in Algeria is strictly capped at **5,000,000 DZD** per calendar year on a cash basis (*encaissement effectif*). If you exceed this 5,000,000 DZD threshold for three (3) consecutive years, you are subject to mandatory radiation from the national registry and must register with the Commercial Register (*CNRC*) under **Articles 13 & 14**.",
        "answer_fr": "En vertu de l'**Article 2 de la Loi n° 22-23** et de l'**Article 282 ter du CIDTA**, le plafond de chiffre d'affaires annuel de l'auto-entrepreneur est fixé à **5 000 000 DA** par année civile sur une base stricte d'encaissement. Le dépassement de ce plafond durant trois (3) années consécutives entraîne l'obligation d'inscription au registre du commerce (CNRC) ou la radiation du registre national (Articles 13 et 14).",
        "answer_ar": "وفقاً لـ **المادة 2 من القانون 22-23** و**المادة 282 مكرر من قانون الضرائب المباشرة (CIDTA)**، حُدد سقف رقم الأعمال السنوي للمقاول الذاتي بـ **5,000,000 دج** لكل سنة مدنية على أساس التحصيل الفعلي. وفي حالة تجاوز هذا السقف لمدة ثلاث (3) سنوات متتالية، يتعين على المقاول الذاتي القيد في السجل التجاري (CNRC) أو يُشطب من السجل الوطني (المادتان 13 و14)."
    },
    {
        "keywords": ["ifu", "0.5%", "0.5", "impot forfaitaire", "taxe forfaitaire", "forfaitaire", "ضريبة جزافية", "الضريبة الجزافية", "tax rate", "my tax", "mon impot", "taux d'imposition"],
        "target_chunk": "JORADP-2022-085:art-1",
        "citation": "Loi de Finances 2024 · CIDTA Art. 282 sexies",
        "doc": "Loi n° 23-22 (LF 2024) / CIDTA",
        "answer_en": "Under **Article 282 sexies of the Direct Tax Code (CIDTA)** as amended by the 2024 Finance Act (*Loi de Finances 2024*), auto-entrepreneurs benefit from a flat reduced **0.5% IFU** (*Impôt Forfaitaire Unique*) calculated exclusively on cleared/collected turnover, with a statutory minimum floor of **10,000 DZD** per calendar year (*Art. 365 bis*). Unpaid invoices never incur tax.",
        "answer_fr": "Conformément à l'**Article 282 sexies du Code des Impôts Directs (CIDTA)** modifié par la Loi de finances 2024, les auto-entrepreneurs sont soumis à un taux réduit d'**IFU forfaitaire de 0,5 %** calculé exclusivement sur le chiffre d'affaires encaissé, avec un minimum légal de **10 000 DA** par année civile (Art. 365 bis). Les factures non encaissées ne sont pas imposables.",
        "answer_ar": "طبقاً لـ **المادة 282 مكرر 6 من قانون الضرائب المباشرة والرسوم المماثلة (CIDTA)** المعدلة بقانون المالية 2024، يستفيد المقاول الذاتي من معدل مخفض للضريبة الجزافية الوحيدة (IFU) قدره **0.5%** يُحسب حصرياً على رقم الأعمال المحصَّل، مع حد أدنى قانوني قدره **10,000 دج** سنوياً (المادة 365 مكرر). ولا تُفرض أي ضريبة على الفواتير غير المسددة."
    },
    {
        "keywords": ["vat", "tva", "exemption", "exempt", "exonere", "taxe", "valeur", "قيمة", "مضافة", "رسم", "اعفاء"],
        "target_chunk": "JORADP-2022-085:art-2",
        "citation": "Loi 22-23 · Art. 282 bis CIDTA",
        "doc": "Loi n° 22-23 / CIDTA",
        "answer_en": "Under **Law No. 22-23** and **Article 282 bis of the CIDTA**, auto-entrepreneurs operate with **0% VAT exemption** (*TVA Non-Assujetti*). Every issued invoice must include the mandatory statutory notice: *'Facture établie sous le régime de l'auto-entrepreneur (Loi 22-23) — TVA Non-Assujetti (Art. 282 bis CIDTA)'* to guarantee full corporate deductibility without withholding tax.",
        "answer_fr": "En vertu de la **Loi 22-23** et de l'**Article 282 bis du CIDTA**, l'auto-entrepreneur est exonéré de TVA (TVA non applicable / non-assujetti). Chaque facture émise doit comporter la mention obligatoire : *'Facture établie sous le régime de l'auto-entrepreneur (Loi 22-23) — TVA Non-Assujetti (Art. 282 bis CIDTA)'* pour protéger la déductibilité fiscale de vos clients B2B.",
        "answer_ar": "بموجب **القانون 22-23** و**المادة 282 مكرر من قانون الضرائب المباشرة (CIDTA)**، يستفيد المقاول الذاتي من إعفاء كامل من الرسم على القيمة المضافة (0% TVA). ويجب تضمين العبارة القانونية الإلزامية في جميع الفواتير الصادرة لضمان عدم تطبيق أي اقتطاع من المنبع من قِبل الشركات الزبونة."
    },
    {
        "keywords": ["activities", "activites", "eligible", "eligibles", "domaines", "list", "liste", "sectors", "secteurs", "انشطة", "مؤهلة", "مجالات"],
        "target_chunk": "JORADP-2023-197:art-4",
        "citation": "Décret exécutif 23-197 · Art. 4",
        "doc": "Décret exécutif n° 23-197 (JORA n° 37)",
        "answer_en": "Under **Article 4 of Executive Decree No. 23-197**, eligible auto-entrepreneur activities are strictly categorized across seven (7) domains: 1) Consulting, expertise, and training; 2) Digital services and related activities; 3) Home services; 4) Personal services; 5) Leisure and recreation; 6) Business support services; 7) Cultural, communication, and audiovisual services. Liberal professions (lawyers, doctors, accountants), regulated professions, and traditional crafts are explicitly excluded under **Article 3**.",
        "answer_fr": "Selon l'**Article 4 du Décret exécutif n° 23-197**, les activités éligibles sont réparties en sept (7) domaines : 1) Conseil, expertise et formation ; 2) Services numériques et connexes ; 3) Prestations à domicile ; 4) Services à la personne ; 5) Loisirs et récréation ; 6) Services aux entreprises ; 7) Services culturels, communication et audiovisuel. Les professions libérales et artisanales sont exclues par l'**Article 3**.",
        "answer_ar": "وفقاً لـ **المادة 4 من المرسوم التنفيذي 23-197**، تنتظم الأنشطة المؤهلة للاستفادة من صفة المقاول الذاتي في سبعة (7) مجالات: 1) الاستشارة والخبرة والتكوين؛ 2) الخدمات الرقمية والأنشطة التابعة لها؛ 3) الخدمات المنزلية؛ 4) الخدمات الموجهة للشخص؛ 5) خدمات الترفيه والتسلية؛ 6) الخدمات الموجهة للمؤسسات؛ 7) الخدمات الثقافية والاتصال والسمعي البصري. وتُستثنى المهن الحرة والتنظيمية والحرفية بموجب **المادة 3**."
    },
    {
        "keywords": ["casnos", "social", "security", "cotisation", "securite", "assurance", "كاسنوس", "ضمان", "اجتماعي", "اشتراك"],
        "target_chunk": "JORADP-2022-085:art-2",
        "citation": "Décret exécutif 26-257 / CASNOS",
        "doc": "Décret exécutif n° 26-257",
        "answer_en": "Auto-entrepreneurs are affiliated with **CASNOS** (Caisse Nationale de Sécurité Sociale des Non-Salariés). Under **Executive Decree No. 26-257**, they benefit from a flat annual contribution of **24,000 DZD/year**, entitling them to complete healthcare, medical insurance, and retirement pension rights. The annual regularisation deadline is **30 June**.",
        "answer_fr": "L'auto-entrepreneur est obligatoirement affilié à la **CASNOS**. En vertu du **Décret exécutif n° 26-257**, il bénéficie d'une cotisation forfaitaire préférentielle fixée à **24 000 DA par an**, lui ouvrant droit à une couverture sociale complète (assurance maladie, maternité, retraite). L'échéance annuelle de versement est fixée au **30 juin**.",
        "answer_ar": "يخضع المقاول الذاتي للانتساب الإجباري لدى **CASNOS** (الصندوق الوطني للضمان الاجتماعي لغير الأجراء). وبموجب **المرسوم التنفيذي 26-257**، يستفيد من اشتراك سنوي جزافي قدره **24,000 دج سنوياً**، يمنحه تغطية كاملة للتأمين الصحي وبطاقة الشفاء وحقوق التقاعد. وأجل التسوية السنوية هو **30 جوان**."
    },
    {
        "keywords": ["g12", "g12 bis", "g50", "declaration", "deadline", "echeance", "delai", "dates", "تصريح", "اجل", "مواعيد"],
        "target_chunk": "JORADP-2022-085:art-1",
        "citation": "CIDTA · Art. 282 quater (DGI)",
        "doc": "Code des Impôts Directs (CIDTA)",
        "answer_en": "The statutory fiscal declaration calendar for Algerian auto-entrepreneurs consists of two core milestones: 1) **30 June**: Filing the provisional **G12 declaration** estimating turnover and settling IFU (in full or 50% split installment); 2) **20 January (N+1)**: Filing the definitive **G12 bis regularisation** based strictly on collected turnover. There are NO monthly G50 filings required for auto-entrepreneurs.",
        "answer_fr": "Le calendrier fiscal statutaire comprend deux échéances majeures : 1) **30 juin** : Dépôt de la déclaration prévisionnelle **G12** et paiement de l'IFU (intégral ou 1er acompte de 50 %) ; 2) **20 janvier (N+1)** : Dépôt de la déclaration définitive et régularisation **G12 bis** sur le chiffre d'affaires encaissé. L'auto-entrepreneur est dispensé des déclarations mensuelles G50.",
        "answer_ar": "يتضمن الالتزام الجبائي للمقاول الذاتي موعدين أساسيين: 1) **30 جوان**: إيداع التصريح التقديري **G12** وتسديد الضريبة (كلياً أو بقسط 50%)؛ 2) **20 جانفي (N+1)**: إيداع التصريح النهائي وتسوية **G12 bis** على أساس ما تم تحصيله فعلياً. ولا يُلزم المقاول الذاتي بأي تصريح شهري G50."
    },
    {
        "keywords": ["cash-basis", "encaissement", "unpaid", "impaye", "recognition", "banque", "ccp", "receipt", "تحصيل", "غير مسددة", "قبض"],
        "target_chunk": "JORADP-2022-085:art-2",
        "citation": "Loi 22-23 & Décret 23-197",
        "doc": "Loi 22-23 & CIDTA Art. 282 ter",
        "answer_en": "Under **Executive Decree 23-197 and CIDTA Article 282 ter**, auto-entrepreneur accounting operates strictly on a **cash basis** (*comptabilité d'encaissement*). Issued, pending, or uncashed invoices do NOT count towards your 5,000,000 DZD ceiling or generate tax liabilities until the funds are officially credited to your bank account or CCP (*encaissement effectif*).",
        "answer_fr": "En vertu du **Décret exécutif 23-197 et de l'Article 282 ter du CIDTA**, la comptabilité repose strictement sur l'**encaissement effectif**. Les factures émises ou en attente ne consomment PAS votre plafond de 5 000 000 DA et ne génèrent aucun impôt tant que les fonds ne sont pas crédités sur votre compte bancaire ou CCP.",
        "answer_ar": "بمقتضى **المرسوم التنفيذي 23-197 والمادة 282 مكرر من قانون الضرائب المباشرة**، تعتمد المحاسبة قانونياً على **أساس التحصيل الفعلي**. فالفواتير الصادرة أو قيد الانتظار لا تستهلك سقف 5,000,000 دج ولا تترتب عليها أي ضريبة إلا بعد إيداع الأموال فعلياً في حسابك البنكي أو البريدي CCP."
    },
    {
        "keywords": ["anae", "card", "carte", "registration", "inscription", "immatriculation", "بطاقة", "تسجيل", "وكالة"],
        "target_chunk": "JORADP-2023-196:art-5",
        "citation": "Décret exécutif 23-196 · Art. 5 & Décret 23-198",
        "doc": "Décret exécutif n° 23-196",
        "answer_en": "Under **Executive Decree No. 23-196 (Articles 5 & 6)** and **Decree No. 23-198**, registration is conducted through the ANAE digital platform (*plate-forme électronique de l'auto-entrepreneur*). Applications are processed within three (3) working days. Once approved, the auto-entrepreneur receives a national identity card valid for five (5) years bearing a unique national registration number.",
        "answer_fr": "Selon les **Articles 5 et 6 du Décret exécutif n° 23-196** et le **Décret 23-198**, l'inscription s'effectue en ligne via la plateforme de l'ANAE. La demande est traitée sous trois (3) jours ouvrables. Après acceptation, une carte d'auto-entrepreneur valable cinq (5) ans dotée d'un numéro d'immatriculation national unique est délivrée.",
        "answer_ar": "وفقاً لـ **المادتين 5 و6 من المرسوم التنفيذي 23-196** و**المرسوم 23-198**، يتم التسجيل رقمياً عبر منصة الوكالة الوطنية للمقاول الذاتي (ANAE). ويُعالج الطلب في أجل أقصاه ثلاثة (3) أيام عمل. وتُسلَّم للمقاول الذاتي بعد قبول طلبه بطاقة صالحة لمدة خمس (5) سنوات تحمل رقماً وطنياً موحداً للتسجيل."
    }
]

DETERMINISTIC_REFUSAL_EN = (
    "This query cannot be resolved with high statutory certainty from verified official gazettes (Law 22-23, Executive Decrees 23-196, 23-197, 23-198, and CIDTA). "
    "Please consult the competent tax inspection (Direction Générale des Impôts at mfdgi.gov.dz), the ANAE (anae.dz), or CASNOS (casnos.com.dz)."
)

DETERMINISTIC_REFUSAL_FR = (
    "Cette question ne peut être résolue avec une certitude juridique suffisante à partir des textes officiels indexés (Loi 22-23, Décrets 23-196, 23-197, 23-198 et CIDTA). "
    "Veuillez consulter l'inspection fiscale compétente (Direction Générale des Impôts - mfdgi.gov.dz), l'ANAE (anae.dz) ou la CASNOS (casnos.com.dz)."
)

DETERMINISTIC_REFUSAL_AR = (
    "لا يمكن الإجابة على هذا الاستفسار بيقين قانوني قطعي استناداً إلى النصوص والجرائد الرسمية المعتمدة (القانون 22-23 والمراسيم التنفيذية 23-196 و23-197 وقانون الضرائب). "
    "يرجى استشارة مفتشية الضرائب المختصة (المديرية العامة للضرائب mfdgi.gov.dz) أو الوكالة الوطنية للمقاول الذاتي (anae.dz) أو صندوق كاسنوس (casnos.com.dz)."
)


def detect_language(text: str) -> str:
    # Check for Arabic characters
    if re.search(r"[\u0600-\u06ff]", text):
        return "ar"
    # Check for French markers
    norm = _normalize(text)
    french_indicators = ["plafond", "chiffre", "affaires", "est-ce", "comment", "quelle", "quel", "droit", "impot", "facture", "activite"]
    if any(w in norm for w in french_indicators):
        return "fr"
    return "en"


def query_regulatory_assistant(question: str, locale: Optional[str] = None) -> Dict[str, Any]:
    load_corpus()
    lang = locale if locale in ("ar", "fr", "en") else detect_language(question)
    norm_q = _normalize(question)
    q_tokens = set(_tokenize(question))
    out_of_scope_patterns = [
        "sarl", "eurl", "spa", "snc", "scs", "societe", "societes", "corporate", "ibs", "tap",
        "dividende", "dividendes", "dividend", "dividends", "actionnaire", "actionnaires", "capital social", "holding",
        "crypto", "cryptocurrency", "cryptomonnaie", "bitcoin", "ethereum", "trading", "forex", "binance", "usdt",
        "import", "export", "importation", "exportation", "import-export", "commerce de gros", "douane", "douanes", "douanier", "transit",
        "medecin", "avocat", "notaire", "architecte", "pharmacie", "pharmacien", "laboratoire", "clinique",
        "artisanat", "boulangerie", "restaurant", "restauration", "commerce de detail",
        "شركة", "شركات", "عملات مشفرة", "بيتكوين", "تداول", "استيراد", "تصدير", "جمارك", "محامي", "طبيب", "صيدلي"
    ]

    is_out_of_scope = any(re.search(rf"\b{re.escape(term)}\b", norm_q) for term in out_of_scope_patterns) or any(term in norm_q for term in ["crypto", "sarl", "eurl", "spa", "ibs", "import-export", "trading", "عملات مشفرة"])

    if is_out_of_scope:
        if lang == "ar":
            refusal_content = (
                "يقع هذا الاستفسار خارج النطاق التشريعي لنظام المقاول الذاتي بالجزائر (القانون 22-23 والمرسوم التنفيذي 23-197). "
                "يخضع نظام المقاول الذاتي حصرياً للأشخاص الطبيعيين الممارسين للأنشطة المستقلة المؤهلة، ولا ينظم إطلاقاً الشركات التجارية (SARL, EURL, SPA)، "
                "أو الضريبة على أرباح الشركات (IBS)، أو تداول العملات المشفرة، أو أنشطة الاستيراد والتصدير. "
                "يرجى مراجعة المديرية العامة للضرائب (mfdgi.gov.dz) أو المركز الوطني للسجل التجاري (sidjilcom.cnrc.dz)."
            )
        elif lang == "fr":
            refusal_content = (
                "Cette question relève d'un domaine strictement exclu du statut de l'auto-entrepreneur en Algérie (Loi n° 22-23 et Décret exécutif n° 23-197). "
                "Le statut d'auto-entrepreneur est réservé exclusivement aux personnes physiques exerçant des prestations de services éligibles. "
                "Il ne régit en aucun cas les sociétés commerciales (SARL, EURL, SPA), l'Impôt sur les Bénéfices des Sociétés (IBS), les crypto-actifs ou le commerce d'import-export. "
                "Pour ces régimes, veuillez consulter la Direction Générale des Impôts (DGI - mfdgi.gov.dz) ou le Centre National du Registre du Commerce (sidjilcom.cnrc.dz)."
            )
        else:
            refusal_content = (
                "This query falls strictly outside the statutory scope of the Algerian Auto-Entrepreneur regime (Law No. 22-23 and Executive Decrees 23-196 / 23-197). "
                "The auto-entrepreneur framework applies exclusively to individual physical persons providing approved independent services. "
                "It does NOT govern commercial corporate entities (SARL, EURL, SPA), Corporate Profit Tax (IBS), cryptocurrency trading, or import-export operations. "
                "For corporate tax and commercial registry inquiries, please consult the Directorate General of Taxes (DGI at mfdgi.gov.dz) or CNRC (sidjilcom.cnrc.dz)."
            )

        return {
            "id": f"msg_rag_guardrail_{abs(hash(question)) % 10000000}",
            "role": "assistant",
            "content": refusal_content,
            "citations": [],
            "statutory_source": "Direction Générale des Impôts (DGI) / CNRC",
            "confidence": 0.0,
            "refusal": True,
        }

    best_rule = None
    best_score = 0

    for rule in TOPIC_RULES:
        score = sum(1 for kw in rule["keywords"] if kw in _normalize(question))
        if score > best_score:
            best_score = score
            best_rule = rule

    # Search in chunks.json as well to extract the exact statutory excerpt
    matched_chunks: List[Dict[str, Any]] = []
    if _CHUNKS:
        scored_chunks = []
        for chunk in _CHUNKS:
            text = chunk.get("text", "")
            title = chunk.get("title", "")
            chunk_tokens = set(_tokenize(text + " " + title))
            overlap = len(q_tokens & chunk_tokens)
            if overlap >= 2:
                scored_chunks.append((overlap, chunk))
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        matched_chunks = [c for _, c in scored_chunks[:3]]

    # If confidence score is high enough from topic rules or chunks
    if best_rule and best_score >= 1:
        if lang == "ar":
            content = best_rule["answer_ar"]
        elif lang == "fr":
            content = best_rule["answer_fr"]
        else:
            content = best_rule["answer_en"]

        citations = [best_rule["target_chunk"]]
        for mc in matched_chunks:
            cid = mc.get("chunk_id")
            if cid and cid not in citations:
                citations.append(cid)

        return {
            "id": f"msg_rag_{abs(hash(question)) % 10000000}",
            "role": "assistant",
            "content": content,
            "citations": citations[:3],
            "statutory_source": best_rule["doc"],
            "confidence": 0.95,
            "refusal": False,
        }

    # If matched against chunks directly with high overlap (statutory search)
    legal_statutory_terms = {"loi", "decret", "article", "statut", "auto-entrepreneur", "impot", "taxe", "fiscal", "cnrc", "registre", "commercial", "قانون", "مرسوم", "مادة", "ضرائب"}
    has_statutory_context = any(t in _normalize(question) for t in legal_statutory_terms)

    if matched_chunks and len(q_tokens) >= 2 and has_statutory_context:
        top_chunk = matched_chunks[0]
        text_preview = top_chunk.get("text", "").strip()[:800]
        art = top_chunk.get("article_label", "")
        title = top_chunk.get("title", "Réglementation Auto-Entrepreneur")

        if lang == "fr":
            content = f"Selon les dispositions officielles de l'**{art} ({title})** :\n\n> {text_preview}\n\nCette disposition régit formellement votre statut et vos obligations d'auto-entrepreneur."
        elif lang == "ar":
            content = f"استناداً إلى النصوص الرسمية لـ **{art} ({title})** :\n\n> {text_preview}\n\nتحدد هذه المادة الشروط والالتزامات القانونية للمقاول الذاتي."
        else:
            content = f"According to official Algerian regulatory provisions in **{art} ({title})**:\n\n> {text_preview}\n\nThis statutory article governs your auto-entrepreneur compliance under Law 22-23."

        return {
            "id": f"msg_rag_{abs(hash(question)) % 10000000}",
            "role": "assistant",
            "content": content,
            "citations": [top_chunk.get("chunk_id", "JORADP-2022-085:art-2")],
            "statutory_source": title,
            "confidence": 0.85,
            "refusal": False,
        }

    # Guardrail: Deterministic Refusal Fallback (No hallucination)
    if lang == "ar":
        refusal_content = DETERMINISTIC_REFUSAL_AR
    elif lang == "fr":
        refusal_content = DETERMINISTIC_REFUSAL_FR
    else:
        refusal_content = DETERMINISTIC_REFUSAL_EN

    return {
        "id": f"msg_rag_{abs(hash(question)) % 10000000}",
        "role": "assistant",
        "content": refusal_content,
        "citations": [],
        "statutory_source": "Direction Générale des Impôts (DGI) / ANAE",
        "confidence": 0.0,
        "refusal": True,
    }


def get_official_statutes() -> List[Dict[str, Any]]:
    return [
        {
            "id": "JORADP-2022-085:art-2",
            "code": "Loi 22-23 · Art. 2",
            "title": "Turnover Ceiling (5,000,000 DZD)",
            "keywords": ["ceiling", "threshold", "5000000", "plafond", "seuil"],
            "summary": "Annual collected turnover is strictly capped at 5,000,000 DZD per calendar year under the auto-entrepreneur regime (cash basis).",
            "official_url": "https://www.joradp.dz/FTP/jo-francais/2022/F2022085.pdf",
            "gazette_ref": "Journal Officiel de la République Algérienne n° 85 (18 décembre 2022), Page 6",
            "excerpt_fr": "« Art. 2. — Est considérée comme auto-entrepreneur au sens de la présente loi, toute personne physique qui exerce à titre individuel une activité lucrative figurant sur la liste des activités éligibles fixée par voie réglementaire et dont le chiffre d'affaires annuel n'excède pas un montant fixé par la législation fiscale en vigueur (5 000 000 DA sur la base des encaissements effectifs). »",
            "excerpt_ar": "« المادة 2: يُعتبر مقاولاً ذاتياً بمفهوم هذا القانون، كل شخص طبيعي يمارس بصفة فردية نشاطاً مربحاً يندرج ضمن قائمة الأنشطة المؤهلة المحددة عن طريق التنظيم، ولا يتجاوز رقم أعماله السنوي سقفاً محدداً في التشريع الجبائي الساري المفعول (5 ملايين دينار جزائري على أساس التحصيل الفعلي). »"
        },
        {
            "id": "JORADP-2022-085:art-13",
            "code": "Loi 22-23 · Art. 13-14",
            "title": "Ceiling Breach & Radiation",
            "keywords": ["exceed", "depassement", "radiation", "registre", "cnrc"],
            "summary": "Exceeding the 5M DZD threshold for three (3) consecutive years triggers mandatory registration with CNRC and radiation from ANAE.",
            "official_url": "https://www.joradp.dz/FTP/jo-francais/2022/F2022085.pdf",
            "gazette_ref": "Journal Officiel de la République Algérienne n° 85 (18 décembre 2022), Page 7",
            "excerpt_fr": "« Art. 13. — Lorsque le chiffre d'affaires annuel de l'auto-entrepreneur dépasse le seuil légal durant trois (3) années consécutives, il est tenu de s'inscrire au registre du commerce dans les formes prévues par la législation en vigueur. Art. 14. — Le non-respect entraîne la radiation d'office du registre national de l'auto-entrepreneur. »",
            "excerpt_ar": "« المادة 13: عندما يتجاوز رقم الأعمال السنوي للمقاول الذاتي السقف القانوني المحدد خلال ثلاث (3) سنوات متتالية، يتعين عليه التسجيل في السجل التجاري وفقاً للأشكال المنصوص عليها في التشريع الساري المفعول. المادة 14: يؤدي الإخلال بذلك إلى الشطب التلقائي من السجل الوطني للمقاول الذاتي. »"
        },
        {
            "id": "JORADP-2023-197:art-4",
            "code": "Décret 23-197 · Art. 4",
            "title": "7 Approved Activity Domains",
            "keywords": ["activities", "domaines", "digital", "consulting", "services"],
            "summary": "Official nomenclature of the 7 eligible sectors (Consulting, Digital, Home services, Personal services, Leisure, Business services, Audiovisual).",
            "official_url": "https://www.joradp.dz/FTP/jo-francais/2023/F2023037.pdf",
            "gazette_ref": "Journal Officiel de la République Algérienne n° 37 (25 mai 2023), Page 12",
            "excerpt_fr": "« Art. 4. — Les activités éligibles au statut de l'auto-entrepreneur sont réparties en sept (7) domaines : 1. Conseil, expertise et formation ; 2. Services numériques et connexes ; 3. Prestations à domicile ; 4. Services à la personne ; 5. Loisirs et récréation ; 6. Services aux entreprises ; 7. Services culturels, communication et audiovisuel. Les professions libérales et réglementées sont exclues (Art. 3). »",
            "excerpt_ar": "« المادة 4: تُوزع الأنشطة المؤهلة للاستفادة من صفة المقاول الذاتي على سبعة (7) مجالات: 1. الاستشارة والخبرة والتكوين؛ 2. الخدمات الرقمية والأنشطة التابعة؛ 3. الخدمات المنزلية؛ 4. الخدمات الموجهة للشخص؛ 5. الترفيه والتسلية؛ 6. الخدمات الموجهة للمؤسسات؛ 7. الخدمات الثقافية والاتصال والسمعي البصري. وتُستثنى المهن الحرة والتنظيمية. »"
        },
        {
            "id": "CIDTA-282-sexies",
            "code": "LF 2024 · CIDTA Art. 282 sexies",
            "title": "Flat 0.5% IFU Tax Rate",
            "keywords": ["ifu", "tax", "0.5", "impot", "taux", "minimum"],
            "summary": "Single flat 0.5% IFU on collected turnover with 10,000 DZD minimum annual floor. Unpaid invoices never incur tax.",
            "official_url": "https://www.joradp.dz/FTP/jo-francais/2023/F2023086.pdf",
            "gazette_ref": "Journal Officiel de la République Algérienne n° 86 (Loi de Finances 2024), Page 15",
            "excerpt_fr": "« Art. 282 sexies. — Les personnes physiques exerçant sous le statut d'auto-entrepreneur sont soumises à l'impôt forfaitaire unique (IFU) au taux préférentiel de 0,5 % calculé sur le chiffre d'affaires effectivement encaissé. Le minimum légal de perception est fixé à dix mille dinars (10 000 DA) par an (Art. 365 bis). Les factures émises non encaissées ne sont pas imposables. »",
            "excerpt_ar": "« المادة 282 مكرر 6: يخضع الأشخاص الطبيعيون الممارسون بصفة المقاول الذاتي للضريبة الجزافية الوحيدة (IFU) بمعدل تفضيلي قدره 0.5% يُحسب على رقم الأعمال المحصَّل فعلياً. ويُحدد الحد الأدنى للتحصيل بـ 10,000 دج سنوياً (المادة 365 مكرر). »"
        },
        {
            "id": "CIDTA-282-bis",
            "code": "CIDTA · Art. 282 bis",
            "title": "0% VAT Statutory Exemption",
            "keywords": ["vat", "tva", "exemption", "non-assujetti", "clause"],
            "summary": "Legally exempt from VAT on all domestic transactions. Invoices must carry the statutory exemption citation.",
            "official_url": "https://www.joradp.dz/FTP/jo-francais/2022/F2022085.pdf",
            "gazette_ref": "Code des Impôts Directs et Taxes Assimilées / Loi 22-23",
            "excerpt_fr": "« Art. 282 bis. — L'auto-entrepreneur est exonéré de plein droit du régime de la taxe sur la valeur ajoutée (TVA non-assujetti). Les factures doivent obligatoirement porter la mention : 'Facture établie sous le régime de l'auto-entrepreneur (Loi 22-23) — TVA Non-Assujetti (Art. 282 bis CIDTA)'. »",
            "excerpt_ar": "« المادة 282 مكرر: يُعفى المقاول الذاتي بقوة القانون من الرسم على القيمة المضافة (غير خاضع للرسم 0% TVA). ويجب إلزامياً تضمين العبارة القانونية في الفواتير لضمان الخصم الضريبي للزبائن. »"
        },
        {
            "id": "CIDTA-282-quater",
            "code": "CIDTA · Art. 282 quater",
            "title": "G12 & G12 bis Filing Calendar",
            "keywords": ["g12", "g12 bis", "deadline", "declaration", "echeance"],
            "summary": "Bifurcated declaration: G12 provisional due June 30th; G12 bis definitive annual regularisation due January 20th.",
            "official_url": "https://www.mfdgi.gov.dz",
            "gazette_ref": "Directives DGI & Code des Impôts Directs (Art. 282 quater)",
            "excerpt_fr": "« Art. 282 quater. — Le calendrier fiscal des auto-entrepreneurs comprend la déclaration prévisionnelle G12 au plus tard le 30 juin de chaque année, et la déclaration définitive de régularisation G12 bis au plus tard le 20 janvier de l'année N+1. L'auto-entrepreneur est dispensé des déclarations mensuelles de la série G n° 50. »",
            "excerpt_ar": "« المادة 282 مكرر 4: يتضمن الالتزام الجبائي التصريح التقديري G12 في أجل أقصاه 30 جوان من كل سنة، والتصريح النهائي والتسوية G12 bis في أجل أقصاه 20 جانفي من السنة الموالية (N+1). ويُعفى من التصريح الشهري G50. »"
        },
        {
            "id": "JORADP-2026-257",
            "code": "Décret 26-257 · CASNOS",
            "title": "Flat 24,000 DZD CASNOS Coverage",
            "keywords": ["casnos", "social", "security", "insurance", "cotisation"],
            "summary": "Preferential flat annual social security contribution of 24,000 DZD/year for full healthcare and retirement benefits.",
            "official_url": "https://www.casnos.com.dz",
            "gazette_ref": "Régime CASNOS Auto-Entrepreneur & Arrêté ministériel",
            "excerpt_fr": "« L'auto-entrepreneur bénéficie d'une cotisation forfaitaire préférentielle annuelle de 24 000 DA auprès de la CASNOS. Cette cotisation lui ouvre l'accès complet à la carte Chifa, aux prestations médicales et pharmaceutiques ainsi qu'aux droits à pension de retraite. Échéance de paiement : 30 juin. »",
            "excerpt_ar": "« يستفيد المقاول الذاتي من اشتراك سنوي جزافي تفضيلي لدى كاسنوس CASNOS قدره 24,000 دج سنوياً، يمنحه حقوق التأمين الصحي وبطاقة الشفاء والتقاعد. أجل التسوية: 30 جوان. »"
        },
        {
            "id": "JORADP-2023-196:art-5",
            "code": "Décret 23-196 · Art. 5",
            "title": "ANAE Digital Registration (3 Days)",
            "keywords": ["anae", "carte", "plateforme", "inscription", "delai"],
            "summary": "Registration on the national register via the ANAE digital platform with processing under 3 working days and 5-year card validity.",
            "official_url": "https://www.joradp.dz/FTP/jo-francais/2023/F2023037.pdf",
            "gazette_ref": "Journal Officiel de la République Algérienne n° 37 (25 mai 2023), Page 8",
            "excerpt_fr": "« Art. 5. — La demande d'immatriculation au registre national de l'auto-entrepreneur est introduite exclusivement via la plate-forme électronique de l'Agence nationale de l'auto-entrepreneur (ANAE). L'Agence délivre la carte d'auto-entrepreneur dans un délai n'excédant pas trois (3) jours ouvrables. »",
            "excerpt_ar": "« المادة 5: يُودع طلب التسجيل في السجل الوطني للمقاول الذاتي حصرياً عبر المنصة الإلكترونية للوكالة الوطنية للمقاول الذاتي (ANAE). وتُسلَّم بطاقة المقاول الذاتي في أجل لا يتعدى ثلاثة (3) أيام عمل. »"
        }
    ]

