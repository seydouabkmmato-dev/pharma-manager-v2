/* ═══════════════════════════════
   PHARMA MANAGER — Authentification
═══════════════════════════════ */
let currentUser = null;

function doLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');

  const users = DB.get('users');
  const user = users.find(u => u.username === username && u.password === password && u.actif !== false);

  if (!user) {
    err.classList.remove('hidden');
    document.getElementById('login-pass').value = '';
    return;
  }

  err.classList.add('hidden');
  currentUser = user;
  sessionStorage.setItem('pm_session', JSON.stringify({ id: user.id, username: user.username, role: user.role, nom: user.nom }));
  startApp();
}

function doLogout() {
  currentUser = null;
  sessionStorage.removeItem('pm_session');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

function togglePwd() {
  const inp = document.getElementById('login-pass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function checkSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem('pm_session'));
    if (s && s.id) {
      const u = DB.get('users').find(r => r.id === s.id);
      if (u && u.actif !== false) { currentUser = u; return true; }
    }
  } catch {}
  return false;
}

function can(permission) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  const perms = { caissier: ['dashboard','vente','clients','factures','alertes'] };
  return (perms[currentUser.role] || []).includes(permission);
}

// Enter key on login
document.addEventListener('keydown', e => {
  if (document.getElementById('login-screen') && !document.getElementById('login-screen').classList.contains('hidden') && e.key === 'Enter') doLogin();
});
