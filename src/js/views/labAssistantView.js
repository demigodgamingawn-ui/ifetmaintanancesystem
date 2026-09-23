// src/js/views/labAssistantView.js - Lab Assistant Dashboard & Maintenance Request Creator

import { db } from '../db.js';
import { workflow } from '../workflow.js';

export function renderLabAssistantView(container, currentUser, activeSubTab = 'my-requests') {
  const requests = db.getRequests().filter(r => r.created_by === currentUser.id);

  const totalMyReqs = requests.length;
  const pendingReqs = requests.filter(r => r.status.startsWith('Pending')).length;
  const approvedReqs = requests.filter(r => r.status.startsWith('Approved') || r.status.startsWith('Pending HR')).length;
  const rejectedReqs = requests.filter(r => r.status.startsWith('Rejected')).length;
  const inProgressReqs = requests.filter(r => r.status === 'Work In Progress' || r.status.startsWith('Assigned') || r.status.startsWith('Accepted')).length;
  const completedReqs = requests.filter(r => r.status === 'Work Completed' || r.status === 'Closed').length;

  container.innerHTML = `
    <!-- Top Action Banner -->
    <div class="dashboard-banner-card">
      <div class="banner-welcome-content">
        <div class="banner-badge">LABORATORY ASSISTANT PORTAL</div>
        <h2 class="banner-title">Maintenance Request Dashboard</h2>
        <p class="banner-desc">Logged in as <strong>${currentUser.full_name}</strong> • ${currentUser.department || 'General'} (${currentUser.lab || 'Main Lab'})</p>
      </div>
      <div class="banner-actions-group">
        <button class="btn btn-primary" id="btn-open-request-form-top">
          <span>+ Create Maintenance Request</span>
        </button>
        <a href="#tracking" class="btn btn-outline-banner">
          <span>Track Status</span>
        </a>
      </div>
    </div>

    <!-- Metric Cards Grid -->
    <div class="metrics-grid">
      <div class="metric-card" style="--card-accent: #8B9C1E;">
        <div class="metric-info">
          <span class="metric-label">My Requests</span>
          <span class="metric-value">${totalMyReqs}</span>
        </div>
        <div class="metric-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #f59e0b;">
        <div class="metric-info">
          <span class="metric-label">Pending</span>
          <span class="metric-value">${pendingReqs}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #d97706; --icon-bg: #fef3c7;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Approved</span>
          <span class="metric-value">${approvedReqs}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #ef4444;">
        <div class="metric-info">
          <span class="metric-label">Rejected</span>
          <span class="metric-value">${rejectedReqs}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #dc2626; --icon-bg: #fee2e2;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #06b6d4;">
        <div class="metric-info">
          <span class="metric-label">In Progress</span>
          <span class="metric-value">${inProgressReqs}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #0891b2; --icon-bg: #cff4fc;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Completed</span>
          <span class="metric-value">${completedReqs}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
      </div>
    </div>

    <!-- Create Request Form Collapsible Card -->
    <div class="content-card" id="card-create-request">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Create Maintenance Request</h3>
          <p>Submit campus infrastructure, equipment failure, electrical, civil, or computing repair tickets</p>
        </div>
        <button class="btn btn-outline" id="btn-toggle-req-form">
          <span id="btn-toggle-text">+ Open Request Form</span>
        </button>
      </div>

      <div id="request-form-container" style="${activeSubTab === 'new-request' ? 'display: block;' : 'display: none;'} margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 24px;">
        <form id="create-request-form">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Request ID (Auto-Generated)</label>
              <input type="text" class="form-control" value="${db.generateRequestId()}" readonly style="background: var(--bg-section-alt); font-weight: 700; color: var(--primary-600);" />
            </div>
            <div class="form-group">
              <label class="form-label">Department (Assigned to your Profile)</label>
              <input type="text" class="form-control" id="req-dept-readonly" value="${currentUser.department || 'General'}" readonly style="background: var(--bg-section-alt); font-weight: 700; color: var(--text-main);" />
            </div>
            <div class="form-group">
              <label class="form-label">Submission Date</label>
              <input type="text" class="form-control" value="${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}" readonly style="background: var(--bg-section-alt);" />
            </div>

            <div class="form-group">
              <label class="form-label">Lab Name / Location *</label>
              <input type="text" class="form-control" id="req-lab-name" required value="${currentUser.lab || 'Main Lab'}" placeholder="e.g. Mechanical CAD Lab" />
            </div>
            <div class="form-group">
              <label class="form-label">Building / Block *</label>
              <input type="text" class="form-control" id="req-building" required value="APJ Abdul Kalam Block" placeholder="e.g. APJ Abdul Kalam Block" />
            </div>

            <div class="form-group">
              <label class="form-label">Floor *</label>
              <input type="text" class="form-control" id="req-floor" required value="2nd Floor" placeholder="e.g. 2nd Floor" />
            </div>
            <div class="form-group">
              <label class="form-label">Room / Bay Number *</label>
              <input type="text" class="form-control" id="req-room" required value="Room 204" placeholder="e.g. Room 204" />
            </div>

            <div class="form-group full-width">
              <label class="form-label">Problem Title *</label>
              <input type="text" class="form-control" id="req-title" required placeholder="e.g. Workstation #14 Monitor Display Flashing" />
            </div>

            <div class="form-group full-width">
              <label class="form-label">Problem Description & Location Specifics *</label>
              <textarea class="form-control" id="req-desc" required placeholder="Describe exact symptoms, equipment serial numbers, failure cause, and impact on laboratory classes..." style="min-height: 90px;"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Work Category *</label>
              <select class="form-control" id="req-category" required>
                <option value="Civil">Civil (Plumbing, Ceiling, Walls, Painting)</option>
                <option value="Electrical" selected>Electrical (Wiring, Lights, Fans, Sockets, Power)</option>
                <option value="Furniture">Furniture (Chairs, Desks, Tables, Hardware)</option>
                <option value="Computer">Computer (PCs, Monitors, Network, LAN, Printers)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Priority Level *</label>
              <select class="form-control" id="req-priority" required>
                <option value="Low">Low (Routine maintenance)</option>
                <option value="Medium" selected>Medium (Standard lab repair)</option>
                <option value="High">High (Impacting lab class schedule)</option>
                <option value="Emergency">Emergency (Immediate hazard / power fault)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Estimated Materials / Requirement</label>
              <input type="text" class="form-control" id="req-estimated" placeholder="e.g. 1x 16A Modular Switch Plate, 5m Wire" />
            </div>

            <div class="form-group">
              <label class="form-label">Photo Upload / Reference URL</label>
              <input type="text" class="form-control" id="req-photo-url" placeholder="Paste image URL (optional)" />
            </div>

            <div class="form-group full-width">
              <label class="form-label">Additional Remarks / Access Notes</label>
              <input type="text" class="form-control" id="req-remarks" placeholder="e.g. Preferred inspection time after 4:00 PM..." />
            </div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline" id="btn-cancel-req-form">Cancel</button>
            <button type="button" class="btn btn-outline" id="btn-save-draft">Save as Draft</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-maintenance-req">Submit Maintenance Request</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Submitted Requests Table Card -->
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Submitted Maintenance Requests</h3>
          <p>Track approval status, reviewer feedback, and lifecycle progression</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Date</th>
              <th>Lab & Location</th>
              <th>Problem Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${renderMyRequestsRows(requests)}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit & Resubmit Rejected Request Modal -->
    <div class="modal-backdrop" id="resubmit-modal">
      <div class="modal-content" style="max-width: 620px;">
        <div class="modal-header">
          <h3 class="modal-title">Edit & Resubmit Maintenance Request</h3>
          <button class="modal-close-btn" id="close-resubmit-modal">&times;</button>
        </div>
        <form id="resubmit-form">
          <div class="modal-body">
            <input type="hidden" id="resubmit-req-id" />
            <div id="rejection-reason-box" style="padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; margin-bottom: 16px; font-size: 13px;">
              <strong>Reviewer Rejection Reason:</strong> <span id="rejection-reason-text"></span>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Problem Title *</label>
              <input type="text" class="form-control" id="edit-title" required />
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Problem Description *</label>
              <textarea class="form-control" id="edit-desc" required style="min-height: 80px;"></textarea>
            </div>

            <div class="form-grid" style="margin-bottom: 14px;">
              <div class="form-group">
                <label class="form-label">Work Category</label>
                <select class="form-control" id="edit-category">
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Computer">Computer</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select class="form-control" id="edit-priority">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Updated Remarks / Clarifications</label>
              <input type="text" class="form-control" id="edit-remarks" placeholder="Provide extra information requested by reviewer..." />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="cancel-resubmit-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Resubmit Request</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Toggle Form Visibility
  const reqFormContainer = container.querySelector('#request-form-container');
  const toggleBtn = container.querySelector('#btn-toggle-req-form');
  const toggleText = container.querySelector('#btn-toggle-text');
  const openTopBtn = container.querySelector('#btn-open-request-form-top');

  const toggleForm = (show) => {
    const isHidden = reqFormContainer.style.display === 'none';
    const shouldShow = show !== undefined ? show : isHidden;
    reqFormContainer.style.display = shouldShow ? 'block' : 'none';
    if (toggleText) {
      toggleText.textContent = shouldShow ? '▲ Close Form' : '+ Open Request Form';
    }
    if (shouldShow) {
      reqFormContainer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  toggleBtn?.addEventListener('click', () => toggleForm());
  openTopBtn?.addEventListener('click', () => toggleForm(true));

  container.querySelector('#btn-cancel-req-form')?.addEventListener('click', () => {
    toggleForm(false);
  });

  // Handle Form Submission
  const createForm = container.querySelector('#create-request-form');

  createForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitRequestData(false);
  });

  container.querySelector('#btn-save-draft')?.addEventListener('click', () => {
    submitRequestData(true);
  });

  function submitRequestData(isDraft) {
    const reqData = {
      lab_name: container.querySelector('#req-lab-name').value.trim(),
      building: container.querySelector('#req-building').value.trim(),
      floor: container.querySelector('#req-floor').value.trim(),
      room_number: container.querySelector('#req-room').value.trim(),
      problem_title: container.querySelector('#req-title').value.trim(),
      description: container.querySelector('#req-desc').value.trim(),
      category: container.querySelector('#req-category').value,
      priority: container.querySelector('#req-priority').value,
      estimated_requirement: container.querySelector('#req-estimated').value.trim(),
      attachment: container.querySelector('#req-photo-url').value.trim(),
      remarks: container.querySelector('#req-remarks').value.trim(),
      is_draft: isDraft
    };

    const newReq = workflow.createRequest(currentUser, reqData);
    if (newReq.warning) {
      alert(`Maintenance Request ${newReq.request_id} ${isDraft ? 'saved as Draft' : 'submitted successfully'}!\n\n⚠️ Notice: ${newReq.warning}`);
    } else {
      alert(`Maintenance Request ${newReq.request_id} ${isDraft ? 'saved as Draft' : 'submitted successfully'}!`);
    }
    renderLabAssistantView(container, currentUser);
  }

  // Handle Resubmit Modal
  const resubmitModal = container.querySelector('#resubmit-modal');
  const resubmitForm = container.querySelector('#resubmit-form');

  container.querySelectorAll('.btn-resubmit-req').forEach(btn => {
    btn.addEventListener('click', () => {
      const reqId = btn.getAttribute('data-id');
      const req = db.getRequests().find(r => r.id === reqId);
      if (!req) return;

      container.querySelector('#resubmit-req-id').value = req.id;
      container.querySelector('#rejection-reason-text').textContent = req.rejection_reason || 'No specific reason provided.';
      container.querySelector('#edit-title').value = req.problem_title;
      container.querySelector('#edit-desc').value = req.description;
      container.querySelector('#edit-category').value = req.category;
      container.querySelector('#edit-priority').value = req.priority;
      container.querySelector('#edit-remarks').value = req.remarks || '';

      resubmitModal.classList.add('show');
    });
  });

  container.querySelector('#close-resubmit-modal')?.addEventListener('click', () => resubmitModal.classList.remove('show'));
  container.querySelector('#cancel-resubmit-modal')?.addEventListener('click', () => resubmitModal.classList.remove('show'));

  resubmitForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const reqId = container.querySelector('#resubmit-req-id').value;
    const updatedData = {
      problem_title: container.querySelector('#edit-title').value.trim(),
      description: container.querySelector('#edit-desc').value.trim(),
      category: container.querySelector('#edit-category').value,
      priority: container.querySelector('#edit-priority').value,
      remarks: container.querySelector('#edit-remarks').value.trim()
    };

    const res = workflow.resubmitRequest(currentUser, reqId, updatedData);
    if (res.success) {
      if (res.warning) {
        alert(`Request ${res.request.request_id} resubmitted successfully!\n\n⚠️ Notice: ${res.warning}`);
      } else {
        alert(`Request ${res.request.request_id} resubmitted successfully to Lab In-Charge.`);
      }
      resubmitModal.classList.remove('show');
      renderLabAssistantView(container, currentUser);
    } else {
      alert(res.message);
    }
  });
}

function renderMyRequestsRows(list) {
  if (list.length === 0) {
    return `
      <tr>
        <td colspan="8">
          <div class="empty-state-table">
            <div class="empty-state-icon">📝</div>
            <div class="empty-state-title">No maintenance requests yet.</div>
            <div class="empty-state-desc">Create your first maintenance request to get started.</div>
          </div>
        </td>
      </tr>
    `;
  }

  return list.map(r => {
    const isRejected = r.status.startsWith('Rejected');
    return `
      <tr>
        <td><strong style="color: var(--primary-600);">${r.request_id}</strong></td>
        <td style="font-size: 11px; color: var(--text-muted);">${new Date(r.created_at).toLocaleDateString()}</td>
        <td>
          <div style="font-weight: 600;">${r.lab_name}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${r.building}, ${r.floor} - ${r.room_number}</div>
        </td>
        <td>
          <div style="font-weight: 600; max-width: 200px;" class="text-truncate">${r.problem_title}</div>
        </td>
        <td><span class="badge badge-assigned">${r.category}</span></td>
        <td><span class="badge badge-prio-${r.priority.toLowerCase()}">${r.priority}</span></td>
        <td>
          <span class="badge ${getStatusBadgeClass(r.status)}">
            <span class="badge-dot"></span> ${r.status}
          </span>
          ${isRejected ? `<div style="font-size: 10px; color: #dc2626; margin-top: 2px;">Reason: ${r.rejection_reason || ''}</div>` : ''}
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <a href="#tracking?id=${r.id}" class="btn btn-outline btn-sm">Track</a>
            ${isRejected ? `<button class="btn btn-primary btn-sm btn-resubmit-req" data-id="${r.id}">Edit & Resubmit</button>` : ''}
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
