// src/js/views/hodView.js - Head of Department (HOD) Approval & Monitoring Workspace

import { db } from '../db.js';
import { workflow } from '../workflow.js';

export function renderHODView(container, currentUser) {
  // Filter requests dynamically by HOD's department (Universal dynamic routing)
  const userDept = (currentUser.department || '').trim().toLowerCase();
  const requests = db.getRequests().filter(r => (r.department || '').trim().toLowerCase() === userDept);

  const pendingHOD = requests.filter(r => r.status === 'Pending HOD');
  const approvedHOD = requests.filter(r => r.status === 'Approved by HOD' || r.status.startsWith('Pending HR') || r.status.startsWith('Assigned') || r.status.startsWith('Accepted') || r.status === 'Work In Progress' || r.status === 'Work Completed' || r.status === 'Closed').length;
  const rejectedHOD = requests.filter(r => r.status === 'Rejected by HOD').length;
  const totalReqs = requests.length;
  const completedReqs = requests.filter(r => r.status === 'Work Completed' || r.status === 'Closed').length;

  container.innerHTML = `
    <!-- Top Action Banner -->
    <div class="dashboard-banner-card">
      <div class="banner-welcome-content">
        <div class="banner-badge">HEAD OF DEPARTMENT PORTAL</div>
        <h2 class="banner-title">HOD Executive Approval Queue</h2>
        <p class="banner-desc">Logged in as <strong>${currentUser.full_name}</strong> • ${currentUser.department || 'General Department'}</p>
      </div>
      <div class="banner-actions-group">
        <a href="#reports" class="btn btn-outline-banner">
          <span>Dept Analytics</span>
        </a>
        <a href="#tracking" class="btn btn-outline-banner">
          <span>Track Requests</span>
        </a>
      </div>
    </div>

    <!-- HOD Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card" style="--card-accent: #f59e0b;">
        <div class="metric-info">
          <span class="metric-label">Pending Approval</span>
          <span class="metric-value">${pendingHOD.length}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #d97706; --icon-bg: #fef3c7;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Approved</span>
          <span class="metric-value">${approvedHOD}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #ef4444;">
        <div class="metric-info">
          <span class="metric-label">Rejected</span>
          <span class="metric-value">${rejectedHOD}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #dc2626; --icon-bg: #fee2e2;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #8B9C1E;">
        <div class="metric-info">
          <span class="metric-label">Total Dept Requests</span>
          <span class="metric-value">${totalReqs}</span>
        </div>
        <div class="metric-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Completed Works</span>
          <span class="metric-value">${completedReqs}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
      </div>
    </div>

    <!-- HOD Approval Queue Card -->
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>HOD Maintenance Authorization Queue</h3>
          <p>Review lab requests pre-approved by Lab In-Charge and authorize HR category assignment</p>
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
              <th>Submitted By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${renderHODRows(requests)}
          </tbody>
        </table>
      </div>
    </div>

    <!-- HOD Approve Modal -->
    <div class="modal-backdrop" id="hod-approve-modal">
      <div class="modal-content" style="max-width: 520px;">
        <div class="modal-header">
          <h3 class="modal-title">HOD Authorization & Approval</h3>
          <button class="modal-close-btn" id="close-hod-approve">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 14px; font-weight: 600; color: var(--primary-900); margin-bottom: 8px;">
            Authorize this request for HR department category routing?
          </p>
          <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 16px;">
            Upon authorization, the request will immediately arrive at the <strong>HR Operations Desk</strong> for automated department routing.
          </p>
          <input type="hidden" id="hod-approve-req-id" />
          <div class="form-group">
            <label class="form-label">HOD Approval Comments (Optional)</label>
            <textarea class="form-control" id="hod-approve-comment" placeholder="Add budget code, authorization notes, or instructions for HR..." style="min-height: 80px;"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="cancel-hod-approve">Cancel</button>
          <button class="btn btn-success" id="confirm-hod-approve">✓ Authorize & Send to HR</button>
        </div>
      </div>
    </div>

    <!-- HOD Reject Modal -->
    <div class="modal-backdrop" id="hod-reject-modal">
      <div class="modal-content" style="max-width: 520px;">
        <div class="modal-header">
          <h3 class="modal-title" style="color: #991b1b;">HOD Rejection</h3>
          <button class="modal-close-btn" id="close-hod-reject">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            The request will be returned to the <strong>Lab Assistant</strong> with your stated rejection reason.
          </p>
          <input type="hidden" id="hod-reject-req-id" />
          <div class="form-group">
            <label class="form-label" style="color: #991b1b;">Rejection Reason (Mandatory) *</label>
            <textarea class="form-control" id="hod-reject-reason" required placeholder="State budget constraints, alternative arrangements, or missing specification..." style="min-height: 90px;"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="cancel-hod-reject">Cancel</button>
          <button class="btn btn-danger" id="confirm-hod-reject">Reject Request</button>
        </div>
      </div>
    </div>
  `;

  // Attach Modal Listeners
  const approveModal = container.querySelector('#hod-approve-modal');
  const rejectModal = container.querySelector('#hod-reject-modal');

  container.querySelectorAll('.btn-hod-open-approve').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelector('#hod-approve-req-id').value = btn.getAttribute('data-id');
      container.querySelector('#hod-approve-comment').value = '';
      approveModal.classList.add('show');
    });
  });

  container.querySelector('#close-hod-approve')?.addEventListener('click', () => approveModal.classList.remove('show'));
  container.querySelector('#cancel-hod-approve')?.addEventListener('click', () => approveModal.classList.remove('show'));
  container.querySelector('#confirm-hod-approve')?.addEventListener('click', () => {
    const id = container.querySelector('#hod-approve-req-id').value;
    const comments = container.querySelector('#hod-approve-comment').value.trim();

    const res = workflow.approveByHOD(currentUser, id, comments);
    if (res.success) {
      if (res.warning) {
        alert(`Request ${res.request.request_id} approved by HOD!\n\n⚠️ Notice: ${res.warning}`);
      } else {
        alert(`Request ${res.request.request_id} approved by HOD and sent to HR!`);
      }
      approveModal.classList.remove('show');
      renderHODView(container, currentUser);
    } else {
      alert(res.message);
    }
  });

  // Reject Listeners
  container.querySelectorAll('.btn-hod-open-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelector('#hod-reject-req-id').value = btn.getAttribute('data-id');
      container.querySelector('#hod-reject-reason').value = '';
      rejectModal.classList.add('show');
    });
  });

  container.querySelector('#close-hod-reject')?.addEventListener('click', () => rejectModal.classList.remove('show'));
  container.querySelector('#cancel-hod-reject')?.addEventListener('click', () => rejectModal.classList.remove('show'));
  container.querySelector('#confirm-hod-reject')?.addEventListener('click', () => {
    const id = container.querySelector('#hod-reject-req-id').value;
    const reason = container.querySelector('#hod-reject-reason').value.trim();

    if (!reason) {
      alert('Rejection reason is mandatory.');
      return;
    }

    const res = workflow.rejectByHOD(currentUser, id, reason);
    if (res.success) {
      alert(`Request ${res.request.request_id} rejected by HOD and returned to Lab Assistant.`);
      rejectModal.classList.remove('show');
      renderHODView(container, currentUser);
    } else {
      alert(res.message);
    }
  });
}

function renderHODRows(list) {
  if (list.length === 0) {
    return `
      <tr>
        <td colspan="9">
          <div class="empty-state-table">
            <div class="empty-state-icon">🎓</div>
            <div class="empty-state-title">No maintenance requests in HOD queue.</div>
            <div class="empty-state-desc">Requests pre-approved by Lab In-Charges will appear here for your executive authorization.</div>
          </div>
        </td>
      </tr>
    `;
  }

  return list.map(r => {
    const isPendingHOD = r.status === 'Pending HOD';
    return `
      <tr style="${isPendingHOD ? 'background: #fdfef5;' : ''}">
        <td><strong style="color: var(--primary-600);">${r.request_id}</strong></td>
        <td>
          <div style="font-weight: 600;">${r.lab_name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${r.building} - ${r.room_number}</div>
        </td>
        <td><div style="font-weight: 600; max-width: 180px;" class="text-truncate">${r.problem_title}</div></td>
        <td><span class="badge badge-assigned">${r.category}</span></td>
        <td><span class="badge badge-prio-${r.priority.toLowerCase()}">${r.priority}</span></td>
        <td><div style="font-size: 13px;">${r.created_by_name}</div></td>
        <td style="font-size: 11px; color: var(--text-muted);">${new Date(r.created_at).toLocaleDateString()}</td>
        <td>
          <span class="badge ${getStatusBadgeClass(r.status)}">
            <span class="badge-dot"></span> ${r.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <a href="#tracking?id=${r.id}" class="btn btn-outline btn-sm">View</a>
            ${isPendingHOD ? `
              <button class="btn btn-success btn-sm btn-hod-open-approve" data-id="${r.id}">Approve</button>
              <button class="btn btn-danger btn-sm btn-hod-open-reject" data-id="${r.id}">Reject</button>
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
