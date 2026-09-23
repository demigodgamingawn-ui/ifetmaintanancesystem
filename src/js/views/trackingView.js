// src/js/views/trackingView.js - Request Tracking Page & 8-Stage Lifecycle Timeline

import { db } from '../db.js';

export function renderTrackingView(container, selectedReqId = null) {
  const requests = db.getRequests();
  
  if (requests.length === 0) {
    container.innerHTML = `
      <div class="dashboard-banner-card">
        <div class="banner-welcome-content">
          <div class="banner-badge">LIFECYCLE TRACKING</div>
          <h2 class="banner-title">Maintenance Request Tracking</h2>
          <p class="banner-desc">Real-time audit tracking, reviewer approval comments, and department resolution certificates.</p>
        </div>
      </div>

      <div class="content-card">
        <div class="empty-state-table" style="padding: 48px 24px;">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">No maintenance requests available to track.</div>
          <div class="empty-state-desc">Create your first maintenance request to view its real-time approval and maintenance timeline here.</div>
          <div style="margin-top: 20px;">
            <a href="#new-request" class="btn btn-primary">+ Create First Request</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Default to first request or specified ID
  let currentReq = requests[0];
  if (selectedReqId) {
    const found = requests.find(r => r.id === selectedReqId || r.request_id === selectedReqId);
    if (found) currentReq = found;
  }

  container.innerHTML = `
    <!-- Top Selector Card -->
    <div class="content-card" style="padding: 20px 24px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <label class="form-label" style="margin: 0; white-space: nowrap; font-weight: 700;">Select Request to Track:</label>
          <select id="select-tracking-req" class="filter-select" style="min-width: 320px; font-weight: 700;">
            ${requests.map(r => `
              <option value="${r.id}" ${currentReq && currentReq.id === r.id ? 'selected' : ''}>
                ${r.request_id} — ${r.problem_title} (${r.category})
              </option>
            `).join('')}
          </select>
        </div>

        ${currentReq ? `
          <div>
            <span class="badge ${getStatusBadgeClass(currentReq.status)}" style="font-size: 13px; padding: 6px 16px;">
              <span class="badge-dot"></span> Status: ${currentReq.status}
            </span>
          </div>
        ` : ''}
      </div>
    </div>

    ${renderRequestTrackingDetails(currentReq)}
  `;

  // Attach Selector Listener
  const selectElem = container.querySelector('#select-tracking-req');
  if (selectElem) {
    selectElem.addEventListener('change', (e) => {
      renderTrackingView(container, e.target.value);
    });
  }
}

function renderRequestTrackingDetails(req) {
  const approvals = db.getApprovals().filter(a => a.request_id === req.id);
  const workUpdates = db.getWorkUpdates().filter(w => w.request_id === req.id);
  const assignments = db.getAssignments().filter(a => a.request_id === req.id);

  // Compute 8 Timeline Stages Status
  const stages = [
    {
      step: 1,
      title: 'Request Created & Submitted',
      role: 'Lab Assistant',
      person: req.created_by_name,
      date: req.created_at,
      status: 'completed',
      details: `Submitted maintenance request for ${req.lab_name} (${req.building}, Room ${req.room_number})`
    },
    {
      step: 2,
      title: 'Lab In-Charge Technical Review',
      role: 'Lab In-Charge',
      ...getLabChargeStageData(req, approvals)
    },
    {
      step: 3,
      title: 'HOD Executive Review & Approval',
      role: 'HOD',
      ...getHODStageData(req, approvals)
    },
    {
      step: 4,
      title: 'HR Department Category Routing',
      role: 'HR Operations',
      ...getHRStageData(req, approvals, assignments)
    },
    {
      step: 5,
      title: 'Department Assigned & Accepted',
      role: `${req.category} In-Charge`,
      ...getDeptAcceptedStageData(req, assignments)
    },
    {
      step: 6,
      title: 'Maintenance Work In Progress',
      role: `${req.category} Technician`,
      ...getWorkInProgressStageData(req)
    },
    {
      step: 7,
      title: 'Work Completed & Verified',
      role: 'Department In-Charge',
      ...getWorkCompletedStageData(req, workUpdates)
    },
    {
      step: 8,
      title: 'Request Closed & Archived',
      role: 'System / Admin',
      status: req.status === 'Work Completed' || req.status === 'Closed' ? 'completed' : 'pending',
      date: req.status === 'Work Completed' || req.status === 'Closed' ? req.updated_at : null,
      details: req.status === 'Work Completed' || req.status === 'Closed' ? 'Maintenance verified and closed.' : 'Pending work completion.'
    }
  ];

  return `
    <div class="tracking-grid-layout">
      <!-- Timeline Left Column -->
      <div class="content-card">
        <div class="card-title-group" style="margin-bottom: 24px;">
          <h3>Approval & Maintenance Lifecycle Timeline</h3>
          <p>Real-time audit chain tracking each tier from submission to completion</p>
        </div>

        <div class="timeline-wrap">
          <div class="timeline-vertical">
            ${stages.map(st => `
              <div class="timeline-step ${st.status}">
                <div class="timeline-icon">
                  ${st.status === 'completed' ? '✓' : st.status === 'rejected' ? '✕' : st.step}
                </div>
                <div class="timeline-content-card">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 6px;">
                    <div>
                      <div class="timeline-step-title">${st.step}. ${st.title}</div>
                      <div class="timeline-step-meta">
                        Role: <strong>${st.role}</strong> ${st.person ? `• ${st.person}` : ''}
                      </div>
                    </div>
                    ${st.date ? `<div style="font-size: 11px; color: var(--text-light);">${new Date(st.date).toLocaleString()}</div>` : ''}
                  </div>

                  <div style="font-size: 12.5px; margin-top: 6px; color: var(--text-main);">${st.details || ''}</div>

                  ${st.comment ? `
                    <div class="timeline-step-comment">
                      <strong>Comments:</strong> "${st.comment}"
                    </div>
                  ` : ''}

                  ${st.rejection ? `
                    <div class="timeline-step-rejection">
                      <strong>Rejection Reason:</strong> "${st.rejection}"
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Request Overview Right Column -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="content-card">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight: 700; margin-bottom: 16px;">
            Request Overview
          </h3>

          <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
            <div>
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Request ID</div>
              <div style="font-weight: 800; color: var(--primary-600); font-size: 18px;">${req.request_id}</div>
            </div>

            <div>
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Problem Title</div>
              <div style="font-weight: 600; font-size: 14px;">${req.problem_title}</div>
            </div>

            <div>
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Category & Priority</div>
              <div style="display: flex; gap: 6px; margin-top: 4px;">
                <span class="badge badge-assigned">${req.category}</span>
                <span class="badge badge-prio-${req.priority.toLowerCase()}">${req.priority}</span>
              </div>
            </div>

            <div>
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Originating Department & Location</div>
              <div style="font-weight: 600; font-size: 13px; color: var(--primary-700);">${req.department || 'General Department'}</div>
              <div style="font-size: 12px;">${req.lab_name} (${req.building}, ${req.floor} - Room ${req.room_number})</div>
            </div>

            <div>
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Problem Description</div>
              <div style="font-size: 12.5px; background: var(--bg-section-alt); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); line-height: 1.4;">${req.description}</div>
            </div>

            <div>
              <div style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px;">Photo Attachment</div>
              ${req.attachment && !req.attachment.includes('images.unsplash.com') ? `
                <img src="${req.attachment}" alt="Photo" style="width: 100%; max-height: 160px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color);" />
              ` : `
                <div style="font-size: 12px; color: var(--text-muted); font-style: italic; background: var(--bg-section-alt); padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-color);">
                  📎 No attachment uploaded
                </div>
              `}
            </div>
          </div>
        </div>

        ${workUpdates.length > 0 ? `
          <div class="content-card" style="border-left: 4px solid #10b981;">
            <h4 style="font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: #065f46; margin-bottom: 10px;">
              ✓ Work Completion Certificate
            </h4>
            <div style="font-size: 12.5px; display: flex; flex-direction: column; gap: 8px;">
              <div><strong>Technician:</strong> ${workUpdates[0].technician_name}</div>
              <div><strong>Materials Used:</strong> ${workUpdates[0].materials_used}</div>
              <div><strong>Actual Cost:</strong> <span style="font-weight: 700; color: var(--primary-600);">${workUpdates[0].actual_cost}</span></div>
              <div><strong>Work Done:</strong> ${workUpdates[0].work_description}</div>
              <div><strong>Remarks:</strong> ${workUpdates[0].remarks}</div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Stage Computation Helpers with Missing Role Support
function getLabChargeStageData(req, approvals) {
  const app = approvals.find(a => a.role === 'Lab In-Charge');
  if (app) {
    if (app.action === 'ACCEPT') {
      return { status: 'completed', person: app.approver_name, date: app.action_date, details: 'Approved request and forwarded to HOD.', comment: app.comments };
    } else {
      return { status: 'rejected', person: app.approver_name, date: app.action_date, details: 'Request rejected.', rejection: app.rejection_reason };
    }
  }
  if (req.status === 'Pending Lab In-Charge') {
    const users = db.getUsers();
    const hasInCharge = users.some(u => 
      u.role === 'Lab In-Charge' && 
      (u.department || '').trim().toLowerCase() === (req.department || '').trim().toLowerCase()
    );
    if (!hasInCharge) {
      return { status: 'active', details: 'No Lab In-Charge is assigned to this department.' };
    }
    return { status: 'active', details: `Awaiting ${req.department || ''} Lab In-Charge review...` };
  }
  return { status: 'pending', details: 'Pending review' };
}

function getHODStageData(req, approvals) {
  const app = approvals.find(a => a.role === 'HOD');
  if (app) {
    if (app.action === 'ACCEPT') {
      return { status: 'completed', person: app.approver_name, date: app.action_date, details: 'HOD approved and authorized HR category routing.', comment: app.comments };
    } else {
      return { status: 'rejected', person: app.approver_name, date: app.action_date, details: 'Rejected by HOD.', rejection: app.rejection_reason };
    }
  }
  if (req.status === 'Pending HOD') {
    const users = db.getUsers();
    const hasHOD = users.some(u => 
      u.role === 'HOD' && 
      (u.department || '').trim().toLowerCase() === (req.department || '').trim().toLowerCase()
    );
    if (!hasHOD) {
      return { status: 'active', details: 'No HOD is assigned to this department.' };
    }
    return { status: 'active', details: `Awaiting ${req.department || ''} HOD approval...` };
  }
  return { status: 'pending', details: 'Pending HOD review' };
}

function getHRStageData(req, approvals, assignments) {
  const hrApp = approvals.find(a => a.role === 'HR');
  const asg = assignments[0];
  if (hrApp || asg) {
    return {
      status: 'completed',
      person: hrApp ? hrApp.approver_name : 'HR Manager',
      date: hrApp ? hrApp.action_date : (asg ? asg.assigned_date : null),
      details: `Checked category "${req.category}". Auto-routed request to ${asg ? asg.assigned_to_name : req.category + ' In-Charge'}.`
    };
  }
  if (req.status === 'Pending HR') {
    const users = db.getUsers();
    const hasHR = users.some(u => u.role === 'HR');
    if (!hasHR) {
      return { status: 'active', details: 'No HR user is currently assigned.' };
    }
    return { status: 'active', details: 'Awaiting HR category routing...' };
  }
  return { status: 'pending', details: 'Pending HR review' };
}

function getDeptAcceptedStageData(req, assignments) {
  const asg = assignments[0];
  if (req.status === 'Accepted by Department' || req.status === 'Work In Progress' || req.status === 'Work Completed' || req.status === 'Closed') {
    return {
      status: 'completed',
      person: asg ? asg.assigned_to_name : `${req.category} In-Charge`,
      date: asg ? asg.assigned_date : req.updated_at,
      details: `${req.category} Maintenance Department accepted the work assignment.`
    };
  }
  if (req.status === 'Assigned to Department') {
    const users = db.getUsers();
    const hasCategoryInCharge = users.some(u => u.role === `${req.category} In-Charge`);
    if (!hasCategoryInCharge) {
      return { status: 'active', details: `No ${req.category} In-Charge is currently assigned.` };
    }
    return { status: 'active', details: `Task assigned to ${req.category} In-Charge. Awaiting acceptance...` };
  }
  return { status: 'pending', details: 'Pending department acceptance' };
}

function getWorkInProgressStageData(req) {
  if (req.status === 'Work In Progress' || req.status === 'Work Completed' || req.status === 'Closed') {
    return {
      status: req.status === 'Work In Progress' ? 'active' : 'completed',
      date: req.updated_at,
      details: `Technician assigned. Repair work currently underway in ${req.lab_name}.`
    };
  }
  return { status: 'pending', details: 'Pending work commencement' };
}

function getWorkCompletedStageData(req, workUpdates) {
  if (workUpdates.length > 0 || req.status === 'Work Completed' || req.status === 'Closed') {
    const wu = workUpdates[0] || {};
    return {
      status: 'completed',
      person: wu.technician_name || 'Maintenance Team',
      date: wu.updated_at || req.updated_at,
      details: `Repair completed. Cost: ${wu.actual_cost || 'N/A'}. Materials: ${wu.materials_used || 'Standard'}`,
      comment: wu.work_description
    };
  }
  return { status: 'pending', details: 'Awaiting repair completion' };
}

function getStatusBadgeClass(status) {
  if (status.startsWith('Pending')) return 'badge-pending';
  if (status.startsWith('Approved') || status === 'Work Completed' || status === 'Closed') return 'badge-approved';
  if (status.startsWith('Rejected')) return 'badge-rejected';
  if (status === 'Work In Progress' || status.startsWith('Accepted')) return 'badge-progress';
  if (status.startsWith('Assigned')) return 'badge-assigned';
  return 'badge-draft';
}
