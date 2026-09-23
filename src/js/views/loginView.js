// src/js/views/loginView.js - Dedicated Institutional Login Page & First-Time Password Reset

import { auth } from '../auth.js';
import { db } from '../db.js';

export function renderLoginView(container, onLoginSuccess) {
  container.innerHTML = `
    <div class="dedicated-login-root">
      <!-- Top Navigation Header -->
      <header class="login-top-navbar">
        <div class="login-top-container">
          <!-- Left IFET College Branding -->
          <a href="#home" class="login-top-brand" style="text-decoration: none;">
            <img 
              src="./src/assets/ifet_logo.png" 
              alt="IFET College Logo" 
              class="login-top-logo-img" 
              onerror="this.onerror=null; this.src='./src/assets/ifet_logo.svg';" 
            />
            <div class="login-top-brand-text">
              <span class="college-tagline">AUTONOMOUS INSTITUTION • AFFILIATED TO ANNA UNIVERSITY</span>
              <span class="portal-badge-text">MAINTENANCE MANAGEMENT PORTAL</span>
            </div>
          </a>

          <!-- Right Status & Return to Home Controls -->
          <div class="login-top-controls">
            <a href="#home" class="btn btn-outline" style="font-size: 12.5px; padding: 6px 14px; text-decoration: none;">
              &larr; Back to Home
            </a>
            <div class="status-indicator-pill desktop-only" title="System Operational">
              <span class="pulse-dot"></span>
              <span>PORTAL ACTIVE</span>
            </div>
            <button class="btn-theme-toggle" id="btn-theme-toggle" title="Toggle Dark/Light Mode" aria-label="Toggle Theme">
              🌙
            </button>
          </div>
        </div>
      </header>

      <!-- Center Main Login Wrapper -->
      <main class="login-standalone-wrapper">
        <div class="login-standalone-card" id="login-card-container">
          <!-- Main Form Injected Here -->
        </div>
      </main>

      <!-- Bottom Footer -->
      <footer class="login-bottom-footer">
        <div class="login-footer-content">
          <span>&copy; 2026 IFET College of Engineering (Autonomous). All Rights Reserved.</span>
          <span class="footer-divider">•</span>
          <span>Central Maintenance & Infrastructure Management Cell</span>
        </div>
      </footer>

      <!-- Help / Forgot Password Modal -->
      <div class="login-modal-overlay" id="forgot-pwd-modal" style="display: none;">
        <div class="login-modal-card">
          <div class="login-modal-header">
            <h3>Institutional Account Access Help</h3>
            <button class="modal-close-btn" id="btn-close-modal">&times;</button>
          </div>
          <div class="login-modal-body">
            <p>For password resets, user ID provisioning, or login troubleshooting, please contact the IT Maintenance Desk:</p>
            <div class="contact-info-card">
              <div><strong>IT Helpdesk:</strong> ithelpdesk@ifet.ac.in</div>
              <div><strong>Phone:</strong> +91 4146 231456 / Ext: 204</div>
              <div><strong>Office:</strong> Main Admin Block, Ground Floor</div>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 14px;">
              <strong>First-Time Login:</strong> Use the unique temporary password provided by your System Administrator. You will be prompted to set your permanent password upon initial login.
            </p>
          </div>
          <div class="login-modal-footer">
            <button class="btn btn-primary" id="btn-modal-dismiss" style="width: 100%;">Understood</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Dark Mode & Theme Toggle
  initThemeToggle(container);

  // Initial State: Render Standard Login Form
  renderStandardLoginForm(container, onLoginSuccess);
}

// 1. Render Standard Sign In Form
function renderStandardLoginForm(container, onLoginSuccess) {
  const cardContainer = container.querySelector('#login-card-container');
  if (!cardContainer) return;

  cardContainer.innerHTML = `
    <!-- Top Card Brand Header -->
    <div class="login-card-header">
      <div class="login-badge-pill">INSTITUTIONAL LOGIN</div>
      <h2 class="login-portal-title">Sign In to CMMS Portal</h2>
      <p class="login-portal-subtitle">Enter your institutional credentials to access your maintenance workspace</p>
    </div>

    <!-- Alert Feedback Boxes -->
    <div id="login-error-msg" class="login-alert-box error" style="display: none;"></div>
    <div id="login-success-msg" class="login-alert-box success" style="display: none;"></div>

    <!-- Login Form -->
    <form id="login-form" class="auth-form-fields" novalidate>
      <div class="form-group-field">
        <label class="field-label" for="login-username">
          <span>User ID / Employee ID / Official Email</span>
        </label>
        <div class="input-with-icon">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <input 
            type="text" 
            id="login-username" 
            class="auth-input" 
            placeholder="e.g. STAFF001, admin001, lab001" 
            required 
            value="" 
            autocomplete="username" 
          />
        </div>
      </div>

      <div class="form-group-field">
        <div class="field-label-row">
          <label class="field-label" for="login-password">Password</label>
          <button type="button" id="btn-forgot-pwd" class="forgot-link-btn">Need Help?</button>
        </div>
        <div class="input-with-icon">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input 
            type="password" 
            id="login-password" 
            class="auth-input" 
            placeholder="Enter your account password" 
            required 
            value="" 
            autocomplete="current-password" 
          />
          <button type="button" id="btn-toggle-pwd" class="btn-pwd-eye" title="Toggle password visibility" aria-label="Toggle password visibility">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>

      <button type="submit" class="btn-auth-submit" id="btn-submit-auth">
        <span>Sign In to Maintenance Portal &rarr;</span>
      </button>
    </form>

    <!-- Security Notice -->
    <div class="login-security-footer" style="margin-top: 24px;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <span>Authorized IFET Personnel Only • RBAC Protected • Audit Active</span>
    </div>
  `;

  // Attach Standard Form Events
  attachStandardFormEvents(container, onLoginSuccess);
}

// 2. Render First-Time Login / Reset Password Screen
function renderFirstTimeResetForm(container, tempUser, redirectRoute, onLoginSuccess) {
  const cardContainer = container.querySelector('#login-card-container');
  if (!cardContainer) return;

  cardContainer.innerHTML = `
    <!-- Top Card Header -->
    <div class="login-card-header">
      <div class="login-badge-pill" style="background: rgba(245, 158, 11, 0.15); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.3);">
        PASSWORD RESET REQUIRED
      </div>
      <h2 class="login-portal-title">Create New Password</h2>
      <p class="login-portal-subtitle" style="margin-bottom: 8px;">
        Your password was reset by the Administrator.<br />
        For security, please create a new password.
      </p>
    </div>

    <!-- Verified Temporary Password Notice Banner -->
    <div class="login-alert-box success" style="display: flex; align-items: center; gap: 8px; margin-bottom: 18px; font-weight: 600; font-size: 13px;">
      <span>✓</span>
      <span>Temporary password verified. Please create your new permanent password.</span>
    </div>

    <!-- User Information Summary Chip -->
    <div style="background: var(--ifet-tint); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 13px; font-weight: 700; color: var(--text-main);">${tempUser.full_name}</div>
        <div style="font-size: 11.5px; color: var(--text-muted);">User ID: <strong>${tempUser.user_id}</strong> • Role: <strong>${tempUser.role}</strong></div>
      </div>
      <span class="badge badge-assigned">${tempUser.department || 'General'}</span>
    </div>

    <!-- Alert Feedback Box -->
    <div id="reset-error-msg" class="login-alert-box error" style="display: none;"></div>
    <div id="reset-success-msg" class="login-alert-box success" style="display: none;"></div>

    <!-- Reset Password Form -->
    <form id="first-time-reset-form" class="auth-form-fields" novalidate>
      <div class="form-group-field">
        <label class="field-label" for="reset-new-pwd">
          <span>New Password</span>
        </label>
        <div class="input-with-icon">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input 
            type="password" 
            id="reset-new-pwd" 
            class="auth-input" 
            placeholder="Enter new password" 
            required 
            autocomplete="new-password" 
            autofocus
          />
          <button type="button" id="btn-toggle-new-pwd" class="btn-pwd-eye" title="Toggle password visibility">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="form-group-field">
        <label class="field-label" for="reset-confirm-pwd">
          <span>Confirm New Password</span>
        </label>
        <div class="input-with-icon">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <input 
            type="password" 
            id="reset-confirm-pwd" 
            class="auth-input" 
            placeholder="Confirm new password" 
            required 
            autocomplete="new-password" 
          />
          <button type="button" id="btn-toggle-confirm-pwd" class="btn-pwd-eye" title="Toggle password visibility">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>

      <div style="font-size: 11.5px; color: var(--text-muted); background: var(--bg-body); padding: 8px 12px; border-radius: 6px; border-left: 3px solid var(--primary-600);">
        The new password must be different from the temporary password.
      </div>

      <button type="submit" class="btn-auth-submit" id="btn-submit-reset-pwd" style="margin-top: 6px;">
        <span>Set New Password</span>
      </button>

      <div style="text-align: center; margin-top: 10px;">
        <button type="button" id="btn-cancel-reset" class="forgot-link-btn" style="font-size: 12px; color: var(--text-muted);">
          &larr; Cancel and return to Sign In
        </button>
      </div>
    </form>
  `;

  // Attach Reset Form Events
  attachResetFormEvents(container, tempUser, redirectRoute, onLoginSuccess);
}

// 3. Event Listeners for Standard Login Form
function attachStandardFormEvents(container, onLoginSuccess) {
  const form = container.querySelector('#login-form');
  const errorMsg = container.querySelector('#login-error-msg');
  const successMsg = container.querySelector('#login-success-msg');
  const userInput = container.querySelector('#login-username');
  const pwdInput = container.querySelector('#login-password');
  const togglePwdBtn = container.querySelector('#btn-toggle-pwd');
  const forgotPwdBtn = container.querySelector('#btn-forgot-pwd');
  const forgotPwdModal = container.querySelector('#forgot-pwd-modal');
  const closeModalBtn = container.querySelector('#btn-close-modal');
  const dismissModalBtn = container.querySelector('#btn-modal-dismiss');

  // Password Visibility Toggle
  if (togglePwdBtn && pwdInput) {
    togglePwdBtn.addEventListener('click', () => {
      togglePasswordInput(pwdInput, togglePwdBtn);
    });
  }

  // Forgot Password Modal Handlers
  if (forgotPwdBtn && forgotPwdModal) {
    forgotPwdBtn.addEventListener('click', (e) => {
      e.preventDefault();
      forgotPwdModal.style.display = 'flex';
    });
  }

  const hideForgotModal = () => {
    if (forgotPwdModal) forgotPwdModal.style.display = 'none';
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', hideForgotModal);
  if (dismissModalBtn) dismissModalBtn.addEventListener('click', hideForgotModal);
  if (forgotPwdModal) {
    forgotPwdModal.addEventListener('click', (e) => {
      if (e.target === forgotPwdModal) hideForgotModal();
    });
  }

  // Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.style.display = 'none';
      if (successMsg) successMsg.style.display = 'none';

      const userVal = userInput ? userInput.value.trim() : '';
      const pwdVal = pwdInput ? pwdInput.value : '';

      const result = auth.login(userVal, pwdVal);

      if (result.success) {
        if (result.mustChangePassword) {
          // FIRST-TIME LOGIN: Direct to Password Reset Screen (Do NOT open dashboard yet)
          renderFirstTimeResetForm(container, result.tempUser, result.redirectRoute, onLoginSuccess);
        } else {
          // NORMAL LOGIN: Direct to Role-Based Portal
          if (successMsg) {
            successMsg.textContent = `✓ Authenticated as ${result.user.full_name} (${result.user.role}). Entering portal...`;
            successMsg.style.display = 'block';
          }
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess(result.user, result.redirectRoute);
          }, 300);
        }
      } else if (errorMsg) {
        errorMsg.textContent = result.message;
        errorMsg.style.display = 'block';
      }
    });
  }
}

// 4. Event Listeners for First-Time Reset Form
function attachResetFormEvents(container, tempUser, redirectRoute, onLoginSuccess) {
  const form = container.querySelector('#first-time-reset-form');
  const errorMsg = container.querySelector('#reset-error-msg');
  const successMsg = container.querySelector('#reset-success-msg');
  const newPwdInput = container.querySelector('#reset-new-pwd');
  const confirmPwdInput = container.querySelector('#reset-confirm-pwd');
  const toggleNewBtn = container.querySelector('#btn-toggle-new-pwd');
  const toggleConfirmBtn = container.querySelector('#btn-toggle-confirm-pwd');
  const cancelBtn = container.querySelector('#btn-cancel-reset');

  if (toggleNewBtn && newPwdInput) {
    toggleNewBtn.addEventListener('click', () => togglePasswordInput(newPwdInput, toggleNewBtn));
  }

  if (toggleConfirmBtn && confirmPwdInput) {
    toggleConfirmBtn.addEventListener('click', () => togglePasswordInput(confirmPwdInput, toggleConfirmBtn));
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      renderStandardLoginForm(container, onLoginSuccess);
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.style.display = 'none';
      if (successMsg) successMsg.style.display = 'none';

      const newPwd = newPwdInput ? newPwdInput.value : '';
      const confirmPwd = confirmPwdInput ? confirmPwdInput.value : '';

      const setResult = auth.setNewPassword(tempUser.id, newPwd, confirmPwd);

      if (setResult.success) {
        if (successMsg) {
          successMsg.textContent = `✓ Password set successfully! Opening ${setResult.user.role} Portal...`;
          successMsg.style.display = 'block';
        }
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(setResult.user, setResult.redirectRoute || redirectRoute);
        }, 400);
      } else if (errorMsg) {
        errorMsg.textContent = setResult.message;
        errorMsg.style.display = 'block';
      }
    });
  }
}

function togglePasswordInput(inputEl, btnEl) {
  if (inputEl.type === 'password') {
    inputEl.type = 'text';
    btnEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    `;
  } else {
    inputEl.type = 'password';
    btnEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
  }
}

function initThemeToggle(container) {
  const themeBtn = container.querySelector('#btn-theme-toggle');
  if (!themeBtn) return;

  const isDarkStored = localStorage.getItem('ifet_theme_mode') === 'dark';
  if (isDarkStored) {
    document.body.classList.add('dark-mode');
    themeBtn.textContent = '☀️';
  } else {
    themeBtn.textContent = '🌙';
  }

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('ifet_theme_mode', isDark ? 'dark' : 'light');
  });
}

