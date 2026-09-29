/* ==========================================================================
   MoukawilOS — Application Logic
   ========================================================================== */

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const invoicesData = [
  {
    id: 'FA-2026-012', client: 'TechVision Algérie', clientAddress: '45 Boulevard Mohamed V, Alger',
    date: '2026-09-15', dueDate: '2026-10-15', status: 'paid',
    items: [
      { desc: 'Web application development', qty: 40, rate: 4500 },
      { desc: 'Technical consulting', qty: 8, rate: 6000 }
    ],
    notes: 'Paiement par virement bancaire CPA.\nCompte N° 00200 0180 0300 1234 56'
  },
  {
    id: 'FA-2026-011', client: 'Studio Andalous', clientAddress: '12 Rue Larbi Ben M\'Hidi, Oran',
    date: '2026-09-02', dueDate: '2026-10-02', status: 'pending',
    items: [
      { desc: 'Website redesign — design and integration', qty: 1, rate: 85000 }
    ],
    notes: 'Paiement à 30 jours.'
  },
  {
    id: 'FA-2026-010', client: 'Dar Digital', clientAddress: 'Cité des 500 Logements, Constantine',
    date: '2026-08-28', dueDate: '2026-09-28', status: 'paid',
    items: [
      { desc: 'API development and integration', qty: 32, rate: 4500 },
      { desc: 'Database architecture', qty: 4, rate: 5000 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-009', client: 'Collectif Créatif', clientAddress: 'Tlemcen',
    date: '2026-08-15', dueDate: '2026-09-15', status: 'overdue',
    items: [
      { desc: 'Landing page development', qty: 1, rate: 42000 }
    ],
    notes: 'Paiement attendu par chèque.'
  },
  {
    id: 'FA-2026-008', client: 'Espace Numérique', clientAddress: '8 Rue Hassiba Ben Bouali, Alger',
    date: '2026-08-01', dueDate: '2026-09-01', status: 'paid',
    items: [
      { desc: 'E-commerce platform — Phase 1', qty: 1, rate: 145000 },
      { desc: 'Payment gateway integration', qty: 1, rate: 50000 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-007', client: 'Agence Atlas', clientAddress: 'Sétif',
    date: '2026-07-18', dueDate: '2026-08-18', status: 'paid',
    items: [
      { desc: 'Mobile app UI development', qty: 24, rate: 5000 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-006', client: 'Média Plus', clientAddress: 'Alger',
    date: '2026-07-05', dueDate: '2026-08-05', status: 'paid',
    items: [
      { desc: 'CMS customization', qty: 14, rate: 4500 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-005', client: 'Startup DZ', clientAddress: 'Boumerdès',
    date: '2026-06-22', dueDate: '2026-07-22', status: 'paid',
    items: [
      { desc: 'SaaS platform development — Sprint 1-3', qty: 1, rate: 250000 },
      { desc: 'DevOps setup and deployment', qty: 12, rate: 5000 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-004', client: 'Cabinet Horizon', clientAddress: 'Blida',
    date: '2026-06-10', dueDate: '2026-07-10', status: 'paid',
    items: [
      { desc: 'Internal dashboard development', qty: 1, rate: 78000 }
    ],
    notes: ''
  },
  {
    id: 'FA-2026-003', client: 'Digital Solutions Algérie', clientAddress: 'Annaba',
    date: '2026-05-28', dueDate: '2026-06-28', status: 'paid',
    items: [
      { desc: 'REST API development', qty: 28, rate: 4500 },
      { desc: 'Technical documentation', qty: 4, rate: 3500 }
    ],
    notes: ''
  }
];

// Assistant response bank
const assistantResponses = [
  {
    keywords: ['casnos', 'social', 'security', 'contribution'],
    body: `<p>CASNOS (Caisse Nationale de Sécurité Sociale des Non-Salariés) contributions for auto-entrepreneurs are calculated based on your declared annual revenue:</p>
<ol>
<li><strong>Base contribution rate:</strong> 15% of annual net income, with a minimum annual contribution of approximately 32 400 DZD (2026 rates).</li>
<li><strong>Payment schedule:</strong> Contributions are due quarterly — on March 31, June 30, September 30, and December 31.</li>
<li><strong>First year benefit:</strong> New auto-entrepreneurs benefit from a 50% reduction in the first year of activity.</li>
</ol>
<p>Late payment incurs a 5% penalty per quarter of delay. Registration with CASNOS is mandatory regardless of revenue level.</p>`,
    sources: [
      { text: 'Loi n° 83-11 relative aux assurances sociales, modifiée', ref: 'Art. 4, 8' },
      { text: 'Décret exécutif n° 23-159 relatif à l\'auto-entrepreneur', ref: 'Art. 12' }
    ]
  },
  {
    keywords: ['tax', 'ifu', 'rate', 'impot', 'declaration'],
    body: `<p>As an auto-entrepreneur, you are subject to the IFU (Impôt Forfaitaire Unique), which is a simplified tax regime:</p>
<ol>
<li><strong>Tax rate:</strong> 0.5% of total revenue for service activities, 5% for commercial activities (buying and reselling goods).</li>
<li><strong>Declaration frequency:</strong> Quarterly via the G12bis form, submitted to your local tax office (Centre des Impôts).</li>
<li><strong>Annual declaration:</strong> The G12 annual declaration is due by January 20 of the following year.</li>
<li><strong>Payment:</strong> Tax is paid at the time of each quarterly declaration.</li>
</ol>
<p>No VAT is charged or collected under the auto-entrepreneur regime. You should note this on your invoices with the mention "Auto-entrepreneur — Art. 8, Loi 22-18 — TVA non applicable."</p>`,
    sources: [
      { text: 'Code des Impôts Directs et Taxes Assimilées', ref: 'Art. 282 bis' },
      { text: 'Loi n° 22-18, Art. 7', ref: 'Régime fiscal applicable' }
    ]
  },
  {
    keywords: ['invoice', 'facture', 'billing', 'mention'],
    body: `<p>Invoices issued by auto-entrepreneurs must include the following mandatory information:</p>
<ol>
<li><strong>Your identification:</strong> Full name, business address, NIF (Numéro d'Identification Fiscale), and auto-entrepreneur registration number.</li>
<li><strong>Client identification:</strong> Name or business name, and address.</li>
<li><strong>Invoice details:</strong> Sequential invoice number, date of issue, and description of services or goods provided.</li>
<li><strong>Financial details:</strong> Unit price, quantity, total amount in DZD. Since you are exempt from VAT, include the mention: "TVA non applicable — Auto-entrepreneur, Art. 8 Loi 22-18."</li>
<li><strong>Payment terms:</strong> Due date and accepted payment methods.</li>
</ol>
<p>Invoices must be numbered sequentially without gaps. Keep copies for at least 10 years as required by commercial law.</p>`,
    sources: [
      { text: 'Code de Commerce, Art. 13', ref: 'Obligations de facturation' },
      { text: 'Loi n° 22-18, Art. 10', ref: 'Documents comptables' }
    ]
  }
];

const defaultResponse = {
  body: `<p>I can help with questions about auto-entrepreneur regulations in Algeria. Here are some topics I can assist with:</p>
<ol>
<li><strong>Registration and setup</strong> — steps after obtaining your auto-entrepreneur status</li>
<li><strong>Tax obligations</strong> — IFU rates, quarterly and annual declarations</li>
<li><strong>CASNOS contributions</strong> — social security payments and schedules</li>
<li><strong>Invoicing requirements</strong> — mandatory mentions and formatting</li>
<li><strong>Revenue thresholds</strong> — limits and what happens if you exceed them</li>
</ol>
<p>Please ask a specific question and I will provide guidance based on official Algerian regulatory texts.</p>`,
  sources: [
    { text: 'Loi n° 22-18 relative au statut de l\'auto-entrepreneur', ref: 'Texte complet' }
  ]
};


// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let currentScreen = 'dashboard';
let currentFilter = 'all';


// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

const screenTitles = {
  'dashboard': 'Dashboard',
  'invoices': 'Invoices',
  'create-invoice': 'New invoice',
  'invoice-preview': 'Invoice',
  'documents': 'Documents',
  'compliance': 'Compliance',
  'assistant': 'Regulatory Assistant',
  'settings': 'Settings'
};

function navigateTo(screen) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  // Show target screen
  const target = document.getElementById('screen-' + screen);
  if (target) {
    target.classList.add('active');
  }

  // Update page title
  document.getElementById('page-title').textContent = screenTitles[screen] || screen;

  // Update nav active state (only for main nav items)
  const navScreen = ['create-invoice', 'invoice-preview'].includes(screen) ? 'invoices' : screen;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.screen === navScreen);
  });

  // Update header actions
  updateHeaderActions(screen);

  currentScreen = screen;

  // Scroll to top
  document.querySelector('.main-body').scrollTop = 0;
}

function updateHeaderActions(screen) {
  const container = document.getElementById('header-actions');
  container.innerHTML = '';

  if (screen === 'invoices') {
    // No duplicate button — it's in the toolbar
  }
}


// ---------------------------------------------------------------------------
// Navigation Event Listeners
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  // Sidebar navigation
  document.querySelectorAll('.nav-item[data-screen]').forEach(item => {
    item.addEventListener('click', function() {
      navigateTo(this.dataset.screen);
    });
  });

  // Links with data-navigate
  document.querySelectorAll('[data-navigate]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo(this.dataset.navigate);
    });
  });

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderInvoicesTable();
    });
  });

  // Invoice search
  const searchInput = document.getElementById('invoice-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderInvoicesTable);
  }

  // Initial render
  renderInvoicesTable();
  updatePreview();
});


// ---------------------------------------------------------------------------
// Format Helpers
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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(dateStr);
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function getInvoiceTotal(invoice) {
  return invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
}


// ---------------------------------------------------------------------------
// Invoices Table
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
    return `
      <tr>
        <td class="col-id">${inv.id}</td>
        <td>${inv.client}</td>
        <td class="col-date">${formatDate(inv.date)}</td>
        <td class="col-date">${formatDate(inv.dueDate)}</td>
        <td class="col-amount">${formatCurrency(total)}</td>
        <td><span class="status status-${inv.status}">${capitalize(inv.status)}</span></td>
        <td class="col-actions">
          <button class="btn btn-ghost btn-sm" onclick="viewInvoice('${inv.id}')">View</button>
        </td>
      </tr>
    `;
  }).join('');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// ---------------------------------------------------------------------------
// View Invoice
// ---------------------------------------------------------------------------

function viewInvoice(invoiceId) {
  const inv = invoicesData.find(i => i.id === invoiceId);
  if (!inv) return;

  const total = getInvoiceTotal(inv);
  const container = document.getElementById('invoice-document');

  container.innerHTML = `
    <div class="inv-header">
      <div>
        <div class="inv-brand">MoukawilOS</div>
        <div class="inv-brand-sub">Amina Benali · Software Development</div>
      </div>
      <div class="inv-title">Facture</div>
    </div>

    <div class="inv-details-row">
      <div class="inv-detail-item">
        <div class="inv-detail-label">Invoice N°</div>
        <div class="inv-detail-value">${inv.id}</div>
      </div>
      <div class="inv-detail-item">
        <div class="inv-detail-label">Date</div>
        <div class="inv-detail-value">${formatDate(inv.date)}</div>
      </div>
      <div class="inv-detail-item">
        <div class="inv-detail-label">Due date</div>
        <div class="inv-detail-value">${formatDate(inv.dueDate)}</div>
      </div>
      <div class="inv-detail-item">
        <div class="inv-detail-label">Status</div>
        <div class="inv-detail-value"><span class="status status-${inv.status}">${capitalize(inv.status)}</span></div>
      </div>
    </div>

    <div class="inv-parties">
      <div>
        <div class="inv-party-label">From</div>
        <div class="inv-party-name">Amina Benali</div>
        <div class="inv-party-detail">
          Software Development<br>
          12 Rue des Frères Bouadou<br>
          Bir Mourad Raïs, Alger<br>
          NIF: 002345678901234
        </div>
      </div>
      <div>
        <div class="inv-party-label">To</div>
        <div class="inv-party-name">${inv.client}</div>
        <div class="inv-party-detail">${inv.clientAddress || ''}</div>
      </div>
    </div>

    <table class="inv-items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="align-right">Qty</th>
          <th class="align-right">Unit price</th>
          <th class="align-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${inv.items.map(item => `
          <tr>
            <td>${item.desc}</td>
            <td class="align-right">${item.qty}</td>
            <td class="align-right">${formatCurrency(item.rate)}</td>
            <td class="align-right">${formatCurrency(item.qty * item.rate)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="inv-totals">
      <div class="inv-total-row grand">
        <span class="t-label">Total</span>
        <span class="t-value">${formatCurrency(total)}</span>
      </div>
    </div>

    ${inv.notes ? `
      <div class="inv-notes">
        <strong>Notes</strong><br>
        ${inv.notes.replace(/\n/g, '<br>')}
      </div>
    ` : ''}

    <div class="inv-notes" style="${inv.notes ? '' : 'border-top: 1px solid var(--border-light); padding-top: var(--s5); margin-top: var(--s8);'}">
      <div style="font-size: var(--fs-xs); color: var(--text-3); line-height: 1.6;">
        Auto-entrepreneur — Loi n° 22-18, Art. 8 — TVA non applicable
      </div>
    </div>
  `;

  navigateTo('invoice-preview');
}


// ---------------------------------------------------------------------------
// Create Invoice — Line Items
// ---------------------------------------------------------------------------

function addLineItem() {
  const tbody = document.getElementById('line-items-body');
  const row = document.createElement('tr');
  row.className = 'line-item-row';
  row.innerHTML = `
    <td><input type="text" placeholder="Service description" class="li-desc" oninput="updatePreview()"></td>
    <td><input type="number" class="num-input li-qty" value="1" min="0" step="1" oninput="updatePreview()"></td>
    <td><input type="number" class="num-input li-rate" value="0" min="0" step="500" oninput="updatePreview()"></td>
    <td class="line-item-total">0 DZD</td>
    <td>
      <button class="remove-line-btn" onclick="removeLineItem(this)" title="Remove">
        <svg viewBox="0 0 14 14"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
      </button>
    </td>
  `;
  tbody.appendChild(row);
  updatePreview();
}

function removeLineItem(btn) {
  const tbody = document.getElementById('line-items-body');
  if (tbody.children.length <= 1) return; // Keep at least one row
  btn.closest('tr').remove();
  updatePreview();
}


// ---------------------------------------------------------------------------
// Create Invoice — Live Preview
// ---------------------------------------------------------------------------

function updatePreview() {
  const rows = document.querySelectorAll('.line-item-row');
  let grandTotal = 0;

  // Update line item totals
  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.li-qty')?.value) || 0;
    const rate = parseFloat(row.querySelector('.li-rate')?.value) || 0;
    const total = qty * rate;
    grandTotal += total;
    const totalCell = row.querySelector('.line-item-total');
    if (totalCell) totalCell.textContent = formatCurrency(total);
  });

  // Update grand total
  const grandTotalEl = document.getElementById('invoice-grand-total');
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(grandTotal);

  // Update preview panel
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

  // Preview items
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
        <td style="${desc === '—' ? 'color: var(--text-4)' : ''}">${desc}</td>
        <td class="align-right">${qty}</td>
        <td class="align-right">${formatCurrency(rate).replace(' DZD', '')}</td>
        <td class="align-right">${formatCurrency(total).replace(' DZD', '')}</td>
      `;
      pvItems.appendChild(tr);
    });
  }

  const pvTotal = document.getElementById('pv-total');
  if (pvTotal) pvTotal.textContent = 'Total: ' + formatCurrency(grandTotal);
}

// Listen for input on client and date fields
document.addEventListener('DOMContentLoaded', function() {
  ['inv-client', 'inv-date', 'inv-due-date', 'inv-client-address'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
  });
});


// ---------------------------------------------------------------------------
// Create Invoice — Submit
// ---------------------------------------------------------------------------

function createInvoice() {
  const client = document.getElementById('inv-client')?.value;
  if (!client) {
    showToast('Please enter a client name');
    return;
  }

  const rows = document.querySelectorAll('.line-item-row');
  let hasItem = false;
  rows.forEach(row => {
    const desc = row.querySelector('.li-desc')?.value;
    const rate = parseFloat(row.querySelector('.li-rate')?.value) || 0;
    if (desc && rate > 0) hasItem = true;
  });

  if (!hasItem) {
    showToast('Please add at least one line item');
    return;
  }

  // Build new invoice
  const items = [];
  rows.forEach(row => {
    const desc = row.querySelector('.li-desc')?.value || '';
    const qty = parseFloat(row.querySelector('.li-qty')?.value) || 0;
    const rate = parseFloat(row.querySelector('.li-rate')?.value) || 0;
    if (desc && rate > 0) {
      items.push({ desc, qty, rate });
    }
  });

  const newInvoice = {
    id: document.getElementById('inv-number')?.value || 'FA-2026-013',
    client: client,
    clientAddress: document.getElementById('inv-client-address')?.value || '',
    date: document.getElementById('inv-date')?.value || '2026-09-29',
    dueDate: document.getElementById('inv-due-date')?.value || '2026-10-29',
    status: 'draft',
    items: items,
    notes: document.getElementById('inv-notes')?.value || ''
  };

  invoicesData.unshift(newInvoice);
  renderInvoicesTable();

  showToast('Invoice ' + newInvoice.id + ' created');
  navigateTo('invoices');

  // Reset form for next invoice
  resetInvoiceForm();
}

function resetInvoiceForm() {
  const nextNum = invoicesData.length + 3; // Simple incrementing
  const numInput = document.getElementById('inv-number');
  if (numInput) numInput.value = 'FA-2026-' + String(nextNum).padStart(3, '0');

  const clientInput = document.getElementById('inv-client');
  if (clientInput) clientInput.value = '';

  const clientAddr = document.getElementById('inv-client-address');
  if (clientAddr) clientAddr.value = '';

  const notesInput = document.getElementById('inv-notes');
  if (notesInput) notesInput.value = '';

  // Reset line items to one empty row
  const tbody = document.getElementById('line-items-body');
  if (tbody) {
    tbody.innerHTML = `
      <tr class="line-item-row">
        <td><input type="text" placeholder="Service description" class="li-desc" oninput="updatePreview()"></td>
        <td><input type="number" class="num-input li-qty" value="1" min="0" step="1" oninput="updatePreview()"></td>
        <td><input type="number" class="num-input li-rate" value="0" min="0" step="500" oninput="updatePreview()"></td>
        <td class="line-item-total">0 DZD</td>
        <td>
          <button class="remove-line-btn" onclick="removeLineItem(this)" title="Remove">
            <svg viewBox="0 0 14 14"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>
          </button>
        </td>
      </tr>
    `;
  }

  updatePreview();
}


// ---------------------------------------------------------------------------
// Regulatory Assistant
// ---------------------------------------------------------------------------

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

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'message';
  userMsg.innerHTML = `
    <div class="message-sender user">You</div>
    <div class="message-body"><p>${escapeHtml(message)}</p></div>
  `;
  container.appendChild(userMsg);

  input.value = '';

  // Find matching response
  const lowerMsg = message.toLowerCase();
  let response = defaultResponse;
  for (const resp of assistantResponses) {
    if (resp.keywords.some(kw => lowerMsg.includes(kw))) {
      response = resp;
      break;
    }
  }

  // Add assistant response after a brief delay
  setTimeout(() => {
    const assistantMsg = document.createElement('div');
    assistantMsg.className = 'message';

    let sourcesHtml = '';
    if (response.sources && response.sources.length > 0) {
      sourcesHtml = `
        <div class="message-sources">
          <div class="sources-label">Sources</div>
          ${response.sources.map(s => `<div class="source-item">${s.text} — <span class="source-ref">${s.ref}</span></div>`).join('')}
        </div>
      `;
    }

    assistantMsg.innerHTML = `
      <div class="message-sender assistant">Regulatory Assistant</div>
      <div class="message-body">${response.body}</div>
      ${sourcesHtml}
    `;

    container.appendChild(assistantMsg);
    container.scrollTop = container.scrollHeight;
  }, 400);

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


// ---------------------------------------------------------------------------
// Toast Notifications
// ---------------------------------------------------------------------------

let toastTimeout;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}
