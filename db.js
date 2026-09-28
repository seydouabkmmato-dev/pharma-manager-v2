/* ═══════════════════════════════════════
   PHARMA MANAGER — Base de données locale
   MARHABA ABK TECHNOLOGY
═══════════════════════════════════════ */
const DB_KEY = 'pharma_manager_v1';

const DB = {
  // ── Lecture ──
  get(table) {
    const root = this._root();
    return root[table] || [];
  },

  getOne(table, id) {
    return this.get(table).find(r => r.id === id) || null;
  },

  // ── Écriture ──
  save(table, records) {
    const root = this._root();
    root[table] = records;
    localStorage.setItem(DB_KEY, JSON.stringify(root));
  },

  insert(table, data) {
    const records = this.get(table);
    const record = { ...data, id: this._uid(), createdAt: Date.now() };
    records.push(record);
    this.save(table, records);
    return record;
  },

  update(table, id, data) {
    let records = this.get(table);
    records = records.map(r => r.id === id ? { ...r, ...data, updatedAt: Date.now() } : r);
    this.save(table, records);
    return records.find(r => r.id === id);
  },

  remove(table, id) {
    // soft delete → corbeille
    const item = this.getOne(table, id);
    if (!item) return;
    const trash = this.get('corbeille');
    trash.push({ ...item, _table: table, deletedAt: Date.now() });
    this.save('corbeille', trash);
    let records = this.get(table).filter(r => r.id !== id);
    this.save(table, records);
  },

  hardDelete(table, id) {
    let records = this.get(table).filter(r => r.id !== id);
    this.save(table, records);
  },

  restore(trashedId) {
    const trash = this.get('corbeille');
    const item = trash.find(r => r.id === trashedId);
    if (!item) return;
    const { _table, deletedAt, ...data } = item;
    const records = this.get(_table);
    records.push(data);
    this.save(_table, records);
    this.save('corbeille', trash.filter(r => r.id !== trashedId));
  },

  // ── Config / Settings ──
  getSetting(key, def = null) {
    const root = this._root();
    return root.settings?.[key] ?? def;
  },

  setSetting(key, value) {
    const root = this._root();
    if (!root.settings) root.settings = {};
    root.settings[key] = value;
    localStorage.setItem(DB_KEY, JSON.stringify(root));
  },

  getSettings() {
    return this._root().settings || {};
  },

  // ── Utilitaires ──
  _root() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || {}; }
    catch { return {}; }
  },

  _uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  nextNum(table) {
    const root = this._root();
    if (!root._counters) root._counters = {};
    root._counters[table] = (root._counters[table] || 0) + 1;
    localStorage.setItem(DB_KEY, JSON.stringify(root));
    return root._counters[table];
  }
};

// ── Initialisation des paramètres par défaut ──
(function initDefaults() {
  const s = DB.getSettings();
  if (!s.pharmacyName) {
    DB.setSetting('pharmacyName', 'Ma Pharmacie');
    DB.setSetting('currency', 'FCFA');
    DB.setSetting('taxRate', 0);
    DB.setSetting('alertStock', 10);
    DB.setSetting('alertExpiry', 30);
    DB.setSetting('address', '');
    DB.setSetting('phone', '');
    DB.setSetting('email', '');
  }
  // Utilisateurs par défaut
  if (DB.get('users').length === 0) {
    DB.insert('users', { username: 'admin',    password: 'admin123',    role: 'admin',   nom: 'Administrateur', actif: true });
    DB.insert('users', { username: 'caissier', password: 'caissier123', role: 'caissier', nom: 'Caissier',        actif: true });
  }
})();
