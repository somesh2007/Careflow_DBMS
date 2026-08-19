document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await apiFetch('/dashboard/summary');

    document.getElementById('totalDoctors').textContent  = data.totalDoctors;
    document.getElementById('totalPatients').textContent = data.totalPatients;
    document.getElementById('upcoming').textContent      = data.upcoming;
    document.getElementById('completed').textContent     = data.completed;

    // ── Bar Chart ─────────────────────────────────────────────
    const chart   = document.getElementById('barChart');
    const doctors = data.appointmentsByDoctor;
    const maxVal  = Math.max(...doctors.map(d => d.count), 1);

    doctors.forEach(d => {
      const pct    = (d.count / maxVal) * 100;
      const height = Math.max(pct * 1.4, 4); // scale to ~140px max

      const col = document.createElement('div');
      col.className = 'bar-col';

      const fill = document.createElement('div');
      fill.className = 'bar-fill';
      fill.style.height = height + 'px';
      fill.title = `${d.doctorName}: ${d.count}`;

      const tooltip = document.createElement('div');
      tooltip.style.cssText = `
        position:absolute; top:-40px; left:50%; transform:translateX(-50%);
        background:#1e293b; color:#fff; padding:4px 8px; border-radius:6px;
        font-size:11px; white-space:nowrap; display:none; z-index:10;
      `;
      tooltip.innerHTML = `${d.doctorName}<br><strong>count: ${d.count}</strong>`;
      fill.style.position = 'relative';
      fill.appendChild(tooltip);
      fill.addEventListener('mouseenter', () => tooltip.style.display = 'block');
      fill.addEventListener('mouseleave', () => tooltip.style.display = 'none');

      const label = document.createElement('div');
      label.className = 'bar-label';
      const shortName = d.doctorName.replace('Dr. ', '');
      label.textContent = shortName;
      label.title = d.doctorName;

      col.appendChild(fill);
      col.appendChild(label);
      chart.appendChild(col);
    });

    // ── Recent Appointments ───────────────────────────────────
    const list = document.getElementById('recentList');
    if (!data.recentAppointments.length) {
      list.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No appointments yet.</p>';
      return;
    }
    data.recentAppointments.forEach(a => {
      const item = document.createElement('div');
      item.className = 'recent-item';
      item.innerHTML = `
        <div class="recent-info">
          <div class="recent-patient">${a.patient_name}</div>
          <div class="recent-doctor">◷ ${a.doctor_name}</div>
        </div>
        <div class="recent-meta">
          <div class="recent-date">${fmtDateShort(a.appointment_date)}</div>
          ${statusBadge(a.status)}
        </div>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    console.error(err);
  }
});
