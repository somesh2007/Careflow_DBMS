let allAppts   = [];
let editingId  = null;
let activeMenu = null; // {id, el}

async function loadAppointments() {
  const tbody = document.getElementById('apptTbody');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading...</td></tr>';
  try {
    allAppts = await apiFetch('/appointments');
    renderAppointments(allAppts);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading-cell" style="color:red">${err.message}</td></tr>`;
  }
}

function renderAppointments(appts) {
  const tbody = document.getElementById('apptTbody');
  if (!appts.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">No appointments yet.</td></tr>';
    return;
  }
  tbody.innerHTML = appts.map(a => `
    <tr>
      <td>
        <div style="font-weight:500;font-size:13px">${fmtDateShort(a.appointment_date)}</div>
        <div style="font-size:11px;color:var(--text-muted)">${new Date(a.appointment_date).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
      </td>
      <td><div class="doc-name">${a.patient_name}</div></td>
      <td><div style="font-size:13px">Dr. ${a.doctor_name}</div></td>
      <td><div style="font-size:13px;color:var(--text-muted)">⬤ ${a.reason}</div></td>
      <td>${statusBadge(a.status)}</td>
      <td style="text-align:right">
        <button class="icon-btn" onclick="openEditAppt(${a.id})" title="Edit" style="margin-right:2px">✎</button>
        <button class="icon-btn" onclick="toggleMenu(event, ${a.id})" title="Actions">⋯</button>
      </td>
    </tr>
  `).join('');
}

// ── Dropdown menu ─────────────────────────────────────────────
function toggleMenu(event, id) {
  event.stopPropagation();
  const menu = document.getElementById('statusMenu');

  if (activeMenu && activeMenu.id === id) {
    menu.classList.add('hidden');
    activeMenu = null;
    return;
  }
  activeMenu = { id };

  const btn = event.currentTarget;
  const rect = btn.getBoundingClientRect();
  menu.style.top  = (rect.bottom + 4) + 'px';
  menu.style.left = (rect.right - 170) + 'px';
  menu.classList.remove('hidden');
}

document.addEventListener('click', () => {
  document.getElementById('statusMenu').classList.add('hidden');
  activeMenu = null;
});

// ── Modal helpers ─────────────────────────────────────────────
async function loadDropdowns() {
  const [docs, pats] = await Promise.all([
    apiFetch('/doctors'),
    apiFetch('/patients'),
  ]);
  const docSel = document.getElementById('apptDoctor');
  const patSel = document.getElementById('apptPatient');
  docSel.innerHTML = '<option value="">Select doctor</option>' +
    docs.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  patSel.innerHTML = '<option value="">Select patient</option>' +
    pats.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function openModal(title = 'Schedule Appointment') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('formError').classList.add('hidden');
  document.getElementById('apptModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('apptModal').classList.add('hidden');
  document.getElementById('apptForm').reset();
  document.getElementById('apptId').value = '';
  editingId = null;
  document.getElementById('submitBtn').textContent = 'Schedule';
}

function openEditAppt(id) {
  const a = allAppts.find(x => x.id === id);
  if (!a) return;
  editingId = id;
  document.getElementById('apptId').value      = id;
  document.getElementById('apptPatient').value = a.patient_id;
  document.getElementById('apptDoctor').value  = a.doctor_id;
  const localDt = new Date(a.appointment_date).toISOString().slice(0, 16);
  document.getElementById('apptDate').value    = localDt;
  document.getElementById('apptReason').value  = a.reason;
  document.getElementById('apptStatus').value  = a.status;
  document.getElementById('submitBtn').textContent = 'Update Appointment';
  openModal('Edit Appointment');
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadDropdowns();
  loadAppointments();

  document.getElementById('addApptBtn').addEventListener('click', () => {
    editingId = null;
    openModal();
  });
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('apptModal').addEventListener('click', e => {
    if (e.target === document.getElementById('apptModal')) closeModal();
  });

  // Status quick-change
  document.querySelectorAll('.dropdown-item[data-status]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!activeMenu) return;
      const id = activeMenu.id;
      try {
        await apiFetch(`/appointments/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: btn.dataset.status }),
        });
        showToast('Status updated.', 'success');
        loadAppointments();
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });

  // Delete from menu
  document.getElementById('deleteApptBtn').addEventListener('click', async () => {
    if (!activeMenu) return;
    const id = activeMenu.id;
    if (!confirm('Delete this appointment?')) return;
    try {
      await apiFetch(`/appointments/${id}`, { method: 'DELETE' });
      showToast('Appointment deleted.', 'success');
      loadAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Form submit
  document.getElementById('apptForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('formError');
    errEl.classList.add('hidden');

    const body = {
      doctor_id:        parseInt(document.getElementById('apptDoctor').value),
      patient_id:       parseInt(document.getElementById('apptPatient').value),
      appointment_date: document.getElementById('apptDate').value,
      reason:           document.getElementById('apptReason').value.trim(),
      status:           document.getElementById('apptStatus').value,
    };

    try {
      if (editingId) {
        await apiFetch(`/appointments/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        showToast('Appointment updated.', 'success');
      } else {
        await apiFetch('/appointments', { method: 'POST', body: JSON.stringify(body) });
        showToast('Appointment scheduled.', 'success');
      }
      closeModal();
      loadAppointments();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });
});
