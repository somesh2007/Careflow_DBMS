let allPatients = [];
let editingId   = null;

async function loadPatients(search = '') {
  const tbody = document.getElementById('patientsTbody');
  tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';
  try {
    const pats = await apiFetch('/patients' + (search ? `?search=${encodeURIComponent(search)}` : ''));
    allPatients = pats;
    renderPatients(pats);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="loading-cell" style="color:red">${err.message}</td></tr>`;
  }
}

function renderPatients(pats) {
  const tbody = document.getElementById('patientsTbody');
  if (!pats.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No patients found.</td></tr>';
    return;
  }
  tbody.innerHTML = pats.map(p => `
    <tr>
      <td>
        <div class="doc-name">${p.name}</div>
        <div class="doc-id">ID: ${p.id}</div>
      </td>
      <td>
        <div>${p.age} yrs • ${p.gender}</div>
        <div style="color:var(--danger);font-size:12px">⬤ ${p.blood_group}</div>
      </td>
      <td><div class="contact-row">✆ ${p.phone}</div></td>
      <td><div style="font-size:13px;color:var(--text-muted)">⌖ ${p.address}</div></td>
      <td style="text-align:right">
        <button class="icon-btn" onclick="openEdit(${p.id})" title="Edit">✎</button>
        <button class="icon-btn" onclick="deletePatient(${p.id})" title="Delete" style="color:var(--danger)">✕</button>
      </td>
    </tr>
  `).join('');
}

function openModal(title = 'Add New Patient') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('formError').classList.add('hidden');
  document.getElementById('patientModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('patientModal').classList.add('hidden');
  document.getElementById('patientForm').reset();
  document.getElementById('patientId').value = '';
  editingId = null;
  document.getElementById('submitBtn').textContent = 'Create Patient';
}

function openEdit(id) {
  const pat = allPatients.find(p => p.id === id);
  if (!pat) return;
  editingId = id;
  document.getElementById('patientId').value  = id;
  document.getElementById('patName').value    = pat.name;
  document.getElementById('patAge').value     = pat.age;
  document.getElementById('patGender').value  = pat.gender;
  document.getElementById('patPhone').value   = pat.phone;
  document.getElementById('patBlood').value   = pat.blood_group;
  document.getElementById('patAddress').value = pat.address;
  document.getElementById('submitBtn').textContent = 'Update Patient';
  openModal('Edit Patient');
}

async function deletePatient(id) {
  if (!confirm('Delete this patient? All their appointments will also be removed.')) return;
  try {
    await apiFetch(`/patients/${id}`, { method: 'DELETE' });
    showToast('Patient deleted.', 'success');
    loadPatients();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadPatients();

  document.getElementById('addPatientBtn').addEventListener('click', () => openModal());
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('patientModal').addEventListener('click', e => {
    if (e.target === document.getElementById('patientModal')) closeModal();
  });

  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadPatients(e.target.value), 300);
  });

  document.getElementById('patientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('formError');
    errEl.classList.add('hidden');

    const body = {
      name:        document.getElementById('patName').value.trim(),
      age:         parseInt(document.getElementById('patAge').value),
      gender:      document.getElementById('patGender').value,
      phone:       document.getElementById('patPhone').value.trim(),
      address:     document.getElementById('patAddress').value.trim(),
      blood_group: document.getElementById('patBlood').value,
    };

    try {
      if (editingId) {
        await apiFetch(`/patients/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        showToast('Patient updated successfully.', 'success');
      } else {
        await apiFetch('/patients', { method: 'POST', body: JSON.stringify(body) });
        showToast('Patient created successfully.', 'success');
      }
      closeModal();
      loadPatients();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });
});
