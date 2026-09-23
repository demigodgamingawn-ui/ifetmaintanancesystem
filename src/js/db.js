// src/js/db.js - Centralized Server Database Client for College Maintenance Management System

// Default fallback seed data if backend is momentarily initializing
const DEFAULT_USERS = [
  {
    id: 'usr-admin-1',
    full_name: 'Dr. K. Rajasekar',
    employee_id: 'EMP-ADM-001',
    user_id: 'admin001',
    email: 'admin@ifet.ac.in',
    phone: '+91 98765 43210',
    password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
    role: 'Admin',
    department: 'Administration',
    lab: 'Central Admin',
    status: 'Active',
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-lab-1',
    full_name: 'S. Ramanathan',
    employee_id: 'EMP-CSE-012',
    user_id: 'lab001',
    email: 'lab.assistant@ifet.ac.in',
    phone: '+91 98765 43211',
    password_hash: '38d58c8ecb2f76bdcb1d2aa3838dc2a11b51829e0618ff7abec034f1994eec99', // lab123
    role: 'Lab Assistant',
    department: 'Computer Science & Engineering',
    lab: 'CSE Lab 2 - AI & ML Lab',
    status: 'Active',
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-labcharge-1',
    full_name: 'Prof. M. Vijay',
    employee_id: 'EMP-CSE-005',
    user_id: 'labcharge001',
    email: 'labincharge@ifet.ac.in',
    phone: '+91 98765 43212',
    password_hash: '18e9bbce36f1cb68f8fb442f495147833a69a419fcda9f3adba9d3db9eb6e279', // charge123
    role: 'Lab In-Charge',
    department: 'Computer Science & Engineering',
    lab: 'CSE Lab 2 - AI & ML Lab',
    status: 'Active',
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-hod-1',
    full_name: 'Dr. P. Sundar',
    employee_id: 'EMP-HOD-001',
    user_id: 'hod001',
    email: 'hod.cse@ifet.ac.in',
    phone: '+91 98765 43213',
    password_hash: '1eeefc7e7b68673f45f062ab5fa2d5aa87f2e14856f6a73a65096530a597a7e8', // hod123
    role: 'HOD',
    department: 'Computer Science & Engineering',
    lab: 'CSE Department Main',
    status: 'Active',
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-hr-1',
    full_name: 'R. Meenakshi',
    employee_id: 'EMP-HR-002',
    user_id: 'hr001',
    email: 'hr@ifet.ac.in',
    phone: '+91 98765 43214',
    password_hash: '8fa545aef06ec20076a0fbda511394fccf5c1507ef15525ca0872620ca123df9', // hr123
    role: 'HR',
    department: 'Human Resources & Operations',
    lab: 'HR Office',
    status: 'Active',
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-civil-1',
    full_name: 'Er. A. Murugan',
    employee_id: 'EMP-CIV-008',
    user_id: 'civil001',
    email: 'civil.maint@ifet.ac.in',
    phone: '+91 98765 43215',
    password_hash: 'aa2fcbc2825d197e411b0e956bc959ab4d603a117d983fb082163b784cb58797', // civil123
    role: 'Civil In-Charge',
    department: 'Civil Maintenance',
    lab: 'Civil Operations',
    status: 'Active',
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-electrical-1',
    full_name: 'Er. K. Anbarasan',
    employee_id: 'EMP-EEE-004',
    user_id: 'electrical001',
    email: 'electrical.maint@ifet.ac.in',
    phone: '+91 98765 43216',
    password_hash: 'a54904bfbcbbad9c57cb848dd270e599b4d4b1a45749a9415c898863fceb94ae', // elec123
    role: 'Electrical In-Charge',
    department: 'Electrical Maintenance',
    lab: 'Electrical Substation',
    status: 'Active',
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-furniture-1',
    full_name: 'S. Karthik',
    employee_id: 'EMP-FRN-003',
    user_id: 'furniture001',
    email: 'furniture.maint@ifet.ac.in',
    phone: '+91 98765 43217',
    password_hash: '88a9df61cfa7fe32b13c77eb0c1692ae12398548174fb1c53e07e6ce54ef84a1', // furn123
    role: 'Furniture In-Charge',
    department: 'Furniture & Infrastructure',
    lab: 'Central Store Yard',
    status: 'Active',
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-computer-1',
    full_name: 'Er. V. Dinesh',
    employee_id: 'EMP-IT-007',
    user_id: 'computer001',
    email: 'it.maint@ifet.ac.in',
    phone: '+91 98765 43218',
    password_hash: '16d0014b1451f08c35398a6bb526ef68f3a3f5a549db6aa6d04ebcb99587428f', // comp123
    role: 'Computer In-Charge',
    department: 'IT Hardware & Network Services',
    lab: 'Central Server Room',
    status: 'Active',
    must_change_password: false,
    password_changed_at: new Date().toISOString(),
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_DEPARTMENTS = [
  { id: 'dept-cse', name: 'Computer Science & Engineering', code: 'CSE', block: 'APJ Abdul Kalam Block', status: 'Active', created_at: new Date().toISOString() },
  { id: 'dept-ece', name: 'Electronics & Communication Engineering', code: 'ECE', block: 'Sir MV Block', status: 'Active', created_at: new Date().toISOString() },
  { id: 'dept-eee', name: 'Electrical & Electronics Engineering', code: 'EEE', block: 'Edison Block', status: 'Active', created_at: new Date().toISOString() },
  { id: 'dept-mech', name: 'Mechanical Engineering', code: 'MECH', block: 'Mechanical Block', status: 'Active', created_at: new Date().toISOString() },
  { id: 'dept-it', name: 'Information Technology', code: 'IT', block: 'Tech Block', status: 'Active', created_at: new Date().toISOString() },
  { id: 'dept-aids', name: 'Artificial Intelligence & Data Science', code: 'AI&DS', block: 'Innovation Hub', status: 'Active', created_at: new Date().toISOString() },
  { id: 'dept-civil', name: 'Civil Engineering', code: 'CIVIL', block: 'Civil Workshop Block', status: 'Active', created_at: new Date().toISOString() },
  { id: 'dept-hr', name: 'Human Resources & Operations', code: 'HR', block: 'Main Admin Block', status: 'Active', created_at: new Date().toISOString() },
  { id: 'dept-adm', name: 'Administration', code: 'ADM', block: 'Central Admin Block', status: 'Active', created_at: new Date().toISOString() }
];

class Database {
  constructor() {
    // In-memory runtime state synced with central server
    this.state = {
      users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
      departments: JSON.parse(JSON.stringify(DEFAULT_DEPARTMENTS)),
      requests: [],
      approvals: [],
      assignments: [],
      work_updates: [],
      notifications: [],
      audit_logs: []
    };
    this.initialized = false;
    this.initPromise = this.sync();
  }

  // Synchronize state from Central Database Server
  async sync() {
    try {
      const res = await fetch('/api/db', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.db) {
          this.state.users = Array.isArray(data.db.users) ? data.db.users : [];
          this.state.departments = Array.isArray(data.db.departments) ? data.db.departments : [];
          this.state.requests = Array.isArray(data.db.requests) ? data.db.requests : [];
          this.state.approvals = Array.isArray(data.db.approvals) ? data.db.approvals : [];
          this.state.assignments = Array.isArray(data.db.assignments) ? data.db.assignments : [];
          this.state.work_updates = Array.isArray(data.db.work_updates) ? data.db.work_updates : [];
          this.state.notifications = Array.isArray(data.db.notifications) ? data.db.notifications : [];
          this.state.audit_logs = Array.isArray(data.db.audit_logs) ? data.db.audit_logs : [];
          this.initialized = true;
          return this.state;
        }
      }
    } catch (e) {
      console.warn('[Database] Network sync warning, using current cache:', e);
    }
    return this.state;
  }

  // Ensure DB has loaded initially
  async ready() {
    if (this.initialized) return this.state;
    return await this.initPromise;
  }

  // Reset central database to clean state
  async resetAll() {
    try {
      const res = await fetch('/api/db/reset', { method: 'POST' });
      if (res.ok) {
        await this.sync();
        return true;
      }
    } catch (e) {
      console.error('[Database] Reset failed:', e);
    }
    return false;
  }

  // --- Users API ---
  getUsers() {
    return (this.state.users || []).map(u => ({
      ...u,
      must_change_password: u.must_change_password ?? false
    }));
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id) || null;
  }

  getUserByUserId(userId) {
    if (!userId) return null;
    const clean = userId.toLowerCase().trim();
    return this.getUsers().find(u => u.user_id.toLowerCase() === clean || (u.email && u.email.toLowerCase() === clean)) || null;
  }

  async createUserAsync(userData) {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        await this.sync();
        return { success: true, user: data.user, temporary_password: data.temporary_password };
      }
      return { success: false, message: data.message || 'Failed to create user.' };
    } catch (e) {
      return { success: false, message: 'Server communication error: ' + e.message };
    }
  }

  async updateUserAsync(id, updates) {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.user) {
        await this.sync();
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Failed to update user.' };
    } catch (e) {
      return { success: false, message: 'Server communication error: ' + e.message };
    }
  }

  async deleteUserAsync(id) {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await this.sync();
        return { success: true, deletedUser: data.deletedUser };
      }
      return { success: false, message: data.message || 'Failed to delete user.' };
    } catch (e) {
      return { success: false, message: 'Server communication error: ' + e.message };
    }
  }

  async resetPasswordAsync(id) {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(id)}/reset-password`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        await this.sync();
        return {
          success: true,
          temporary_password: data.temporary_password || 'Temp@123',
          must_change_password: true
        };
      }
      return { success: false, message: data.message || 'Failed to reset password.' };
    } catch (e) {
      return { success: false, message: 'Server communication error: ' + e.message };
    }
  }

  // Synchronous wrappers for compatibility
  saveUsers(users) {
    this.state.users = users;
    // Push full sync asynchronously in background
    fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    }).catch(err => console.error('[Database] Sync error:', err));
  }

  deleteUser(id) {
    const index = this.state.users.findIndex(u => u.id === id);
    if (index !== -1) {
      const deleted = this.state.users.splice(index, 1)[0];
      this.deleteUserAsync(id);
      return deleted;
    }
    return null;
  }

  // --- Departments API ---
  getDepartments() {
    const depts = this.state.departments || [];
    return depts.length > 0 ? depts : DEFAULT_DEPARTMENTS;
  }

  saveDepartments(departments) {
    this.state.departments = departments;
    fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    }).catch(err => console.error('[Database] Sync error:', err));
  }

  async addDepartmentAsync(deptData) {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData)
      });
      const data = await res.json();
      if (data.success && data.department) {
        await this.sync();
        return { success: true, department: data.department };
      }
      return { success: false, message: data.message || 'Failed to add department.' };
    } catch (e) {
      return { success: false, message: 'Server communication error: ' + e.message };
    }
  }

  addDepartment({ name, code, block, status = 'Active' }) {
    if (!name || !name.trim()) return { success: false, message: 'Department Name is required.' };
    const depts = this.getDepartments();
    const cleanName = name.trim();
    if (depts.some(d => d.name.toLowerCase() === cleanName.toLowerCase())) {
      return { success: false, message: 'A department with this name already exists.' };
    }
    const newDept = {
      id: 'dept-' + Date.now(),
      name: cleanName,
      code: (code || cleanName.substring(0, 4)).toUpperCase().trim(),
      block: block || 'Main Campus Block',
      status: status || 'Active',
      created_at: new Date().toISOString()
    };
    this.state.departments.push(newDept);
    this.addDepartmentAsync({ name, code, block, status });
    return { success: true, department: newDept };
  }

  async updateDepartmentAsync(id, updates) {
    try {
      const res = await fetch(`/api/departments/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.department) {
        await this.sync();
        return { success: true, department: data.department };
      }
      return { success: false, message: data.message || 'Failed to update department.' };
    } catch (e) {
      return { success: false, message: 'Server communication error: ' + e.message };
    }
  }

  updateDepartment(id, { name, code, block, status }) {
    const dept = this.state.departments.find(d => d.id === id);
    if (!dept) return { success: false, message: 'Department not found.' };
    if (name && name.trim()) dept.name = name.trim();
    if (code && code.trim()) dept.code = code.trim().toUpperCase();
    if (block) dept.block = block.trim();
    if (status) dept.status = status;
    dept.updated_at = new Date().toISOString();
    this.updateDepartmentAsync(id, { name, code, block, status });
    return { success: true, department: dept };
  }

  async toggleDepartmentStatusAsync(id) {
    try {
      const res = await fetch(`/api/departments/${encodeURIComponent(id)}/toggle`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (data.success) {
        await this.sync();
        return data.department;
      }
    } catch (e) {
      console.error('[Database] Toggle department status failed:', e);
    }
    return null;
  }

  toggleDepartmentStatus(id) {
    const dept = this.state.departments.find(d => d.id === id);
    if (!dept) return null;
    dept.status = dept.status === 'Active' ? 'Disabled' : 'Active';
    dept.updated_at = new Date().toISOString();
    this.toggleDepartmentStatusAsync(id);
    return dept;
  }

  deleteDepartment(id) {
    const index = this.state.departments.findIndex(d => d.id === id);
    if (index !== -1) {
      const deleted = this.state.departments.splice(index, 1)[0];
      fetch(`/api/departments/${encodeURIComponent(id)}`, { method: 'DELETE' })
        .then(() => this.sync())
        .catch(err => console.error('[Database] Delete department error:', err));
      return deleted;
    }
    return null;
  }

  // --- Requests API ---
  getRequests() { return this.state.requests || []; }
  
  saveRequests(requests) {
    this.state.requests = requests;
    fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    }).catch(err => console.error('[Database] Sync error:', err));
  }

  async createRequestAsync(reqData) {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData)
      });
      const data = await res.json();
      if (data.success && data.request) {
        await this.sync();
        return { success: true, request: data.request };
      }
      return { success: false, message: data.message || 'Failed to create request.' };
    } catch (e) {
      return { success: false, message: 'Server communication error: ' + e.message };
    }
  }

  async updateRequestAsync(id, updates) {
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.request) {
        await this.sync();
        return { success: true, request: data.request };
      }
      return { success: false, message: data.message || 'Failed to update request.' };
    } catch (e) {
      return { success: false, message: 'Server communication error: ' + e.message };
    }
  }

  // --- Approvals, Assignments & Work Updates ---
  getApprovals() { return this.state.approvals || []; }
  saveApprovals(approvals) {
    this.state.approvals = approvals;
    fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    }).catch(err => console.error('[Database] Sync error:', err));
  }

  getAssignments() { return this.state.assignments || []; }
  saveAssignments(assignments) {
    this.state.assignments = assignments;
    fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    }).catch(err => console.error('[Database] Sync error:', err));
  }

  getWorkUpdates() { return this.state.work_updates || []; }
  saveWorkUpdates(updates) {
    this.state.work_updates = updates;
    fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    }).catch(err => console.error('[Database] Sync error:', err));
  }

  // --- Notifications API ---
  getNotifications() { return this.state.notifications || []; }
  saveNotifications(notifications) {
    this.state.notifications = notifications;
    fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    }).catch(err => console.error('[Database] Sync error:', err));
  }

  async markNotificationRead(id) {
    const notif = (this.state.notifications || []).find(n => n.id === id);
    if (notif) notif.read = true;
    try {
      await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' });
    } catch (e) {
      console.error('[Database] Read notification error:', e);
    }
  }

  async markAllNotificationsRead() {
    (this.state.notifications || []).forEach(n => { n.read = true; });
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT' });
    } catch (e) {
      console.error('[Database] Read all notifications error:', e);
    }
  }

  // --- Audit Logs API ---
  getAuditLogs() { return this.state.audit_logs || []; }
  saveAuditLogs(logs) {
    this.state.audit_logs = logs;
    fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    }).catch(err => console.error('[Database] Sync error:', err));
  }

  logAudit(userId, userName, role, requestId, action, oldStatus, newStatus, details) {
    const newLog = {
      id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      user_id: userId,
      user_name: userName,
      role: role,
      request_id: requestId,
      action: action,
      old_status: oldStatus,
      new_status: newStatus,
      details: details,
      timestamp: new Date().toISOString()
    };
    this.state.audit_logs.unshift(newLog);
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(err => console.error('[Database] Audit log error:', err));
    return newLog;
  }

  // --- Request ID Generator ---
  generateRequestId() {
    const requests = this.getRequests();
    const currentYear = new Date().getFullYear();
    const count = requests.length + 1;
    const padNum = String(count).padStart(4, '0');
    return `MR-${currentYear}-${padNum}`;
  }
}

export const db = new Database();
