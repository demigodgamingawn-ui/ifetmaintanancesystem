// src/js/app.js - Main Application Shell, Global RBAC Router & Multi-Page View Engine

import { auth } from './auth.js';
import { db } from './db.js';
import { notificationsManager } from './notifications.js';

import { renderHomeView } from './views/homeView.js';
import { renderLoginView } from './views/loginView.js';
import { renderAdminView } from './views/adminView.js';
import { renderLabAssistantView } from './views/labAssistantView.js';
import { renderLabChargeView } from './views/labChargeView.js';
import { renderHODView } from './views/hodView.js';
import { renderHRView } from './views/hrView.js';
import { renderDeptView } from './views/deptView.js';
import { renderTrackingView } from './views/trackingView.js';
import { renderReportsView } from './views/reportsView.js';

class App {
  constructor() {
    this.container = document.getElementById('app-container');
    this.init();
  }

  async init() {
    await db.ready();
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();
  }

  normalizeRoute(hashOrPath) {
    let clean = (hashOrPath || '').replace(/^#\/?/, '').replace(/^\//, '').split('?')[0];

    const aliasMap = {
      '': 'home',
      'admin/dashboard': 'admin-dashboard',
      'admin/users': 'admin-users',
      'admin/departments': 'admin-departments',
      'admin/requests': 'admin-requests',
      'admin/workflow': 'admin-workflow',
      'admin/reports': 'admin-reports',
      'admin/audit': 'admin-audit',
      'admin/notifications': 'admin-notifications',
      'admin/system': 'admin-system',
      'admin/profile': 'admin-profile',
      'staff/lab-assistant/dashboard': 'lab-assistant-dashboard',
      'staff/lab-incharge/dashboard': 'lab-charge-dashboard',
      'staff/lab-charge/dashboard': 'lab-charge-dashboard',
      'hod/dashboard': 'hod-dashboard',
      'hr/dashboard': 'hr-dashboard',
      'department/civil/dashboard': 'civil-dashboard',
      'department/electrical/dashboard': 'electrical-dashboard',
      'department/furniture/dashboard': 'furniture-dashboard',
      'department/computer/dashboard': 'computer-dashboard'
    };

    return aliasMap[clean] || clean;
  }

  async handleRouting() {
    await db.sync();
    const user = auth.getCurrentUser();
    const rawHash = window.location.hash.slice(1) || '';
    const route = this.normalizeRoute(rawHash);

    // 1. Unauthenticated Visitor Routing or Pending First-Time Password Reset
    if (!user || !user.authenticated || user.must_change_password) {
      if (route === 'login') {
        this.renderDedicatedLoginState();
        return;
      }

      // Default unauthenticated view is the institutional Homepage
      this.renderInstitutionalHomeState();
      return;
    }

    // 2. Authenticated User Navigates to #login
    if (route === 'login') {
      const targetRoute = auth.getDashboardRouteForRole(user.role);
      window.location.hash = targetRoute;
      return;
    }

    // 3. Authenticated User Navigates to #home
    if (route === 'home' || route === '') {
      this.renderInstitutionalHomeState(true);
      return;
    }

    // 4. Role-Based Route Guarding (RBAC)
    if (!auth.canAccessRoute(route)) {
      const allowedDashboard = auth.getDashboardRouteForRole(user.role);
      this.showToast(`Access Denied: You do not have permission to access '${route}'. Redirected to your dashboard.`, 'error');
      window.location.hash = allowedDashboard;
      this.renderAuthenticatedShell(user, allowedDashboard);
      return;
    }

    const defaultRoute = auth.getDashboardRouteForRole(user.role);
    this.renderAuthenticatedShell(user, route || defaultRoute);
  }

  showToast(message, type = 'info') {
    const existing = document.querySelector('.app-global-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `app-global-toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'error' ? '🚫' : type === 'warning' ? '⚠️' : '✓'}</span>
        <span class="toast-msg">${message}</span>
      </div>
      <button class="toast-close-btn">&times;</button>
    `;

    document.body.appendChild(toast);
    toast.querySelector('.toast-close-btn').addEventListener('click', () => toast.remove());

    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  }

  renderInstitutionalHomeState(isAuthenticated = false) {
    this.container.innerHTML = '';
    renderHomeView(this.container);

    if (isAuthenticated) {
      const user = auth.getCurrentUser();
      const loginNavBtn = this.container.querySelector('.btn-nav-login');
      if (loginNavBtn && user) {
        const dashboardRoute = auth.getDashboardRouteForRole(user.role);
        loginNavBtn.href = `#${dashboardRoute}`;
        loginNavBtn.innerHTML = `<span>My ${user.role} Portal &rarr;</span>`;
      }
    }
  }

  renderDedicatedLoginState() {
    this.container.innerHTML = '';
    renderLoginView(this.container, (loggedInUser, targetRoute) => {
      const routeToOpen = targetRoute || auth.getDashboardRouteForRole(loggedInUser.role);
      window.location.hash = routeToOpen;
    });
  }

  renderAuthenticatedShell(user, route) {
    const unreadNotifCount = notificationsManager.getUnreadCount(user.id);
    const notifications = notificationsManager.getUserNotifications(user.id);

    this.container.innerHTML = `
      <div class="app-layout-root">
        <!-- Sidebar Navigation -->
        <aside class="sidebar" id="app-sidebar">
          <div class="sidebar-header">
            <a href="#${auth.getDashboardRouteForRole(user.role)}" class="sidebar-brand-link">
              <img src="./src/assets/ifet_logo.png" alt="IFET Logo" class="sidebar-logo-img" onerror="this.onerror=null; this.src='./src/assets/ifet_logo.svg';" />
              <div class="sidebar-brand-info">
                <span class="sidebar-brand-title">IFET CMMS</span>
                <span class="sidebar-brand-sub">Maintenance Cell</span>
              </div>
            </a>
            <button class="sidebar-close-mobile-btn" id="btn-close-sidebar" aria-label="Close Navigation">
              &times;
            </button>
          </div>

          <div class="sidebar-role-indicator">
            <span class="role-pill-dot"></span>
            <span class="role-pill-text">${user.role}</span>
          </div>

          <div class="sidebar-nav">
            ${this.renderSidebarItemsForRole(user.role, route)}
          </div>

          <div class="sidebar-footer">
            <div class="user-mini-profile" id="btn-open-profile-mini" title="Click to view full profile">
              <div class="user-avatar">${user.full_name.charAt(0)}</div>
              <div class="user-details">
                <span class="user-name">${user.full_name}</span>
                <span class="user-role-badge">${user.user_id} • ${user.role}</span>
              </div>
            </div>
            <button id="btn-logout" title="Sign Out from Portal" class="btn-logout-icon" aria-label="Sign Out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </aside>

        <!-- Main Workspace Shell -->
        <div class="main-wrapper">
          <header class="top-header">
            <div class="top-header-left">
              <button class="btn-hamburger" id="btn-toggle-sidebar" aria-label="Toggle Sidebar Menu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div class="page-header-title">
                <h2 class="page-title">${this.getRouteTitle(route, user.role)}</h2>
                <div class="page-breadcrumb">
                  <a href="#home" style="text-decoration: none; color: inherit;">Home</a> &rsaquo; <span>${user.role}</span> &rsaquo; <strong class="breadcrumb-active">${route}</strong>
                </div>
              </div>
            </div>

            <div class="header-actions">
              <a href="#home" class="btn btn-outline desktop-only" style="font-size: 12px; padding: 6px 12px; text-decoration: none;">
                🏛️ Public Home
              </a>

              <div class="status-indicator-pill desktop-only" title="Server Status">
                <span class="pulse-dot"></span>
                <span>ONLINE</span>
              </div>

              <!-- Profile Button -->
              <button class="btn-header-profile" id="btn-header-profile" title="View Profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span class="desktop-only">${user.full_name.split(' ')[0]}</span>
              </button>

              <!-- Notification Bell Dropdown -->
              <div style="position: relative;">
                <button class="notif-bell-btn" id="btn-notif-toggle" title="Notifications" aria-label="Notifications">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  ${unreadNotifCount > 0 ? `<span class="notif-badge-count">${unreadNotifCount}</span>` : ''}
                </button>

                <!-- Notification Dropdown Menu -->
                <div class="notif-dropdown-menu" id="notif-dropdown">
                  <div class="notif-header">
                    <h4>Notifications (${unreadNotifCount} Unread)</h4>
                    <button id="btn-mark-all-read" class="btn-mark-read">Mark all read</button>
                  </div>
                  <div class="notif-list">
                    ${notifications.length === 0 ? '<div class="notif-empty-state">No new notifications.</div>' : notifications.map(n => `
                      <div class="notif-item ${n.is_read ? '' : 'unread'}" data-reqid="${n.request_id}">
                        <div class="notif-item-title">${n.title}</div>
                        <div class="notif-item-msg">${n.message}</div>
                        <div class="notif-item-time">${new Date(n.created_at).toLocaleString()}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main class="main-content" id="view-content-root">
            <!-- Dynamic Sub View Rendered Here -->
          </main>
        </div>
      </div>

      <!-- User Profile Modal -->
      <div class="modal-backdrop" id="user-profile-modal">
        <div class="modal-content" style="max-width: 550px;">
          <div class="modal-header">
            <h3 class="modal-title">Authenticated User Profile</h3>
            <button class="modal-close-btn" id="close-profile-modal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="profile-card-header-view">
              <div class="profile-big-avatar">${user.full_name.charAt(0)}</div>
              <div>
                <h3 class="profile-header-name">${user.full_name}</h3>
                <div class="profile-header-role">${user.role} • ${user.department || 'General'}</div>
              </div>
            </div>

            <div class="profile-details-grid">
              <div class="profile-detail-item">
                <span class="profile-detail-label">Employee ID</span>
                <span class="profile-detail-value">${user.employee_id || user.user_id.toUpperCase()}</span>
              </div>
              <div class="profile-detail-item">
                <span class="profile-detail-label">User ID (Login Username)</span>
                <span class="profile-detail-value">${user.user_id}</span>
              </div>
              <div class="profile-detail-item">
                <span class="profile-detail-label">Official Email</span>
                <span class="profile-detail-value">${user.email}</span>
              </div>
              <div class="profile-detail-item">
                <span class="profile-detail-label">Contact Phone</span>
                <span class="profile-detail-value">${user.phone || '+91 98765 00000'}</span>
              </div>
              <div class="profile-detail-item">
                <span class="profile-detail-label">Assigned Department</span>
                <span class="profile-detail-value">${user.department || 'Engineering & Technology'}</span>
              </div>
              <div class="profile-detail-item">
                <span class="profile-detail-label">Lab / Work Location</span>
                <span class="profile-detail-value">${user.lab || 'Main Campus'}</span>
              </div>
              <div class="profile-detail-item">
                <span class="profile-detail-label">Account Status</span>
                <span class="badge badge-approved"><span class="badge-dot"></span> ${user.status || 'Active'}</span>
              </div>
              <div class="profile-detail-item">
                <span class="profile-detail-label">Portal Access Level</span>
                <span class="badge badge-assigned">Role: ${user.role}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-close-profile-footer">Close</button>
            <button type="button" class="btn btn-primary" id="btn-profile-logout">Sign Out</button>
          </div>
        </div>
      </div>
    `;

    // Logout Handlers
    const logoutAction = () => {
      auth.logout();
      window.location.hash = 'home';
      this.handleRouting();
    };

    this.container.querySelector('#btn-logout').addEventListener('click', logoutAction);
    this.container.querySelector('#btn-profile-logout')?.addEventListener('click', logoutAction);

    // Profile Modal Handlers
    const profileModal = this.container.querySelector('#user-profile-modal');
    const openProfile = () => profileModal.classList.add('show');
    const closeProfile = () => profileModal.classList.remove('show');

    this.container.querySelector('#btn-open-profile-mini')?.addEventListener('click', openProfile);
    this.container.querySelector('#btn-header-profile')?.addEventListener('click', openProfile);
    this.container.querySelector('#close-profile-modal')?.addEventListener('click', closeProfile);
    this.container.querySelector('#btn-close-profile-footer')?.addEventListener('click', closeProfile);

    // Mobile Hamburger Sidebar Toggle
    const sidebar = this.container.querySelector('#app-sidebar');
    const toggleSidebarBtn = this.container.querySelector('#btn-toggle-sidebar');
    const closeSidebarBtn = this.container.querySelector('#btn-close-sidebar');

    if (toggleSidebarBtn && sidebar) {
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar-mobile-open');
      });
    }

    if (closeSidebarBtn && sidebar) {
      closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('sidebar-mobile-open');
      });
    }

    // Notification Dropdown Toggle
    const notifBtn = this.container.querySelector('#btn-notif-toggle');
    const notifDropdown = this.container.querySelector('#notif-dropdown');
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => notifDropdown.classList.remove('show'));

    this.container.querySelector('#btn-mark-all-read').addEventListener('click', (e) => {
      e.stopPropagation();
      notificationsManager.markAllAsRead(user.id);
      this.renderAuthenticatedShell(user, route);
    });

    // Handle Notification item clicks -> Navigate to tracking page
    this.container.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const reqId = item.getAttribute('data-reqid');
        if (reqId) {
          window.location.hash = `tracking?id=${reqId}`;
        }
      });
    });

    // Render Sub View based on Role and Route
    const viewRoot = this.container.querySelector('#view-content-root');
    this.renderSubView(viewRoot, user, route);
  }

  renderSubView(viewRoot, user, route) {
    const rawRoute = route.split('?')[0];

    if (rawRoute.startsWith('tracking')) {
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const reqId = urlParams.get('id');
      renderTrackingView(viewRoot, reqId);
      return;
    }

    if (rawRoute === 'reports') {
      renderReportsView(viewRoot);
      return;
    }

    // Role-Specific Renderers
    switch (user.role) {
      case 'Admin':
        renderAdminView(viewRoot, rawRoute);
        break;
      case 'Lab Assistant':
        renderLabAssistantView(viewRoot, user, rawRoute);
        break;
      case 'Lab In-Charge':
        renderLabChargeView(viewRoot, user);
        break;
      case 'HOD':
        renderHODView(viewRoot, user);
        break;
      case 'HR':
        renderHRView(viewRoot, user);
        break;
      case 'Civil In-Charge':
      case 'Electrical In-Charge':
      case 'Furniture In-Charge':
      case 'Computer In-Charge':
        renderDeptView(viewRoot, user);
        break;
      default:
        this.renderDedicatedLoginState();
        break;
    }
  }

  renderSidebarItemsForRole(role, currentRoute) {
    const itemsMap = {
      'Admin': [
        { label: 'Admin Dashboard', hash: 'admin-dashboard', icon: 'grid' },
        { label: 'User Accounts', hash: 'admin-users', icon: 'users' },
        { label: 'Departments', hash: 'admin-departments', icon: 'layers' },
        { label: 'Maintenance Requests', hash: 'admin-requests', icon: 'file-text' },
        { label: 'Workflow Monitor', hash: 'admin-workflow', icon: 'git-pull-request' },
        { label: 'Reports & Analytics', hash: 'admin-reports', icon: 'bar-chart' },
        { label: 'Audit Logs', hash: 'admin-audit', icon: 'shield' },
        { label: 'Notifications', hash: 'admin-notifications', icon: 'bell' },
        { label: 'System Settings', hash: 'admin-system', icon: 'cpu' }
      ],
      'Lab Assistant': [
        { label: 'My Dashboard', hash: 'lab-assistant-dashboard', icon: 'grid' },
        { label: 'New Request', hash: 'new-request', icon: 'plus-circle' },
        { label: 'My Requests', hash: 'my-requests', icon: 'file-text' },
        { label: 'Track Requests', hash: 'tracking', icon: 'activity' }
      ],
      'Lab In-Charge': [
        { label: 'Review Dashboard', hash: 'lab-charge-dashboard', icon: 'grid' },
        { label: 'Pending Approvals', hash: 'pending-approvals', icon: 'check-square' },
        { label: 'Track Requests', hash: 'tracking', icon: 'activity' }
      ],
      'HOD': [
        { label: 'HOD Dashboard', hash: 'hod-dashboard', icon: 'grid' },
        { label: 'Approval Queue', hash: 'pending-approvals', icon: 'check-circle' },
        { label: 'Dept Reports', hash: 'reports', icon: 'bar-chart' },
        { label: 'Track Requests', hash: 'tracking', icon: 'activity' }
      ],
      'HR': [
        { label: 'HR Routing Hub', hash: 'hr-dashboard', icon: 'grid' },
        { label: 'Category Matrix', hash: 'dept-assignment', icon: 'share-2' },
        { label: 'System Reports', hash: 'reports', icon: 'bar-chart' },
        { label: 'Track Requests', hash: 'tracking', icon: 'activity' }
      ],
      'Civil In-Charge': [
        { label: 'Civil Dashboard', hash: 'civil-dashboard', icon: 'grid' },
        { label: 'Track Requests', hash: 'tracking', icon: 'activity' }
      ],
      'Electrical In-Charge': [
        { label: 'Electrical Dashboard', hash: 'electrical-dashboard', icon: 'grid' },
        { label: 'Track Requests', hash: 'tracking', icon: 'activity' }
      ],
      'Furniture In-Charge': [
        { label: 'Furniture Dashboard', hash: 'furniture-dashboard', icon: 'grid' },
        { label: 'Track Requests', hash: 'tracking', icon: 'activity' }
      ],
      'Computer In-Charge': [
        { label: 'Computer Dashboard', hash: 'computer-dashboard', icon: 'grid' },
        { label: 'Track Requests', hash: 'tracking', icon: 'activity' }
      ]
    };

    const items = itemsMap[role] || [];
    return items.map(item => `
      <a href="#${item.hash}" class="nav-item ${currentRoute === item.hash ? 'active' : ''}">
        ${this.getIconSVG(item.icon)}
        <span>${item.label}</span>
      </a>
    `).join('');
  }

  getRouteTitle(route, role) {
    if (route.startsWith('tracking')) return 'Interactive Request Tracking & Lifecycle Timeline';
    if (route === 'reports' || route === 'admin-reports') return 'System Reports, Performance Metrics & Export';
    if (route === 'admin-dashboard') return 'Enterprise Admin Control Portal & Real-Time Overview';
    if (route === 'admin-users') return 'Institutional User Accounts Management & Security';
    if (route === 'admin-departments') return 'Institutional Academic & Maintenance Departments';
    if (route === 'admin-requests') return 'Maintenance Requests Master Registry & Filters';
    if (route === 'admin-workflow') return 'Live Multi-Tier Approval Workflow Monitor';
    if (route === 'admin-audit') return 'System Security Audit Trail & Activity Logs';
    if (route === 'admin-notifications') return 'Institutional Notification & Alert Center';
    if (route === 'admin-system') return 'System Health, Engine Status & Data Backups';
    if (route === 'admin-profile') return 'Administrator Profile & Security Credentials';
    return `${role} Control Portal`;
  }

  getIconSVG(name) {
    switch (name) {
      case 'grid': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
      case 'users': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
      case 'layers': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
      case 'file-text': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
      case 'git-pull-request': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`;
      case 'shield': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      case 'bell': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
      case 'cpu': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`;
      case 'plus-circle': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
      case 'check-square': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`;
      case 'check-circle': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
      case 'share-2': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
      case 'bar-chart': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`;
      case 'activity': return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
      default: return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    }
  }
}

// Initialize Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
