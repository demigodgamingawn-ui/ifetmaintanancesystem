// src/js/views/deptView.js - Department In-Charge Workspace (Civil, Electrical, Furniture, Computer)

import { db } from '../db.js';
import { workflow } from '../workflow.js';

export function renderDeptView(container, currentUser) {
  // Determine Category Filter from User Role
  const roleCategoryMap = {
    'Civil In-Charge': 'Civil',
    'Electrical In-Charge': 'Electrical',
    'Furniture In-Charge': 'Furniture',
    'Computer In-Charge': 'Computer'
  };

  const myCategory = roleCategoryMap[currentUser.role] || 'Electrical';

  // Filter requests specifically assigned to this department category
  const allRequests = db.getRequests();
  const deptRequests = allRequests.filter(r => r.category === myCategory);

  const pendingWork = deptRequests.filter(r => r.status === 'Assigned to Department');
  const acceptedWork = deptRequests.filter(r => r.status === 'Accepted by Department');
  const inProgressWork = deptRequests.filter(r => r.status === 'Work In Progress');
  const completedWork = deptRequests.filter(r => r.status === 'Work Completed' || r.status === 'Closed');
  const totalDeptReqs = deptRequests.length;

  container.innerHTML = `
    <!-- Top Department Banner Card -->
    <div class="dashboard-banner-card">
      <div class="banner-welcome-content">
        <div class="banner-badge">${myCategory.toUpperCase()} OPERATIONS DESK</div>
        <h2 class="banner-title">${myCategory} Maintenance Operations</h2>
        <p class="banner-desc">Assigned In-Charge: <strong>${currentUser.full_name}</strong> • ${currentUser.role}</p>
      </div>
      <div class="banner-actions-group">
        <a href="#tracking" class="btn btn-outline-banner">
          <span>Track Lifecycle</span>
        </a>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card" style="--card-accent: #f59e0b;">
        <div class="metric-info">
          <span class="metric-label">Pending Work</span>
          <span class="metric-value">${pendingWork.length}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #d97706; --icon-bg: #fef3c7;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #3b82f6;">
        <div class="metric-info">
          <span class="metric-label">Accepted Work</span>
          <span class="metric-value">${acceptedWork.length}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #2563eb; --icon-bg: #eff6ff;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #06b6d4;">
        <div class="metric-info">
          <span class="metric-label">In Progress</span>
          <span class="metric-value">${inProgressWork.length}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #0891b2; --icon-bg: #cff4fc;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Completed Works</span>
          <span class="metric-value">${completedWork.length}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #8B9C1E;">
        <div class="metric-info">
          <span class="metric-label">Total Assigned</span>
          <span class="metric-value">${totalDeptReqs}</span>
        </div>
        <div class="metric-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
      </div>
    </div>

    <!-- Assigned Requests Queue Card -->
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>${myCategory} Maintenance Operations Queue</h3>
          <p>Accept assigned tasks, initiate work progress, and log completion certificates</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Lab & Location</th>
              <th>Problem Description</th>
              <th>Priority</th>
              <th>Date Assigned</th>
              <th>Status</th>
              <th>Work Actions</th>
            </tr>
          </thead>
          <tbody>
            ${renderDeptRows(deptRequests)}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Completion Form Modal -->
    <div class="modal-backdrop" id="complete-work-modal">
      <div class="modal-content" style="max-width: 680px;">
        <div class="modal-header">
          <h3 class="modal-title">Submit Maintenance Work Completion</h3>
          <button class="modal-close-btn" id="close-complete-modal">&times;</button>
        </div>
        <form id="complete-work-form">
          <div class="modal-body">
            <input type="hidden" id="comp-req-id" />
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Work Completion Date *</label>
                <input type="date" class="form-control" id="comp-date" required value="${new Date().toISOString().split('T')[0]}" />
              </div>

              <div class="form-group">
                <label class="form-label">Technician / Engineer Name *</label>
                <input type="text" class="form-control" id="comp-tech" required placeholder="e.g. R. Selvam (Sr. Technician)" value="${currentUser.full_name}" />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Work Completed Description *</label>
                <textarea class="form-control" id="comp-desc" required placeholder="Describe exact repairs performed, replacement parts, tests executed, and operational status..." style="min-height: 80px;"></textarea>
              </div>

              <div class="form-group full-width">
                <label class="form-label">Materials & Spare Parts Used</label>
                <input type="text" class="form-control" id="comp-materials" placeholder="e.g. 1x 16A modular switch socket, 5m wiring, anchor bolts" />
              </div>

              <div class="form-group">
                <label class="form-label">Estimated Cost</label>
                <input type="text" class="form-control" id="comp-est-cost" placeholder="₹ 1,500" value="₹ 1,000" />
              </div>

              <div class="form-group">
                <label class="form-label">Actual Repair Cost *</label>
                <input type="text" class="form-control" id="comp-act-cost" required placeholder="₹ 1,150" value="₹ 1,000" />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Completion Proof Photo URL</label>
                <input type="text" class="form-control" id="comp-photo" placeholder="Photo URL (optional)" />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Final Remarks / Handover Notes</label>
                <input type="text" class="form-control" id="comp-remarks" placeholder="e.g. Tested in presence of Lab In-Charge. Fully operational." value="Tested and verified operational." />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="cancel-complete-modal">Cancel</button>
            <button type="submit" class="btn btn-success">✓ Submit Completion Certificate</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Attach Event Handlers
  container.querySelectorAll('.btn-dept-accept').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const res = workflow.acceptWork(currentUser, id);
      if (res.success) {
        alert(`Work accepted for Request ${res.request.request_id}!`);
        renderDeptView(container, currentUser);
      }
    });
  });

  container.querySelectorAll('.btn-dept-start').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const res = workflow.startWork(currentUser, id);
      if (res.success) {
        alert(`Status updated to "Work In Progress" for Request ${res.request.request_id}!`);
        renderDeptView(container, currentUser);
      }
    });
  });

  // Complete Work Modal
  const compModal = container.querySelector('#complete-work-modal');
  const compForm = container.querySelector('#complete-work-form');

  container.querySelectorAll('.btn-dept-open-complete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      container.querySelector('#comp-req-id').value = id;
      compModal.classList.add('show');
    });
  });

  container.querySelector('#close-complete-modal')?.addEventListener('click', () => compModal.classList.remove('show'));
  container.querySelector('#cancel-complete-modal')?.addEventListener('click', () => compModal.classList.remove('show'));

  compForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const reqId = container.querySelector('#comp-req-id').value;
    const compData = {
      work_description: container.querySelector('#comp-desc').value.trim(),
      materials_used: container.querySelector('#comp-materials').value.trim(),
      technician_name: container.querySelector('#comp-tech').value.trim(),
      estimated_cost: container.querySelector('#comp-est-cost').value.trim(),
      actual_cost: container.querySelector('#comp-act-cost').value.trim(),
      completion_photo: container.querySelector('#comp-photo').value.trim(),
      remarks: container.querySelector('#comp-remarks').value.trim()
    };

    const res = workflow.completeWork(currentUser, reqId, compData);
    if (res.success) {
      alert(`Request ${res.request.request_id} successfully marked as WORK COMPLETED 🎉!`);
      compModal.classList.remove('show');
      renderDeptView(container, currentUser);
    } else {
      alert(res.message);
    }
  });
}

function renderDeptRows(list) {
  if (list.length === 0) {
    return `
      <tr>
        <td colspan="7">
          <div class="empty-state-table">
            <div class="empty-state-icon">🔧</div>
            <div class="empty-state-title">No maintenance requests assigned.</div>
            <div class="empty-state-desc">Requests routed to your department by HR will appear here for task execution.</div>
          </div>
        </td>
      </tr>
    `;
  }

  return list.map(r => {
    const isAssigned = r.status === 'Assigned to Department';
    const isAccepted = r.status === 'Accepted by Department';
    const isInProgress = r.status === 'Work In Progress';
    const isCompleted = r.status === 'Work Completed' || r.status === 'Closed';

    return `
      <tr style="${isAssigned || isInProgress ? 'background: #fdfef5;' : ''}">
        <td><strong style="color: var(--primary-600);">${r.request_id}</strong></td>
        <td>
          <div style="font-weight: 600;">${r.department || 'General'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${r.lab_name} (${r.building} - ${r.room_number})</div>
        </td>
        <td>
          <div style="font-weight: 600; max-width: 220px;" class="text-truncate">${r.problem_title}</div>
          <div style="font-size: 11px; color: var(--text-muted); max-width: 220px;" class="text-truncate">${r.description}</div>
        </td>
        <td><span class="badge badge-prio-${r.priority.toLowerCase()}">${r.priority}</span></td>
        <td style="font-size: 11px; color: var(--text-muted);">${new Date(r.updated_at).toLocaleDateString()}</td>
        <td>
          <span class="badge ${getStatusBadgeClass(r.status)}">
            <span class="badge-dot"></span> ${r.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <a href="#tracking?id=${r.id}" class="btn btn-outline btn-sm">Details</a>
            ${isAssigned ? `<button class="btn btn-primary btn-sm btn-dept-accept" data-id="${r.id}">Accept Work</button>` : ''}
            ${isAccepted ? `<button class="btn btn-primary btn-sm btn-dept-start" data-id="${r.id}">Start Work</button>` : ''}
            ${isInProgress ? `<button class="btn btn-success btn-sm btn-dept-open-complete" data-id="${r.id}">Mark Completed</button>` : ''}
            ${isCompleted ? `<span style="font-size: 11px; color: #059669; font-weight: 700;">✓ Done</span>` : ''}
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
