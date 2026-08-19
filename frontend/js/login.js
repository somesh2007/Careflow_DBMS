document.addEventListener('DOMContentLoaded', async () => {
  // If already logged in, redirect
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const me  = await res.json();
    if (me.loggedIn) {
      window.location.href = '/pages/dashboard.html';
      return;
    }
  } catch (_) {}

  const form     = document.getElementById('loginForm');
  const errorEl  = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');
    loginBtn.textContent = 'Signing in…';
    loginBtn.disabled = true;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      window.location.href = '/pages/dashboard.html';
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
    }
  });
});
