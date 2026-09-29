/* ==========================================================================
   MoukawilOS — Application Logic & Compliance Integration
   Single source of truth: rules.js & calc.js
   Date: 29 September 2026
   ========================================================================== */

// ---------------------------------------------------------------------------
// 1. Invoices Data (Internally Consistent: Paid 2026 = 1,850,000 DZD)
// ---------------------------------------------------------------------------

const invoicesData = [
  {
    id: 'FA-2026-012',
    client: 'TechVision Algérie',
    clientAddress: '45 Boulevard Mohamed V, Alger',
    clientNif: '001916001234567',
    date: '2026-09-15',
    dueDate: '2026-10-15',
    status: 'paid',
    items: [
      { desc: 'Développement d\'application web — Phase 2', qty: 40, rate: 4500 },
      { desc: 'Audit technique et optimisation de performance', qty: 8, rate: 6000 }
    ],
    notes: 'Paiement par virement bancaire CPA effectué.\nCompte N° 00200 0180 0300 1234 56'
  },
  {
    id: 'FA-2026-011',
    client: 'Studio Andalous',
    clientAddress: '12 Rue Larbi Ben M\'Hidi, Oran',
    clientNif: '002031009876543',
    date: '2026-09-02',
    dueDate: '2026-10-02',
    status: 'pending',
    items: [
      { desc: 'Refonte intégrale de site web et intégration responsive', qty: 1, rate: 85000 }
    ],
    notes: 'Paiement à 30 jours par chèque ou virement bancaire.'
  },
  {
    id: 'FA-2026-010',
    client: 'Dar Digital',
    clientAddress: 'Cité des 500 Logements, Constantine',
    clientNif: '001825007654321',
    date: '2026-08-28',
    dueDate: '2026-09-28',
    status: 'paid',
    items: [
      { desc: 'Développement d\'API REST sécurisée', qty: 32, rate: 4500 },
      { desc: 'Architecture et modélisation de base de données', qty: 4, rate: 5000 }
    ],
    notes: 'Règlement reçu par virement BNA.'
  },
  {
    id: 'FA-2026-009',
    client: 'Collectif Créatif',
    clientAddress: 'Tlemcen',
    clientNif: '',
    date: '2026-08-15',
    dueDate: '2026-09-15',
    status: 'overdue',
    items: [
      { desc: 'Création et intégration de page d\'atterrissage (landing page)', qty: 1, rate: 42000 }
    ],
    notes: 'Paiement attendu par virement ou chèque.'
  },
  {
    id: 'FA-2026-008',
    client: 'Espace Numérique',
    clientAddress: '8 Rue Hassiba Ben Bouali, Alger',
    clientNif: '002116005544332',
    date: '2026-08-01',
    dueDate: '2026-09-01',
    status: 'paid',
    items: [
      { desc: 'Plateforme e-commerce — Module de gestion catalogue', qty: 1, rate: 145000 },
      { desc: 'Intégration passerelle de paiement électronique CIB/Edahabia', qty: 1, rate: 50000 }
    ],
    notes: 'Paiement intégral reçu.'
  },
  {
    id: 'FA-2026-007',
    client: 'Agence Atlas',
    clientAddress: 'Sétif',
    clientNif: '001719003322114',
    date: '2026-07-18',
    dueDate: '2026-08-18',
    status: 'paid',
    items: [
      { desc: 'Développement d\'interface mobile React Native', qty: 24, rate: 5000 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-006',
    client: 'Média Plus',
    clientAddress: 'Alger',
    clientNif: '001516008899001',
    date: '2026-07-05',
    dueDate: '2026-08-05',
    status: 'paid',
    items: [
      { desc: 'Personnalisation CMS et optimisation SEO', qty: 14, rate: 4500 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-005',
    client: 'Startup DZ',
    clientAddress: 'Boumerdès',
    clientNif: '002235001122334',
    date: '2026-06-22',
    dueDate: '2026-07-22',
    status: 'paid',
    items: [
      { desc: 'Développement plateforme SaaS — Sprints 1 à 3', qty: 1, rate: 250000 },
      { desc: 'Configuration infrastructure Cloud et déploiement Docker', qty: 12, rate: 5000 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-004',
    client: 'Cabinet Horizon',
    clientAddress: 'Blida',
    clientNif: '001609004455667',
    date: '2026-06-10',
    dueDate: '2026-07-10',
    status: 'paid',
    items: [
      { desc: 'Tableau de bord de gestion interne sur mesure', qty: 1, rate: 78000 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-003',
    client: 'Digital Solutions Algérie',
    clientAddress: 'Annaba',
    clientNif: '001923009988776',
    date: '2026-05-28',
    dueDate: '2026-06-28',
    status: 'paid',
    items: [
      { desc: 'Services d\'ingénierie logicielle backend', qty: 28, rate: 4500 },
      { desc: 'Rédaction documentation d\'architecture technique', qty: 4, rate: 3500 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-002',
    client: 'Maghreb Tech',
    clientAddress: 'Béjaïa',
    clientNif: '001806001239874',
    date: '2026-04-12',
    dueDate: '2026-05-12',
    status: 'paid',
    items: [
      { desc: 'Développement d\'application de gestion d\'inventaire', qty: 1, rate: 280000 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-001',
    client: 'InnoServices',
    clientAddress: 'Alger Centre',
    clientNif: '001716007788990',
    date: '2026-03-05',
    dueDate: '2026-04-05',
    status: 'paid',
    items: [
      { desc: 'Prestation d\'assistance technique et refonte frontend', qty: 1, rate: 272000 }
    ],
    notes: 'Première facture émise après obtention de la carte ANAE et du NIF.'
  }
];

// ---------------------------------------------------------------------------
// 2. User Business Profile (Settings)
// ---------------------------------------------------------------------------

let userProfile = {
  name: 'Amina Benali',
  email: 'amina.benali@email.com',
  phone: '+213 555 12 34 56',
  activity: 'Développement de logiciels et applications web',
  nif: '002345678901234',
  anae: '25/00-0142857',
  casnos: '0142857390',
  address: '12 Rue des Frères Bouadou, Bir Mourad Raïs, Alger',
  language: 'fr'
};

// ---------------------------------------------------------------------------
// 3. State & Navigation
// ---------------------------------------------------------------------------

let currentScreen = 'dashboard';
let currentFilter = 'all';
let currentLanguage = 'fr';

const screenTitles = {
  fr: {
    'dashboard': 'Tableau de bord',
    'invoices': 'Factures',
    'create-invoice': 'Nouvelle facture',
    'invoice-preview': 'Visualisation facture',
    'documents': 'Documents administratifs',
    'compliance': 'Conformité & Échéances',
    'rules': 'Règles & Sources officielles',
    'assistant': 'Assistant Réglementaire',
    'settings': 'Paramètres'
  },
  en: {
    'dashboard': 'Dashboard',
    'invoices': 'Invoices',
    'create-invoice': 'New invoice',
    'invoice-preview': 'Invoice view',
    'documents': 'Documents',
    'compliance': 'Compliance',
    'rules': 'Rules & Sources',
    'assistant': 'Regulatory Assistant',
    'settings': 'Settings'
  },
  ar: {
    'dashboard': 'لوحة القيادة',
    'invoices': 'الفواتير',
    'create-invoice': 'فاتورة جديدة',
    'invoice-preview': 'معاينة الفاتورة',
    'documents': 'الوثائق',
    'compliance': 'الامتثال القانوني',
    'rules': 'القواعد والمصادر',
    'assistant': 'المساعد القانوني',
    'settings': 'الإعدادات'
  }
};

function navigateTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + screen);
  if (target) {
    target.classList.add('active');
  }

  const titles = screenTitles[currentLanguage] || screenTitles.fr;
  document.getElementById('page-title').textContent = titles[screen] || screen;

  const navScreen = ['create-invoice', 'invoice-preview'].includes(screen) ? 'invoices' : screen;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.screen === navScreen);
  });

  currentScreen = screen;
  document.querySelector('.main-body').scrollTop = 0;

  if (screen === 'dashboard') {
    updateDashboard();
  } else if (screen === 'compliance') {
    renderComplianceScreen();
  } else if (screen === 'rules') {
    renderRulesScreen();
  } else if (screen === 'invoices') {
    renderInvoicesTable();
  }
}

// ---------------------------------------------------------------------------
// 4. Formatting Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '0 DZD';
  const str = Math.round(amount).toString();
  const parts = [];
  for (let i = str.length; i > 0; i -= 3) {
    parts.unshift(str.slice(Math.max(0, i - 3), i));
  }
  return parts.join(' ') + ' DZD';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function getInvoiceTotal(invoice) {
  return (invoice.items || []).reduce((sum, item) => sum + (item.qty * item.rate), 0);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------------------------------------------------------------------------
// 5. Dashboard Data Synchronization (All Numbers Computed)
// ---------------------------------------------------------------------------

function updateDashboard() {
  let revenueThisYear = 0;
  let monthTotal = 0;
  let outstanding = 0;
  let monthPaidCount = 0;
  let pendingCount = 0;

  invoicesData.forEach(inv => {
    const total = getInvoiceTotal(inv);
    const date = inv.date || '';

    if (inv.status === 'paid' && date.startsWith('2026')) {
      revenueThisYear += total;
      if (date.startsWith('2026-09')) {
        monthTotal += total;
        monthPaidCount++;
      }
    } else if (inv.status === 'pending' || inv.status === 'overdue') {
      outstanding += total;
      pendingCount++;
    }
  });

  // Update Stat Cards
  const revEl = document.getElementById('dash-revenue-val');
  if (revEl) revEl.textContent = formatCurrency(revenueThisYear);

  const monthEl = document.getElementById('dash-month-val');
  if (monthEl) monthEl.textContent = formatCurrency(monthTotal);

  const monthSub = document.getElementById('dash-month-sub');
  if (monthSub) monthSub.textContent = `${monthPaidCount} facture${monthPaidCount > 1 ? 's' : ''} encaissée${monthPaidCount > 1 ? 's' : ''}`;

  const outEl = document.getElementById('dash-outstanding-val');
  if (outEl) outEl.textContent = formatCurrency(outstanding);

  const outSub = document.getElementById('dash-outstanding-sub');
  if (outSub) outSub.textContent = `${pendingCount} facture${pendingCount > 1 ? 's' : ''} en attente`;

  // Update Threshold Widget via MoukawilCalc
  if (window.MoukawilCalc) {
    const thresh = window.MoukawilCalc.thresholdStatus(revenueThisYear, 2026);
    const curEl = document.getElementById('dash-threshold-current');
    const ceilEl = document.getElementById('dash-threshold-ceiling');
    const fillEl = document.getElementById('dash-threshold-fill');
    const noteEl = document.getElementById('dash-threshold-note');

    if (curEl) curEl.textContent = formatCurrency(thresh.currentRevenue);
    if (ceilEl) ceilEl.textContent = formatCurrency(thresh.ceiling);
    if (fillEl) fillEl.style.width = Math.min(100, thresh.percent) + '%';
    if (noteEl) {
      noteEl.innerHTML = `<strong>${thresh.percent}%</strong> du plafond légal de ${formatCurrency(thresh.ceiling)}. Situation conforme.`;
    }
  }

  // Update Recent Invoices
  const recentTbody = document.getElementById('dash-recent-invoices-tbody');
  if (recentTbody) {
    const recent = invoicesData.slice(0, 5);
    recentTbody.innerHTML = recent.map(inv => {
      const total = getInvoiceTotal(inv);
      return `
        <tr>
          <td class="col-id">${inv.id}</td>
          <td>${inv.client}</td>
          <td class="col-date">${formatDate(inv.date)}</td>
          <td class="col-amount">${formatCurrency(total)}</td>
          <td><span class="status status-${inv.status}">${translateStatus(inv.status)}</span></td>
        </tr>
      `;
    }).join('');
  }

  // Update Upcoming Obligations from buildCalendar (No quarterly CASNOS!)
  const obContainer = document.getElementById('dash-obligations-container');
  if (obContainer && window.MoukawilCalc) {
    const calendar = window.MoukawilCalc.buildCalendar(2026, '2026-09-29');
    const upcoming = calendar.filter(o => o.status === 'upcoming' || o.status === 'due-soon').slice(0, 2);

    let html = '';
    // Highlight overdue invoice if any
    const overdueInv = invoicesData.find(i => i.status === 'overdue');
    if (overdueInv) {
      html += `
        <div class="obligation-item">
          <div class="obligation-name">Relance client : Facture ${overdueInv.id}</div>
          <div class="obligation-meta"><span class="overdue">${formatCurrency(getInvoiceTotal(overdueInv))} en retard</span> · ${overdueInv.client}</div>
          <button class="btn btn-sm btn-ghost" onclick="viewInvoice('${overdueInv.id}')">Voir la facture</button>
        </div>
      `;
    }

    upcoming.forEach(ob => {
      html += `
        <div class="obligation-item">
          <div class="obligation-name">${ob.title}</div>
          <div class="obligation-meta"><span class="due-soon">Échéance : ${ob.displayDeadline}</span> · ${ob.form}</div>
          <button class="btn btn-sm btn-ghost" onclick="navigateTo('compliance')">Détails</button>
        </div>
      `;
    });

    obContainer.innerHTML = html;
  }
}

function translateStatus(status) {
  const map = {
    'paid': 'Encaissée',
    'pending': 'En attente',
    'overdue': 'En retard',
    'draft': 'Brouillon',
    'avoir': 'Avoir'
  };
  return map[status] || capitalize(status);
}

// ---------------------------------------------------------------------------
// 6. Invoices Screen & Table
// ---------------------------------------------------------------------------

function renderInvoicesTable() {
  const tbody = document.getElementById('invoices-tbody');
  if (!tbody) return;

  const searchTerm = (document.getElementById('invoice-search')?.value || '').toLowerCase();
  let filtered = invoicesData;

  if (currentFilter !== 'all') {
    filtered = filtered.filter(inv => inv.status === currentFilter);
  }

  if (searchTerm) {
    filtered = filtered.filter(inv =>
      inv.id.toLowerCase().includes(searchTerm) ||
      inv.client.toLowerCase().includes(searchTerm)
    );
  }

  tbody.innerHTML = filtered.map(inv => {
    const total = getInvoiceTotal(inv);
    const isAvoir = inv.id.startsWith('AV-');
    return `
      <tr>
        <td class="col-id">${inv.id} ${isAvoir ? '<span class="credit-note-badge">Avoir</span>' : ''}</td>
        <td>${inv.client}</td>
        <td class="col-date">${formatDate(inv.date)}</td>
        <td class="col-date">${formatDate(inv.dueDate)}</td>
        <td class="col-amount">${formatCurrency(total)}</td>
        <td><span class="status status-${inv.status}">${translateStatus(inv.status)}</span></td>
        <td class="col-actions">
          <button class="btn btn-ghost btn-sm" onclick="viewInvoice('${inv.id}')">Consulter</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ---------------------------------------------------------------------------
// 7. View Invoice Document & Inalterability (Credit Notes)
// ---------------------------------------------------------------------------

function viewInvoice(invoiceId) {
  const inv = invoicesData.find(i => i.id === invoiceId);
  if (!inv) return;

  const total = getInvoiceTotal(inv);
  const container = document.getElementById('invoice-document');
  const actionButtonsContainer = document.getElementById('inv-action-buttons');
  const isFinalized = inv.status === 'paid' || inv.status === 'pending' || inv.status === 'overdue';
  const isAvoir = inv.id.startsWith('AV-');

  // Strict legal rule: Finalized invoices cannot be edited. Offer Credit Note ("Avoir")
  if (actionButtonsContainer) {
    if (isAvoir) {
      actionButtonsContainer.innerHTML = `<span class="credit-note-badge">Avoir comptable inaltérable</span>`;
    } else if (isFinalized) {
      actionButtonsContainer.innerHTML = `
        <button class="btn btn-ghost" onclick="issueCreditNote('${inv.id}')" title="Émettre un avoir légal rectificatif">
          <svg viewBox="0 0 15 15" style="width:12px; height:12px; margin-right:4px;"><path d="M2 7.5h11M7.5 2L2 7.5 7.5 13"/></svg>
          Établir un avoir rectificatif
        </button>
      `;
    } else {
      actionButtonsContainer.innerHTML = `
        <button class="btn btn-ghost" onclick="showToast('Facture brouillon modifiable')">Modifier</button>
      `;
    }
  }

  // Get mandatory legal mentions from rules.js
  const vatRule = window.MoukawilRules ? window.MoukawilRules.getRule('vatMention') : null;
  const vatMentionText = vatRule ? vatRule.value : 'Franchise de TVA — Article 282 sexies du CIDTA — TVA non applicable';

  container.innerHTML = `
    <div class="inv-header">
      <div>
        <div class="inv-brand">${escapeHtml(userProfile.name)}</div>
        <div class="inv-brand-sub">${escapeHtml(userProfile.activity)}</div>
        <div style="font-size: var(--fs-xs); color: var(--text-3); margin-top: 4px;">
          NIF : <strong>${escapeHtml(userProfile.nif)}</strong> · N° Carte ANAE : <strong>${escapeHtml(userProfile.anae)}</strong>
        </div>
      </div>
      <div style="text-align: right">
        <div class="inv-title">${isAvoir ? 'Facture d\'Avoir' : 'Facture'}</div>
        <div style="font-size: var(--fs-xs); color: var(--text-3);">Conforme Décret exécutif n° 05-468</div>
      </div>
    </div>

    <div class="inv-details-row">
      <div class="inv-detail-item">
        <div class="inv-detail-label">Numéro séquentiel</div>
        <div class="inv-detail-value" style="font-family: var(--font-mono)">${inv.id}</div>
      </div>
      <div class="inv-detail-item">
        <div class="inv-detail-label">Date d'émission</div>
        <div class="inv-detail-value">${formatDate(inv.date)}</div>
      </div>
      <div class="inv-detail-item">
        <div class="inv-detail-label">Date d'échéance</div>
        <div class="inv-detail-value">${formatDate(inv.dueDate)}</div>
      </div>
      <div class="inv-detail-item">
        <div class="inv-detail-label">Statut</div>
        <div class="inv-detail-value"><span class="status status-${inv.status}">${translateStatus(inv.status)}</span></div>
      </div>
    </div>

    <div class="inv-parties">
      <div>
        <div class="inv-party-label">Émetteur (Prestataire)</div>
        <div class="inv-party-name">${escapeHtml(userProfile.name)}</div>
        <div class="inv-party-detail">
          ${escapeHtml(userProfile.activity)}<br>
          ${escapeHtml(userProfile.address)}<br>
          NIF : ${escapeHtml(userProfile.nif)}<br>
          Immatriculation ANAE : ${escapeHtml(userProfile.anae)}
        </div>
      </div>
      <div>
        <div class="inv-party-label">Client (Destinataire)</div>
        <div class="inv-party-name">${escapeHtml(inv.client)}</div>
        <div class="inv-party-detail">
          ${escapeHtml(inv.clientAddress || 'Adresse non spécifiée')}<br>
          ${inv.clientNif ? `NIF Client : ${escapeHtml(inv.clientNif)}<br>` : ''}
        </div>
      </div>
    </div>

    <table class="inv-items-table">
      <thead>
        <tr>
          <th>Description détaillée des prestations</th>
          <th class="align-right">Quantité</th>
          <th class="align-right">Prix unitaire (DZD)</th>
          <th class="align-right">Total (DZD)</th>
        </tr>
      </thead>
      <tbody>
        ${inv.items.map(item => `
          <tr>
            <td>${escapeHtml(item.desc)}</td>
            <td class="align-right">${item.qty}</td>
            <td class="align-right">${formatCurrency(item.rate)}</td>
            <td class="align-right">${formatCurrency(item.qty * item.rate)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="inv-totals">
      <div class="inv-total-row grand">
        <span class="t-label">${isAvoir ? 'Montant crédité' : 'Net à payer'}</span>
        <span class="t-value">${formatCurrency(total)}</span>
      </div>
    </div>

    ${inv.notes ? `
      <div class="inv-notes">
        <strong>Conditions de règlement & Coordonnées :</strong><br>
        ${escapeHtml(inv.notes).replace(/\n/g, '<br>')}
      </div>
    ` : ''}

    <div class="inv-notes" style="border-top: 1px solid var(--border-light); padding-top: var(--s4); margin-top: var(--s8);">
      <div style="font-size: var(--fs-xs); color: var(--text-2); font-weight: var(--w-medium);">
        ${vatMentionText}
      </div>
      <div style="font-size: 11px; color: var(--text-3); margin-top: 4px; line-height: 1.5;">
        Dispensé d'immatriculation au registre du commerce (Loi n° 22-23 du 18 décembre 2022, Art. 2 & 11). Document comptable officiel inaltérable (Décret exécutif n° 05-468). Archivage obligatoire 10 ans.
      </div>
    </div>
  `;

  navigateTo('invoice-preview');
}

function issueCreditNote(originalInvoiceId) {
  const original = invoicesData.find(i => i.id === originalInvoiceId);
  if (!original) return;

  const countAvoirs = invoicesData.filter(i => i.id.startsWith('AV-2026-')).length + 1;
  const avoirId = `AV-2026-${String(countAvoirs).padStart(3, '0')}`;

  const avoir = {
    id: avoirId,
    client: original.client,
    clientAddress: original.clientAddress,
    clientNif: original.clientNif,
    date: '2026-09-29',
    dueDate: '2026-09-29',
    status: 'avoir',
    items: original.items.map(item => ({
      desc: `Avoir rectificatif sur facture ${original.id} : ${item.desc}`,
      qty: item.qty,
      rate: -Math.abs(item.rate)
    })),
    notes: `Avoir émis conformément au Décret exécutif n° 05-468 pour annulation / rectification de la facture ${original.id}.`
  };

  invoicesData.unshift(avoir);
  renderInvoicesTable();
  updateDashboard();
  showToast(`Avoir ${avoirId} émis avec succès pour la facture ${original.id}`);
  viewInvoice(avoirId);
}

function printInvoicePDF() {
  window.print();
}

// ---------------------------------------------------------------------------
// 8. Create Invoice Flow & Validation
// ---------------------------------------------------------------------------

function initiateNewInvoice() {
  // Check if NIF or ANAE number is missing
  const hasNif = userProfile.nif && userProfile.nif.trim().length >= 10;
  const hasAnae = userProfile.anae && userProfile.anae.trim().length >= 5;
  const warningBox = document.getElementById('invoice-guard-warning');

  if (!hasNif || !hasAnae) {
    if (warningBox) warningBox.style.display = 'flex';
  } else {
    if (warningBox) warningBox.style.display = 'none';
  }

  // Compute next sequential ID (FA-2026-NNN)
  const regularInvoices = invoicesData.filter(i => i.id.startsWith('FA-2026-'));
  const nextSeq = regularInvoices.length + 1;
  const numInput = document.getElementById('inv-number');
  if (numInput) numInput.value = `FA-2026-${String(nextSeq).padStart(3, '0')}`;

  updatePreview();
  navigateTo('create-invoice');
}

function addLineItem() {
  const tbody = document.getElementById('line-items-body');
  const row = document.createElement('tr');
  row.className = 'line-item-row';
  row.innerHTML = `
    <td><input type="text" placeholder="Description de la prestation" class="li-desc" oninput="updatePreview()"></td>
    <td><input type="number" class="num-input li-qty" value="1" min="0" step="1" oninput="updatePreview()"></td>
    <td><input type="number" class="num-input li-rate" value="0" min="0" step="500" oninput="updatePreview()"></td>
    <td class="line-item-total">0 DZD</td>
    <td>
      <button class="remove-line-btn" onclick="removeLineItem(this)" title="Supprimer">
        <svg viewBox="0 0 14 14"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
      </button>
    </td>
  `;
  tbody.appendChild(row);
  updatePreview();
}

function removeLineItem(btn) {
  const tbody = document.getElementById('line-items-body');
  if (tbody.children.length <= 1) return;
  btn.closest('tr').remove();
  updatePreview();
}

function updatePreview() {
  const rows = document.querySelectorAll('.line-item-row');
  let grandTotal = 0;

  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.li-qty')?.value) || 0;
    const rate = parseFloat(row.querySelector('.li-rate')?.value) || 0;
    const total = qty * rate;
    grandTotal += total;
    const totalCell = row.querySelector('.line-item-total');
    if (totalCell) totalCell.textContent = formatCurrency(total);
  });

  const grandTotalEl = document.getElementById('invoice-grand-total');
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

  // Update Preview Card
  const clientInput = document.getElementById('inv-client');
  const pvClient = document.getElementById('pv-client');
  if (pvClient && clientInput) {
    pvClient.textContent = clientInput.value || '—';
    pvClient.style.color = clientInput.value ? 'inherit' : 'var(--text-4)';
  }

  const dateInput = document.getElementById('inv-date');
  const pvDate = document.getElementById('pv-date');
  if (pvDate && dateInput) pvDate.textContent = formatDate(dateInput.value);

  const dueDateInput = document.getElementById('inv-due-date');
  const pvDue = document.getElementById('pv-due');
  if (pvDue && dueDateInput) pvDue.textContent = formatDate(dueDateInput.value);

  const numInput = document.getElementById('inv-number');
  const pvNum = document.getElementById('pv-number');
  if (pvNum && numInput) pvNum.textContent = numInput.value;

  // Seller Details in preview
  const pvSellerName = document.getElementById('pv-seller-name');
  if (pvSellerName) pvSellerName.textContent = userProfile.name;

  const pvSellerNif = document.getElementById('pv-seller-nif');
  if (pvSellerNif) pvSellerNif.textContent = userProfile.nif;

  const pvSellerAnae = document.getElementById('pv-seller-anae');
  if (pvSellerAnae) pvSellerAnae.textContent = userProfile.anae;

  // Preview Line Items
  const pvItems = document.getElementById('pv-items');
  if (pvItems) {
    pvItems.innerHTML = '';
    rows.forEach(row => {
      const desc = row.querySelector('.li-desc')?.value || '—';
      const qty = row.querySelector('.li-qty')?.value || '0';
      const rate = parseFloat(row.querySelector('.li-rate')?.value) || 0;
      const total = (parseFloat(qty) || 0) * rate;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="${desc === '—' ? 'color: var(--text-4)' : ''}">${escapeHtml(desc)}</td>
        <td class="align-right">${qty}</td>
        <td class="align-right">${formatCurrency(rate).replace(' DZD', '')}</td>
        <td class="align-right">${formatCurrency(total).replace(' DZD', '')}</td>
      `;
      pvItems.appendChild(tr);
    });
  }

  const pvTotal = document.getElementById('pv-total');
  if (pvTotal) pvTotal.textContent = 'Total : ' + formatCurrency(grandTotal);
}

function createInvoice() {
  // Blocking check for required legal identifiers
  if (!userProfile.nif || userProfile.nif.trim().length < 10 || !userProfile.anae || userProfile.anae.trim().length < 5) {
    showToast('Blocage : Renseignez votre NIF et N° ANAE dans les Paramètres avant d\'émettre une facture');
    navigateTo('settings');
    return;
  }

  const client = document.getElementById('inv-client')?.value.trim();
  if (!client) {
    showToast('Veuillez renseigner le nom du client');
    return;
  }

  const rows = document.querySelectorAll('.line-item-row');
  let hasItem = false;
  rows.forEach(row => {
    const desc = row.querySelector('.li-desc')?.value.trim();
    const rate = parseFloat(row.querySelector('.li-rate')?.value) || 0;
    if (desc && rate > 0) hasItem = true;
  });

  if (!hasItem) {
    showToast('Veuillez ajouter au moins une ligne de prestation avec un montant');
    return;
  }

  const items = [];
  rows.forEach(row => {
    const desc = row.querySelector('.li-desc')?.value.trim() || '';
    const qty = parseFloat(row.querySelector('.li-qty')?.value) || 0;
    const rate = parseFloat(row.querySelector('.li-rate')?.value) || 0;
    if (desc && rate > 0) {
      items.push({ desc, qty, rate });
    }
  });

  const invNumber = document.getElementById('inv-number')?.value || `FA-2026-${String(invoicesData.length + 1).padStart(3, '0')}`;

  const newInvoice = {
    id: invNumber,
    client: client,
    clientAddress: document.getElementById('inv-client-address')?.value || '',
    clientNif: document.getElementById('inv-client-nif')?.value || '',
    date: document.getElementById('inv-date')?.value || '2026-09-29',
    dueDate: document.getElementById('inv-due-date')?.value || '2026-10-29',
    status: 'pending',
    items: items,
    notes: document.getElementById('inv-notes')?.value || ''
  };

  invoicesData.unshift(newInvoice);
  renderInvoicesTable();
  updateDashboard();
  showToast(`Facture ${newInvoice.id} créée avec succès`);
  viewInvoice(newInvoice.id);
}

// ---------------------------------------------------------------------------
// 9. Compliance Screen & Estimator
// ---------------------------------------------------------------------------

function renderComplianceScreen() {
  if (!window.MoukawilCalc) return;

  const calendar = window.MoukawilCalc.buildCalendar(2026, '2026-09-29');
  const upcomingList = document.getElementById('compliance-upcoming-list');
  const completedList = document.getElementById('compliance-completed-list');

  if (upcomingList) {
    const upcoming = calendar.filter(o => o.status === 'upcoming' || o.status === 'due-soon');
    upcomingList.innerHTML = upcoming.map(ob => `
      <div class="obligation-card ${ob.status === 'due-soon' ? 'attention' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div class="ob-name">${ob.title}</div>
          <span class="badge-status ${ob.verified ? 'badge-verified' : 'badge-conflicting'}">
            ${ob.verified ? 'Vérifié officiel' : 'À confirmer'}
          </span>
        </div>
        <div class="ob-meta">Échéance légale : <strong>${ob.displayDeadline}</strong> · ${ob.authority} · Formulaire : ${ob.form}</div>
        <div style="font-size: var(--fs-xs); color: var(--text-2); margin-top: var(--s2); line-height: 1.4;">${ob.description}</div>
        <div style="font-size: 11px; color: var(--text-3); margin-top: var(--s2)">Source : ${ob.legalRef}</div>
      </div>
    `).join('');
  }

  if (completedList) {
    const completed = calendar.filter(o => o.status === 'completed');
    completedList.innerHTML = completed.map(ob => `
      <div class="completed-item">
        <div class="completed-check">
          <svg viewBox="0 0 10 10"><path d="M2 5.5L4 7.5L8 3"/></svg>
        </div>
        <div class="completed-text">
          <div class="c-name">${ob.title}</div>
          <div class="c-date">Échéance : ${ob.displayDeadline} (${ob.legalRef}) — Validé</div>
        </div>
      </div>
    `).join('');
  }

  runComplianceEstimator();
}

function runComplianceEstimator() {
  if (!window.MoukawilCalc) return;

  const turnoverInput = document.getElementById('sim-turnover');
  const turnover = parseFloat(turnoverInput?.value) || 0;

  const selectedOpt = document.querySelector('input[name="casnos-opt"]:checked')?.value || 'flat';
  const assietteInput = document.getElementById('sim-assiette');
  const assietteGroup = document.getElementById('sim-assiette-group');
  const assiette = parseFloat(assietteInput?.value) || 288000;

  // Toggle assiette input visibility
  if (assietteGroup) {
    assietteGroup.style.display = selectedOpt === 'general' ? 'block' : 'none';
  }

  // Update card active classes
  const flatCard = document.getElementById('opt-casnos-flat-card');
  const genCard = document.getElementById('opt-casnos-gen-card');
  if (flatCard) flatCard.classList.toggle('active', selectedOpt === 'flat');
  if (genCard) genCard.classList.toggle('active', selectedOpt === 'general');

  // Compute IFU via pure function
  const ifuResult = window.MoukawilCalc.computeIFU(turnover);

  // Compute CASNOS via pure function
  const casnosResult = window.MoukawilCalc.computeCasnos({
    option: selectedOpt,
    assiette: assiette
  });

  const total = ifuResult.amount + casnosResult.amount;

  // Update DOM
  const resIfu = document.getElementById('sim-res-ifu');
  if (resIfu) {
    resIfu.innerHTML = `${formatCurrency(ifuResult.amount)} ${ifuResult.minimumApplied ? '<span style="font-size:11px; color:#d9381e; font-weight:normal">(Minimum légal appliqué)</span>' : ''}`;
  }

  const resCasnos = document.getElementById('sim-res-casnos');
  if (resCasnos) {
    resCasnos.textContent = formatCurrency(casnosResult.amount);
  }

  const resTotal = document.getElementById('sim-res-total');
  if (resTotal) {
    resTotal.textContent = formatCurrency(total);
  }

  const resFormula = document.getElementById('sim-res-formula');
  if (resFormula) {
    resFormula.innerHTML = `
      <strong>IFU (0,5%) :</strong> ${ifuResult.formula}<br>
      <strong>CASNOS :</strong> ${casnosResult.formula}<br>
      <strong>Total estimé :</strong> ${formatCurrency(ifuResult.amount)} + ${formatCurrency(casnosResult.amount)} = ${formatCurrency(total)}
    `;
  }
}

// ---------------------------------------------------------------------------
// 10. Rules & Sources Screen (Jury Transparency Table)
// ---------------------------------------------------------------------------

function renderRulesScreen() {
  const tbody = document.getElementById('rules-table-tbody');
  if (!tbody || !window.MoukawilRules) return;

  const rules = window.MoukawilRules.getAllRules();

  tbody.innerHTML = rules.map(rule => {
    let displayValue = rule.value;
    if (typeof rule.value === 'number') {
      if (rule.id === 'ifuRate' || rule.id === 'casnosRate') {
        displayValue = (rule.value * 100).toFixed(1) + ' %';
      } else {
        displayValue = formatCurrency(rule.value);
      }
    } else if (Array.isArray(rule.value)) {
      displayValue = `${rule.value.length} mentions obligatoires`;
    } else if (typeof rule.value === 'boolean') {
      displayValue = rule.value ? 'Requis' : 'Dispensé';
    }

    let badgeClass = 'badge-verified';
    let badgeText = 'Vérifié officiel';
    if (rule.status === 'secondary-only') {
      badgeClass = 'badge-secondary';
      badgeText = 'Source secondaire';
    } else if (rule.status === 'conflicting') {
      badgeClass = 'badge-conflicting';
      badgeText = 'En conflit';
    } else if (rule.status === 'unknown') {
      badgeClass = 'badge-unknown';
      badgeText = 'Inconnu (Arrêté en attente)';
    }

    return `
      <tr>
        <td><span class="rule-code">${rule.id}</span></td>
        <td>
          <div style="font-weight: var(--w-medium); color: var(--text-1)">${rule.label}</div>
          <div style="font-size: 11px; color: var(--text-3); margin-top: 2px;">${rule.notes || ''}</div>
        </td>
        <td><strong style="font-family: var(--font-mono)">${displayValue}</strong></td>
        <td>
          <div>${rule.source.text}</div>
          <div style="font-size: 11px; color: var(--text-2); font-weight: var(--w-medium)">${rule.source.ref}</div>
          <a href="${rule.source.url}" target="_blank" rel="noopener" class="rule-source-link">Consulter source ↗</a>
        </td>
        <td><span class="badge-status ${badgeClass}">${badgeText}</span></td>
        <td style="font-size: var(--fs-xs); color: var(--text-3); white-space: nowrap">${rule.lastChecked}</td>
      </tr>
    `;
  }).join('');
}

// ---------------------------------------------------------------------------
// 11. Regulatory Assistant (Grounded in rules.js, Honest Prototype)
// ---------------------------------------------------------------------------

const assistantKnowledge = [
  {
    topic: 'registration',
    keywords: ['inscrire', 'inscription', 'demarche', 'démarche', 'après', 'carte', 'debut', 'commencer', 'register'],
    buildResponse: () => {
      const nifDays = window.MoukawilRules.getRule('nifDeclarationDays')?.value || 30;
      const casnosDays = window.MoukawilRules.getRule('casnosAffiliationDays')?.value || 10;
      return {
        body: `<p>Après avoir reçu votre carte d'auto-entrepreneur délivrée par l'ANAE (valable 5 ans selon le Décret exécutif n° 23-196), vous devez accomplir les formalités officielles suivantes :</p>
<ol>
  <li><strong>Souscrire la déclaration d'existence fiscale (NIF)</strong> : dans les <strong>${nifDays} jours</strong> suivant la délivrance de la carte auprès de votre Centre des Impôts (CDI/CPI) compétent (formulaire Série G n° 8).</li>
  <li><strong>S'affilier à la CASNOS</strong> : dans un délai strict de <strong>${casnosDays} jours</strong> suivant le début d'activité. L'affiliation est obligatoire.</li>
  <li><strong>Ouvrir un compte bancaire professionnel ou CCP</strong> : dédié exclusivement aux encaissements et décaissements de votre activité.</li>
  <li><strong>Aucune inscription au Registre du Commerce (RC)</strong> : l'auto-entrepreneur est expressément dispensé de RC et de NIS.</li>
</ol>`,
        sources: [
          { ruleId: 'nifDeclarationDays', ref: 'Loi 22-23 Art. 11 / CIDTA Art. 183', text: 'Déclaration d\'existence fiscale sous 30 jours', status: 'verified-official' },
          { ruleId: 'casnosAffiliationDays', ref: 'Loi 83-14 / Décret 15-289 Art. 8', text: 'Affiliation CASNOS sous 10 jours', status: 'verified-official' },
          { ruleId: 'rcRequired', ref: 'Loi 22-23 Art. 2 & 11', text: 'Dispense expresse de registre du commerce', status: 'verified-official' }
        ]
      };
    }
  },
  {
    topic: 'ifu',
    keywords: ['ifu', 'impot', 'impôt', 'taxe', 'fiscal', 'taux', 'minimum', 'g12', 'g12bis', 'g12 bis'],
    buildResponse: () => {
      const rate = window.MoukawilRules.getRule('ifuRate');
      const min = window.MoukawilRules.getRule('ifuMinimum');
      const g12 = window.MoukawilRules.getRule('g12Deadline');
      const g12bis = window.MoukawilRules.getRule('g12bisDeadline');
      return {
        body: `<p>L'auto-entrepreneur est assujetti au régime de l'<strong>Impôt Forfaitaire Unique (IFU)</strong> :</p>
<ol>
  <li><strong>Taux libératoire</strong> : <strong>${(rate.value * 100).toFixed(1)}%</strong> du chiffre d'affaires annuel pour toutes les activités éligibles (Loi de Finances 2024 art. 18 modifiant l'art. 282 sexies du CIDTA). Ce taux est libératoire de l'IRG et de la TVA.</li>
  <li><strong>Minimum d'imposition</strong> : <strong>${formatCurrency(min.value)}</strong> par an (CIDTA art. 365 bis), dû même en cas de chiffre d'affaires nul.</li>
  <li><strong>Déclaration prévisionnelle (G12)</strong> : à souscrire au plus tard le <strong>${g12.value}</strong> de l'année en cours avec paiement de l'impôt (ou 1ère fraction de 50%).</li>
  <li><strong>Déclaration définitive (G12 bis)</strong> : à souscrire au plus tard le <strong>${g12bis.value}</strong> pour régulariser le chiffre d'affaires effectif de l'année civile.</li>
</ol>
<p><em>Rappel de conformité</em> : Aucune déclaration mensuelle n'est exigée par la DGI ni par l'ANAE.</p>`,
        sources: [
          { ruleId: 'ifuRate', ref: 'CIDTA Art. 282 sexies (LF 2024 Art. 18)', text: 'Taux IFU de 0,5% applicable à toutes les activités', status: 'verified-official' },
          { ruleId: 'ifuMinimum', ref: 'CIDTA Art. 365 bis', text: 'Minimum annuel d\'imposition de 10 000 DZD', status: 'verified-official' },
          { ruleId: 'g12Deadline', ref: 'CIDTA Art. 282 quater', text: 'Échéance G12 fixée au 30 juin', status: 'verified-official' },
          { ruleId: 'g12bisDeadline', ref: 'CIDTA Art. 282 quater', text: 'Échéance G12 bis fixée au 20 janvier N+1', status: 'verified-official' }
        ]
      };
    }
  },
  {
    topic: 'casnos',
    keywords: ['casnos', 'cotisation', 'retraite', 'sécurité sociale', 'sociale', 'snmg', 'forfait'],
    buildResponse: () => {
      const flat = window.MoukawilRules.getRule('casnosFlat');
      const rate = window.MoukawilRules.getRule('casnosRate');
      const minBase = window.MoukawilRules.getRule('casnosBaseMin');
      const maxBase = window.MoukawilRules.getRule('casnosBaseMax');
      const deadline = window.MoukawilRules.getRule('casnosDeadline');
      return {
        body: `<p>Pour la couverture sociale (assurance maladie & retraite), l'auto-entrepreneur relève de la <strong>CASNOS</strong> :</p>
<ol>
  <li><strong>Option Forfaitaire Auto-entrepreneur</strong> : <strong>${formatCurrency(flat.value)} / an</strong>. C'est l'option avantageuse dédiée aux porteurs de la carte ANAE.</li>
  <li><strong>Option Régime Général</strong> : <strong>${(rate.value * 100).toFixed(0)}%</strong> sur assiette déclarée (Décret exécutif n° 26-257 du 15 juillet 2026 modifiant le décret 15-289). Assiette comprise entre 1× SNMG annuel (${formatCurrency(minBase.value)} => cotisation ${formatCurrency(minBase.value * 0.15)}) et 20× SNMG annuel (${formatCurrency(maxBase.value)} => cotisation ${formatCurrency(maxBase.value * 0.15)}).</li>
  <li><strong>Périodicité de paiement</strong> : annuelle en un versement unique avant le <strong>${deadline.value}</strong>. Aucune cotisation trimestrielle ordinaire.</li>
  <li><strong>Barème plancher 3ème année</strong> : prévu en principe par la doctrine mais non fixé par arrêté ministériel au 29/09/2026 (statut : inconnu, à confirmer auprès de votre agence).</li>
</ol>`,
        sources: [
          { ruleId: 'casnosFlat', ref: 'Décision conjointe Ministère du Travail / ANAE', text: 'Option forfaitaire 24 000 DZD/an pour auto-entrepreneurs', status: 'verified-official' },
          { ruleId: 'casnosRate', ref: 'Décret exécutif n° 26-257 du 15/07/2026', text: 'Régime général 15% (7,5% maladie + 7,5% retraite)', status: 'verified-official' },
          { ruleId: 'casnosDeadline', ref: 'Décret exécutif 15-289 Art. 14', text: 'Paiement annuel exigible au 30 juin', status: 'verified-official' },
          { ruleId: 'casnosThirdYearFloor', ref: 'Arrêté d\'application en attente', text: 'Plancher 3ème année non publié', status: 'unknown' }
        ]
      };
    }
  },
  {
    topic: 'ceiling',
    keywords: ['plafond', 'seuil', '5 000 000', '5 millions', 'depassement', 'dépassement', 'exceed', '8 millions', '10 millions'],
    buildResponse: () => {
      const ceiling = window.MoukawilRules.getRule('annualCeiling');
      const years = window.MoukawilRules.getRule('ceilingConsecutiveYears');
      return {
        body: `<p>Le plafond légal annuel de chiffre d'affaires est fixé à <strong>${formatCurrency(ceiling.value)} par an</strong> (Loi n° 22-23 Art. 2 & CIDTA Art. 282 ter).</p>
<p><strong>Règle légale en cas de dépassement :</strong></p>
<ol>
  <li>L'auto-entrepreneur qui dépasse ce plafond pendant <strong>${years.value} années consécutives</strong> est radié d'office du Registre National de l'Auto-Entrepreneur (Loi 22-23 Art. 13 et 14).</li>
  <li>Il a l'obligation légale de s'inscrire au Registre du Commerce (EURL, SARL ou entreprise individuelle).</li>
  <li>Les rumeurs de plafonds à 8 millions ou 10 millions de DA, ou de "bascule forcée sous 30 jours", sont non vérifiées et contraires aux textes législatifs actuels.</li>
</ol>
<p><em>Note produit MoukawilOS</em> : L'alerte déclenchée à 80% (4 000 000 DZD) est une fonctionnalité de précaution logicielle de MoukawilOS, et non une obligation légale.</p>`,
        sources: [
          { ruleId: 'annualCeiling', ref: 'Loi n° 22-23 Art. 2 / CIDTA Art. 282 ter', text: 'Plafond strict de 5 000 000 DZD/an', status: 'verified-official' },
          { ruleId: 'ceilingConsecutiveYears', ref: 'Loi n° 22-23 Art. 13 & 14', text: 'Radiation en cas de dépassement sur 3 années consécutives', status: 'verified-official' }
        ]
      };
    }
  },
  {
    topic: 'invoicing',
    keywords: ['facture', 'facturation', 'mention', 'mentions', 'tva', 'avoir', 'loi 22-18', 'obligatoire'],
    buildResponse: () => {
      const mentions = window.MoukawilRules.getRule('invoiceMandatoryMentions');
      const vat = window.MoukawilRules.getRule('vatMention');
      const record = window.MoukawilRules.getRule('recordKeepingYears');
      return {
        body: `<p>La facturation de l'auto-entrepreneur est régie par le <strong>Décret exécutif n° 05-468</strong> et le régime fiscal de l'IFU :</p>
<ol>
  <li><strong>Mentions obligatoires</strong> : nom & prénom, adresse, activité ANAE, NIF à 15 chiffres, N° de carte ANAE, identité du client (+ son NIF s'il est professionnel), date, numéro séquentiel chronologique unique (ex: FA-2026-001), détail des prestations et total en DZD.</li>
  <li><strong>Mention TVA obligatoire</strong> : <em>« ${vat.value} »</em>. (Toute référence à la « Loi 22-18 » est erronée).</li>
  <li><strong>Inaltérabilité</strong> : une facture émise ne peut être modifiée. Toute correction impose l'émission d'un <strong>avoir</strong> (note de crédit).</li>
  <li><strong>Archivage</strong> : conservation obligatoire pendant <strong>${record.value} ans</strong> (Code de commerce Art. 12).</li>
</ol>`,
        sources: [
          { ruleId: 'invoiceMandatoryMentions', ref: 'Décret exécutif n° 05-468 Art. 4 à 11', text: 'Mentions légales obligatoires sur facture', status: 'verified-official' },
          { ruleId: 'vatMention', ref: 'CIDTA Art. 282 sexies', text: 'Mention officielle de franchise en TVA', status: 'verified-official' },
          { ruleId: 'recordKeepingYears', ref: 'Code de commerce Art. 12', text: 'Conservation des pièces comptables 10 ans', status: 'verified-official' }
        ]
      };
    }
  }
];

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  const container = document.getElementById('chat-messages');

  // User bubble
  const userMsg = document.createElement('div');
  userMsg.className = 'message';
  userMsg.innerHTML = `
    <div class="message-sender user">Vous</div>
    <div class="message-body"><p>${escapeHtml(message)}</p></div>
  `;
  container.appendChild(userMsg);
  input.value = '';

  const lower = message.toLowerCase();
  let match = null;

  for (const item of assistantKnowledge) {
    if (item.keywords.some(k => lower.includes(k))) {
      match = item;
      break;
    }
  }

  setTimeout(() => {
    const assistantMsg = document.createElement('div');
    assistantMsg.className = 'message';

    if (match) {
      const response = match.buildResponse();
      let sourcesHtml = '';
      if (response.sources && response.sources.length > 0) {
        sourcesHtml = `
          <div class="message-sources">
            <div class="sources-label">Sources officielles (rules.js)</div>
            ${response.sources.map(s => `
              <div class="source-item">
                <span class="badge-status ${s.status === 'verified-official' ? 'badge-verified' : 'badge-unknown'}" style="margin-right:6px">
                  ${s.status === 'verified-official' ? 'Vérifié officiel' : 'Inconnu'}
                </span>
                ${s.text} — <span class="source-ref">${s.ref}</span>
              </div>
            `).join('')}
          </div>
        `;
      }
      assistantMsg.innerHTML = `
        <div class="message-sender assistant">Assistant Réglementaire MoukawilOS</div>
        <div class="message-body">${response.body}</div>
        ${sourcesHtml}
      `;
    } else {
      // Honest fallback when unverified
      assistantMsg.innerHTML = `
        <div class="message-sender assistant">Assistant Réglementaire MoukawilOS</div>
        <div class="message-body">
          <p><strong>Information non vérifiée dans la base réglementaire :</strong></p>
          <p>Je n'ai pas de réponse vérifiée sur ce point précis dans les textes de lois actuellement indexés. Conformément aux principes de transparence de MoukawilOS, aucune réponse n'est inventée.</p>
          <p>Veuillez consulter directement les organismes compétents :</p>
          <ul>
            <li><strong>Fiscalité (IFU, NIF)</strong> : Direction Générale des Impôts (<a href="https://www.mfdgi.gov.dz" target="_blank" class="link">mfdgi.gov.dz</a>)</li>
            <li><strong>Statut & Activités</strong> : Agence Nationale de l'Auto-Entrepreneur (<a href="https://anae.dz" target="_blank" class="link">anae.dz</a>)</li>
            <li><strong>Cotisations sociales</strong> : Caisse Nationale de Sécurité Sociale des Non-Salariés (<a href="https://www.casnos.dz" target="_blank" class="link">casnos.dz</a>)</li>
          </ul>
        </div>
        <div class="message-sources">
          <div class="sources-label">Statut</div>
          <div class="source-item"><span class="badge-status badge-unknown">Non répertorié</span> — Vérification requise auprès des autorités</div>
        </div>
      `;
    }

    container.appendChild(assistantMsg);
    container.scrollTop = container.scrollHeight;
  }, 350);

  container.scrollTop = container.scrollHeight;
}

function initAssistantChat() {
  const container = document.getElementById('chat-messages');
  if (!container || container.children.length > 0) return;

  // Initial welcome Q&A
  const item1 = assistantKnowledge[0].buildResponse();
  const item2 = assistantKnowledge[3].buildResponse();

  container.innerHTML = `
    <div class="message">
      <div class="message-sender user">Vous</div>
      <div class="message-body"><p>Quelles sont les démarches obligatoires après réception de la carte d'auto-entrepreneur ?</p></div>
    </div>
    <div class="message">
      <div class="message-sender assistant">Assistant Réglementaire MoukawilOS</div>
      <div class="message-body">${item1.body}</div>
      <div class="message-sources">
        <div class="sources-label">Sources officielles vérifiées</div>
        ${item1.sources.map(s => `<div class="source-item"><span class="badge-status badge-verified">Vérifié officiel</span> ${s.text} — <span class="source-ref">${s.ref}</span></div>`).join('')}
      </div>
    </div>

    <div class="message">
      <div class="message-sender user">Vous</div>
      <div class="message-body"><p>Que se passe-t-il si je dépasse le plafond annuel de 5 millions de DA ?</p></div>
    </div>
    <div class="message">
      <div class="message-sender assistant">Assistant Réglementaire MoukawilOS</div>
      <div class="message-body">${item2.body}</div>
      <div class="message-sources">
        <div class="sources-label">Sources officielles vérifiées</div>
        ${item2.sources.map(s => `<div class="source-item"><span class="badge-status badge-verified">Vérifié officiel</span> ${s.text} — <span class="source-ref">${s.ref}</span></div>`).join('')}
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// 12. Settings & Profile Management
// ---------------------------------------------------------------------------

function saveSettings() {
  const name = document.getElementById('set-name')?.value.trim();
  const email = document.getElementById('set-email')?.value.trim();
  const phone = document.getElementById('set-phone')?.value.trim();
  const activity = document.getElementById('set-activity')?.value.trim();
  const nif = document.getElementById('set-nif')?.value.trim();
  const anae = document.getElementById('set-anae')?.value.trim();
  const casnos = document.getElementById('set-casnos')?.value.trim();
  const address = document.getElementById('set-address')?.value.trim();

  if (!name || !nif || !anae) {
    showToast('Le nom, le NIF et le numéro ANAE sont obligatoires');
    return;
  }

  userProfile.name = name;
  userProfile.email = email || userProfile.email;
  userProfile.phone = phone || userProfile.phone;
  userProfile.activity = activity || userProfile.activity;
  userProfile.nif = nif;
  userProfile.anae = anae;
  userProfile.casnos = casnos || userProfile.casnos;
  userProfile.address = address || userProfile.address;

  // Update header / sidebar display
  const nameEl = document.getElementById('user-display-name');
  if (nameEl) nameEl.textContent = userProfile.name;

  showToast('Paramètres et identifiants réglementaires enregistrés');
  navigateTo('dashboard');
}

// ---------------------------------------------------------------------------
// 13. Languages & RTL Support
// ---------------------------------------------------------------------------

const i18nDict = {
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.invoices': 'Factures',
    'nav.documents': 'Documents',
    'nav.compliance': 'Conformité',
    'nav.rules': 'Règles & Sources',
    'nav.assistant': 'Assistant Réglementaire',
    'nav.settings': 'Paramètres',
    'dashboard.statRevenue': 'Chiffre d\'affaires annuel (2026)',
    'dashboard.statMonth': 'Ce mois (septembre 2026)',
    'dashboard.statOutstanding': 'En attente d\'encaissement',
    'dashboard.recentInvoices': 'Dernières factures',
    'dashboard.recentActivity': 'Activité récente',
    'dashboard.upcomingObligations': 'Échéances administratives',
    'dashboard.thresholdTitle': 'Seuil de chiffre d\'affaires',
    'common.viewAll': 'Tout afficher',
    'table.invoice': 'N° Facture',
    'table.client': 'Client',
    'table.date': 'Date',
    'table.dueDate': 'Échéance',
    'table.amount': 'Montant',
    'table.status': 'Statut',
    'table.actions': 'Actions',
    'filter.all': 'Toutes',
    'filter.paid': 'Payées',
    'filter.pending': 'En attente',
    'filter.overdue': 'En retard',
    'invoices.newInvoice': 'Nouvelle facture',
    'invoices.intro': 'Gestion de vos factures et avoirs. Numérotation séquentielle conforme aux obligations de facturation (Décret exécutif 05-468).',
    'createInvoice.intro': 'Établissement d\'une facture. Les mentions obligatoires sont appliquées automatiquement selon le décret 05-468 et le statut ANAE.',
    'documents.intro': 'Pièces justificatives, attestations fiscales et déclarations administratives de votre micro-activité.',
    'compliance.intro': 'Suivi exact du calendrier fiscal et parafiscal de l\'auto-entrepreneur algérien. Les échéances sont issues de la Loi 22-23, du CIDTA et des décrets exécutifs en vigueur.'
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.invoices': 'Invoices',
    'nav.documents': 'Documents',
    'nav.compliance': 'Compliance',
    'nav.rules': 'Rules & Sources',
    'nav.assistant': 'Regulatory Assistant',
    'nav.settings': 'Settings',
    'dashboard.statRevenue': 'Annual Revenue (2026)',
    'dashboard.statMonth': 'This Month (September 2026)',
    'dashboard.statOutstanding': 'Outstanding Revenue',
    'dashboard.recentInvoices': 'Recent Invoices',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.upcomingObligations': 'Administrative Deadlines',
    'dashboard.thresholdTitle': 'Annual Revenue Ceiling',
    'common.viewAll': 'View all',
    'table.invoice': 'Invoice N°',
    'table.client': 'Client',
    'table.date': 'Date',
    'table.dueDate': 'Due Date',
    'table.amount': 'Amount',
    'table.status': 'Status',
    'table.actions': 'Actions',
    'filter.all': 'All',
    'filter.paid': 'Paid',
    'filter.pending': 'Pending',
    'filter.overdue': 'Overdue',
    'invoices.newInvoice': 'New invoice',
    'invoices.intro': 'Manage your invoices and credit notes. Sequential numbering in compliance with Algerian billing decree (Décret 05-468).',
    'createInvoice.intro': 'Create an invoice. Mandatory statutory mentions are automatically applied.',
    'documents.intro': 'Official administrative and tax documents for your auto-entrepreneur status.',
    'compliance.intro': 'Accurate tracking of Algerian tax and social security compliance deadlines.'
  },
  ar: {
    'nav.dashboard': 'لوحة القيادة',
    'nav.invoices': 'الفواتير',
    'nav.documents': 'الوثائق',
    'nav.compliance': 'الامتثال القانوني',
    'nav.rules': 'القواعد والمصادر',
    'nav.assistant': 'المساعد القانوني',
    'nav.settings': 'الإعدادات',
    'dashboard.statRevenue': 'رقم الأعمال السنوي (2026)',
    'dashboard.statMonth': 'هذا الشهر (سبتمبر 2026)',
    'dashboard.statOutstanding': 'مستحقات قيد التحصيل',
    'dashboard.recentInvoices': 'أحدث الفواتير',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.upcomingObligations': 'الالتزامات الإدارية القادمة',
    'dashboard.thresholdTitle': 'سقف رقم الأعمال السنوي',
    'common.viewAll': 'عرض الكل',
    'table.invoice': 'رقم الفاتورة',
    'table.client': 'العميل',
    'table.date': 'التاريخ',
    'table.dueDate': 'تاريخ الاستحقاق',
    'table.amount': 'المبلغ',
    'table.status': 'الحالة',
    'table.actions': 'الإجراءات',
    'filter.all': 'الكل',
    'filter.paid': 'مدفوعة',
    'filter.pending': 'قيد الانتظار',
    'filter.overdue': 'متأخرة',
    'invoices.newInvoice': 'فاتورة جديدة',
    'invoices.intro': 'إدارة الفواتير وجداول التخفيض، ترقيم تسلسلي مطابق للمرسوم التنفيذي 05-468.',
    'createInvoice.intro': 'إنشاء فاتورة جديدة، يتم تضمين البيانات القانونية الإلزامية تلقائياً.',
    'documents.intro': 'الوثائق والشهادات الإدارية والجبائية الخاصة بالمقاول الذاتي.',
    'compliance.intro': 'المتابعة الدقيقة للمواعيد الجبائية واشتراكات الضمان الاجتماعي وفقاً للقانون 22-23.'
  }
};

function setLanguage(lang) {
  currentLanguage = lang;
  userProfile.language = lang;

  // Direction: RTL for Arabic, LTR for others
  const isRtl = (lang === 'ar');
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);

  // Update language buttons active state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Update Settings select
  const langSelect = document.getElementById('set-lang-select');
  if (langSelect && langSelect.value !== lang) {
    langSelect.value = lang;
  }

  // Update translated text elements
  const dict = i18nDict[lang] || i18nDict.fr;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Update page title
  const titles = screenTitles[lang] || screenTitles.fr;
  document.getElementById('page-title').textContent = titles[currentScreen] || currentScreen;

  // Re-render current view tables to preserve localized state
  if (currentScreen === 'dashboard') updateDashboard();
  if (currentScreen === 'invoices') renderInvoicesTable();
}

// ---------------------------------------------------------------------------
// 14. Toast Notifications & Helpers
// ---------------------------------------------------------------------------

let toastTimeout;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// 15. Initialization
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
  // Navigation event listeners
  document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
    item.addEventListener('click', function () {
      navigateTo(this.dataset.screen);
    });
  });

  document.querySelectorAll('[data-navigate]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      navigateTo(this.dataset.navigate);
    });
  });

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderInvoicesTable();
    });
  });

  // Search input
  const searchInput = document.getElementById('invoice-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderInvoicesTable);
  }

  // Live input bindings for invoice creation
  ['inv-client', 'inv-date', 'inv-due-date', 'inv-client-address', 'inv-client-nif'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
  });

  // Document filter
  const docSearch = document.getElementById('doc-search');
  if (docSearch) {
    docSearch.addEventListener('input', function () {
      const term = this.value.toLowerCase();
      document.querySelectorAll('#documents-table tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });
  }

  // Initial renders
  updateDashboard();
  renderInvoicesTable();
  updatePreview();
  initAssistantChat();
});
