/* ═══════════════════════════════
   PHARMA MANAGER — Utilitaires
═══════════════════════════════ */

// ── Formatage ──
function fmt(n) {
  const cur = DB.getSetting('currency', 'FCFA');
  return Number(n||0).toLocaleString('fr-FR') + ' ' + cur;
}

function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('fr-FR');
}

function fmtDatetime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('fr-FR');
}

function fmtDateInput(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

function parseDate(str) {
  if (!str) return null;
  return new Date(str).getTime();
}

function daysLeft(ts) {
  if (!ts) return null;
  return Math.ceil((ts - Date.now()) / 86400000);
}

// ── Toast ──
function toast(msg, type = 'success', duration = 3000) {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, duration);
}

// ── Modal ──
function openModal(content, size = '') {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-overlay" id="active-modal">
      <div class="modal ${size}" onclick="event.stopPropagation()">
        ${content}
      </div>
    </div>
  `;
  document.getElementById('active-modal').addEventListener('click', closeModal);
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

// ── Confirm ──
function confirmDialog(message, onConfirm, label = 'Supprimer') {
  openModal(`
    <div class="modal-header">
      <h3>⚠️ Confirmation</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <p style="line-height:1.6;color:var(--c-text2)">${message}</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Annuler</button>
      <button class="btn btn-danger" id="confirm-ok">${label}</button>
    </div>
  `);
  document.getElementById('confirm-ok').onclick = () => { closeModal(); onConfirm(); };
}

// ── Recherche/Filtre ──
function searchFilter(items, query, fields) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item => fields.some(f => (item[f] || '').toString().toLowerCase().includes(q)));
}

// ── Pagination ──
function paginate(items, page, perPage = 20) {
  const total = Math.ceil(items.length / perPage);
  const slice = items.slice((page - 1) * perPage, page * perPage);
  return { items: slice, total, page, perPage, count: items.length };
}

function renderPagination(container, paged, onChange) {
  if (paged.total <= 1) { container.innerHTML = ''; return; }
  let html = '';
  if (paged.page > 1) html += `<button class="pg-btn" onclick="(${onChange})(${paged.page - 1})">‹</button>`;
  for (let i = 1; i <= paged.total; i++) {
    html += `<button class="pg-btn ${i === paged.page ? 'active' : ''}" onclick="(${onChange})(${i})">${i}</button>`;
  }
  if (paged.page < paged.total) html += `<button class="pg-btn" onclick="(${onChange})(${paged.page + 1})">›</button>`;
  container.innerHTML = html;
}

// ── Badge stock ──
function stockBadge(qte, seuil) {
  const s = seuil || DB.getSetting('alertStock', 10);
  if (qte <= 0) return '<span class="badge badge-danger">Rupture</span>';
  if (qte <= s) return '<span class="badge badge-warning">Faible</span>';
  return '<span class="badge badge-success">Disponible</span>';
}

// ── Badge expiration ──
function expiryBadge(ts) {
  const days = daysLeft(ts);
  if (days === null) return '';
  if (days < 0) return '<span class="badge badge-danger">Expiré</span>';
  const seuil = DB.getSetting('alertExpiry', 30);
  if (days <= seuil) return `<span class="badge badge-warning">Exp. ${days}j</span>`;
  return `<span class="badge badge-neutral">${fmtDate(ts)}</span>`;
}

// ── Numéro de document ──
function docNum(prefix, n) {
  return prefix + String(n).padStart(5, '0');
}

// ── Export CSV ──
function exportCSV(data, filename, columns) {
  const header = columns.map(c => c.label).join(';');
  const rows = data.map(row => columns.map(c => `"${(row[c.key] || '').toString().replace(/"/g, '""')}"`).join(';'));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename + '.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ── Print ──
function printArea(html, title) {
  const w = window.open('', '_blank');
  const settings = DB.getSettings();
  w.document.write(`<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Inter',sans-serif;font-size:13px;color:#111;padding:20px}
      h1{font-size:18px;margin-bottom:4px}
      h2{font-size:14px;margin-bottom:12px;color:#555}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th{background:#f0f0f0;padding:8px 10px;text-align:left;font-size:12px;border:1px solid #ddd}
      td{padding:7px 10px;border:1px solid #eee;font-size:12px}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;border-bottom:2px solid #0d7f5f;padding-bottom:12px}
      .logo{font-size:24px}
      .footer{margin-top:20px;text-align:center;font-size:11px;color:#888}
      @media print{body{padding:0}}
    </style>
  </head><body>
    <div class="header">
      <div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="logo">💊</span>
          <div>
            <h1>${settings.pharmacyName || 'PHARMA MANAGER'}</h1>
            <div style="font-size:11px;color:#666">${settings.address || ''} ${settings.phone ? '| Tél: '+settings.phone : ''}</div>
          </div>
        </div>
      </div>
      <div style="text-align:right;font-size:11px;color:#666">
        <div>${title}</div>
        <div>Imprimé le ${new Date().toLocaleString('fr-FR')}</div>
        <div style="font-size:10px;margin-top:4px;color:#aaa">MARHABA ABK TECHNOLOGY</div>
      </div>
    </div>
    ${html}
    <div class="footer">MARHABA ABK TECHNOLOGY — PHARMA MANAGER V1</div>
  </body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
}
