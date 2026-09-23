// src/js/auth.js - Authentication & Session Management with Role-Based Access Control

import { db } from './db.js';

const SESSION_KEY = 'cmms_current_session';

// Secure SHA-256 Hashing Implementation (Deterministic & Salt-Free for Standard Auth Verification)
export function hashPassword(str) {
  if (typeof str !== 'string' || !str) return '';
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = str[lengthProperty] * 8;
  
  let hash = [];
  let k = [];
  let primeCounter = 0;

  const isPrime = (candidate) => {
    for (let n = 2; n * n <= candidate; n++) {
      if (candidate % n === 0) return false;
    }
    return true;
  };

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter++;
    }
  }

  str += '\x80';
  while ((str[lengthProperty] % 64) - 56) str += '\x00';
  for (i = 0; i < str[lengthProperty]; i++) {
    j = str.charCodeAt(i);
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const s1Main = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1Main + ch + k[i] + w[i]) | 0;
      const s0Main = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0Main + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (let b = 3; b >= 0; b--) {
      const byte = (hash[i] >> (b * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}

// Generate unique temporary password for newly created / reset accounts
export function generateTemporaryPassword() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randStr = '';
  for (let i = 0; i < 6; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TEMP@${randStr}`;
}

export class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
  }

  loadSession() {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      if (!data) return null;
      const session = JSON.parse(data);
      if (session && session.user_id && session.role) {
        return session;
      }
      return null;
    } catch (e) {
      console.error('Failed to parse current session', e);
      return null;
    }
  }

  saveSession(user) {
    const sessionData = {
      id: user.id,
      user_id: user.user_id,
      full_name: user.full_name,
      employee_id: user.employee_id || user.user_id.toUpperCase(),
      role: user.role,
      department: user.department || 'General',
      email: user.email,
      phone: user.phone || '',
      lab: user.lab || '',
      status: user.status,
      must_change_password: !!user.must_change_password,
      authenticated: true,
      last_login: new Date().toISOString()
    };
    this.currentUser = sessionData;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }

  clearSession() {
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
  }

  login(userIdOrEmail, password) {
    if (!userIdOrEmail || !password) {
      return { success: false, message: 'Please enter both User ID and Password.' };
    }

    const cleanInput = userIdOrEmail.toLowerCase().trim();
    const users = db.getUsers();
    
    // Find matching user by user_id or email
    const user = users.find(
      u => u.user_id.toLowerCase() === cleanInput || (u.email && u.email.toLowerCase() === cleanInput)
    );

    // 1. Check if user exists
    if (!user) {
      return { success: false, message: 'Invalid User ID or Password.' };
    }

    // 2. Check if account is disabled
    if (user.status === 'Disabled') {
      return { success: false, message: 'Your account is no longer active. Contact Administrator.' };
    }

    // 3. Verify password (check hashed password or legacy plain text)
    const inputHash = hashPassword(password);
    const isPasswordValid = (user.password_hash === inputHash) || (user.password_hash === password);

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid User ID or Password.' };
    }

    // Auto-upgrade legacy plain password to hash in DB if needed
    if (user.password_hash === password) {
      user.password_hash = inputHash;
    }

    // 4. Check if first-login password reset is required
    const mustChangePassword = !!user.must_change_password;

    if (mustChangePassword) {
      // Do NOT log the user into a full session yet
      return {
        success: true,
        mustChangePassword: true,
        tempUser: {
          id: user.id,
          user_id: user.user_id,
          full_name: user.full_name,
          role: user.role,
          department: user.department,
          email: user.email
        },
        redirectRoute: this.getDashboardRouteForRole(user.role),
        message: 'Temporary password verified. Please create your new permanent password.'
      };
    }

    // 5. Normal login workflow: update last login and establish session
    user.last_login = new Date().toISOString();
    db.saveUsers(users);

    this.saveSession(user);
    
    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      '-',
      'USER_LOGIN',
      '-',
      '-',
      `User ${user.user_id} (${user.role}) logged in successfully.`
    );

    return { 
      success: true, 
      mustChangePassword: false,
      user: this.currentUser,
      redirectRoute: this.getDashboardRouteForRole(user.role)
    };
  }

  // Set permanent password on first login
  setNewPassword(userId, newPassword, confirmPassword) {
    if (!userId) {
      return { success: false, message: 'User identification missing. Please sign in again.' };
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length === 0) {
      return { success: false, message: 'New password cannot be empty.' };
    }

    if (!confirmPassword || typeof confirmPassword !== 'string' || confirmPassword.trim().length === 0) {
      return { success: false, message: 'Confirm password cannot be empty.' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Both passwords must match.' };
    }

    const users = db.getUsers();
    const user = users.find(u => u.id === userId || u.user_id.toLowerCase() === userId.toLowerCase());

    if (!user) {
      return { success: false, message: 'User account not found.' };
    }

    const newHash = hashPassword(newPassword);

    // Verify new password is different from the temporary password (Temp@123 or current hash)
    if (newPassword === 'Temp@123' || user.password_hash === newHash || user.password_hash === newPassword) {
      return { success: false, message: 'The new password must be different from the temporary password (Temp@123).' };
    }

    // Update user record securely
    user.password_hash = newHash;
    user.must_change_password = false;
    user.password_changed_at = new Date().toISOString();
    user.updated_at = new Date().toISOString();
    user.last_login = new Date().toISOString();

    db.saveUsers(users);

    // Establish authenticated session
    this.saveSession(user);

    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      '-',
      'USER_PASSWORD_CHANGE',
      '-',
      '-',
      `User ${user.user_id} (${user.role}) successfully set permanent password on initial login.`
    );

    return {
      success: true,
      user: this.currentUser,
      redirectRoute: this.getDashboardRouteForRole(user.role),
      message: 'New password set successfully! Opening your portal...'
    };
  }

  // Admin creates a new user with temporary password and must_change_password = true
  adminCreateUser({ full_name, employee_id, user_id, email, phone, role, department, lab, status, temporaryPassword }) {
    if (!full_name || !full_name.trim()) {
      return { success: false, message: 'Full Name is required.', field: 'fullname' };
    }
    if (!employee_id || !employee_id.trim()) {
      return { success: false, message: 'Employee ID is required.', field: 'empid' };
    }
    if (!user_id || !user_id.trim()) {
      return { success: false, message: 'User ID is required.', field: 'userid' };
    }
    if (!email || !email.trim()) {
      return { success: false, message: 'Email Address is required.', field: 'email' };
    }
    if (!role || !role.trim()) {
      return { success: false, message: 'Role is required.', field: 'role' };
    }
    if (!department || !department.trim()) {
      return { success: false, message: 'Department is required.', field: 'dept' };
    }
    if (!temporaryPassword || !temporaryPassword.trim()) {
      return { success: false, message: 'Temporary Password is required.', field: 'temppwd' };
    }

    const currentUsers = db.getUsers();
    const cleanUserId = user_id.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate User ID
    if (currentUsers.some(u => u.user_id && u.user_id.toLowerCase() === cleanUserId.toLowerCase())) {
      return { success: false, message: 'User ID already exists. Please choose another User ID.', field: 'userid' };
    }

    // Check duplicate Email
    if (currentUsers.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.', field: 'email' };
    }

    const rawTempPassword = temporaryPassword.trim();
    const hashedTempPassword = hashPassword(rawTempPassword);

    const newUserObj = {
      id: 'usr-' + Date.now(),
      full_name: full_name.trim(),
      employee_id: employee_id.trim(),
      user_id: cleanUserId,
      email: email.trim(),
      phone: (phone && phone.trim()) || '',
      role: role.trim(),
      department: department.trim(),
      lab: (lab && lab.trim()) || 'Main',
      status: status || 'Active',
      password_hash: hashedTempPassword,
      must_change_password: true,
      password_changed_at: null,
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    currentUsers.push(newUserObj);
    db.saveUsers(currentUsers);

    db.logAudit(
      newUserObj.id,
      newUserObj.full_name,
      newUserObj.role,
      '-',
      'ADMIN_CREATE_USER',
      '-',
      '-',
      `Admin created user account ${newUserObj.user_id} (${newUserObj.role}) with temporary password.`
    );

    return {
      success: true,
      user: newUserObj,
      rawTempPassword: rawTempPassword,
      message: '✓ User created successfully.'
    };
  }

  // Admin resets staff password to Temp@123 and sets must_change_password = true
  adminResetPassword(userId, currentAdminId) {
    const users = db.getUsers();
    const user = users.find(u => u.id === userId || u.user_id.toLowerCase() === userId.toLowerCase());

    if (!user) {
      return { success: false, message: 'User account not found.' };
    }

    // Prevent Admin from resetting their own account credentials through this table flow
    const isSelfAdmin = (currentAdminId && (user.id === currentAdminId)) ||
                        (this.currentUser && (this.currentUser.id === user.id || this.currentUser.user_id.toLowerCase() === user.user_id.toLowerCase()));
    if (isSelfAdmin) {
      return { success: false, message: 'You cannot reset your own Admin account credentials from this table.' };
    }

    const tempPassword = 'Temp@123';
    user.password_hash = hashPassword(tempPassword);
    user.must_change_password = true;
    user.updated_at = new Date().toISOString();

    db.saveUsers(users);

    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      '-',
      'ADMIN_PASSWORD_RESET',
      '-',
      '-',
      `Admin reset credentials for user ${user.user_id} (${user.role}) to temporary password (Temp@123).`
    );

    return {
      success: true,
      tempPassword: tempPassword,
      user: {
        id: user.id,
        user_id: user.user_id,
        full_name: user.full_name,
        role: user.role,
        email: user.email
      },
      message: 'Password reset successfully.'
    };
  }

  // Admin updates user account
  adminUpdateUser(id, updates) {
    const users = db.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) {
      return { success: false, message: 'User account not found.' };
    }
    if (updates.full_name) user.full_name = updates.full_name.trim();
    if (updates.employee_id) user.employee_id = updates.employee_id.trim();
    if (updates.email) user.email = updates.email.trim().toLowerCase();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.role) user.role = updates.role;
    if (updates.department) user.department = updates.department;
    if (updates.lab !== undefined) user.lab = updates.lab;
    if (updates.status) user.status = updates.status;
    user.updated_at = new Date().toISOString();

    db.saveUsers(users);

    db.logAudit(
      user.id,
      user.full_name,
      user.role,
      '-',
      'ADMIN_UPDATE_USER',
      '-',
      '-',
      `Admin updated user account details for ${user.user_id} (${user.role}).`
    );

    return {
      success: true,
      user: user,
      message: 'User account updated successfully.'
    };
  }

  adminDeleteUser(userId, currentAdminId) {
    return this.deleteUser(userId, currentAdminId);
  }

  // Admin deletes user account
  deleteUser(userId, currentAdminId) {
    const users = db.getUsers();
    const userToDelete = users.find(u => u.id === userId || u.user_id.toLowerCase() === userId.toLowerCase());

    if (!userToDelete) {
      return { success: false, message: 'User account not found.' };
    }

    // Prevent Admin from deleting their own account
    const isSelfAdmin = (currentAdminId && (userToDelete.id === currentAdminId)) ||
      (this.currentUser && (this.currentUser.id === userToDelete.id || this.currentUser.user_id.toLowerCase() === userToDelete.user_id.toLowerCase()));

    if (isSelfAdmin) {
      return { success: false, message: 'You cannot delete your own Admin account.' };
    }

    const deleted = db.deleteUser(userToDelete.id);
    if (!deleted) {
      return { success: false, message: 'Failed to delete user account.' };
    }

    db.logAudit(
      deleted.id,
      deleted.full_name,
      deleted.role,
      '-',
      'USER_DELETED',
      '-',
      '-',
      `User account ${deleted.user_id} (${deleted.full_name} - ${deleted.role}) was deleted from the system by Admin.`
    );

    return {
      success: true,
      message: `User ${deleted.user_id} (${deleted.full_name}) was deleted successfully.`
    };
  }

  logout() {
    if (this.currentUser) {
      db.logAudit(
        this.currentUser.id,
        this.currentUser.full_name,
        this.currentUser.role,
        '-',
        'USER_LOGOUT',
        '-',
        '-',
        `User ${this.currentUser.user_id} logged out.`
      );
    }
    this.clearSession();
  }

  // Quick switch for demo testing
  quickSwitchRole(roleName) {
    const users = db.getUsers();
    const targetUser = users.find(u => u.role.toLowerCase() === roleName.toLowerCase() && u.status === 'Active');
    
    if (!targetUser) {
      return { success: false, message: `No active user found for role: ${roleName}` };
    }

    this.saveSession(targetUser);
    
    db.logAudit(
      targetUser.id,
      targetUser.full_name,
      targetUser.role,
      '-',
      'QUICK_ROLE_SWITCH',
      '-',
      '-',
      `Switched session to ${targetUser.full_name} (${targetUser.role})`
    );

    return { success: true, user: this.currentUser };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null && this.currentUser.authenticated === true && !this.currentUser.must_change_password;
  }

  getDashboardRouteForRole(role) {
    switch (role) {
      case 'Admin':
        return 'admin-dashboard';
      case 'Lab Assistant':
        return 'lab-assistant-dashboard';
      case 'Lab In-Charge':
        return 'lab-charge-dashboard';
      case 'HOD':
        return 'hod-dashboard';
      case 'HR':
        return 'hr-dashboard';
      case 'Civil In-Charge':
        return 'civil-dashboard';
      case 'Electrical In-Charge':
        return 'electrical-dashboard';
      case 'Furniture In-Charge':
        return 'furniture-dashboard';
      case 'Computer In-Charge':
        return 'computer-dashboard';
      default:
        return 'login';
    }
  }

  canAccessRoute(route) {
    if (!this.isAuthenticated()) {
      const publicRoutes = ['', 'home', 'login', 'how-it-works', 'approval-workflow', 'features', 'departments', 'faq', 'request-tracking-preview'];
      return publicRoutes.includes(route);
    }

    const role = this.currentUser.role;

    // Admin has access to administrative pages, reports, user management, and tracking
    if (role === 'Admin') {
      const adminAllowed = [
        'admin-dashboard',
        'admin-users',
        'admin-departments',
        'admin-requests',
        'admin-workflow',
        'admin-reports',
        'admin-audit',
        'admin-notifications',
        'admin-system',
        'admin-profile',
        'all-requests',
        'reports',
        'tracking',
        'profile',
        'notifications'
      ];
      return adminAllowed.includes(route);
    }

    const roleRouteMap = {
      'Lab Assistant': ['lab-assistant-dashboard', 'new-request', 'my-requests', 'rejected-requests', 'completed-requests', 'tracking', 'notifications', 'profile'],
      'Lab In-Charge': ['lab-charge-dashboard', 'pending-approvals', 'all-requests', 'tracking', 'notifications', 'profile'],
      'HOD': ['hod-dashboard', 'pending-approvals', 'all-requests', 'reports', 'tracking', 'notifications', 'profile'],
      'HR': ['hr-dashboard', 'pending-requests', 'dept-assignment', 'all-requests', 'reports', 'tracking', 'notifications', 'profile'],
      'Civil In-Charge': ['civil-dashboard', 'dept-requests', 'tracking', 'notifications', 'profile'],
      'Electrical In-Charge': ['electrical-dashboard', 'dept-requests', 'tracking', 'notifications', 'profile'],
      'Furniture In-Charge': ['furniture-dashboard', 'dept-requests', 'tracking', 'notifications', 'profile'],
      'Computer In-Charge': ['computer-dashboard', 'dept-requests', 'tracking', 'notifications', 'profile']
    };

    const allowedRoutes = roleRouteMap[role] || [];
    return allowedRoutes.includes(route) || route === 'tracking' || route === 'profile' || route === 'notifications';
  }
}

export const auth = new AuthManager();
