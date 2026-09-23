-- =========================================================================
-- IFET Maintenance Management System - Supabase PostgreSQL Schema
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. System Key-Value App State (for full snapshot cloud sync)
CREATE TABLE IF NOT EXISTS app_state (
    key VARCHAR(64) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(64) UNIQUE NOT NULL,
    user_id VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(32),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL,
    department VARCHAR(255) NOT NULL,
    lab VARCHAR(255),
    status VARCHAR(32) DEFAULT 'Active',
    must_change_password BOOLEAN DEFAULT FALSE,
    password_changed_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(32) NOT NULL,
    block VARCHAR(255) DEFAULT 'Main Campus Block',
    status VARCHAR(32) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Maintenance Requests Table
CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL,
    department VARCHAR(255) NOT NULL,
    lab_room VARCHAR(255) NOT NULL,
    priority VARCHAR(32) DEFAULT 'Medium',
    status VARCHAR(64) DEFAULT 'Pending Lab In-Charge Approval',
    equipment_code VARCHAR(64),
    created_by_id VARCHAR(64),
    created_by_name VARCHAR(255),
    created_by_role VARCHAR(64),
    assigned_to VARCHAR(64),
    assigned_engineer_name VARCHAR(255),
    total_cost NUMERIC(10, 2) DEFAULT 0,
    completion_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) REFERENCES requests(id) ON DELETE CASCADE,
    approver_id VARCHAR(64),
    approver_name VARCHAR(255),
    approver_role VARCHAR(64),
    stage VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    remarks TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) REFERENCES requests(id) ON DELETE CASCADE,
    in_charge_id VARCHAR(64),
    in_charge_name VARCHAR(255),
    in_charge_role VARCHAR(64),
    engineer_name VARCHAR(255) NOT NULL,
    engineer_phone VARCHAR(32),
    work_type VARCHAR(64),
    instructions TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Work Updates Table
CREATE TABLE IF NOT EXISTS work_updates (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) REFERENCES requests(id) ON DELETE CASCADE,
    updated_by_id VARCHAR(64),
    updated_by_name VARCHAR(255),
    role VARCHAR(64),
    status VARCHAR(64),
    details TEXT NOT NULL,
    cost NUMERIC(10, 2) DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_role VARCHAR(64),
    department VARCHAR(255),
    user_id VARCHAR(64),
    request_id VARCHAR(64),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_name VARCHAR(255),
    role VARCHAR(64),
    request_id VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    old_status VARCHAR(64),
    new_status VARCHAR(64),
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Speed
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_dept ON requests(department);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(target_role, read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Enable RLS (Optional / Row Level Security Policies)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Allow public read/write using anon/service key policies for full system integration
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Read Users" ON users;
    CREATE POLICY "Public Read Users" ON users FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Read Departments" ON departments;
    CREATE POLICY "Public Read Departments" ON departments FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Read Requests" ON requests;
    CREATE POLICY "Public Read Requests" ON requests FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Read Approvals" ON approvals;
    CREATE POLICY "Public Read Approvals" ON approvals FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Read Assignments" ON assignments;
    CREATE POLICY "Public Read Assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Read Work Updates" ON work_updates;
    CREATE POLICY "Public Read Work Updates" ON work_updates FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Read Notifications" ON notifications;
    CREATE POLICY "Public Read Notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Read Audit Logs" ON audit_logs;
    CREATE POLICY "Public Read Audit Logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Read App State" ON app_state;
    CREATE POLICY "Public Read App State" ON app_state FOR ALL USING (true) WITH CHECK (true);
END $$;
