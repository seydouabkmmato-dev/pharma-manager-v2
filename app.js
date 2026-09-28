/* ═══════════════════════════════
   PHARMA MANAGER — Application Shell
═══════════════════════════════ */

const NAV = [
  { group: 'Principal' },
  { id: 'dashboard',    icon: '📊', label: 'Tableau de bord',  perm: 'dashboard' },
  { id: 'vente',        icon: '🛒', label: 'Nouvelle vente',   perm: 'vente' },
  { group: 'Inventaire' },
  { id: 'medicaments',  icon: '💊', label: 'Médicaments',      perm: 'admin' },
  { id: 'categories',   icon: '🗂️', label: 'Catégories',       perm: 'admin' },
  { id: 'fournisseurs', icon: '🏭', label: 'Fournisseurs',      perm: 'admin' },
  { id: 'achats',       icon: '📦', label: 'Achats & Stock',    perm: 'admin' },
  { group: 'Commercial' },
  { id: 'clients',      icon: '👥', label: 'Clients',           perm: 'dashboard' },
  { id: 'credits',      icon: '💳', label: 'Ventes à crédit',   perm: 'dashboard' },
  { id: 'factures',     icon: '🧾', label: 'Factures & Reçus',  perm: 'dashboard' },
  { group: 'Suivi' },
  { id: 'alertes',      icon: '⚠️', label: 'Alertes',           perm: 'dashboard', badge: 'alertes' },
  { id: 'rapports',     icon: '📈', label: 'Rapports',           perm: 'admin' },
  { group: 'Administration' },
  { id: 'utilisateurs', icon: '👤', label: 'Utilisateurs',      perm: 'admin' },
  { id: 'corbeille',    icon: '🗑️', label: 'Corbeille',         perm: 'admin' },
  { id: 'parametres',   icon: '⚙️', label: 'Paramètres',        perm: 'admin' },
];

let activePage = 'dashboard';

function startApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  buildNav();
  updateUserPill();
  restoreTheme();
  showPage('dashboard');
  updateBellBadge();
}

function buildNav() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  NAV.forEach(item => {
    if (item.group) {
      nav.insertAdjacentHTML('beforeend', `<div class="nav-group-label">${item.group}</div>`);
    } else {
      if (item.perm === 'admin' && currentUser.role !== 'admin') return;
      nav.insertAdjacentHTML('beforeend', `
        <button class="nav-item" id="nav-${item.id}" onclick="showPage('${item.id}')">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${item.badge ? `<span class="nav-badge hidden" id="badge-${item.id}">0</span>` : ''}
        </button>
      `);
    }
  });
}

function showPage(id) {
  if (!document.getElementById(`nav-${id}`)) return;

  activePage = id;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById(`nav-${id}`);
  if (navEl) navEl.classList.add('active');

  const label = NAV.find(n => n.id === id)?.label || '';
  document.getElementById('topbar-title').textContent = label;

  const container = document.getElementById('page-container');

  const pages = {
    dashboard:    renderDashboard,
    medicaments:  renderMedicaments,
    categories:   renderCategories,
    fournisseurs: renderFournisseurs,
    vente:        renderVente,
    achats:       renderAchats,
    clients:      renderClients,
    credits:      renderCredits,
    factures:     renderFactures,
    alertes:      renderAlertes,
    utilisateurs: renderUtilisateurs,
    rapports:     renderRapports,
    corbeille:    renderCorbeille,
    parametres:   renderParametres,
  };

  if (pages[id]) {
    container.innerHTML = '';
    pages[id](container);
  }

  // Auto-close sidebar on mobile
  if (window.innerWidth < 769) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-btn').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem('pm_theme', isDark ? 'light' : 'dark');
}

function restoreTheme() {
  const t = localStorage.getItem('pm_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('theme-btn').textContent = t === 'dark' ? '☀️' : '🌙';
}

function updateUserPill() {
  const el = document.getElementById('user-pill');
  const initials = (currentUser.nom || currentUser.username).slice(0, 2).toUpperCase();
  el.innerHTML = `
    <div class="user-pill-avatar">${initials}</div>
    <div>
      <div style="font-weight:600;font-size:12px;color:var(--c-text)">${currentUser.nom || currentUser.username}</div>
      <div style="font-size:10.5px;color:var(--c-text3);text-transform:capitalize">${currentUser.role}</div>
    </div>
  `;
}

function updateBellBadge() {
  const alertStock = DB.getSetting('alertStock', 10);
  const alertExpiry = DB.getSetting('alertExpiry', 30);
  const now = Date.now();
  const meds = DB.get('medicaments');

  let count = 0;
  meds.forEach(m => {
    if ((m.quantite || 0) <= alertStock) count++;
    if (m.dateExpiration) {
      const days = daysLeft(m.dateExpiration);
      if (days !== null && days <= alertExpiry) count++;
    }
  });
  // credits échus
  const credits = DB.get('credits');
  credits.forEach(c => {
    if (c.statut !== 'payé' && c.echeance && c.echeance < now) count++;
  });

  document.getElementById('bell-badge').textContent = count;
  const badge = document.getElementById('badge-alertes');
  if (badge) {
    if (count > 0) { badge.textContent = count; badge.classList.remove('hidden'); }
    else badge.classList.add('hidden');
  }
}

// Init
window.addEventListener('load', () => {
  if (checkSession()) startApp();
});
