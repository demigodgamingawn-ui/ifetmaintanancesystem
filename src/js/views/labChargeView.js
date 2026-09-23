// src/js/views/labChargeView.js - Lab In-Charge Review & Approval Module

import { db } from '../db.js';
import { workflow } from '../workflow.js';

export function renderLabChargeView(container, currentUser) {
  // Filter requests dynamically by user department (Universal dynamic routing)
  const userDept = (currentUser.department || '').trim().toLowerCase();
  const requests = db.getRequests().filter(r => (r.department || '').trim().toLowerCase() === userDept);

  const totalReqs = requests.length;
  const pendingLabCharge = requests.filter(r => r.status === 'Pending Lab In-Charge');
  const approvedLabCharge = requests.filter(r => r.status.includes('Approved by Lab In-Charge') || r.status.startsWith('Approved') || r.status.startsWith('Pending HOD') || r.status.startsWith('Pending HR') || r.status.startsWith('Assigned') || r.status.startsWith('Accepted') || r.status === 'Work In Progress' || r.status === 'Work Completed' || r.status === 'Closed').length;
  const rejectedLabCharge = requests.filter(r => r.status === 'Rejected by Lab In-Charge').length;

  container.innerHTML = `
    <!-- Top Action Banner -->
    <div class="dashboard-banner-card">
      <div class="banner-welcome-content">
        <div class="banner-badge">LABORATORY IN-CHARGE PORTAL</div>
        <h2 class="banner-title">Technical Review & Approval Queue</h2>
        <p class="banner-desc">Logged in as <strong>${currentUser.full_name}</strong> • ${currentUser.department || 'General'} (${currentUser.lab || 'Main Lab'})</p>
      </div>
      <div class="banner-actions-group">
        <a href="#tracking" class="btn btn-outline-banner">
          <span>Track Requests</span>
        </a>
      </div>
    </div>

    <!-- Top Metrics Grid -->
    <div class="metrics-grid">
      <div class="metric-card" style="--card-accent: #f59e0b;">
        <div class="metric-info">
          <span class="metric-label">Pending Approval</span>
          <span class="metric-value">${pendingLabCharge.length}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #d97706; --icon-bg: #fef3c7;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Approved Requests</span>
          <span class="metric-value">${approvedLabCharge}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #ef4444;">
        <div class="metric-info">
          <span class="metric-label">Rejected Requests</span>
          <span class="metric-value">${rejectedLabCharge}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #dc2626; --icon-bg: #fee2e2;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #8B9C1E;">
        <div class="metric-info">
          <span class="metric-label">Total Lab Requests</span>
          <span class="metric-value">${totalReqs}</span>
        </div>
        <div class="metric-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
      </div>
    </div>

    <!-- Requests Pending Lab In-Charge Review -->
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Lab Maintenance Requests Review Queue</h3>
          <p>Inspect problem descriptions, verify site feasibility, and approve or reject submissions</p>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Submitted By</th>
              <th>Lab & Location</th>
              <th>Problem Description</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${renderLabChargeRows(requests)}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Accept Confirmation Modal -->
    <div class="modal-backdrop" id="accept-modal">
      <div class="modal-content" style="max-width: 520px;">
        <div class="modal-header">
          <h3 class="modal-title">Approve Maintenance Request</h3>
          <button class="modal-close-btn" id="close-accept-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 14px; font-weight: 600; color: var(--primary-900); margin-bottom: 8px;">
            Are you sure you want to approve this maintenance request?
          </p>
          <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 16px;">
            Approved request will automatically advance to the <strong>HOD Approval Queue</strong> for department head endorsement.
          </p>
          <input type="hidden" id="accept-req-id" />
          <div class="form-group">
            <label class="form-label">Approval Comments / Technical Notes (Optional)</label>
            <textarea class="form-control" id="accept-comment" placeholder="Add technical observations or instructions for HOD..." style="min-height: 80px;"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="cancel-accept-modal">Cancel</button>
          <button class="btn btn-success" id="confirm-accept-btn">✓ Approve & Forward to HOD</button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div class="modal-backdrop" id="reject-modal">
      <div class="modal-content" style="max-width: 520px;">
        <div class="modal-header">
          <h3 class="modal-title" style="color: #991b1b;">Reject Maintenance Request</h3>
          <button class="modal-close-btn" id="close-reject-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
            The request will be returned to the <strong>Lab Assistant</strong> with your stated reason so they can update and resubmit.
          </p>
          <input type="hidden" id="reject-req-id" />
          <div class="form-group">
            <label class="form-label" style="color: #991b1b;">Rejection Reason (Mandatory) *</label>
            <textarea class="form-control" id="reject-reason" required placeholder="e.g. Insufficient specifications, duplicate request, or invalid lab area..." style="min-height: 90px;"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="cancel-reject-modal">Cancel</button>
          <button class="btn btn-danger" id="confirm-reject-btn">Reject Request</button>
        </div>
      </div>
    </div>

    <!-- View Request Details Modal -->
    <div class="modal-backdrop" id="view-modal">
      <div class="modal-content" style="max-width: 720px;">
        <div class="modal-header">
          <h3 class="modal-title" id="view-modal-title">Request Details</h3>
          <button class="modal-close-btn" id="close-view-modal">&times;</button>
        </div>
        <div class="modal-body" id="view-modal-body">
          <!-- Filled dynamically -->
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="close-view-footer">Close</button>
        </div>
      </div>
    </div>
  `;

  // Attach Modal Listeners
  const acceptModal = container.querySelector('#accept-modal');
  const rejectModal = container.querySelector('#reject-modal');
  const viewModal = container.querySelector('#view-modal');

  // Accept Handler
  container.querySelectorAll('.btn-open-accept').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      container.querySelector('#accept-req-id').value = id;
      container.querySelector('#accept-comment').value = '';
      acceptModal.classList.add('show');
    });
  });

  container.querySelector('#close-accept-modal')?.addEventListener('click', () => acceptModal.classList.remove('show'));
  container.querySelector('#cancel-accept-modal')?.addEventListener('click', () => acceptModal.classList.remove('show'));
  container.querySelector('#confirm-accept-btn')?.addEventListener('click', () => {
    const id = container.querySelector('#accept-req-id').value;
    const comments = container.querySelector('#accept-comment').value.trim();

    const res = workflow.approveByLabCharge(currentUser, id, comments);
    if (res.success) {
      if (res.warning) {
        alert(`Request ${res.request.request_id} approved successfully!\n\n⚠️ Notice: ${res.warning}`);
      } else {
        alert(`Request ${res.request.request_id} approved successfully and forwarded to HOD!`);
      }
      acceptModal.classList.remove('show');
      renderLabChargeView(container, currentUser);
    } else {
      alert(res.message);
    }
  });

  // Reject Handler
  container.querySelectorAll('.btn-open-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      container.querySelector('#reject-req-id').value = id;
      container.querySelector('#reject-reason').value = '';
      rejectModal.classList.add('show');
    });
  });

  container.querySelector('#close-reject-modal')?.addEventListener('click', () => rejectModal.classList.remove('show'));
  container.querySelector('#cancel-reject-modal')?.addEventListener('click', () => rejectModal.classList.remove('show'));
  container.querySelector('#confirm-reject-btn')?.addEventListener('click', () => {
    const id = container.querySelector('#reject-req-id').value;
    const reason = container.querySelector('#reject-reason').value.trim();

    if (!reason) {
      alert('Please enter a rejection reason.');
      return;
    }

    const res = workflow.rejectByLabCharge(currentUser, id, reason);
    if (res.success) {
      alert(`Request ${res.request.request_id} rejected and returned to Lab Assistant.`);
      rejectModal.classList.remove('show');
      renderLabChargeView(container, currentUser);
    } else {
      alert(res.message);
    }
  });

  // View Details Handler
  container.querySelectorAll('.btn-open-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const req = db.getRequests().find(r => r.id === id);
      const approvals = db.getApprovals().filter(a => a.request_id === id);

      if (!req) return;

      container.querySelector('#view-modal-title').textContent = `Request ${req.request_id} Details`;
      container.querySelector('#view-modal-body').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <h4 style="font-family: var(--font-heading); font-size: 16px; color: var(--primary-900); font-weight: 700;">${req.problem_title}</h4>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${req.lab_name} • ${req.building}, ${req.floor} - Room ${req.room_number}</div>
            </div>
            <div>
              <span class="badge ${getStatusBadgeClass(req.status)}">${req.status}</span>
            </div>
          </div>

          <div class="form-grid">
            <div>
              <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Work Category</div>
              <div style="font-size: 14px; font-weight: 600; color: var(--primary-600);">${req.category}</div>
            </div>
            <div>
              <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Priority</div>
              <div><span class="badge badge-prio-${req.priority.toLowerCase()}">${req.priority}</span></div>
            </div>
            <div>
              <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Submitted By</div>
              <div style="font-size: 13px; font-weight: 600;">${req.created_by_name}</div>
            </div>
            <div>
              <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Submission Date</div>
              <div style="font-size: 13px;">${new Date(req.created_at).toLocaleString()}</div>
            </div>
          </div>

          <div>
            <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Problem Description</div>
            <div style="font-size: 13px; background: var(--bg-section-alt); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); line-height: 1.5;">${req.description}</div>
          </div>

          ${req.estimated_requirement ? `
            <div>
              <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Estimated Requirement / Parts</div>
              <div style="font-size: 13px; font-weight: 600;">${req.estimated_requirement}</div>
            </div>
          ` : ''}

          <div>
            <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Attachment / Photo Preview</div>
            ${req.attachment && !req.attachment.includes('images.unsplash.com') ? `
              <img src="${req.attachment}" alt="Photo" style="max-width: 100%; max-height: 220px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color);" />
            ` : `
              <div style="font-size: 12.5px; color: var(--text-muted); font-style: italic; background: var(--bg-section-alt); padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 6px;">
                <span>📎 No attachment uploaded</span>
              </div>
            `}
          </div>

          <div>
            <div style="font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Approval Chain History</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${approvals.length === 0 ? '<div style="font-size: 12px; color: var(--text-muted); padding: 8px; background: var(--bg-section-alt); border-radius: 6px;">No approval records yet.</div>' : approvals.map(a => `
                <div style="font-size: 12px; padding: 10px 12px; background: var(--bg-section-alt); border-radius: 6px; display: flex; justify-content: space-between; border: 1px solid var(--border-color);">
                  <div>
                    <strong>${a.approver_name} (${a.role})</strong> — <span style="color: ${a.action === 'ACCEPT' ? '#059669' : '#dc2626'}; font-weight: 700;">${a.action}</span>
                    ${a.comments ? `<div style="color: var(--text-muted); font-size: 11px; margin-top: 2px;">"${a.comments}"</div>` : ''}
                  </div>
                  <div style="font-size: 10.5px; color: var(--text-light);">${new Date(a.action_date).toLocaleDateString()}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      viewModal.classList.add('show');
    });
  });

  container.querySelector('#close-view-modal')?.addEventListener('click', () => viewModal.classList.remove('show'));
  container.querySelector('#close-view-footer')?.addEventListener('click', () => viewModal.classList.remove('show'));
}

function renderLabChargeRows(list) {
  if (list.length === 0) {
    return `
      <tr>
        <td colspan="9">
          <div class="empty-state-table">
            <div class="empty-state-icon">✅</div>
            <div class="empty-state-title">No maintenance requests available.</div>
            <div class="empty-state-desc">Requests submitted by lab assistants will appear here for your review and approval.</div>
          </div>
        </td>
      </tr>
    `;
  }

  return list.map(r => {
    const isPendingMe = r.status === 'Pending Lab In-Charge';
    return `
      <tr style="${isPendingMe ? 'background: #fdfef5;' : ''}">
        <td><strong style="color: var(--primary-600);">${r.request_id}</strong></td>
        <td><div style="font-weight: 600;">${r.created_by_name}</div></td>
        <td>
          <div style="font-weight: 600;">${r.lab_name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${r.building} - ${r.room_number}</div>
        </td>
        <td><div style="font-weight: 600; max-width: 180px;" class="text-truncate">${r.problem_title}</div></td>
        <td><span class="badge badge-assigned">${r.category}</span></td>
        <td><span class="badge badge-prio-${r.priority.toLowerCase()}">${r.priority}</span></td>
        <td style="font-size: 11px; color: var(--text-muted);">${new Date(r.created_at).toLocaleDateString()}</td>
        <td>
          <span class="badge ${getStatusBadgeClass(r.status)}">
            <span class="badge-dot"></span> ${r.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm btn-open-view" data-id="${r.id}">View</button>
            ${isPendingMe ? `
              <button class="btn btn-success btn-sm btn-open-accept" data-id="${r.id}">Approve</button>
              <button class="btn btn-danger btn-sm btn-open-reject" data-id="${r.id}">Reject</button>
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
