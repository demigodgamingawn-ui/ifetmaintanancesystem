// src/js/workflow.js - Complete Automated Workflow Engine & Category Auto-Routing

import { db } from './db.js';
import { notificationsManager } from './notifications.js';

export const WORKFLOW_STATUSES = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING_LAB_CHARGE: 'Pending Lab In-Charge',
  REJECTED_LAB_CHARGE: 'Rejected by Lab In-Charge',
  APPROVED_LAB_CHARGE: 'Approved by Lab In-Charge',
  PENDING_HOD: 'Pending HOD',
  REJECTED_HOD: 'Rejected by HOD',
  APPROVED_HOD: 'Approved by HOD',
  PENDING_HR: 'Pending HR',
  ASSIGNED_DEPT: 'Assigned to Department',
  ACCEPTED_DEPT: 'Accepted by Department',
  WORK_IN_PROGRESS: 'Work In Progress',
  WORK_COMPLETED: 'Work Completed',
  CLOSED: 'Closed'
};

export const CATEGORY_DEPT_MAP = {
  'Civil': { role: 'Civil In-Charge', userId: 'civil001', name: 'Civil Maintenance Dept' },
  'Electrical': { role: 'Electrical In-Charge', userId: 'electrical001', name: 'Electrical Maintenance Dept' },
  'Furniture': { role: 'Furniture In-Charge', userId: 'furniture001', name: 'Furniture Maintenance Dept' },
  'Computer': { role: 'Computer In-Charge', userId: 'computer001', name: 'IT & Computer Maintenance Dept' }
};

export class WorkflowEngine {
  // Create New Request
  createRequest(user, requestData) {
    const requests = db.getRequests();
    const requestId = db.generateRequestId();

    const newRequest = {
      id: 'req-' + Date.now(),
      request_id: requestId,
      created_by: user.id,
      created_by_name: user.full_name,
      department: user.department || 'General',
      lab_name: requestData.lab_name || user.lab || 'General Lab',
      building: requestData.building || 'Main Academic Block',
      floor: requestData.floor || 'Ground Floor',
      room_number: requestData.room_number || '101',
      problem_title: requestData.problem_title,
      description: requestData.description,
      category: requestData.category,
      priority: requestData.priority || 'Medium',
      attachment: requestData.attachment || null,
      remarks: requestData.remarks || '',
      estimated_requirement: requestData.estimated_requirement || '',
      status: requestData.is_draft ? WORKFLOW_STATUSES.DRAFT : WORKFLOW_STATUSES.PENDING_LAB_CHARGE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    requests.unshift(newRequest);
    db.saveRequests(requests);

    // Log Audit
    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      newRequest.request_id,
      requestData.is_draft ? 'SAVE_DRAFT' : 'CREATE_REQUEST',
      '-',
      newRequest.status,
      `Created maintenance request: ${newRequest.problem_title} [Dept: ${newRequest.department}]`
    );

    let warning = null;
    if (!requestData.is_draft) {
      // Notify Dynamic Same-Department Lab In-Charge
      const users = db.getUsers();
      const labInCharges = users.filter(u => 
        u.role === 'Lab In-Charge' && 
        (u.department || '').trim().toLowerCase() === (newRequest.department || '').trim().toLowerCase()
      );

      if (labInCharges.length > 0) {
        labInCharges.forEach(inCharge => {
          notificationsManager.notify(
            inCharge.id,
            newRequest.id,
            'New Maintenance Request Pending Review',
            `New request ${newRequest.request_id} (${newRequest.problem_title}) in ${newRequest.department} - ${newRequest.lab_name} requires your approval.`
          );
        });
      } else {
        warning = 'No Lab In-Charge is assigned to this department.';
        db.logAudit(
          user.id,
          user.full_name,
          user.role,
          newRequest.request_id,
          'MISSING_ROLE_NOTICE',
          newRequest.status,
          newRequest.status,
          `Notice: No Lab In-Charge is assigned to department "${newRequest.department}". Request kept pending.`
        );
      }
    }

    if (warning) {
      newRequest.warning = warning;
    }
    return newRequest;
  }

  // Lab In-Charge Accept
  approveByLabCharge(user, requestId, comments = '') {
    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);

    if (index === -1) return { success: false, message: 'Request not found.' };

    const req = requests[index];
    const oldStatus = req.status;
    const newStatus = WORKFLOW_STATUSES.PENDING_HOD;

    req.status = newStatus;
    req.updated_at = new Date().toISOString();
    db.saveRequests(requests);

    // Log Approval
    const approvals = db.getApprovals();
    approvals.push({
      id: 'app-' + Date.now(),
      request_id: req.id,
      approver_id: user.id,
      approver_name: user.full_name,
      role: user.role,
      action: 'ACCEPT',
      comments: comments || 'Approved by Lab In-Charge',
      action_date: new Date().toISOString()
    });
    db.saveApprovals(approvals);

    // Audit Log
    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      req.request_id,
      'LAB_CHARGE_APPROVE',
      oldStatus,
      newStatus,
      `Approved request. Forwarded to HOD for department "${req.department}". Comments: ${comments}`
    );

    // Notify Dynamic Same-Department HOD
    const users = db.getUsers();
    const hods = users.filter(u => 
      u.role === 'HOD' && 
      (u.department || '').trim().toLowerCase() === (req.department || '').trim().toLowerCase()
    );

    let warning = null;
    if (hods.length > 0) {
      hods.forEach(hod => {
        notificationsManager.notify(
          hod.id,
          req.id,
          'Pending HOD Approval',
          `Request ${req.request_id} (${req.problem_title}) approved by Lab In-Charge and requires ${req.department} HOD approval.`
        );
      });
    } else {
      warning = 'No HOD is assigned to this department.';
      db.logAudit(
        user.id,
        user.full_name,
        user.role,
        req.request_id,
        'MISSING_ROLE_NOTICE',
        newStatus,
        newStatus,
        `Notice: No HOD is assigned to department "${req.department}". Request kept pending HOD.`
      );
    }

    // Notify Lab Assistant
    notificationsManager.notify(
      req.created_by,
      req.id,
      'Request Approved by Lab In-Charge',
      `Your request ${req.request_id} has been approved by Lab In-Charge and forwarded to HOD.`
    );

    return { success: true, request: req, warning };
  }

  // Lab In-Charge Reject
  rejectByLabCharge(user, requestId, rejectionReason) {
    if (!rejectionReason || !rejectionReason.trim()) {
      return { success: false, message: 'Rejection reason is mandatory.' };
    }

    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, message: 'Request not found.' };

    const req = requests[index];
    const oldStatus = req.status;
    const newStatus = WORKFLOW_STATUSES.REJECTED_LAB_CHARGE;

    req.status = newStatus;
    req.rejection_reason = rejectionReason;
    req.updated_at = new Date().toISOString();
    db.saveRequests(requests);

    // Log Approval
    const approvals = db.getApprovals();
    approvals.push({
      id: 'app-' + Date.now(),
      request_id: req.id,
      approver_id: user.id,
      approver_name: user.full_name,
      role: user.role,
      action: 'REJECT',
      rejection_reason: rejectionReason,
      comments: rejectionReason,
      action_date: new Date().toISOString()
    });
    db.saveApprovals(approvals);

    // Audit Log
    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      req.request_id,
      'LAB_CHARGE_REJECT',
      oldStatus,
      newStatus,
      `Rejected request. Reason: ${rejectionReason}`
    );

    // Notify Lab Assistant
    notificationsManager.notify(
      req.created_by,
      req.id,
      'Request Rejected by Lab In-Charge',
      `Your request ${req.request_id} was rejected. Reason: ${rejectionReason}`
    );

    return { success: true, request: req };
  }

  // HOD Accept
  approveByHOD(user, requestId, comments = '') {
    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, message: 'Request not found.' };

    const req = requests[index];
    const oldStatus = req.status;
    const newStatus = WORKFLOW_STATUSES.PENDING_HR;

    req.status = newStatus;
    req.updated_at = new Date().toISOString();
    db.saveRequests(requests);

    // Log Approval
    const approvals = db.getApprovals();
    approvals.push({
      id: 'app-' + Date.now(),
      request_id: req.id,
      approver_id: user.id,
      approver_name: user.full_name,
      role: user.role,
      action: 'ACCEPT',
      comments: comments || 'Approved by HOD',
      action_date: new Date().toISOString()
    });
    db.saveApprovals(approvals);

    // Audit Log
    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      req.request_id,
      'HOD_APPROVE',
      oldStatus,
      newStatus,
      `HOD approved request for department "${req.department}". Forwarded to General HR.`
    );

    // Auto-trigger General HR Notification (No department filter)
    const users = db.getUsers();
    const hrs = users.filter(u => u.role === 'HR');

    let warning = null;
    if (hrs.length > 0) {
      hrs.forEach(hr => {
        notificationsManager.notify(
          hr.id,
          req.id,
          'HOD Approved Request - Ready for Routing',
          `Request ${req.request_id} from ${req.department} (${req.category}) approved by HOD. Ready for Category Routing.`
        );
      });
    } else {
      warning = 'No HR user is currently assigned.';
      db.logAudit(
        user.id,
        user.full_name,
        user.role,
        req.request_id,
        'MISSING_ROLE_NOTICE',
        newStatus,
        newStatus,
        `Notice: No HR user is currently assigned in the system. Request kept pending HR.`
      );
    }

    // Notify Creator
    notificationsManager.notify(
      req.created_by,
      req.id,
      'Request Approved by HOD',
      `Your request ${req.request_id} has been approved by HOD and sent to HR.`
    );

    return { success: true, request: req, warning };
  }

  // HOD Reject
  rejectByHOD(user, requestId, rejectionReason) {
    if (!rejectionReason || !rejectionReason.trim()) {
      return { success: false, message: 'Rejection reason is mandatory.' };
    }

    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, message: 'Request not found.' };

    const req = requests[index];
    const oldStatus = req.status;
    const newStatus = WORKFLOW_STATUSES.REJECTED_HOD;

    req.status = newStatus;
    req.rejection_reason = rejectionReason;
    req.updated_at = new Date().toISOString();
    db.saveRequests(requests);

    // Log Approval
    const approvals = db.getApprovals();
    approvals.push({
      id: 'app-' + Date.now(),
      request_id: req.id,
      approver_id: user.id,
      approver_name: user.full_name,
      role: user.role,
      action: 'REJECT',
      rejection_reason: rejectionReason,
      comments: rejectionReason,
      action_date: new Date().toISOString()
    });
    db.saveApprovals(approvals);

    // Audit Log
    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      req.request_id,
      'HOD_REJECT',
      oldStatus,
      newStatus,
      `Rejected by HOD. Reason: ${rejectionReason}`
    );

    // Notify Creator
    notificationsManager.notify(
      req.created_by,
      req.id,
      'Request Rejected by HOD',
      `Your request ${req.request_id} was rejected by HOD. Reason: ${rejectionReason}`
    );

    return { success: true, request: req };
  }

  // HR Automated Category Routing
  routeByHR(user, requestId) {
    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, message: 'Request not found.' };

    const req = requests[index];
    const categoryInfo = CATEGORY_DEPT_MAP[req.category];

    if (!categoryInfo) {
      return { success: false, message: `Unknown category: ${req.category}` };
    }

    // Find General Category In-Charge (No department filter)
    const users = db.getUsers();
    const deptInChargeUser = users.find(u => u.role === categoryInfo.role);

    if (!deptInChargeUser) {
      return { 
        success: false, 
        message: `No ${req.category} In-Charge is currently assigned.` 
      };
    }

    const oldStatus = req.status;
    const newStatus = WORKFLOW_STATUSES.ASSIGNED_DEPT;

    req.status = newStatus;
    req.assigned_dept = categoryInfo.role;
    req.updated_at = new Date().toISOString();
    db.saveRequests(requests);

    // Record Department Assignment
    const assignments = db.getAssignments();

    assignments.push({
      id: 'asg-' + Date.now(),
      request_id: req.id,
      department: req.category,
      assigned_to: deptInChargeUser.id,
      assigned_to_name: deptInChargeUser.full_name,
      assigned_date: new Date().toISOString(),
      status: 'Assigned'
    });
    db.saveAssignments(assignments);

    // Log Approval / Action
    const approvals = db.getApprovals();
    approvals.push({
      id: 'app-' + Date.now(),
      request_id: req.id,
      approver_id: user.id,
      approver_name: user.full_name,
      role: user.role,
      action: 'ROUTE',
      comments: `Category = ${req.category}. Auto-routed to ${categoryInfo.role}`,
      action_date: new Date().toISOString()
    });
    db.saveApprovals(approvals);

    // Audit Log
    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      req.request_id,
      'HR_CATEGORY_ROUTING',
      oldStatus,
      newStatus,
      `Auto-routed ${req.category} request (Origin: ${req.department}) to ${categoryInfo.role} (${deptInChargeUser.full_name})`
    );

    // Notify Department In-Charge
    notificationsManager.notify(
      deptInChargeUser.id,
      req.id,
      `New ${req.category} Maintenance Task Assigned`,
      `Request ${req.request_id} from ${req.department} (${req.problem_title}) has been assigned to your department by HR.`
    );

    // Notify Creator
    notificationsManager.notify(
      req.created_by,
      req.id,
      'Assigned to Maintenance Department',
      `Your request ${req.request_id} has been assigned to ${categoryInfo.name}.`
    );

    return { success: true, request: req, assignedTo: categoryInfo.role };
  }

  // Department In-Charge: Accept Work
  acceptWork(user, requestId) {
    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, message: 'Request not found.' };

    const req = requests[index];
    const oldStatus = req.status;
    const newStatus = WORKFLOW_STATUSES.ACCEPTED_DEPT;

    req.status = newStatus;
    req.updated_at = new Date().toISOString();
    db.saveRequests(requests);

    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      req.request_id,
      'DEPT_ACCEPT_WORK',
      oldStatus,
      newStatus,
      `Department accepted request ${req.request_id}`
    );

    notificationsManager.notify(
      req.created_by,
      req.id,
      'Maintenance Work Accepted',
      `Department ${user.role} has accepted your request ${req.request_id}.`
    );

    return { success: true, request: req };
  }

  // Department In-Charge: Start Work
  startWork(user, requestId) {
    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, message: 'Request not found.' };

    const req = requests[index];
    const oldStatus = req.status;
    const newStatus = WORKFLOW_STATUSES.WORK_IN_PROGRESS;

    req.status = newStatus;
    req.updated_at = new Date().toISOString();
    db.saveRequests(requests);

    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      req.request_id,
      'DEPT_START_WORK',
      oldStatus,
      newStatus,
      `Department started work on request ${req.request_id}`
    );

    notificationsManager.notify(
      req.created_by,
      req.id,
      'Maintenance Work Started',
      `Work has officially started for your request ${req.request_id}.`
    );

    return { success: true, request: req };
  }

  // Department In-Charge: Complete Work
  completeWork(user, requestId, completionData) {
    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, message: 'Request not found.' };

    const req = requests[index];
    const oldStatus = req.status;
    const newStatus = WORKFLOW_STATUSES.WORK_COMPLETED;

    req.status = newStatus;
    req.updated_at = new Date().toISOString();
    db.saveRequests(requests);

    // Record Work Update
    const workUpdates = db.getWorkUpdates();
    workUpdates.push({
      id: 'wrk-' + Date.now(),
      request_id: req.id,
      updated_by: user.id,
      updated_by_name: user.full_name,
      status: 'Completed',
      work_description: completionData.work_description || 'Maintenance completed successfully.',
      materials_used: completionData.materials_used || 'Standard maintenance supplies',
      technician_name: completionData.technician_name || user.full_name,
      estimated_cost: completionData.estimated_cost || '₹ 0',
      actual_cost: completionData.actual_cost || '₹ 0',
      completion_photo: completionData.completion_photo || req.attachment,
      remarks: completionData.remarks || 'All issues resolved.',
      updated_at: new Date().toISOString()
    });
    db.saveWorkUpdates(workUpdates);

    // Audit Log
    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      req.request_id,
      'DEPT_COMPLETE_WORK',
      oldStatus,
      newStatus,
      `Work completed by ${completionData.technician_name || user.full_name}. Cost: ${completionData.actual_cost}`
    );

    // Notify Creator
    notificationsManager.notify(
      req.created_by,
      req.id,
      'Maintenance Work Completed 🎉',
      `Your maintenance request ${req.request_id} has been marked as Completed by ${user.role}.`
    );

    return { success: true, request: req };
  }

  // Edit and Resubmit Rejected Request (Lab Assistant)
  resubmitRequest(user, requestId, updatedData) {
    const requests = db.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return { success: false, message: 'Request not found.' };

    const req = requests[index];
    const oldStatus = req.status;
    const newStatus = WORKFLOW_STATUSES.PENDING_LAB_CHARGE;

    req.problem_title = updatedData.problem_title || req.problem_title;
    req.description = updatedData.description || req.description;
    req.category = updatedData.category || req.category;
    req.priority = updatedData.priority || req.priority;
    req.attachment = updatedData.attachment || req.attachment;
    req.remarks = updatedData.remarks || req.remarks;
    req.estimated_requirement = updatedData.estimated_requirement || req.estimated_requirement;
    req.status = newStatus;
    req.rejection_reason = ''; // Clear previous rejection reason
    req.updated_at = new Date().toISOString();

    db.saveRequests(requests);

    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      req.request_id,
      'RESUBMIT_REQUEST',
      oldStatus,
      newStatus,
      `Resubmitted rejected request ${req.request_id} after updates.`
    );

    // Notify Dynamic Same-Department Lab In-Charge
    const users = db.getUsers();
    const labInCharges = users.filter(u => 
      u.role === 'Lab In-Charge' && 
      (u.department || '').trim().toLowerCase() === (req.department || '').trim().toLowerCase()
    );

    let warning = null;
    if (labInCharges.length > 0) {
      labInCharges.forEach(inCharge => {
        notificationsManager.notify(
          inCharge.id,
          req.id,
          'Resubmitted Maintenance Request',
          `Request ${req.request_id} (${req.department}) has been updated and resubmitted by Lab Assistant.`
        );
      });
    } else {
      warning = 'No Lab In-Charge is assigned to this department.';
    }

    return { success: true, request: req, warning };
  }
}

export const workflow = new WorkflowEngine();
