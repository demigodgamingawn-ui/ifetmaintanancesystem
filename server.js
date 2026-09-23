// server.js - Central Backend Server & Persistent Database API for College Maintenance Management System
import http from 'http';
import fs from 'fs';
import path from 'path';
import net from 'net';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let PORT = parseInt(process.env.PORT, 10) || 5173;
const HOST = '127.0.0.1';

// Central Database File Path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Default Seed Data
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

function getInitialDatabase() {
  return {
    version: '1.0',
    users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
    departments: JSON.parse(JSON.stringify(DEFAULT_DEPARTMENTS)),
    requests: [],
    approvals: [],
    assignments: [],
    work_updates: [],
    notifications: [],
    audit_logs: []
  };
}

// Ensure database file exists on disk
function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    console.log(`[Database] Initialized central persistent database at ${DB_FILE}`);
  } else {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(content);
      // Validate schema keys
      let modified = false;
      if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
        parsed.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
        modified = true;
      }
      if (!Array.isArray(parsed.departments) || parsed.departments.length === 0) {
        parsed.departments = JSON.parse(JSON.stringify(DEFAULT_DEPARTMENTS));
        modified = true;
      }
      if (!Array.isArray(parsed.requests)) { parsed.requests = []; modified = true; }
      if (!Array.isArray(parsed.approvals)) { parsed.approvals = []; modified = true; }
      if (!Array.isArray(parsed.assignments)) { parsed.assignments = []; modified = true; }
      if (!Array.isArray(parsed.work_updates)) { parsed.work_updates = []; modified = true; }
      if (!Array.isArray(parsed.notifications)) { parsed.notifications = []; modified = true; }
      if (!Array.isArray(parsed.audit_logs)) { parsed.audit_logs = []; modified = true; }

      if (modified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
      }
      console.log(`[Database] Loaded central persistent database with ${parsed.users.length} users, ${parsed.departments.length} departments, ${parsed.requests.length} requests.`);
    } catch (e) {
      console.error('[Database] Corrupt DB file found, resetting to clean default state:', e);
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    }
  }
}

function readDatabase() {
  try {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error('[Database] Error reading database:', e);
    initDatabase();
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
}

function writeDatabase(db) {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (e) {
    console.error('[Database] Error writing database:', e);
    return false;
  }
}

// Helper: SHA-256
function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Initialize central database immediately
initDatabase();

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Parse JSON request body helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// JSON response helper
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

// Handle API Requests
async function handleAPI(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  try {
    // 1. Full Database Snapshot & Sync
    if (pathname === '/api/db' && method === 'GET') {
      const db = readDatabase();
      return sendJSON(res, 200, { success: true, db });
    }

    if (pathname === '/api/db/sync' && method === 'POST') {
      const body = await parseBody(req);
      if (body && body.users && body.departments) {
        writeDatabase(body);
        return sendJSON(res, 200, { success: true, message: 'Database synchronized successfully.' });
      }
      return sendJSON(res, 400, { success: false, message: 'Invalid database payload.' });
    }

    if (pathname === '/api/db/reset' && method === 'POST') {
      const initial = getInitialDatabase();
      writeDatabase(initial);
      console.log('[Database] Reset to initial clean state.');
      return sendJSON(res, 200, { success: true, message: 'Database reset to clean state.' });
    }

    // Health check
    if (pathname === '/api/health' && method === 'GET') {
      const db = readDatabase();
      return sendJSON(res, 200, {
        status: 'Online',
        database: 'Connected',
        usersCount: db.users.length,
        requestsCount: db.requests.length,
        departmentsCount: db.departments.length,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Authentication API
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { user_id, password } = await parseBody(req);
      if (!user_id || !password) {
        return sendJSON(res, 400, { success: false, message: 'Please enter both User ID and Password.' });
      }
      const db = readDatabase();
      const cleanInput = user_id.toLowerCase().trim();
      const user = db.users.find(u => u.user_id.toLowerCase() === cleanInput || (u.email && u.email.toLowerCase() === cleanInput));

      if (!user) {
        return sendJSON(res, 401, { success: false, message: 'Invalid User ID or Password.' });
      }
      if (user.status === 'Disabled') {
        return sendJSON(res, 403, { success: false, message: 'Your account is disabled. Contact Administrator.' });
      }

      const inputHash = sha256(password);
      const isValid = (user.password_hash === inputHash) || (user.password_hash === password);
      if (!isValid) {
        return sendJSON(res, 401, { success: false, message: 'Invalid User ID or Password.' });
      }

      // Upgrade plain password to hash if needed
      if (user.password_hash === password) {
        user.password_hash = inputHash;
      }
      user.last_login = new Date().toISOString();
      writeDatabase(db);

      const sanitizedUser = { ...user };
      delete sanitizedUser.password_hash;
      return sendJSON(res, 200, { success: true, user: sanitizedUser });
    }

    if (pathname === '/api/auth/change-password' && method === 'POST') {
      const { user_id, current_password, new_password } = await parseBody(req);
      if (!user_id || !new_password) {
        return sendJSON(res, 400, { success: false, message: 'Missing user ID or new password.' });
      }
      const db = readDatabase();
      const clean = user_id.toLowerCase().trim();
      const user = db.users.find(u => u.user_id.toLowerCase() === clean || u.id === user_id);
      if (!user) {
        return sendJSON(res, 404, { success: false, message: 'User not found.' });
      }

      if (current_password) {
        const curHash = sha256(current_password);
        if (user.password_hash !== curHash && user.password_hash !== current_password) {
          return sendJSON(res, 400, { success: false, message: 'Current password is incorrect.' });
        }
      }

      user.password_hash = sha256(new_password);
      user.must_change_password = false;
      user.password_changed_at = new Date().toISOString();
      user.updated_at = new Date().toISOString();

      // Log audit
      db.audit_logs.unshift({
        id: 'aud-' + Date.now(),
        user_id: user.user_id,
        user_name: user.full_name,
        role: user.role,
        action: 'CHANGE_PASSWORD',
        details: 'User successfully changed password.',
        timestamp: new Date().toISOString()
      });

      writeDatabase(db);
      return sendJSON(res, 200, { success: true, message: 'Password changed successfully.' });
    }

    // 3. User Management APIs
    if (pathname === '/api/users' && method === 'GET') {
      const db = readDatabase();
      return sendJSON(res, 200, { success: true, users: db.users });
    }

    if (pathname === '/api/users' && method === 'POST') {
      const userData = await parseBody(req);
      const db = readDatabase();

      if (!userData.full_name || !userData.role || !userData.department) {
        return sendJSON(res, 400, { success: false, message: 'Full Name, Role, and Department are required.' });
      }

      const cleanUserId = (userData.user_id || '').toLowerCase().trim();
      const cleanEmail = (userData.email || '').toLowerCase().trim();

      if (cleanUserId && db.users.some(u => u.user_id.toLowerCase() === cleanUserId)) {
        return sendJSON(res, 400, { success: false, message: `User ID '${userData.user_id}' already exists.` });
      }
      if (cleanEmail && db.users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
        return sendJSON(res, 400, { success: false, message: `Email '${userData.email}' already exists.` });
      }

      const rawTempPwd = userData.temporary_password || 'Temp@123';
      const newUser = {
        id: 'usr-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        full_name: userData.full_name.trim(),
        employee_id: userData.employee_id ? userData.employee_id.trim() : `EMP-${Date.now().toString().slice(-4)}`,
        user_id: userData.user_id ? userData.user_id.trim() : `user${Date.now().toString().slice(-4)}`,
        email: userData.email ? userData.email.trim().toLowerCase() : '',
        phone: userData.phone ? userData.phone.trim() : '',
        password_hash: sha256(rawTempPwd),
        role: userData.role,
        department: userData.department,
        lab: userData.lab || '',
        status: userData.status || 'Active',
        must_change_password: true,
        password_changed_at: null,
        last_login: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.users.push(newUser);

      // Audit log
      db.audit_logs.unshift({
        id: 'aud-' + Date.now(),
        user_id: 'admin001',
        user_name: 'Admin',
        role: 'Admin',
        action: 'CREATE_USER',
        details: `Created new user ${newUser.full_name} (${newUser.user_id}) with role ${newUser.role} in ${newUser.department}.`,
        timestamp: new Date().toISOString()
      });

      writeDatabase(db);
      return sendJSON(res, 201, { success: true, user: newUser, temporary_password: rawTempPwd });
    }

    // PUT /api/users/:id
    const userMatch = pathname.match(/^\/api\/users\/([^\/]+)$/);
    if (userMatch && method === 'PUT') {
      const id = userMatch[1];
      const updates = await parseBody(req);
      const db = readDatabase();
      const user = db.users.find(u => u.id === id);
      if (!user) {
        return sendJSON(res, 404, { success: false, message: 'User not found.' });
      }

      if (updates.full_name) user.full_name = updates.full_name.trim();
      if (updates.employee_id) user.employee_id = updates.employee_id.trim();
      if (updates.email) user.email = updates.email.trim().toLowerCase();
      if (updates.phone !== undefined) user.phone = updates.phone.trim();
      if (updates.role) user.role = updates.role;
      if (updates.department) user.department = updates.department;
      if (updates.lab !== undefined) user.lab = updates.lab;
      if (updates.status) user.status = updates.status;
      if (updates.must_change_password !== undefined) user.must_change_password = !!updates.must_change_password;
      user.updated_at = new Date().toISOString();

      db.audit_logs.unshift({
        id: 'aud-' + Date.now(),
        user_id: 'admin001',
        user_name: 'Admin',
        role: 'Admin',
        action: 'UPDATE_USER',
        details: `Updated user profile for ${user.full_name} (${user.user_id}).`,
        timestamp: new Date().toISOString()
      });

      writeDatabase(db);
      return sendJSON(res, 200, { success: true, user });
    }

    // DELETE /api/users/:id
    if (userMatch && method === 'DELETE') {
      const id = userMatch[1];
      const db = readDatabase();
      const index = db.users.findIndex(u => u.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'User not found.' });
      }
      const deletedUser = db.users.splice(index, 1)[0];

      db.audit_logs.unshift({
        id: 'aud-' + Date.now(),
        user_id: 'admin001',
        user_name: 'Admin',
        role: 'Admin',
        action: 'DELETE_USER',
        details: `Deleted user ${deletedUser.full_name} (${deletedUser.user_id}).`,
        timestamp: new Date().toISOString()
      });

      writeDatabase(db);
      return sendJSON(res, 200, { success: true, message: 'User deleted successfully.', deletedUser });
    }

    // POST /api/users/:id/reset-password
    const resetMatch = pathname.match(/^\/api\/users\/([^\/]+)\/reset-password$/);
    if (resetMatch && method === 'POST') {
      const id = resetMatch[1];
      const db = readDatabase();
      const user = db.users.find(u => u.id === id);
      if (!user) {
        return sendJSON(res, 404, { success: false, message: 'User not found.' });
      }

      const tempPwd = 'Temp@123';
      user.password_hash = sha256(tempPwd);
      user.must_change_password = true;
      user.updated_at = new Date().toISOString();

      db.audit_logs.unshift({
        id: 'aud-' + Date.now(),
        user_id: 'admin001',
        user_name: 'Admin',
        role: 'Admin',
        action: 'RESET_PASSWORD',
        details: `Password reset for user ${user.full_name} (${user.user_id}). Temporary password assigned.`,
        timestamp: new Date().toISOString()
      });

      writeDatabase(db);
      return sendJSON(res, 200, {
        success: true,
        message: 'Password reset successfully.',
        temporary_password: tempPwd,
        must_change_password: true
      });
    }

    // 4. Department Management APIs
    if (pathname === '/api/departments' && method === 'GET') {
      const db = readDatabase();
      return sendJSON(res, 200, { success: true, departments: db.departments });
    }

    if (pathname === '/api/departments' && method === 'POST') {
      const deptData = await parseBody(req);
      const db = readDatabase();

      if (!deptData.name || !deptData.name.trim()) {
        return sendJSON(res, 400, { success: false, message: 'Department Name is required.' });
      }

      const cleanName = deptData.name.trim();
      if (db.departments.some(d => d.name.toLowerCase() === cleanName.toLowerCase())) {
        return sendJSON(res, 400, { success: false, message: 'Department with this name already exists.' });
      }

      const newDept = {
        id: 'dept-' + Date.now(),
        name: cleanName,
        code: (deptData.code || cleanName.substring(0, 4)).toUpperCase().trim(),
        block: deptData.block ? deptData.block.trim() : 'Main Campus Block',
        status: deptData.status || 'Active',
        created_at: new Date().toISOString()
      };

      db.departments.push(newDept);

      db.audit_logs.unshift({
        id: 'aud-' + Date.now(),
        user_id: 'admin001',
        user_name: 'Admin',
        role: 'Admin',
        action: 'CREATE_DEPARTMENT',
        details: `Created department ${newDept.name} (${newDept.code}).`,
        timestamp: new Date().toISOString()
      });

      writeDatabase(db);
      return sendJSON(res, 201, { success: true, department: newDept });
    }

    const deptMatch = pathname.match(/^\/api\/departments\/([^\/]+)$/);
    if (deptMatch && method === 'PUT') {
      const id = deptMatch[1];
      const updates = await parseBody(req);
      const db = readDatabase();
      const dept = db.departments.find(d => d.id === id);
      if (!dept) {
        return sendJSON(res, 404, { success: false, message: 'Department not found.' });
      }

      if (updates.name && updates.name.trim()) dept.name = updates.name.trim();
      if (updates.code && updates.code.trim()) dept.code = updates.code.trim().toUpperCase();
      if (updates.block) dept.block = updates.block.trim();
      if (updates.status) dept.status = updates.status;
      dept.updated_at = new Date().toISOString();

      writeDatabase(db);
      return sendJSON(res, 200, { success: true, department: dept });
    }

    const deptToggleMatch = pathname.match(/^\/api\/departments\/([^\/]+)\/toggle$/);
    if (deptToggleMatch && method === 'PATCH') {
      const id = deptToggleMatch[1];
      const db = readDatabase();
      const dept = db.departments.find(d => d.id === id);
      if (!dept) {
        return sendJSON(res, 404, { success: false, message: 'Department not found.' });
      }

      dept.status = dept.status === 'Active' ? 'Disabled' : 'Active';
      dept.updated_at = new Date().toISOString();

      writeDatabase(db);
      return sendJSON(res, 200, { success: true, department: dept });
    }

    if (deptMatch && method === 'DELETE') {
      const id = deptMatch[1];
      const db = readDatabase();
      const index = db.departments.findIndex(d => d.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Department not found.' });
      }
      const deletedDept = db.departments.splice(index, 1)[0];
      writeDatabase(db);
      return sendJSON(res, 200, { success: true, deletedDept });
    }

    // 5. Maintenance Requests APIs
    if (pathname === '/api/requests' && method === 'GET') {
      const db = readDatabase();
      return sendJSON(res, 200, { success: true, requests: db.requests });
    }

    if (pathname === '/api/requests' && method === 'POST') {
      const reqData = await parseBody(req);
      const db = readDatabase();

      const currentYear = new Date().getFullYear();
      const count = db.requests.length + 1;
      const padNum = String(count).padStart(4, '0');
      const requestId = `MR-${currentYear}-${padNum}`;

      const newRequest = {
        id: requestId,
        ...reqData,
        created_at: reqData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.requests.unshift(newRequest);

      // Add audit log
      db.audit_logs.unshift({
        id: 'aud-' + Date.now(),
        user_id: newRequest.created_by_id || 'system',
        user_name: newRequest.created_by_name || 'Lab Assistant',
        role: newRequest.created_by_role || 'Lab Assistant',
        request_id: requestId,
        action: 'CREATE_REQUEST',
        old_status: null,
        new_status: newRequest.status || 'Pending Lab In-Charge Approval',
        details: `Created maintenance ticket for ${newRequest.title} in ${newRequest.department}.`,
        timestamp: new Date().toISOString()
      });

      // Add notification for Lab In-Charge
      db.notifications.unshift({
        id: 'notif-' + Date.now(),
        title: 'New Maintenance Request',
        message: `New request ${requestId} created for ${newRequest.department} (${newRequest.lab_room}).`,
        target_role: 'Lab In-Charge',
        department: newRequest.department,
        request_id: requestId,
        read: false,
        created_at: new Date().toISOString()
      });

      writeDatabase(db);
      return sendJSON(res, 201, { success: true, request: newRequest });
    }

    const reqMatch = pathname.match(/^\/api\/requests\/([^\/]+)$/);
    if (reqMatch && method === 'PUT') {
      const id = reqMatch[1];
      const updates = await parseBody(req);
      const db = readDatabase();
      const index = db.requests.findIndex(r => r.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Request not found.' });
      }

      db.requests[index] = { ...db.requests[index], ...updates, updated_at: new Date().toISOString() };
      writeDatabase(db);
      return sendJSON(res, 200, { success: true, request: db.requests[index] });
    }

    // 6. Workflow Approvals, Assignments, Work Updates APIs
    if (pathname === '/api/approvals' && method === 'POST') {
      const approval = await parseBody(req);
      const db = readDatabase();
      approval.id = 'appr-' + Date.now();
      approval.timestamp = new Date().toISOString();
      db.approvals.unshift(approval);
      writeDatabase(db);
      return sendJSON(res, 201, { success: true, approval });
    }

    if (pathname === '/api/assignments' && method === 'POST') {
      const assignment = await parseBody(req);
      const db = readDatabase();
      assignment.id = 'asgn-' + Date.now();
      assignment.assigned_at = new Date().toISOString();
      db.assignments.unshift(assignment);
      writeDatabase(db);
      return sendJSON(res, 201, { success: true, assignment });
    }

    if (pathname === '/api/work-updates' && method === 'POST') {
      const update = await parseBody(req);
      const db = readDatabase();
      update.id = 'work-' + Date.now();
      update.timestamp = new Date().toISOString();
      db.work_updates.unshift(update);
      writeDatabase(db);
      return sendJSON(res, 201, { success: true, update });
    }

    // 7. Notifications APIs
    if (pathname === '/api/notifications' && method === 'GET') {
      const db = readDatabase();
      return sendJSON(res, 200, { success: true, notifications: db.notifications });
    }

    if (pathname === '/api/notifications' && method === 'POST') {
      const notif = await parseBody(req);
      const db = readDatabase();
      notif.id = 'notif-' + Date.now();
      notif.created_at = new Date().toISOString();
      notif.read = false;
      db.notifications.unshift(notif);
      writeDatabase(db);
      return sendJSON(res, 201, { success: true, notification: notif });
    }

    const notifReadMatch = pathname.match(/^\/api\/notifications\/([^\/]+)\/read$/);
    if (notifReadMatch && method === 'PUT') {
      const id = notifReadMatch[1];
      const db = readDatabase();
      const notif = db.notifications.find(n => n.id === id);
      if (notif) notif.read = true;
      writeDatabase(db);
      return sendJSON(res, 200, { success: true });
    }

    if (pathname === '/api/notifications/read-all' && method === 'PUT') {
      const db = readDatabase();
      db.notifications.forEach(n => { n.read = true; });
      writeDatabase(db);
      return sendJSON(res, 200, { success: true });
    }

    // 8. Audit Logs APIs
    if (pathname === '/api/audit-logs' && method === 'GET') {
      const db = readDatabase();
      return sendJSON(res, 200, { success: true, audit_logs: db.audit_logs });
    }

    if (pathname === '/api/audit-logs' && method === 'POST') {
      const log = await parseBody(req);
      const db = readDatabase();
      log.id = 'aud-' + Date.now();
      log.timestamp = new Date().toISOString();
      db.audit_logs.unshift(log);
      writeDatabase(db);
      return sendJSON(res, 201, { success: true, log });
    }

    // 404 for unknown API routes
    return sendJSON(res, 404, { success: false, message: `API endpoint not found: ${pathname}` });

  } catch (err) {
    console.error(`[API Error] ${method} ${pathname}:`, err);
    return sendJSON(res, 500, { success: false, message: 'Internal Server Error', error: err.message });
  }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // API Route Dispatcher
  if (req.url.startsWith('/api/')) {
    return handleAPI(req, res);
  }

  // Static File Serving
  let safePath = req.url.split('?')[0];
  if (safePath === '/') {
    safePath = '/index.html';
  }

  const filePath = path.join(__dirname, safePath);

  // Security check: stay within workspace
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA routing
        if (!ext) {
          fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexData) => {
            if (indexErr) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              return res.end('404 Not Found');
            }
            res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
            return res.end(indexData);
          });
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('500 Internal Server Error');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// Auto-detect an available open port if 5173 is in use
function findAvailablePort(startPort, callback) {
  const tester = net.createServer();
  tester.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${startPort} is in use, trying port ${startPort + 1}...`);
      findAvailablePort(startPort + 1, callback);
    } else {
      callback(startPort);
    }
  });
  tester.once('listening', () => {
    tester.close(() => {
      callback(startPort);
    });
  });
  tester.listen(startPort, HOST);
}

findAvailablePort(PORT, (availablePort) => {
  server.listen(availablePort, HOST, () => {
    console.log(`====================================================`);
    console.log(` IFET College Maintenance Management System`);
    console.log(` Central Database Server active at: http://127.0.0.1:${availablePort}`);
    console.log(` Database: ${DB_FILE}`);
    console.log(`====================================================`);
  });
});
