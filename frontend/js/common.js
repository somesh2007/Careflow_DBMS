// ── API base ────────────────────────────────────────────────
const API = '/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (res.status === 401) {
    window.location.href = '/index.html';
    return;
  }
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth guard ───────────────────────────────────────────────
(async () => {
  // Skip on login page
  if (window.location.pathname === '/index.html' || window.location.pathname === '/') return;
  try {
    const me = await apiFetch('/auth/me');
    if (!me || !me.loggedIn) {
      window.location.href = '/index.html';
      return;
    }
    const el = document.getElementById('adminName');
    if (el) el.textContent = me.username;
  } catch (e) {
    window.location.href = '/index.html';
  }
})();

// ── Logout ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await apiFetch('/auth/logout', { method: 'POST' });
      window.location.href = '/index.html';
    });
  }
});

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'default') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Date formatter ───────────────────────────────────────────
function fmtDate(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateShort(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ── Status badge ─────────────────────────────────────────────
function statusBadge(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}
