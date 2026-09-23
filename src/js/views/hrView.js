// src/js/views/hrView.js - HR Category Auto-Routing Dashboard & Department Assignments

import { db } from '../db.js';
import { workflow } from '../workflow.js';

export function renderHRView(container, currentUser) {
  const requests = db.getRequests();

  const pendingHR = requests.filter(r => r.status === 'Pending HR');
  const assignedDept = requests.filter(r => r.status.startsWith('Assigned') || r.status.startsWith('Accepted') || r.status === 'Work In Progress').length;
  const completedCount = requests.filter(r => r.status === 'Work Completed' || r.status === 'Closed').length;
  const totalReqs = requests.length;

  container.innerHTML = `
    <!-- Top Action Banner -->
    <div class="dashboard-banner-card">
      <div class="banner-welcome-content">
        <div class="banner-badge">HR & CAMPUS OPERATIONS PORTAL</div>
        <h2 class="banner-title">Automated Category Routing Hub</h2>
        <p class="banner-desc">Logged in as <strong>${currentUser.full_name}</strong> • Central HR & Infrastructure Routing Desk</p>
      </div>
      <div class="banner-actions-group">
        <a href="#reports" class="btn btn-outline-banner">
          <span>Maintenance Reports</span>
        </a>
        <a href="#tracking" class="btn btn-outline-banner">
          <span>Track Requests</span>
        </a>
      </div>
    </div>

    <!-- Top HR Metrics -->
    <div class="metrics-grid">
      <div class="metric-card" style="--card-accent: #f59e0b;">
        <div class="metric-info">
          <span class="metric-label">Pending HR Routing</span>
          <span class="metric-value">${pendingHR.length}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #d97706; --icon-bg: #fef3c7;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #3b82f6;">
        <div class="metric-info">
          <span class="metric-label">Assigned to Dept</span>
          <span class="metric-value">${assignedDept}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #2563eb; --icon-bg: #eff6ff;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Completed Works</span>
          <span class="metric-value">${completedCount}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #8B9C1E;">
        <div class="metric-info">
          <span class="metric-label">Total Requests</span>
          <span class="metric-value">${totalReqs}</span>
        </div>
        <div class="metric-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
      </div>
    </div>

    <!-- Automated Category Routing Visual Matrix Card -->
    <div class="routing-matrix-card">
      <div class="routing-matrix-header">
        <div class="routing-matrix-icon">⚙️</div>
        <div>
          <h3 class="routing-matrix-title">HR Department Category Routing Engine</h3>
          <p class="routing-matrix-subtitle">Auto-assignment destinations mapped by technical domain classification:</p>
        </div>
      </div>

      <div class="routing-grid">
        <div class="routing-box">
          <div class="routing-cat-title">🧱 Civil Category</div>
          <div class="routing-dest">➔ Civil In-Charge</div>
          <div class="routing-desc">Masonry, ceiling, plumbing, carpentry & painting</div>
        </div>

        <div class="routing-box">
          <div class="routing-cat-title">⚡ Electrical Category</div>
          <div class="routing-dest">➔ Electrical In-Charge</div>
          <div class="routing-desc">Power sockets, wiring, fans, lighting, MCBs</div>
        </div>

        <div class="routing-box">
          <div class="routing-cat-title">🪑 Furniture Category</div>
          <div class="routing-dest">➔ Furniture In-Charge</div>
          <div class="routing-desc">Workstation chairs, lab tables, storage cabinets</div>
        </div>

        <div class="routing-box">
          <div class="routing-cat-title">💻 Computer Category</div>
          <div class="routing-dest">➔ Computer In-Charge</div>
          <div class="routing-desc">Workstations, monitors, LAN network switches</div>
        </div>
      </div>
    </div>

    <!-- HR Department Assignment Table Card -->
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>HOD-Approved Requests Ready for Assignment</h3>
          <p>Click "Auto Route Category" to assign tickets to the respective department in-charge</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Lab & Location</th>
              <th>Problem Description</th>
              <th>Category</th>
              <th>Priority</th>
              <th>HOD Approved Date</th>
              <th>Target Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${renderHRRows(requests)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Event Handlers
  container.querySelectorAll('.btn-hr-auto-route').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const res = workflow.routeByHR(currentUser, id);
      if (res.success) {
        alert(`Request ${res.request.request_id} successfully auto-routed to ${res.assignedTo}!`);
        renderHRView(container, currentUser);
      } else {
        alert(res.message);
      }
    });
  });
}

function renderHRRows(list) {
  if (list.length === 0) {
    return `
      <tr>
        <td colspan="9">
          <div class="empty-state-table">
            <div class="empty-state-icon">🏢</div>
            <div class="empty-state-title">No maintenance requests pending HR routing.</div>
            <div class="empty-state-desc">Requests authorized by Head of Departments will appear here for automated department dispatch.</div>
          </div>
        </td>
      </tr>
    `;
  }

  return list.map(r => {
    const isPendingHR = r.status === 'Pending HR';
    const deptMap = {
      'Civil': 'Civil Maintenance Dept',
      'Electrical': 'Electrical Maintenance Dept',
      'Furniture': 'Furniture Maintenance Dept',
      'Computer': 'IT Hardware & Computer Dept'
    };

    return `
      <tr style="${isPendingHR ? 'background: #fdfef5;' : ''}">
        <td><strong style="color: var(--primary-600);">${r.request_id}</strong></td>
        <td>
          <div style="font-weight: 600;">${r.department || 'General'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${r.lab_name} (${r.building})</div>
        </td>
        <td><div style="font-weight: 600; max-width: 180px;" class="text-truncate">${r.problem_title}</div></td>
        <td><span class="badge badge-assigned">${r.category}</span></td>
        <td><span class="badge badge-prio-${r.priority.toLowerCase()}">${r.priority}</span></td>
        <td style="font-size: 11px; color: var(--text-muted);">${new Date(r.updated_at).toLocaleDateString()}</td>
        <td>
          <div style="font-size: 12px; font-weight: 600;">${r.assigned_dept || deptMap[r.category]}</div>
        </td>
        <td>
          <span class="badge ${getStatusBadgeClass(r.status)}">
            <span class="badge-dot"></span> ${r.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <a href="#tracking?id=${r.id}" class="btn btn-outline btn-sm">Track</a>
            ${isPendingHR ? `
              <button class="btn btn-primary btn-sm btn-hr-auto-route" data-id="${r.id}">
                ⚡ Auto Route ${r.category}
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadgeClass(status) {
  if (status.startsWith('Pending')) return 'badge-pending';
  if (status.startsWith('Approved') || status === 'Work Completed' || status === 'Closed') return 'badge-approved';
  if (status.startsWith('Rejected')) return 'badge-rejected';
  if (status === 'Work In Progress' || status.startsWith('Accepted')) return 'badge-progress';
  if (status.startsWith('Assigned')) return 'badge-assigned';
  return 'badge-draft';
}
