let allDoctors = [];
let editingId  = null;

async function loadDoctors(search = '') {
  const tbody = document.getElementById('doctorsTbody');
  tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';
  try {
    const docs = await apiFetch('/doctors' + (search ? `?search=${encodeURIComponent(search)}` : ''));
    allDoctors = docs;
    renderDoctors(docs);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="loading-cell" style="color:red">${err.message}</td></tr>`;
  }
}

function renderDoctors(docs) {
  const tbody = document.getElementById('doctorsTbody');
  if (!docs.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No doctors found.</td></tr>';
    return;
  }
  tbody.innerHTML = docs.map(d => `
    <tr>
      <td>
        <div class="doc-name">${d.name}</div>
        <div class="doc-id">ID: ${d.id}</div>
      </td>
      <td><span class="badge" style="background:#dbeafe;color:#1e40af">${d.specialization}</span></td>
      <td>
        <div class="contact-row">✉ ${d.email}</div>
        <div class="contact-row">✆ ${d.phone}</div>
      </td>
      <td>⛉ ${d.room_no}</td>
      <td style="text-align:right">
        <button class="icon-btn" onclick="openEdit(${d.id})" title="Edit">✎</button>
        <button class="icon-btn" onclick="deleteDoctor(${d.id})" title="Delete" style="color:var(--danger)">✕</button>
      </td>
    </tr>
  `).join('');
}

function openModal(title = 'Add New Doctor', subTitle = 'Enter the doctor\'s details below.') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalSub').textContent   = subTitle;
  document.getElementById('formError').classList.add('hidden');
  document.getElementById('doctorModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('doctorModal').classList.add('hidden');
  document.getElementById('doctorForm').reset();
  document.getElementById('doctorId').value = '';
  editingId = null;
  document.getElementById('submitBtn').textContent = 'Create Doctor';
}

function openEdit(id) {
  const doc = allDoctors.find(d => d.id === id);
  if (!doc) return;
  editingId = id;
  document.getElementById('doctorId').value = id;
  document.getElementById('docName').value  = doc.name;
  document.getElementById('docSpec').value  = doc.specialization;
  document.getElementById('docPhone').value = doc.phone;
  document.getElementById('docEmail').value = doc.email;
  document.getElementById('docRoom').value  = doc.room_no;
  document.getElementById('submitBtn').textContent = 'Update Doctor';
  openModal('Edit Doctor', 'Update the doctor\'s details.');
}

async function deleteDoctor(id) {
  if (!confirm('Delete this doctor? All their appointments will also be removed.')) return;
  try {
    await apiFetch(`/doctors/${id}`, { method: 'DELETE' });
    showToast('Doctor deleted.', 'success');
    loadDoctors();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDoctors();

  document.getElementById('addDoctorBtn').addEventListener('click', () => openModal());
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('doctorModal').addEventListener('click', e => {
    if (e.target === document.getElementById('doctorModal')) closeModal();
  });

  // Search
  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadDoctors(e.target.value), 300);
  });

  // Form submit
  document.getElementById('doctorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('formError');
    errEl.classList.add('hidden');

    const body = {
      name:           document.getElementById('docName').value.trim(),
      specialization: document.getElementById('docSpec').value.trim(),
      phone:          document.getElementById('docPhone').value.trim(),
      email:          document.getElementById('docEmail').value.trim(),
      room_no:        document.getElementById('docRoom').value.trim(),
    };

    try {
      if (editingId) {
        await apiFetch(`/doctors/${editingId}`, { method: 'PUT', body: JSON.stringify(body) });
        showToast('Doctor updated successfully.', 'success');
      } else {
        await apiFetch('/doctors', { method: 'POST', body: JSON.stringify(body) });
        showToast('Doctor created successfully.', 'success');
      }
      closeModal();
      loadDoctors();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    }
  });
});
