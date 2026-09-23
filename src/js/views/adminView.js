// src/js/views/adminView.js - Enterprise Admin Control Portal & System Governance Engine

import { db } from '../db.js';
import { auth, hashPassword, generateTemporaryPassword } from '../auth.js';
import { notificationsManager } from '../notifications.js';

export function renderAdminView(container, activeRoute = 'admin-dashboard') {
  // Normalize active route / subtab
  let activeTab = 'dashboard';
  if (activeRoute.includes('users')) activeTab = 'users';
  else if (activeRoute.includes('department')) activeTab = 'departments';
  else if (activeRoute.includes('request')) activeTab = 'requests';
  else if (activeRoute.includes('workflow')) activeTab = 'workflow';
  else if (activeRoute.includes('report')) activeTab = 'reports';
  else if (activeRoute.includes('audit')) activeTab = 'audit';
  else if (activeRoute.includes('notif')) activeTab = 'notifications';
  else if (activeRoute.includes('system')) activeTab = 'system';
  else if (activeRoute.includes('profile')) activeTab = 'profile';

  const users = db.getUsers();
  const departments = db.getDepartments();
  const requests = db.getRequests();
  const logs = db.getAuditLogs();
  const notifications = db.getNotifications();
  const approvals = db.getApprovals();
  const workUpdates = db.getWorkUpdates();
  const currentAdmin = auth.getCurrentUser();

  // Metrics computation from real database state
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status.startsWith('Pending')).length;
  const inProgressRequests = requests.filter(r => r.status === 'Work In Progress' || r.status.startsWith('Assigned') || r.status.startsWith('Accepted')).length;
  const completedRequests = requests.filter(r => r.status === 'Work Completed' || r.status === 'Closed').length;
  const rejectedRequests = requests.filter(r => r.status.startsWith('Rejected')).length;
  const returnedRequests = requests.filter(r => r.status.startsWith('Rejected') || (r.status === 'Pending Lab In-Charge' && r.rejection_reason)).length;

  // Render Admin Layout Container
  container.innerHTML = `
    <!-- Top Action & Governance Banner -->
    <div class="dashboard-banner-card">
      <div class="banner-welcome-content">
        <div class="banner-badge">IFET CMMS • ENTERPRISE GOVERNANCE</div>
        <h2 class="banner-title">Admin Control Portal</h2>
        <p class="banner-desc">Welcome, <strong>${currentAdmin.full_name}</strong> • Real-time campus infrastructure oversight, user management, and dynamic department workflows.</p>
      </div>
      <div class="banner-actions-group">
        <button class="btn btn-primary" id="btn-quick-create-user">
          <span>+ Create User</span>
        </button>
        <button class="btn btn-outline-banner" id="btn-quick-add-dept">
          <span>+ Add Department</span>
        </button>
        <button class="btn btn-outline-banner" id="btn-open-global-search">
          <span>🔍 Quick Search</span>
        </button>
      </div>
    </div>

    <!-- Live System Status & Health Bar -->
    <div class="content-card" style="padding: 12px 20px; margin-bottom: 20px; background: var(--bg-card); border-left: 4px solid var(--primary-600);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; font-size: 12.5px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
            <strong>Portal Online</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
            <strong>Database:</strong> Connected (Local Engine)
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #3b82f6;"></span>
            <strong>Authentication:</strong> SHA-256 RBAC Active
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #8B9C1E;"></span>
            <strong>Routing Engine:</strong> Universal Dynamic
          </div>
        </div>
        <div style="font-size: 11.5px; color: var(--text-muted);">
          <span>Database Engine: <strong>Central Persistent JSON</strong></span>
          <span style="margin: 0 6px;">•</span>
          <span>Last Sync: <strong>${new Date().toLocaleTimeString()}</strong></span>
        </div>
      </div>
    </div>

    <!-- Admin Sub-Navigation Tabs / Cards Bar -->
    <div class="admin-subnav-container" role="tablist" aria-label="Admin Sections">
      <!-- 1. Overview -->
      <button class="admin-tab-btn admin-tab-card ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard" role="tab" aria-selected="${activeTab === 'dashboard'}" title="Overview Dashboard">
        <div class="admin-tab-card-top">
          <div class="admin-tab-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
        </div>
        <div class="admin-tab-title">Overview</div>
      </button>

      <!-- 2. User Accounts -->
      <button class="admin-tab-btn admin-tab-card ${activeTab === 'users' ? 'active' : ''}" data-tab="users" role="tab" aria-selected="${activeTab === 'users'}" title="User Accounts Management">
        <div class="admin-tab-card-top">
          <div class="admin-tab-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <span class="admin-tab-badge">${totalUsers}</span>
        </div>
        <div class="admin-tab-title">User Accounts</div>
      </button>

      <!-- 3. Departments -->
      <button class="admin-tab-btn admin-tab-card ${activeTab === 'departments' ? 'active' : ''}" data-tab="departments" role="tab" aria-selected="${activeTab === 'departments'}" title="Department Management">
        <div class="admin-tab-card-top">
          <div class="admin-tab-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="15" y1="6" x2="15" y2="6.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="15" y1="10" x2="15" y2="10.01"></line><line x1="9" y1="14" x2="9" y2="14.01"></line><line x1="15" y1="14" x2="15" y2="14.01"></line><line x1="9" y1="18" x2="9" y2="18.01"></line><line x1="15" y1="18" x2="15" y2="18.01"></line></svg>
          </div>
          <span class="admin-tab-badge">${departments.length}</span>
        </div>
        <div class="admin-tab-title">Departments</div>
      </button>

      <!-- 4. Maintenance Requests -->
      <button class="admin-tab-btn admin-tab-card ${activeTab === 'requests' ? 'active' : ''}" data-tab="requests" role="tab" aria-selected="${activeTab === 'requests'}" title="Maintenance Requests Overview">
        <div class="admin-tab-card-top">
          <div class="admin-tab-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <span class="admin-tab-badge">${totalRequests}</span>
        </div>
        <div class="admin-tab-title">Maintenance Requests</div>
      </button>

      <!-- 5. Live Workflow Monitor -->
      <button class="admin-tab-btn admin-tab-card ${activeTab === 'workflow' ? 'active' : ''}" data-tab="workflow" role="tab" aria-selected="${activeTab === 'workflow'}" title="Live Multi-Tier Workflow Monitor">
        <div class="admin-tab-card-top">
          <div class="admin-tab-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg>
          </div>
        </div>
        <div class="admin-tab-title">Workflow Monitor</div>
      </button>

      <!-- 6. Reports & Analytics -->
      <button class="admin-tab-btn admin-tab-card ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports" role="tab" aria-selected="${activeTab === 'reports'}" title="Reports & Analytics">
        <div class="admin-tab-card-top">
          <div class="admin-tab-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </div>
        </div>
        <div class="admin-tab-title">Reports & Analytics</div>
      </button>

      <!-- 7. Audit Logs -->
      <button class="admin-tab-btn admin-tab-card ${activeTab === 'audit' ? 'active' : ''}" data-tab="audit" role="tab" aria-selected="${activeTab === 'audit'}" title="Security Audit Logs">
        <div class="admin-tab-card-top">
          <div class="admin-tab-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <span class="admin-tab-badge">${logs.length}</span>
        </div>
        <div class="admin-tab-title">Audit Logs</div>
      </button>

      <!-- 8. Notifications -->
      <button class="admin-tab-btn admin-tab-card ${activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications" role="tab" aria-selected="${activeTab === 'notifications'}" title="System Notifications Center">
        <div class="admin-tab-card-top">
          <div class="admin-tab-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <span class="admin-tab-badge">${notifications.length}</span>
        </div>
        <div class="admin-tab-title">Notifications</div>
      </button>

      <!-- 9. System Health -->
      <button class="admin-tab-btn admin-tab-card ${activeTab === 'system' ? 'active' : ''}" data-tab="system" role="tab" aria-selected="${activeTab === 'system'}" title="System Status & Database Recovery">
        <div class="admin-tab-card-top">
          <div class="admin-tab-icon-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
          </div>
        </div>
        <div class="admin-tab-title">System Health</div>
      </button>
    </div>

    <!-- Dynamic Subtab Content Container -->
    <div id="admin-subtab-view">
      ${renderSubtabContent(activeTab, { users, departments, requests, logs, notifications, approvals, workUpdates, currentAdmin })}
    </div>

    <!-- Modals Container (User, Department, Password, Search, View) -->
    ${renderAllAdminModals(currentAdmin, departments)}
  `;

  // Attach Subtab Click Handlers
  container.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      const routeMap = {
        dashboard: 'admin-dashboard',
        users: 'admin-users',
        departments: 'admin-departments',
        requests: 'admin-requests',
        workflow: 'admin-workflow',
        reports: 'admin-reports',
        audit: 'admin-audit',
        notifications: 'admin-notifications',
        system: 'admin-system'
      };
      window.location.hash = routeMap[tabName] || 'admin-dashboard';
    });
  });

  // Attach Global Search and Quick Actions
  attachGlobalSearchListeners(container);
  attachQuickActionListeners(container);

  // Attach View-Specific Listeners based on Active Tab
  if (activeTab === 'dashboard') {
    initDashboardVisuals(container, requests, users, departments);
  } else if (activeTab === 'users') {
    initUsersTabListeners(container);
  } else if (activeTab === 'departments') {
    initDepartmentsTabListeners(container);
  } else if (activeTab === 'requests') {
    initRequestsTabListeners(container);
  } else if (activeTab === 'workflow') {
    initWorkflowTabListeners(container);
  } else if (activeTab === 'reports') {
    initReportsTabListeners(container, requests, departments);
  } else if (activeTab === 'audit') {
    initAuditTabListeners(container);
  } else if (activeTab === 'notifications') {
    initNotificationsTabListeners(container);
  } else if (activeTab === 'system') {
    initSystemTabListeners(container);
  }
}

// ----------------------------------------------------
// SUBTAB CONTENT DISPATCHER
// ----------------------------------------------------
function renderSubtabContent(tab, data) {
  switch (tab) {
    case 'dashboard':
      return renderDashboardTab(data);
    case 'users':
      return renderUsersTab(data);
    case 'departments':
      return renderDepartmentsTab(data);
    case 'requests':
      return renderRequestsTab(data);
    case 'workflow':
      return renderWorkflowTab(data);
    case 'reports':
      return renderReportsTab(data);
    case 'audit':
      return renderAuditTab(data);
    case 'notifications':
      return renderNotificationsTab(data);
    case 'system':
      return renderSystemTab(data);
    default:
      return renderDashboardTab(data);
  }
}

// ----------------------------------------------------
// 1. DASHBOARD OVERVIEW TAB
// ----------------------------------------------------
function renderDashboardTab({ users, departments, requests, logs }) {
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const totalReqs = requests.length;
  const pendingReqs = requests.filter(r => r.status.startsWith('Pending')).length;
  const inProgressReqs = requests.filter(r => r.status === 'Work In Progress' || r.status.startsWith('Assigned') || r.status.startsWith('Accepted')).length;
  const completedReqs = requests.filter(r => r.status === 'Work Completed' || r.status === 'Closed').length;
  const rejectedReqs = requests.filter(r => r.status.startsWith('Rejected')).length;
  const returnedReqs = requests.filter(r => r.status.startsWith('Rejected') || (r.status === 'Pending Lab In-Charge' && r.rejection_reason)).length;

  return `
    <!-- Top 8 Summary Metric Cards Grid -->
    <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); margin-bottom: 24px;">
      <div class="metric-card" style="--card-accent: #8B9C1E;">
        <div class="metric-info">
          <span class="metric-label">Total Users</span>
          <span class="metric-value">${totalUsers}</span>
          <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Registered accounts</span>
        </div>
        <div class="metric-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Active Users</span>
          <span class="metric-value">${activeUsers}</span>
          <span style="font-size: 11px; color: #059669; margin-top: 4px;">● ${totalUsers - activeUsers} Disabled</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #3b82f6;">
        <div class="metric-info">
          <span class="metric-label">Total Requests</span>
          <span class="metric-value">${totalReqs}</span>
          <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">All-time submissions</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #2563eb; --icon-bg: #eff6ff;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #f59e0b;">
        <div class="metric-info">
          <span class="metric-label">Pending Requests</span>
          <span class="metric-value">${pendingReqs}</span>
          <span style="font-size: 11px; color: #d97706; margin-top: 4px;">Awaiting Review/HR</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #d97706; --icon-bg: #fef3c7;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #06b6d4;">
        <div class="metric-info">
          <span class="metric-label">In Progress</span>
          <span class="metric-value">${inProgressReqs}</span>
          <span style="font-size: 11px; color: #0891b2; margin-top: 4px;">Assigned / On-Site</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #0891b2; --icon-bg: #cff4fc;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Completed Works</span>
          <span class="metric-value">${completedReqs}</span>
          <span style="font-size: 11px; color: #059669; margin-top: 4px;">Verified & Closed</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #ef4444;">
        <div class="metric-info">
          <span class="metric-label">Rejected Requests</span>
          <span class="metric-value">${rejectedReqs}</span>
          <span style="font-size: 11px; color: #dc2626; margin-top: 4px;">By In-Charge / HOD</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #dc2626; --icon-bg: #fee2e2;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #8b5cf6;">
        <div class="metric-info">
          <span class="metric-label">Returned / Updated</span>
          <span class="metric-value">${returnedReqs}</span>
          <span style="font-size: 11px; color: #7c3aed; margin-top: 4px;">Action required</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #7c3aed; --icon-bg: #ede9fe;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>
        </div>
      </div>
    </div>

    <!-- Quick Actions Banner & Charts Grid -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
      <!-- Real-time Charts -->
      <div class="content-card" style="margin-bottom: 0;">
        <div class="card-header-flex">
          <div class="card-title-group">
            <h3>Request Analytics Overview</h3>
            <p>Real-time visual distribution of campus maintenance tickets</p>
          </div>
          <a href="#admin-reports" class="btn btn-outline btn-sm">Full Analytics &rarr;</a>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
          <div>
            <h5 style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; font-weight: 700;">REQUESTS BY CATEGORY</h5>
            <div style="height: 190px; position: relative;">
              <canvas id="dash-chart-cat"></canvas>
            </div>
          </div>
          <div>
            <h5 style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; font-weight: 700;">STATUS BREAKDOWN</h5>
            <div style="height: 190px; position: relative;">
              <canvas id="dash-chart-status"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Controls & Quick Stats -->
      <div class="content-card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
        <div class="card-title-group" style="margin-bottom: 14px;">
          <h3>Admin Quick Actions</h3>
          <p>Instant shortcuts to system controls</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-primary" id="dash-btn-create-user" style="justify-content: flex-start;">
            <span>➕ Provision New Staff Account</span>
          </button>
          <button class="btn btn-outline" id="dash-btn-add-dept" style="justify-content: flex-start;">
            <span>🏛️ Create New Academic Department</span>
          </button>
          <a href="#admin-requests" class="btn btn-outline" style="justify-content: flex-start; text-decoration: none;">
            <span>📋 Inspect Maintenance Registry</span>
          </a>
          <a href="#admin-reports" class="btn btn-outline" style="justify-content: flex-start; text-decoration: none;">
            <span>📊 Generate Export Reports</span>
          </a>
          <a href="#admin-audit" class="btn btn-outline" style="justify-content: flex-start; text-decoration: none;">
            <span>🛡️ View System Audit Logs</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Recent Maintenance Requests & Recent Activity Grid -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
      <!-- Recent Requests -->
      <div class="content-card" style="margin-bottom: 0;">
        <div class="card-header-flex">
          <div class="card-title-group">
            <h3>Recent Maintenance Requests</h3>
            <p>Latest tickets submitted across academic laboratories</p>
          </div>
          <a href="#admin-requests" class="btn btn-outline btn-sm">View All (${totalReqs}) &rarr;</a>
        </div>
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Department & Lab</th>
                <th>Problem Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${renderRecentRequestsRows(requests.slice(0, 6))}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent System Activity from Audit Log -->
      <div class="content-card" style="margin-bottom: 0;">
        <div class="card-header-flex">
          <div class="card-title-group">
            <h3>Recent System Activity</h3>
            <p>Live events recorded in security audit trail</p>
          </div>
          <a href="#admin-audit" class="btn btn-outline btn-sm">Audit &rarr;</a>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto;">
          ${renderRecentActivityStream(logs.slice(0, 7))}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. USER MANAGEMENT TAB
// ----------------------------------------------------
function renderUsersTab({ users, departments }) {
  return `
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Institutional User Accounts Management</h3>
          <p>Create staff credentials, assign institutional roles, reset passwords, and govern account permissions</p>
        </div>
        <div class="toolbar-flex" style="flex-wrap: wrap; gap: 10px;">
          <div class="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="user-search-input" class="search-input" placeholder="Search by ID, Name, Email, Emp ID..." />
          </div>
          <select id="user-filter-role" class="filter-select">
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Lab Assistant">Lab Assistant</option>
            <option value="Lab In-Charge">Lab In-Charge</option>
            <option value="HOD">HOD</option>
            <option value="HR">HR</option>
            <option value="Civil In-Charge">Civil In-Charge</option>
            <option value="Electrical In-Charge">Electrical In-Charge</option>
            <option value="Furniture In-Charge">Furniture In-Charge</option>
            <option value="Computer In-Charge">Computer In-Charge</option>
          </select>
          <select id="user-filter-dept" class="filter-select">
            <option value="">All Departments</option>
            ${departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
          </select>
          <button class="btn btn-primary" id="btn-open-create-user-modal">
            <span>+ Add New User</span>
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="admin-users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Employee ID</th>
              <th>Email & Phone</th>
              <th>Role</th>
              <th>Department / Lab</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="admin-users-tbody">
            ${renderUsersTableRows(users)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. DEPARTMENT MANAGEMENT TAB
// ----------------------------------------------------
function renderDepartmentsTab({ departments, users, requests }) {
  const totalDepts = departments.length;
  const activeDepts = departments.filter(d => d.status === 'Active').length;

  return `
    <!-- Top Department Metrics Grid -->
    <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 24px;">
      <div class="metric-card" style="--card-accent: #8B9C1E;">
        <div class="metric-info">
          <span class="metric-label">Total Departments</span>
          <span class="metric-value">${totalDepts}</span>
        </div>
        <div class="metric-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Active Departments</span>
          <span class="metric-value">${activeDepts}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #059669; --icon-bg: #d1fae5;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #3b82f6;">
        <div class="metric-info">
          <span class="metric-label">Total Department Staff</span>
          <span class="metric-value">${users.filter(u => u.department !== 'Administration').length}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #2563eb; --icon-bg: #eff6ff;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
      </div>

      <div class="metric-card" style="--card-accent: #f59e0b;">
        <div class="metric-info">
          <span class="metric-label">Active Tickets</span>
          <span class="metric-value">${requests.filter(r => r.status !== 'Work Completed' && r.status !== 'Closed').length}</span>
        </div>
        <div class="metric-icon-box" style="--icon-color: #d97706; --icon-bg: #fef3c7;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>
    </div>

    <!-- Departments Master Table Card -->
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Academic & Maintenance Departments Registry</h3>
          <p>Define academic departments with automatic dynamic role routing (No code modification required)</p>
        </div>
        <div class="toolbar-flex">
          <button class="btn btn-primary" id="btn-open-create-dept-modal">
            <span>+ Add New Department</span>
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Code</th>
              <th>Building / Block</th>
              <th>Staff Count</th>
              <th>Assigned Lab In-Charge</th>
              <th>Assigned HOD</th>
              <th>Active Tickets</th>
              <th>Completed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${renderDepartmentsTableRows(departments, users, requests)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. MAINTENANCE REQUESTS OVERVIEW TAB
// ----------------------------------------------------
function renderRequestsTab({ requests, departments }) {
  return `
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Maintenance Requests Master Registry</h3>
          <p>Filter, search, audit, and track maintenance issues across the institution</p>
        </div>
      </div>

      <!-- Advanced Filter Toolbar -->
      <div style="background: var(--bg-section-alt); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 12px;">
          <div>
            <label class="form-label" style="font-size: 11px;">Search Keyword</label>
            <input type="text" id="req-filter-search" class="form-control" placeholder="Search ID, Title, Person..." />
          </div>
          <div>
            <label class="form-label" style="font-size: 11px;">Department</label>
            <select id="req-filter-dept" class="form-control">
              <option value="">All Departments</option>
              ${departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 11px;">Category</label>
            <select id="req-filter-cat" class="form-control">
              <option value="">All Categories</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
              <option value="Furniture">Furniture</option>
              <option value="Computer">Computer</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 11px;">Workflow Status</label>
            <select id="req-filter-status" class="form-control">
              <option value="">All Statuses</option>
              <option value="Pending Lab In-Charge">Pending Lab In-Charge</option>
              <option value="Pending HOD">Pending HOD</option>
              <option value="Pending HR">Pending HR</option>
              <option value="Assigned to Department">Assigned to Department</option>
              <option value="Accepted by Department">Accepted by Department</option>
              <option value="Work In Progress">Work In Progress</option>
              <option value="Work Completed">Work Completed</option>
              <option value="Closed">Closed</option>
              <option value="Rejected by Lab In-Charge">Rejected by Lab In-Charge</option>
              <option value="Rejected by HOD">Rejected by HOD</option>
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size: 11px;">Priority</label>
            <select id="req-filter-prio" class="form-control">
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 12px; color: var(--text-muted);" id="req-filtered-count-text">
            Showing all <strong>${requests.length}</strong> maintenance requests
          </div>
          <button class="btn btn-outline btn-sm" id="btn-reset-req-filters">Clear All Filters</button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="admin-requests-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Department</th>
              <th>Lab & Room</th>
              <th>Problem Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Submitted By</th>
              <th>Current Stage</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="admin-requests-tbody">
            ${renderMasterRequestsRows(requests)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. LIVE WORKFLOW MONITOR TAB
// ----------------------------------------------------
function renderWorkflowTab({ requests }) {
  return `
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Live Multi-Tier Approval Workflow Monitor</h3>
          <p>Real-time visual pipeline showing lifecycle stage progression for all active maintenance tickets</p>
        </div>
      </div>

      <!-- Pipeline Reference Legend -->
      <div style="background: var(--ifet-tint); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
        <div style="font-weight: 700; font-size: 13px; color: var(--primary-800); margin-bottom: 6px;">
          🏛️ 6-Stage Institutional Workflow Route
        </div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.6;">
          <strong>Stage 1:</strong> Lab Assistant (Create) &rarr; 
          <strong>Stage 2:</strong> Same-Dept Lab In-Charge (Review) &rarr; 
          <strong>Stage 3:</strong> Same-Dept HOD (Approve) &rarr; 
          <strong>Stage 4:</strong> General HR (Category Routing) &rarr; 
          <strong>Stage 5:</strong> Maintenance Category In-Charge (Civil / Electrical / Furniture / Computer) &rarr; 
          <strong>Stage 6:</strong> Work Completed & Verified
        </div>
      </div>

      ${requests.length === 0 ? `
        <div class="empty-state-table" style="padding: 40px 20px;">
          <div class="empty-state-icon">🔄</div>
          <div class="empty-state-title">No maintenance requests to monitor.</div>
          <div class="empty-state-desc">When staff members submit maintenance tickets, their live multi-tier progression will appear here.</div>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${requests.map(r => renderSingleWorkflowStepperCard(r)).join('')}
        </div>
      `}
    </div>
  `;
}

// ----------------------------------------------------
// 6. REPORTS & ANALYTICS TAB
// ----------------------------------------------------
function renderReportsTab({ requests, departments }) {
  const totalReqs = requests.length;
  const civilReqs = requests.filter(r => r.category === 'Civil').length;
  const elecReqs = requests.filter(r => r.category === 'Electrical').length;
  const furnReqs = requests.filter(r => r.category === 'Furniture').length;
  const compReqs = requests.filter(r => r.category === 'Computer').length;
  const completedReqs = requests.filter(r => r.status === 'Work Completed' || r.status === 'Closed').length;
  const pendingReqs = requests.filter(r => r.status.startsWith('Pending')).length;

  return `
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>System Reports & Institutional Analytics</h3>
          <p>Export maintenance records, monitor resolution velocity, and evaluate department performance</p>
        </div>
        <div class="toolbar-flex" style="flex-wrap: wrap;">
          <button class="btn btn-primary" id="btn-admin-export-csv" ${totalReqs === 0 ? 'disabled' : ''}>
            <span>📥 Export CSV Report</span>
          </button>
          <button class="btn btn-outline" id="btn-admin-print-report" ${totalReqs === 0 ? 'disabled' : ''}>
            <span>🖨️ Print Report</span>
          </button>
        </div>
      </div>

      <!-- Analytics Summary Metrics Grid -->
      <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 24px;">
        <div class="metric-card" style="--card-accent: #3b82f6;">
          <div class="metric-info">
            <span class="metric-label">Total Requests</span>
            <span class="metric-value">${totalReqs}</span>
          </div>
        </div>
        <div class="metric-card" style="--card-accent: #f59e0b;">
          <div class="metric-info">
            <span class="metric-label">Civil Requests</span>
            <span class="metric-value">${civilReqs}</span>
          </div>
        </div>
        <div class="metric-card" style="--card-accent: #8B9C1E;">
          <div class="metric-info">
            <span class="metric-label">Electrical Requests</span>
            <span class="metric-value">${elecReqs}</span>
          </div>
        </div>
        <div class="metric-card" style="--card-accent: #8b5cf6;">
          <div class="metric-info">
            <span class="metric-label">Furniture Requests</span>
            <span class="metric-value">${furnReqs}</span>
          </div>
        </div>
        <div class="metric-info" style="--card-accent: #06b6d4;">
          <div class="metric-info">
            <span class="metric-label">Computer Requests</span>
            <span class="metric-value">${compReqs}</span>
          </div>
        </div>
        <div class="metric-card" style="--card-accent: #10b981;">
          <div class="metric-info">
            <span class="metric-label">Resolution Rate</span>
            <span class="metric-value">${totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      ${totalReqs === 0 ? `
        <div class="empty-state-table" style="padding: 40px 20px;">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-title">No maintenance data available for reports.</div>
          <div class="empty-state-desc">Reports and charts will automatically populate as tickets are filed in the system.</div>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          <div class="content-card" style="margin-bottom: 0;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--primary-900);">Requests by Academic Department</h4>
            <div style="height: 240px; position: relative;">
              <canvas id="report-chart-dept"></canvas>
            </div>
          </div>

          <div class="content-card" style="margin-bottom: 0;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--primary-900);">Requests by Maintenance Category</h4>
            <div style="height: 240px; position: relative;">
              <canvas id="report-chart-cat"></canvas>
            </div>
          </div>

          <div class="content-card" style="margin-bottom: 0;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--primary-900);">Request Status Distribution</h4>
            <div style="height: 240px; position: relative;">
              <canvas id="report-chart-status"></canvas>
            </div>
          </div>

          <div class="content-card" style="margin-bottom: 0;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--primary-900);">Priority Classification</h4>
            <div style="height: 240px; position: relative;">
              <canvas id="report-chart-prio"></canvas>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
}

// ----------------------------------------------------
// 7. AUDIT LOGS TAB
// ----------------------------------------------------
function renderAuditTab({ logs }) {
  return `
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>System Security & Workflow Audit Trail</h3>
          <p>Immutable forensic record of user logins, password modifications, and workflow approvals</p>
        </div>
        <div class="toolbar-flex" style="flex-wrap: wrap;">
          <input type="text" id="audit-search-input" class="search-input" placeholder="Search audit logs..." />
          <select id="audit-filter-action" class="filter-select">
            <option value="">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="CREATE_REQUEST">CREATE_REQUEST</option>
            <option value="LAB_CHARGE_APPROVE">LAB_CHARGE_APPROVE</option>
            <option value="HOD_APPROVE">HOD_APPROVE</option>
            <option value="HR_CATEGORY_ROUTING">HR_CATEGORY_ROUTING</option>
            <option value="DEPT_COMPLETE_WORK">DEPT_COMPLETE_WORK</option>
            <option value="ADMIN_CREATE_USER">ADMIN_CREATE_USER</option>
            <option value="ADMIN_RESET_PASSWORD">ADMIN_RESET_PASSWORD</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="custom-table" id="admin-audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Staff Member</th>
              <th>Role</th>
              <th>Action Code</th>
              <th>Target ID</th>
              <th>Transition</th>
              <th>Details & Comments</th>
            </tr>
          </thead>
          <tbody id="admin-audit-tbody">
            ${renderAuditTableRows(logs)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 8. NOTIFICATIONS TAB
// ----------------------------------------------------
function renderNotificationsTab({ notifications, currentAdmin }) {
  const adminNotifs = notifications.filter(n => n.user_id === currentAdmin.id || n.user_id === 'admin' || n.title.includes('Admin') || n.title.includes('Request'));

  return `
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>Institutional Notification Center</h3>
          <p>System alerts, review notifications, and ticket assignment updates</p>
        </div>
        <button class="btn btn-outline btn-sm" id="btn-admin-mark-all-read">Mark All as Read</button>
      </div>

      ${adminNotifs.length === 0 ? `
        <div class="empty-state-table" style="padding: 40px 20px;">
          <div class="empty-state-icon">🔔</div>
          <div class="empty-state-title">No notifications.</div>
          <div class="empty-state-desc">System alerts and workflow notifications will appear here.</div>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${adminNotifs.map(n => `
            <div style="padding: 14px 16px; background: ${n.is_read ? 'var(--bg-section-alt)' : 'rgba(139, 156, 30, 0.08)'}; border: 1px solid ${n.is_read ? 'var(--border-color)' : 'var(--primary-600)'}; border-radius: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
              <div>
                <div style="font-weight: 700; font-size: 13.5px; color: var(--primary-900);">${n.title}</div>
                <div style="font-size: 12.5px; color: var(--text-main); margin-top: 4px;">${n.message}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${new Date(n.created_at).toLocaleString()}</div>
              </div>
              ${!n.is_read ? '<span class="badge badge-assigned">New</span>' : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

// ----------------------------------------------------
// 9. SYSTEM HEALTH TAB
// ----------------------------------------------------
function renderSystemTab({ users, departments, requests, logs }) {
  return `
    <div class="content-card">
      <div class="card-header-flex">
        <div class="card-title-group">
          <h3>System Health, Architecture & Data Backups</h3>
          <p>Inspect platform connectivity, cryptographic security status, and create database backups</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="padding: 16px; background: var(--bg-section-alt); border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">APPLICATION CORE</div>
          <div style="font-size: 16px; font-weight: 700; color: var(--primary-800); margin: 6px 0 4px;">IFET CMMS v2.4 (Enterprise)</div>
          <div style="font-size: 12px; color: var(--text-muted);">Autonomous Institutional Maintenance Management Platform</div>
        </div>

        <div style="padding: 16px; background: var(--bg-section-alt); border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">SECURITY & AUTHENTICATION</div>
          <div style="font-size: 16px; font-weight: 700; color: #059669; margin: 6px 0 4px;">SHA-256 RBAC Verified</div>
          <div style="font-size: 12px; color: var(--text-muted);">Session validation & temporary password enforcement active</div>
        </div>

        <div style="padding: 16px; background: var(--bg-section-alt); border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">DYNAMIC ROUTING ENGINE</div>
          <div style="font-size: 16px; font-weight: 700; color: var(--primary-700); margin: 6px 0 4px;">Universal Department Matching</div>
          <div style="font-size: 12px; color: var(--text-muted);">${departments.length} Academic Departments Registered (Zero hardcoded names)</div>
        </div>
      </div>

      <!-- Backup & Restore Section -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 20px;">
        <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--primary-900);">Database Backup & Disaster Recovery</h4>
        <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 16px;">Download an instantaneous snapshot of all institutional users, departments, requests, approvals, and audit logs.</p>
        
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-primary" id="btn-download-db-backup">
            <span>💾 Download JSON Database Snapshot</span>
          </button>
          <label class="btn btn-outline" style="cursor: pointer; margin: 0;">
            <span>📤 Restore Database from JSON</span>
            <input type="file" id="input-restore-db-json" accept=".json" style="display: none;" />
          </label>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// TABLE ROW RENDERERS
// ----------------------------------------------------
function renderRecentRequestsRows(list) {
  if (!list || list.length === 0) {
    return '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No maintenance requests yet.</td></tr>';
  }
  return list.map(r => `
    <tr>
      <td><strong style="color: var(--primary-600);">${r.request_id}</strong></td>
      <td>
        <div style="font-weight: 600;">${r.department || 'General'}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${r.lab_name}</div>
      </td>
      <td><div style="font-weight: 600; max-width: 180px;" class="text-truncate">${r.problem_title}</div></td>
      <td><span class="badge badge-assigned">${r.category}</span></td>
      <td>
        <span class="badge ${getStatusBadgeClass(r.status)}">
          <span class="badge-dot"></span> ${r.status}
        </span>
      </td>
      <td>
        <a href="#tracking?id=${r.id}" class="btn btn-outline btn-sm">Track</a>
      </td>
    </tr>
  `).join('');
}

function renderRecentActivityStream(logs) {
  if (!logs || logs.length === 0) {
    return '<div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 20px;">No system activity logged yet.</div>';
  }
  return logs.map(l => `
    <div style="padding: 10px 12px; background: var(--bg-section-alt); border-radius: 6px; border: 1px solid var(--border-color); font-size: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <strong style="color: var(--primary-900);">${l.action}</strong>
        <span style="font-size: 10.5px; color: var(--text-muted);">${new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div style="color: var(--text-muted);">${l.details}</div>
      <div style="font-size: 10.5px; color: var(--primary-600); margin-top: 4px;">User: <strong>${l.user_name}</strong> (${l.role})</div>
    </div>
  `).join('');
}

function renderUsersTableRows(usersList) {
  if (!usersList || usersList.length === 0) {
    return '<tr><td colspan="9" style="text-align: center; padding: 30px; color: var(--text-muted);">No users match the criteria.</td></tr>';
  }
  return usersList.map(u => `
    <tr>
      <td><strong style="color: var(--primary-600); font-family: monospace;">${u.user_id}</strong></td>
      <td>
        <div style="font-weight: 600;">${u.full_name}</div>
        ${u.must_change_password ? '<span style="font-size: 10px; color: #d97706; font-weight: 700;">⏳ Must Reset Pwd</span>' : ''}
      </td>
      <td><span class="badge badge-draft">${u.employee_id || '-'}</span></td>
      <td>
        <div style="font-size: 12px;">${u.email}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${u.phone || '-'}</div>
      </td>
      <td><span class="badge badge-assigned">${u.role}</span></td>
      <td>
        <div style="font-weight: 600; font-size: 12px;">${u.department}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${u.lab || '-'}</div>
      </td>
      <td>
        <span class="badge ${u.status === 'Active' ? 'badge-approved' : 'badge-rejected'}">
          <span class="badge-dot"></span> ${u.status}
        </span>
      </td>
      <td style="font-size: 11px; color: var(--text-muted);">${u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
      <td>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm btn-edit-user" data-id="${u.id}">Edit</button>
          <button class="btn btn-outline btn-sm btn-reset-pwd" data-id="${u.id}" title="Reset password to Temp@123">Reset Pwd</button>
          <button class="btn btn-outline btn-sm btn-toggle-user-status" data-id="${u.id}">${u.status === 'Active' ? 'Disable' : 'Activate'}</button>
          <button class="btn btn-outline btn-sm btn-delete-user" data-id="${u.id}" style="color: #dc2626; border-color: rgba(220,38,38,0.3);">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderDepartmentsTableRows(departments, users, requests) {
  if (!departments || departments.length === 0) {
    return '<tr><td colspan="10" style="text-align: center; padding: 24px; color: var(--text-muted);">No departments found.</td></tr>';
  }

  return departments.map(d => {
    const deptUsers = users.filter(u => (u.department || '').trim().toLowerCase() === (d.name || '').trim().toLowerCase());
    const labInCharges = deptUsers.filter(u => u.role === 'Lab In-Charge').map(u => u.full_name);
    const hods = deptUsers.filter(u => u.role === 'HOD').map(u => u.full_name);
    const activeReqs = requests.filter(r => (r.department || '').trim().toLowerCase() === (d.name || '').trim().toLowerCase() && r.status !== 'Work Completed' && r.status !== 'Closed').length;
    const completedReqs = requests.filter(r => (r.department || '').trim().toLowerCase() === (d.name || '').trim().toLowerCase() && (r.status === 'Work Completed' || r.status === 'Closed')).length;

    return `
      <tr>
        <td><strong>${d.name}</strong></td>
        <td><span class="badge badge-draft" style="font-weight: 700;">${d.code}</span></td>
        <td style="font-size: 12px;">${d.block || 'Main Campus Block'}</td>
        <td><span class="badge badge-assigned">${deptUsers.length} Users</span></td>
        <td style="font-size: 12px;">${labInCharges.length > 0 ? labInCharges.join(', ') : '<span style="color: #dc2626;">None Assigned</span>'}</td>
        <td style="font-size: 12px;">${hods.length > 0 ? hods.join(', ') : '<span style="color: #dc2626;">None Assigned</span>'}</td>
        <td><span class="badge badge-pending">${activeReqs}</span></td>
        <td><span class="badge badge-approved">${completedReqs}</span></td>
        <td>
          <span class="badge ${d.status === 'Active' ? 'badge-approved' : 'badge-rejected'}">
            <span class="badge-dot"></span> ${d.status}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm btn-edit-dept" data-id="${d.id}">Edit</button>
            <button class="btn btn-outline btn-sm btn-toggle-dept-status" data-id="${d.id}">${d.status === 'Active' ? 'Disable' : 'Activate'}</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderMasterRequestsRows(list) {
  if (!list || list.length === 0) {
    return '<tr><td colspan="11" style="text-align: center; padding: 30px; color: var(--text-muted);">No maintenance requests match the filter criteria.</td></tr>';
  }

  return list.map(r => `
    <tr>
      <td><strong style="color: var(--primary-600);">${r.request_id}</strong></td>
      <td><strong>${r.department || 'General'}</strong></td>
      <td>
        <div style="font-weight: 600; font-size: 12px;">${r.lab_name}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${r.building} - ${r.room_number}</div>
      </td>
      <td>
        <div style="font-weight: 600; max-width: 180px;" class="text-truncate">${r.problem_title}</div>
      </td>
      <td><span class="badge badge-assigned">${r.category}</span></td>
      <td><span class="badge badge-prio-${r.priority.toLowerCase()}">${r.priority}</span></td>
      <td style="font-size: 12px;">${r.created_by_name}</td>
      <td><span class="badge badge-draft">${getCurrentStageTitle(r.status, r.category)}</span></td>
      <td>
        <span class="badge ${getStatusBadgeClass(r.status)}">
          <span class="badge-dot"></span> ${r.status}
        </span>
      </td>
      <td style="font-size: 11px; color: var(--text-muted);">${new Date(r.created_at).toLocaleDateString()}</td>
      <td>
        <div style="display: flex; gap: 4px;">
          <a href="#tracking?id=${r.id}" class="btn btn-outline btn-sm">Track</a>
          <button class="btn btn-outline btn-sm btn-admin-quick-view-req" data-id="${r.id}">View</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderSingleWorkflowStepperCard(req) {
  const isRejected = req.status.startsWith('Rejected');
  const isCompleted = req.status === 'Work Completed' || req.status === 'Closed';

  // Compute 6 stage visual statuses: completed | active | pending | rejected
  const s1 = 'completed'; // Created
  let s2 = 'pending'; // Lab In-Charge
  let s3 = 'pending'; // HOD
  let s4 = 'pending'; // HR
  let s5 = 'pending'; // Category In-Charge
  let s6 = isCompleted ? 'completed' : 'pending';

  if (req.status === 'Pending Lab In-Charge') {
    s2 = 'active';
  } else if (req.status === 'Rejected by Lab In-Charge') {
    s2 = 'rejected';
  } else if (req.status === 'Approved by Lab In-Charge' || req.status === 'Pending HOD') {
    s2 = 'completed';
    s3 = 'active';
  } else if (req.status === 'Rejected by HOD') {
    s2 = 'completed';
    s3 = 'rejected';
  } else if (req.status === 'Approved by HOD' || req.status === 'Pending HR') {
    s2 = 'completed';
    s3 = 'completed';
    s4 = 'active';
  } else if (req.status === 'Assigned to Department') {
    s2 = 'completed';
    s3 = 'completed';
    s4 = 'completed';
    s5 = 'active';
  } else if (req.status === 'Accepted by Department' || req.status === 'Work In Progress') {
    s2 = 'completed';
    s3 = 'completed';
    s4 = 'completed';
    s5 = 'active';
  } else if (isCompleted) {
    s2 = 'completed';
    s3 = 'completed';
    s4 = 'completed';
    s5 = 'completed';
    s6 = 'completed';
  }

  return `
    <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 18px; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        <div>
          <span style="font-weight: 700; color: var(--primary-600); font-size: 14px;">${req.request_id}</span>
          <span style="margin: 0 6px;">•</span>
          <strong style="color: var(--primary-900);">${req.problem_title}</strong>
          <span style="margin: 0 6px;">•</span>
          <span class="badge badge-assigned">${req.department}</span>
          <span class="badge badge-draft">${req.category}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge ${getStatusBadgeClass(req.status)}">${req.status}</span>
          <a href="#tracking?id=${req.id}" class="btn btn-outline btn-sm">Lifecycle Timeline &rarr;</a>
        </div>
      </div>

      <!-- 6-Tier Interactive Workflow Visual Stepper -->
      <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; text-align: center; font-size: 11px;">
        <div style="padding: 8px 4px; border-radius: 6px; background: ${getStepperBg(s1)}; border: 1px solid ${getStepperBorder(s1)};">
          <div style="font-weight: 700; color: ${getStepperColor(s1)};">1. Lab Assistant</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">✓ Submitted</div>
        </div>

        <div style="padding: 8px 4px; border-radius: 6px; background: ${getStepperBg(s2)}; border: 1px solid ${getStepperBorder(s2)};">
          <div style="font-weight: 700; color: ${getStepperColor(s2)};">2. Lab In-Charge</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${getStepperStatusText(s2)}</div>
        </div>

        <div style="padding: 8px 4px; border-radius: 6px; background: ${getStepperBg(s3)}; border: 1px solid ${getStepperBorder(s3)};">
          <div style="font-weight: 700; color: ${getStepperColor(s3)};">3. Dept HOD</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${getStepperStatusText(s3)}</div>
        </div>

        <div style="padding: 8px 4px; border-radius: 6px; background: ${getStepperBg(s4)}; border: 1px solid ${getStepperBorder(s4)};">
          <div style="font-weight: 700; color: ${getStepperColor(s4)};">4. General HR</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${getStepperStatusText(s4)}</div>
        </div>

        <div style="padding: 8px 4px; border-radius: 6px; background: ${getStepperBg(s5)}; border: 1px solid ${getStepperBorder(s5)};">
          <div style="font-weight: 700; color: ${getStepperColor(s5)};">5. ${req.category} In-Charge</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${getStepperStatusText(s5)}</div>
        </div>

        <div style="padding: 8px 4px; border-radius: 6px; background: ${getStepperBg(s6)}; border: 1px solid ${getStepperBorder(s6)};">
          <div style="font-weight: 700; color: ${getStepperColor(s6)};">6. Work Done</div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">${getStepperStatusText(s6)}</div>
        </div>
      </div>
    </div>
  `;
}

function renderAuditTableRows(logs) {
  if (!logs || logs.length === 0) {
    return '<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">No audit records found.</td></tr>';
  }
  return logs.slice(0, 100).map(l => `
    <tr>
      <td style="font-size: 11px; color: var(--text-muted);">${new Date(l.timestamp).toLocaleString()}</td>
      <td><strong>${l.user_name}</strong></td>
      <td><span class="badge badge-draft">${l.role}</span></td>
      <td><span class="badge badge-assigned" style="font-family: monospace;">${l.action}</span></td>
      <td><strong style="color: var(--primary-600);">${l.request_id || '-'}</strong></td>
      <td style="font-size: 11px;">${l.old_status || '-'} &rarr; ${l.new_status || '-'}</td>
      <td style="font-size: 12px; color: var(--text-main);">${l.details}</td>
    </tr>
  `).join('');
}

// ----------------------------------------------------
// MODALS
// ----------------------------------------------------
function renderAllAdminModals(currentAdmin, departments) {
  return `
    <!-- 1. Create / Edit User Account Modal -->
    <div class="modal-backdrop" id="user-modal">
      <div class="modal-content" style="max-width: 640px;">
        <div class="modal-header">
          <h3 class="modal-title" id="user-modal-title">Create Institutional User</h3>
          <button type="button" class="modal-close-btn" id="close-user-modal">&times;</button>
        </div>
        <form id="user-form" novalidate>
          <div class="modal-body">
            <input type="hidden" id="edit-user-db-id" />
            <div id="user-modal-error" class="modal-alert-box error" style="display: none;"></div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" class="form-control" id="u-fullname" required placeholder="e.g. Dr. A. Murugan" />
              </div>
              <div class="form-group">
                <label class="form-label">Employee ID *</label>
                <input type="text" class="form-control" id="u-empid" required placeholder="e.g. EMP-CSE-020" />
              </div>
              <div class="form-group">
                <label class="form-label">User ID (Login Username) *</label>
                <input type="text" class="form-control" id="u-userid" required placeholder="e.g. lab002" />
              </div>
              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input type="email" class="form-control" id="u-email" required placeholder="e.g. faculty@ifet.ac.in" />
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="text" class="form-control" id="u-phone" placeholder="+91 98765 00000" />
              </div>
              <div class="form-group">
                <label class="form-label">Role *</label>
                <select class="form-control" id="u-role" required>
                  <option value="Lab Assistant">Lab Assistant</option>
                  <option value="Lab In-Charge">Lab In-Charge</option>
                  <option value="HOD">HOD</option>
                  <option value="HR">HR</option>
                  <option value="Civil In-Charge">Civil In-Charge</option>
                  <option value="Electrical In-Charge">Electrical In-Charge</option>
                  <option value="Furniture In-Charge">Furniture In-Charge</option>
                  <option value="Computer In-Charge">Computer In-Charge</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Department *</label>
                <input type="text" class="form-control" id="u-dept" list="depts-datalist" required placeholder="e.g. Computer Science & Engineering" />
                <datalist id="depts-datalist">
                  ${departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
                </datalist>
              </div>
              <div class="form-group">
                <label class="form-label">Lab / Work Location</label>
                <input type="text" class="form-control" id="u-lab" placeholder="e.g. Main Lab" />
              </div>
              <div class="form-group full-width">
                <label class="form-label">Account Status</label>
                <select class="form-control" id="u-status">
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <!-- Temporary Password for Create Mode -->
              <div class="form-group full-width" id="form-group-temppwd">
                <label class="form-label">Temporary Password *</label>
                <div style="display: flex; gap: 8px;">
                  <input type="text" class="form-control" id="u-temppwd" value="Temp@123" required />
                  <button type="button" class="btn btn-outline" id="btn-generate-temp-pwd" style="white-space: nowrap; font-size: 12px; padding: 6px 12px;">
                    🎲 Generate
                  </button>
                </div>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">
                  The user will be required to create a permanent password on first login.
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="cancel-user-modal">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-save-user-account">Create User</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 2. One-Time Credentials Display Modal -->
    <div class="modal-backdrop" id="temp-credentials-modal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title" style="color: var(--color-approved);">✓ User Created Successfully</h3>
          <button class="modal-close-btn" id="close-temp-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 13.5px; margin-bottom: 16px;">Initial credentials generated:</p>
          <div style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
            <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span style="font-size: 12px; color: var(--text-muted);">Staff Name:</span>
              <strong id="cred-name">-</strong>
            </div>
            <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span style="font-size: 12px; color: var(--text-muted);">User ID:</span>
              <strong id="cred-userid" style="font-family: monospace;">-</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: rgba(139, 156, 30, 0.12); padding: 8px 12px; border-radius: 6px;">
              <span style="font-size: 12px; color: var(--primary-800); font-weight: 700;">Temporary Password:</span>
              <strong id="cred-password" style="font-family: monospace; color: var(--primary-800);">-</strong>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="btn-copy-credentials">📋 Copy Credentials</button>
          <button type="button" class="btn btn-primary" id="btn-dismiss-temp-modal">Done</button>
        </div>
      </div>
    </div>

    <!-- 3. Confirm Delete User Modal (Safety) -->
    <div class="modal-backdrop" id="delete-user-modal">
      <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header" style="background: rgba(239, 68, 68, 0.08);">
          <h3 class="modal-title" style="color: #dc2626;">⚠️ Delete User Account</h3>
          <button type="button" class="modal-close-btn" id="close-delete-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Are you sure you want to delete this user?</p>
          <div style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px 14px; margin-bottom: 14px;">
            <div style="font-size: 13px; font-weight: 700;" id="del-user-name">-</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              User ID: <strong id="del-user-id">-</strong> • Role: <span id="del-user-role">-</span>
            </div>
          </div>
          <p style="font-size: 12px; color: #dc2626;">This action will remove the account from the system.</p>
          <input type="hidden" id="del-user-target-id" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="cancel-delete-modal">Cancel</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-delete-user">Delete User</button>
        </div>
      </div>
    </div>

    <!-- 4. Reset User Password Confirmation Modal -->
    <div class="modal-backdrop" id="reset-pwd-modal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">🔑 Reset User Password</h3>
          <button type="button" class="modal-close-btn" id="close-reset-pwd-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 13.5px; margin-bottom: 14px;">The user's password will be reset to temporary password <strong>Temp@123</strong>.</p>
          <div style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px 16px; margin-bottom: 16px;">
            <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span style="font-size: 12px; color: var(--text-muted);">User:</span>
              <strong id="reset-target-name">-</strong>
            </div>
            <div style="margin-bottom: 8px; display: flex; justify-content: space-between;">
              <span style="font-size: 12px; color: var(--text-muted);">User ID:</span>
              <strong id="reset-target-userid" style="font-family: monospace;">-</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: rgba(139, 156, 30, 0.12); padding: 8px 12px; border-radius: 6px;">
              <span style="font-size: 12px; color: var(--primary-800); font-weight: 700;">New Temporary Password:</span>
              <strong style="font-family: monospace; color: var(--primary-800);">Temp@123</strong>
            </div>
          </div>
          <div style="font-size: 12px; color: var(--text-muted);">The user will be required to create a new password on their next login.</div>
          <input type="hidden" id="reset-target-id" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="cancel-reset-pwd-modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-reset-pwd">Confirm Reset</button>
        </div>
      </div>
    </div>

    <!-- 5. Create / Edit Department Modal -->
    <div class="modal-backdrop" id="dept-modal">
      <div class="modal-content" style="max-width: 520px;">
        <div class="modal-header">
          <h3 class="modal-title" id="dept-modal-title">Create Academic Department</h3>
          <button type="button" class="modal-close-btn" id="close-dept-modal">&times;</button>
        </div>
        <form id="dept-form">
          <div class="modal-body">
            <input type="hidden" id="edit-dept-id" />
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Department Name *</label>
              <input type="text" class="form-control" id="dept-name-input" required placeholder="e.g. Artificial Intelligence & Data Science" />
            </div>
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Department Code *</label>
              <input type="text" class="form-control" id="dept-code-input" required placeholder="e.g. AI&DS" />
            </div>
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Campus Block / Building Location</label>
              <input type="text" class="form-control" id="dept-block-input" placeholder="e.g. Innovation Block" />
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-control" id="dept-status-input">
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="cancel-dept-modal">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-save-dept">Save Department</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 6. Global Admin Quick Search Modal -->
    <div class="modal-backdrop" id="global-search-modal">
      <div class="modal-content" style="max-width: 650px;">
        <div class="modal-header">
          <h3 class="modal-title">🔍 Global Admin Search</h3>
          <button type="button" class="modal-close-btn" id="close-global-search-modal">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 16px;">
            <input type="text" id="global-search-input" class="form-control" placeholder="Type User ID, Staff Name, Request ID, Category, Department..." style="font-size: 15px; padding: 12px 16px;" autofocus />
          </div>
          <div id="global-search-results" style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
            <div style="text-align: center; color: var(--text-muted); padding: 24px; font-size: 13px;">
              Start typing to search users, departments, and maintenance requests...
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// EVENT HANDLERS & LOGIC
// ----------------------------------------------------

// Global Search
function attachGlobalSearchListeners(container) {
  const modal = container.querySelector('#global-search-modal');
  const openBtn = container.querySelector('#btn-open-global-search');
  const closeBtn = container.querySelector('#close-global-search-modal');
  const searchInput = container.querySelector('#global-search-input');
  const resultsDiv = container.querySelector('#global-search-results');

  const openSearch = () => {
    modal.classList.add('show');
    searchInput.value = '';
    searchInput.focus();
  };

  openBtn?.addEventListener('click', openSearch);
  closeBtn?.addEventListener('click', () => modal.classList.remove('show'));

  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      resultsDiv.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 24px; font-size: 13px;">Start typing to search...</div>';
      return;
    }

    const users = db.getUsers().filter(u => u.user_id.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.department.toLowerCase().includes(q));
    const requests = db.getRequests().filter(r => r.request_id.toLowerCase().includes(q) || r.problem_title.toLowerCase().includes(q) || (r.department || '').toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    const depts = db.getDepartments().filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));

    let html = '';

    if (users.length > 0) {
      html += '<div style="font-size: 11px; font-weight: 700; color: var(--text-muted); margin-top: 8px;">USERS</div>';
      users.slice(0, 4).forEach(u => {
        html += `
          <div style="padding: 8px 12px; background: var(--bg-section-alt); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${u.full_name}</strong> (${u.user_id}) • <span class="badge badge-assigned">${u.role}</span>
              <div style="font-size: 11px; color: var(--text-muted);">${u.department}</div>
            </div>
            <a href="#admin-users" class="btn btn-outline btn-sm">View User</a>
          </div>
        `;
      });
    }

    if (requests.length > 0) {
      html += '<div style="font-size: 11px; font-weight: 700; color: var(--text-muted); margin-top: 12px;">MAINTENANCE REQUESTS</div>';
      requests.slice(0, 4).forEach(r => {
        html += `
          <div style="padding: 8px 12px; background: var(--bg-section-alt); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: var(--primary-600);">${r.request_id}</strong> — ${r.problem_title}
              <div style="font-size: 11px; color: var(--text-muted);">${r.department} • ${r.category} • Status: ${r.status}</div>
            </div>
            <a href="#tracking?id=${r.id}" class="btn btn-outline btn-sm">Track</a>
          </div>
        `;
      });
    }

    if (depts.length > 0) {
      html += '<div style="font-size: 11px; font-weight: 700; color: var(--text-muted); margin-top: 12px;">DEPARTMENTS</div>';
      depts.slice(0, 4).forEach(d => {
        html += `
          <div style="padding: 8px 12px; background: var(--bg-section-alt); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>${d.name}</strong> [${d.code}]
              <div style="font-size: 11px; color: var(--text-muted);">${d.block}</div>
            </div>
            <a href="#admin-departments" class="btn btn-outline btn-sm">View Dept</a>
          </div>
        `;
      });
    }

    if (!html) {
      html = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">No matching records found for "${q}".</div>`;
    }

    resultsDiv.innerHTML = html;
  });
}

function attachQuickActionListeners(container) {
  const userModal = container.querySelector('#user-modal');
  const deptModal = container.querySelector('#dept-modal');

  container.querySelector('#btn-quick-create-user')?.addEventListener('click', () => {
    openUserModal(container, null);
  });

  container.querySelector('#dash-btn-create-user')?.addEventListener('click', () => {
    openUserModal(container, null);
  });

  container.querySelector('#btn-quick-add-dept')?.addEventListener('click', () => {
    openDeptModal(container, null);
  });

  container.querySelector('#dash-btn-add-dept')?.addEventListener('click', () => {
    openDeptModal(container, null);
  });
}

// Dashboard Charts
function initDashboardVisuals(container, requests, users, departments) {
  if (typeof Chart === 'undefined') return;

  setTimeout(() => {
    // 1. Requests by Category
    const ctxCat = container.querySelector('#dash-chart-cat');
    if (ctxCat) {
      const civil = requests.filter(r => r.category === 'Civil').length;
      const elec = requests.filter(r => r.category === 'Electrical').length;
      const furn = requests.filter(r => r.category === 'Furniture').length;
      const comp = requests.filter(r => r.category === 'Computer').length;

      new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: ['Civil', 'Electrical', 'Furniture', 'Computer'],
          datasets: [{
            data: [civil, elec, furn, comp],
            backgroundColor: ['#f59e0b', '#8B9C1E', '#8b5cf6', '#06b6d4']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 2. Status Breakdown
    const ctxStatus = container.querySelector('#dash-chart-status');
    if (ctxStatus) {
      const pending = requests.filter(r => r.status.startsWith('Pending')).length;
      const progress = requests.filter(r => r.status === 'Work In Progress' || r.status.startsWith('Assigned') || r.status.startsWith('Accepted')).length;
      const completed = requests.filter(r => r.status === 'Work Completed' || r.status === 'Closed').length;
      const rejected = requests.filter(r => r.status.startsWith('Rejected')).length;

      new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'In Progress', 'Completed', 'Rejected'],
          datasets: [{
            data: [pending, progress, completed, rejected],
            backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }, 100);
}

// Users Tab Actions
function initUsersTabListeners(container) {
  const searchInput = container.querySelector('#user-search-input');
  const roleFilter = container.querySelector('#user-filter-role');
  const deptFilter = container.querySelector('#user-filter-dept');
  const tbody = container.querySelector('#admin-users-tbody');
  const openAddBtn = container.querySelector('#btn-open-create-user-modal');

  const filterUsers = () => {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const role = roleFilter?.value || '';
    const dept = deptFilter?.value || '';

    let list = db.getUsers();
    if (q) {
      list = list.filter(u => u.user_id.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.employee_id || '').toLowerCase().includes(q));
    }
    if (role) {
      list = list.filter(u => u.role === role);
    }
    if (dept) {
      list = list.filter(u => u.department === dept);
    }

    if (tbody) {
      tbody.innerHTML = renderUsersTableRows(list);
      attachUserRowEvents(container);
    }
  };

  searchInput?.addEventListener('input', filterUsers);
  roleFilter?.addEventListener('change', filterUsers);
  deptFilter?.addEventListener('change', filterUsers);
  openAddBtn?.addEventListener('click', () => openUserModal(container, null));

  attachUserRowEvents(container);
}

function attachUserRowEvents(container) {
  // Edit User
  container.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const user = db.getUsers().find(u => u.id === id);
      if (user) openUserModal(container, user);
    });
  });

  // Toggle Active/Disable
  container.querySelectorAll('.btn-toggle-user-status').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const users = db.getUsers();
      const user = users.find(u => u.id === id);
      if (!user) return;
      user.status = user.status === 'Active' ? 'Disabled' : 'Active';
      db.saveUsers(users);
      renderAdminView(container, 'admin-users');
    });
  });

  // Reset Password Modal
  const resetModal = container.querySelector('#reset-pwd-modal');
  container.querySelectorAll('.btn-reset-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const user = db.getUsers().find(u => u.id === id);
      if (!user) return;

      container.querySelector('#reset-target-id').value = user.id;
      container.querySelector('#reset-target-name').textContent = user.full_name;
      container.querySelector('#reset-target-userid').textContent = user.user_id;
      resetModal.classList.add('show');
    });
  });

  container.querySelector('#close-reset-pwd-modal')?.addEventListener('click', () => resetModal?.classList.remove('show'));
  container.querySelector('#cancel-reset-pwd-modal')?.addEventListener('click', () => resetModal?.classList.remove('show'));
  container.querySelector('#btn-confirm-reset-pwd')?.addEventListener('click', () => {
    const userId = container.querySelector('#reset-target-id').value;
    const res = auth.adminResetPassword(userId);
    if (res.success) {
      alert(`Password for user ${res.user.user_id} has been reset to Temp@123. The user must create a new password on their next login.`);
      resetModal.classList.remove('show');
      renderAdminView(container, 'admin-users');
    } else {
      alert(res.message);
    }
  });

  // Delete User Modal
  const deleteModal = container.querySelector('#delete-user-modal');
  container.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const user = db.getUsers().find(u => u.id === id);
      if (!user) return;

      const currentAdmin = auth.getCurrentUser();
      if (currentAdmin && currentAdmin.id === user.id) {
        alert('You cannot delete your currently active administrator account.');
        return;
      }

      container.querySelector('#del-user-target-id').value = user.id;
      container.querySelector('#del-user-name').textContent = user.full_name;
      container.querySelector('#del-user-id').textContent = user.user_id;
      container.querySelector('#del-user-role').textContent = `${user.role} (${user.department})`;
      deleteModal.classList.add('show');
    });
  });

  container.querySelector('#close-delete-modal')?.addEventListener('click', () => deleteModal?.classList.remove('show'));
  container.querySelector('#cancel-delete-modal')?.addEventListener('click', () => deleteModal?.classList.remove('show'));
  container.querySelector('#btn-confirm-delete-user')?.addEventListener('click', () => {
    const id = container.querySelector('#del-user-target-id').value;
    const res = auth.adminDeleteUser(id);
    if (res.success) {
      alert(res.message);
      deleteModal.classList.remove('show');
      renderAdminView(container, 'admin-users');
    } else {
      alert(res.message);
    }
  });
}

function openUserModal(container, user = null) {
  const modal = container.querySelector('#user-modal');
  const title = container.querySelector('#user-modal-title');
  const form = container.querySelector('#user-form');
  const tempPwdGroup = container.querySelector('#form-group-temppwd');
  const errorBox = container.querySelector('#user-modal-error');

  errorBox.style.display = 'none';

  if (user) {
    title.textContent = `Edit User Account: ${user.user_id}`;
    container.querySelector('#edit-user-db-id').value = user.id;
    container.querySelector('#u-fullname').value = user.full_name;
    container.querySelector('#u-empid').value = user.employee_id || '';
    container.querySelector('#u-userid').value = user.user_id;
    container.querySelector('#u-userid').readOnly = true;
    container.querySelector('#u-email').value = user.email;
    container.querySelector('#u-phone').value = user.phone || '';
    container.querySelector('#u-role').value = user.role;
    container.querySelector('#u-dept').value = user.department;
    container.querySelector('#u-lab').value = user.lab || '';
    container.querySelector('#u-status').value = user.status;
    if (tempPwdGroup) tempPwdGroup.style.display = 'none';
    container.querySelector('#btn-save-user-account').textContent = 'Save Changes';
  } else {
    title.textContent = 'Create Institutional User Account';
    form.reset();
    container.querySelector('#edit-user-db-id').value = '';
    container.querySelector('#u-userid').readOnly = false;
    container.querySelector('#u-temppwd').value = 'Temp@123';
    if (tempPwdGroup) tempPwdGroup.style.display = 'block';
    container.querySelector('#btn-save-user-account').textContent = 'Create User Account';
  }

  container.querySelector('#close-user-modal')?.addEventListener('click', () => modal.classList.remove('show'));
  container.querySelector('#cancel-user-modal')?.addEventListener('click', () => modal.classList.remove('show'));
  container.querySelector('#btn-generate-temp-pwd')?.addEventListener('click', () => {
    container.querySelector('#u-temppwd').value = generateTemporaryPassword();
  });

  form.onsubmit = (e) => {
    e.preventDefault();
    const editId = container.querySelector('#edit-user-db-id').value;

    const payload = {
      full_name: container.querySelector('#u-fullname').value.trim(),
      employee_id: container.querySelector('#u-empid').value.trim(),
      user_id: container.querySelector('#u-userid').value.trim(),
      email: container.querySelector('#u-email').value.trim(),
      phone: container.querySelector('#u-phone').value.trim(),
      role: container.querySelector('#u-role').value,
      department: container.querySelector('#u-dept').value.trim(),
      lab: container.querySelector('#u-lab').value.trim(),
      status: container.querySelector('#u-status').value,
      temporaryPassword: container.querySelector('#u-temppwd')?.value.trim() || 'Temp@123'
    };

    if (editId) {
      const res = auth.adminUpdateUser(editId, payload);
      if (res.success) {
        alert(`User ${res.user.user_id} updated successfully.`);
        modal.classList.remove('show');
        renderAdminView(container, 'admin-users');
      } else {
        errorBox.textContent = res.message;
        errorBox.style.display = 'block';
      }
    } else {
      const res = auth.adminCreateUser(payload);
      if (res.success) {
        modal.classList.remove('show');
        // Show Credentials Modal
        const credModal = container.querySelector('#temp-credentials-modal');
        container.querySelector('#cred-name').textContent = res.user.full_name;
        container.querySelector('#cred-userid').textContent = res.user.user_id;
        container.querySelector('#cred-password').textContent = res.temporaryPassword;
        credModal.classList.add('show');

        container.querySelector('#close-temp-modal')?.addEventListener('click', () => {
          credModal.classList.remove('show');
          renderAdminView(container, 'admin-users');
        });
        container.querySelector('#btn-dismiss-temp-modal')?.addEventListener('click', () => {
          credModal.classList.remove('show');
          renderAdminView(container, 'admin-users');
        });
        container.querySelector('#btn-copy-credentials')?.addEventListener('click', () => {
          const text = `IFET CMMS Credentials\nStaff Name: ${res.user.full_name}\nUser ID: ${res.user.user_id}\nTemporary Password: ${res.temporaryPassword}`;
          navigator.clipboard.writeText(text);
          alert('Credentials copied to clipboard!');
        });
      } else {
        errorBox.textContent = res.message;
        errorBox.style.display = 'block';
      }
    }
  };

  modal.classList.add('show');
}

// Department Tab Actions
function initDepartmentsTabListeners(container) {
  container.querySelector('#btn-open-create-dept-modal')?.addEventListener('click', () => {
    openDeptModal(container, null);
  });

  // Edit Dept
  container.querySelectorAll('.btn-edit-dept').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const dept = db.getDepartments().find(d => d.id === id);
      if (dept) openDeptModal(container, dept);
    });
  });

  // Toggle Dept Status
  container.querySelectorAll('.btn-toggle-dept-status').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      db.toggleDepartmentStatus(id);
      renderAdminView(container, 'admin-departments');
    });
  });
}

function openDeptModal(container, dept = null) {
  const modal = container.querySelector('#dept-modal');
  const title = container.querySelector('#dept-modal-title');
  const form = container.querySelector('#dept-form');

  if (dept) {
    title.textContent = `Edit Department: ${dept.name}`;
    container.querySelector('#edit-dept-id').value = dept.id;
    container.querySelector('#dept-name-input').value = dept.name;
    container.querySelector('#dept-code-input').value = dept.code;
    container.querySelector('#dept-block-input').value = dept.block || '';
    container.querySelector('#dept-status-input').value = dept.status;
  } else {
    title.textContent = 'Add Academic / Maintenance Department';
    form.reset();
    container.querySelector('#edit-dept-id').value = '';
  }

  container.querySelector('#close-dept-modal')?.addEventListener('click', () => modal.classList.remove('show'));
  container.querySelector('#cancel-dept-modal')?.addEventListener('click', () => modal.classList.remove('show'));

  form.onsubmit = (e) => {
    e.preventDefault();
    const editId = container.querySelector('#edit-dept-id').value;
    const name = container.querySelector('#dept-name-input').value.trim();
    const code = container.querySelector('#dept-code-input').value.trim();
    const block = container.querySelector('#dept-block-input').value.trim();
    const status = container.querySelector('#dept-status-input').value;

    if (editId) {
      const res = db.updateDepartment(editId, { name, code, block, status });
      if (res.success) {
        alert(`Department "${res.department.name}" updated successfully.`);
        modal.classList.remove('show');
        renderAdminView(container, 'admin-departments');
      } else {
        alert(res.message);
      }
    } else {
      const res = db.addDepartment({ name, code, block, status });
      if (res.success) {
        alert(`Department "${res.department.name}" added successfully.`);
        modal.classList.remove('show');
        renderAdminView(container, 'admin-departments');
      } else {
        alert(res.message);
      }
    }
  };

  modal.classList.add('show');
}

// Requests Filter Toolbar Listeners
function initRequestsTabListeners(container) {
  const searchInput = container.querySelector('#req-filter-search');
  const deptFilter = container.querySelector('#req-filter-dept');
  const catFilter = container.querySelector('#req-filter-cat');
  const statusFilter = container.querySelector('#req-filter-status');
  const prioFilter = container.querySelector('#req-filter-prio');
  const tbody = container.querySelector('#admin-requests-tbody');
  const countText = container.querySelector('#req-filtered-count-text');
  const resetBtn = container.querySelector('#btn-reset-req-filters');

  const filterRequests = () => {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const dept = deptFilter?.value || '';
    const cat = catFilter?.value || '';
    const status = statusFilter?.value || '';
    const prio = prioFilter?.value || '';

    let list = db.getRequests();
    if (q) {
      list = list.filter(r => r.request_id.toLowerCase().includes(q) || r.problem_title.toLowerCase().includes(q) || r.created_by_name.toLowerCase().includes(q) || r.lab_name.toLowerCase().includes(q));
    }
    if (dept) {
      list = list.filter(r => (r.department || '').toLowerCase() === dept.toLowerCase());
    }
    if (cat) {
      list = list.filter(r => r.category === cat);
    }
    if (status) {
      list = list.filter(r => r.status === status);
    }
    if (prio) {
      list = list.filter(r => r.priority === prio);
    }

    if (tbody) {
      tbody.innerHTML = renderMasterRequestsRows(list);
    }
    if (countText) {
      countText.innerHTML = `Showing <strong>${list.length}</strong> matching maintenance requests`;
    }
  };

  searchInput?.addEventListener('input', filterRequests);
  deptFilter?.addEventListener('change', filterRequests);
  catFilter?.addEventListener('change', filterRequests);
  statusFilter?.addEventListener('change', filterRequests);
  prioFilter?.addEventListener('change', filterRequests);

  resetBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (deptFilter) deptFilter.value = '';
    if (catFilter) catFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (prioFilter) prioFilter.value = '';
    filterRequests();
  });
}

// Reports Visualizations
function initReportsTabListeners(container, requests, departments) {
  const exportBtn = container.querySelector('#btn-admin-export-csv');
  const printBtn = container.querySelector('#btn-admin-print-report');

  exportBtn?.addEventListener('click', () => {
    exportMasterCSV(requests);
  });

  printBtn?.addEventListener('click', () => {
    window.print();
  });

  if (typeof Chart === 'undefined' || requests.length === 0) return;

  setTimeout(() => {
    // 1. Dept breakdown
    const ctxDept = container.querySelector('#report-chart-dept');
    if (ctxDept) {
      const labels = departments.map(d => d.code);
      const counts = departments.map(d => requests.filter(r => (r.department || '').toLowerCase() === d.name.toLowerCase()).length);

      new Chart(ctxDept, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Requests by Department',
            data: counts,
            backgroundColor: '#8B9C1E',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // 2. Category
    const ctxCat = container.querySelector('#report-chart-cat');
    if (ctxCat) {
      new Chart(ctxCat, {
        type: 'doughnut',
        data: {
          labels: ['Civil', 'Electrical', 'Furniture', 'Computer'],
          datasets: [{
            data: [
              requests.filter(r => r.category === 'Civil').length,
              requests.filter(r => r.category === 'Electrical').length,
              requests.filter(r => r.category === 'Furniture').length,
              requests.filter(r => r.category === 'Computer').length
            ],
            backgroundColor: ['#f59e0b', '#8B9C1E', '#8b5cf6', '#06b6d4']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 3. Status
    const ctxStatus = container.querySelector('#report-chart-status');
    if (ctxStatus) {
      new Chart(ctxStatus, {
        type: 'pie',
        data: {
          labels: ['Pending Review', 'In Progress / Assigned', 'Completed', 'Rejected'],
          datasets: [{
            data: [
              requests.filter(r => r.status.startsWith('Pending')).length,
              requests.filter(r => r.status === 'Work In Progress' || r.status.startsWith('Assigned') || r.status.startsWith('Accepted')).length,
              requests.filter(r => r.status === 'Work Completed' || r.status === 'Closed').length,
              requests.filter(r => r.status.startsWith('Rejected')).length
            ],
            backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 4. Priority
    const ctxPrio = container.querySelector('#report-chart-prio');
    if (ctxPrio) {
      new Chart(ctxPrio, {
        type: 'bar',
        data: {
          labels: ['Low', 'Medium', 'High', 'Emergency'],
          datasets: [{
            label: 'Priority Breakdown',
            data: [
              requests.filter(r => r.priority === 'Low').length,
              requests.filter(r => r.priority === 'Medium').length,
              requests.filter(r => r.priority === 'High').length,
              requests.filter(r => r.priority === 'Emergency').length
            ],
            backgroundColor: ['#0284c7', '#8B9C1E', '#ea580c', '#dc2626'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  }, 100);
}

// Audit Tab Filter
function initAuditTabListeners(container) {
  const searchInput = container.querySelector('#audit-search-input');
  const actionFilter = container.querySelector('#audit-filter-action');
  const tbody = container.querySelector('#admin-audit-tbody');

  const filterLogs = () => {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const action = actionFilter?.value || '';

    let list = db.getAuditLogs();
    if (q) {
      list = list.filter(l => (l.details || '').toLowerCase().includes(q) || (l.user_name || '').toLowerCase().includes(q) || (l.request_id || '').toLowerCase().includes(q));
    }
    if (action) {
      list = list.filter(l => l.action === action);
    }

    if (tbody) {
      tbody.innerHTML = renderAuditTableRows(list);
    }
  };

  searchInput?.addEventListener('input', filterLogs);
  actionFilter?.addEventListener('change', filterLogs);
}

// Notifications Tab
function initNotificationsTabListeners(container) {
  container.querySelector('#btn-admin-mark-all-read')?.addEventListener('click', () => {
    const currentAdmin = auth.getCurrentUser();
    notificationsManager.markAllAsRead(currentAdmin.id);
    renderAdminView(container, 'admin-notifications');
  });
}

// System Health & Backup
function initSystemTabListeners(container) {
  container.querySelector('#btn-download-db-backup')?.addEventListener('click', () => {
    const backupData = {
      version: '2.4',
      timestamp: new Date().toISOString(),
      users: db.getUsers(),
      departments: db.getDepartments(),
      requests: db.getRequests(),
      approvals: db.getApprovals(),
      assignments: db.getAssignments(),
      work_updates: db.getWorkUpdates(),
      notifications: db.getNotifications(),
      audit_logs: db.getAuditLogs()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IFET_CMMS_DB_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const fileInput = container.querySelector('#input-restore-db-json');
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.users) db.saveUsers(data.users);
        if (data.departments) db.saveDepartments(data.departments);
        if (data.requests) db.saveRequests(data.requests);
        if (data.approvals) db.saveApprovals(data.approvals);
        if (data.assignments) db.saveAssignments(data.assignments);
        if (data.work_updates) db.saveWorkUpdates(data.work_updates);
        if (data.notifications) db.saveNotifications(data.notifications);
        if (data.audit_logs) db.saveAuditLogs(data.audit_logs);

        alert('Database restored successfully from JSON backup!');
        renderAdminView(container, 'admin-dashboard');
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  });
}

function initWorkflowTabListeners(container) {
  // Can attach quick inspect modals
}

// Helpers
function getStatusBadgeClass(status) {
  if (status.startsWith('Pending')) return 'badge-pending';
  if (status.startsWith('Approved') || status === 'Work Completed' || status === 'Closed') return 'badge-approved';
  if (status.startsWith('Rejected')) return 'badge-rejected';
  if (status === 'Work In Progress' || status.startsWith('Accepted')) return 'badge-progress';
  if (status.startsWith('Assigned')) return 'badge-assigned';
  return 'badge-draft';
}

function getCurrentStageTitle(status, category) {
  if (status === 'Pending Lab In-Charge') return 'Lab In-Charge Review';
  if (status === 'Pending HOD') return 'HOD Approval';
  if (status === 'Pending HR') return 'HR Category Routing';
  if (status === 'Assigned to Department') return `${category} In-Charge`;
  if (status === 'Accepted by Department') return 'Accepted by Dept';
  if (status === 'Work In Progress') return 'Work in Progress';
  if (status === 'Work Completed' || status === 'Closed') return 'Completed';
  if (status.startsWith('Rejected')) return 'Returned / Rejected';
  return status;
}

function getStepperBg(s) {
  if (s === 'completed') return '#d1fae5';
  if (s === 'active') return '#fef3c7';
  if (s === 'rejected') return '#fee2e2';
  return 'var(--bg-section-alt)';
}

function getStepperBorder(s) {
  if (s === 'completed') return '#059669';
  if (s === 'active') return '#d97706';
  if (s === 'rejected') return '#dc2626';
  return 'var(--border-color)';
}

function getStepperColor(s) {
  if (s === 'completed') return '#065f46';
  if (s === 'active') return '#92400e';
  if (s === 'rejected') return '#991b1b';
  return 'var(--text-muted)';
}

function getStepperStatusText(s) {
  if (s === 'completed') return '✓ Approved / Done';
  if (s === 'active') return '● Current Stage';
  if (s === 'rejected') return '✕ Rejected';
  return '○ Pending';
}

function exportMasterCSV(requests) {
  const headers = ['Request ID', 'Originating Department', 'Lab Name', 'Building', 'Room', 'Problem Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Submission Date'];
  const rows = requests.map(r => [
    `"${r.request_id}"`,
    `"${r.department || 'General'}"`,
    `"${r.lab_name}"`,
    `"${r.building}"`,
    `"${r.room_number}"`,
    `"${r.problem_title.replace(/"/g, '""')}"`,
    `"${r.category}"`,
    `"${r.priority}"`,
    `"${r.status}"`,
    `"${r.created_by_name}"`,
    `"${new Date(r.created_at).toLocaleString()}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `IFET_CMMS_Admin_Master_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
