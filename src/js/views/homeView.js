// src/js/views/homeView.js - Institutional Product Homepage for IFET Maintenance Management System

export function renderHomeView(container) {
  container.innerHTML = `
    <div class="institutional-home-root">
      <!-- 1. FULL-WIDTH NAVBAR -->
      <header class="home-navbar">
        <div class="home-nav-container">
          <!-- Left Branding -->
          <a href="#home" class="home-nav-brand">
            <img 
              src="./src/assets/ifet_logo.png" 
              alt="IFET College Logo" 
              class="home-nav-logo-img" 
              onerror="this.onerror=null; this.src='./src/assets/ifet_logo.svg';" 
            />
            <div class="home-nav-brand-text">
              <span class="home-college-title">IFET COLLEGE OF ENGINEERING</span>
              <span class="home-portal-subtitle">MAINTENANCE MANAGEMENT PORTAL</span>
            </div>
          </a>

          <!-- Center Navigation Links -->
          <nav class="home-nav-links" id="home-nav-menu">
            <a href="#home" class="home-nav-link active">Home</a>
            <a href="#how-it-works" class="home-nav-link">How It Works</a>
            <a href="#workflow" class="home-nav-link">Workflow</a>
            <a href="#features" class="home-nav-link">Features</a>
            <a href="#departments" class="home-nav-link">Departments</a>
            <a href="#faq" class="home-nav-link">FAQ</a>
          </nav>

          <!-- Right Action Controls -->
          <div class="home-nav-actions">
            <button class="btn-theme-toggle" id="btn-theme-toggle" title="Toggle Dark/Light Mode" aria-label="Toggle Theme">
              🌙
            </button>
            <a href="#login" class="btn btn-primary btn-nav-login">
              <span>Login to Portal &rarr;</span>
            </a>
            <button class="btn-home-hamburger" id="btn-home-hamburger" aria-label="Toggle Navigation Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>

      <!-- 2. HERO SECTION -->
      <section class="home-hero-section" id="home">
        <div class="home-section-container">
          <div class="hero-grid-layout">
            <!-- Left Hero Content (50%) -->
            <div class="hero-left-content">
              <div class="hero-institutional-badge">
                <span class="badge-icon">⚙</span>
                <span>IFET MAINTENANCE MANAGEMENT PORTAL</span>
              </div>

              <h1 class="hero-headline">
                Smart <span class="highlight-olive">Maintenance</span><br />
                Management System
              </h1>

              <p class="hero-lead-text">
                A centralized platform for submitting, approving, tracking, and managing college maintenance requests across laboratories and departments.
              </p>

              <p class="hero-sub-text">
                From maintenance request submission to approval, department assignment, tracking, and work completion — manage the entire process digitally.
              </p>

              <div class="hero-cta-button-group">
                <a href="#login" class="btn btn-hero-olive">
                  <span>🔧 Submit Request</span>
                </a>
                <a href="#login" class="btn btn-hero-white">
                  <span>Track Request</span>
                </a>
                <a href="#login" class="btn btn-hero-charcoal">
                  <span>Login to Portal</span>
                </a>
              </div>

              <div class="hero-trust-indicators">
                <div class="trust-indicator-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Role-Based Access Control</span>
                </div>
                <div class="trust-indicator-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>Real-Time Audit Tracking</span>
                </div>
                <div class="trust-indicator-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>Institutional Multi-Tier Approval</span>
                </div>
              </div>
            </div>

            <!-- Right Hero Visual Card (50%) -->
            <div class="hero-right-visual">
              <div class="process-visualization-card">
                <div class="process-visual-header">
                  <div class="process-visual-badge">GOVERNANCE PIPELINE</div>
                  <h3 class="process-visual-title">DIGITAL MAINTENANCE PROCESS</h3>
                  <p class="process-visual-subtitle">Request → Approve → Assign → Resolve</p>
                </div>

                <div class="process-pipeline-steps-container">
                  <!-- Step 01 -->
                  <div class="pipeline-card-step">
                    <div class="pipeline-step-badge">01</div>
                    <div class="pipeline-step-content">
                      <div class="pipeline-role-title">LAB ASSISTANT</div>
                      <div class="pipeline-role-action">Create Maintenance Request</div>
                    </div>
                  </div>
                  <div class="pipeline-step-arrow">↓</div>

                  <!-- Step 02 -->
                  <div class="pipeline-card-step">
                    <div class="pipeline-step-badge">02</div>
                    <div class="pipeline-step-content">
                      <div class="pipeline-role-title">LAB IN-CHARGE</div>
                      <div class="pipeline-role-action">Technical Review & Approval</div>
                    </div>
                  </div>
                  <div class="pipeline-step-arrow">↓</div>

                  <!-- Step 03 -->
                  <div class="pipeline-card-step">
                    <div class="pipeline-step-badge">03</div>
                    <div class="pipeline-step-content">
                      <div class="pipeline-role-title">HOD</div>
                      <div class="pipeline-role-action">Final Departmental Approval</div>
                    </div>
                  </div>
                  <div class="pipeline-step-arrow">↓</div>

                  <!-- Step 04 -->
                  <div class="pipeline-card-step">
                    <div class="pipeline-step-badge">04</div>
                    <div class="pipeline-step-content">
                      <div class="pipeline-role-title">HR OPERATIONS</div>
                      <div class="pipeline-role-action">Category Verification & Assignment</div>
                    </div>
                  </div>
                  <div class="pipeline-step-arrow">↓</div>

                  <!-- Step 05 -->
                  <div class="pipeline-card-step">
                    <div class="pipeline-step-badge">05</div>
                    <div class="pipeline-step-content">
                      <div class="pipeline-role-title">DEPARTMENT IN-CHARGE</div>
                      <div class="pipeline-role-action">Civil • Electrical • Furniture • Computer</div>
                    </div>
                  </div>
                  <div class="pipeline-step-arrow">↓</div>

                  <!-- Step Completed -->
                  <div class="pipeline-card-step step-completed">
                    <div class="pipeline-step-badge step-badge-check">✓</div>
                    <div class="pipeline-step-content">
                      <div class="pipeline-role-title">WORK COMPLETED</div>
                      <div class="pipeline-role-action">Resolution Verified & Archived</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. HERO STATISTICS ROW -->
      <section class="home-stats-section">
        <div class="home-section-container">
          <div class="stats-cards-grid">
            <!-- Card 1 -->
            <div class="stat-highlight-card">
              <div class="stat-card-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div class="stat-main-number">100%</div>
              <div class="stat-card-title">DIGITAL</div>
              <div class="stat-card-desc">Paperless maintenance process</div>
            </div>

            <!-- Card 2 -->
            <div class="stat-highlight-card">
              <div class="stat-card-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="stat-main-number">RBAC</div>
              <div class="stat-card-title">WORKFLOW</div>
              <div class="stat-card-desc">Secure role-based access</div>
            </div>

            <!-- Card 3 -->
            <div class="stat-highlight-card">
              <div class="stat-card-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="stat-main-number">24/7</div>
              <div class="stat-card-title">TRACKING</div>
              <div class="stat-card-desc">Track requests anytime</div>
            </div>

            <!-- Card 4 -->
            <div class="stat-highlight-card">
              <div class="stat-card-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <div class="stat-main-number">4+</div>
              <div class="stat-card-title">DEPARTMENTS</div>
              <div class="stat-card-desc">Civil • Electrical • Furniture • Computer</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. HOW IT WORKS SECTION -->
      <section class="home-section-padded" id="how-it-works">
        <div class="home-section-container">
          <div class="section-header-centered">
            <span class="section-badge-pill">HOW IT WORKS</span>
            <h2 class="section-main-heading">A Simple Workflow from Request to Resolution</h2>
            <p class="section-lead-subtitle">Every maintenance request follows a transparent approval and assignment process across institutional tiers.</p>
          </div>

          <div class="how-it-works-grid">
            <!-- Step 1 -->
            <div class="how-step-card">
              <div class="how-step-badge">01</div>
              <h3 class="how-step-title">Submit Request</h3>
              <p class="how-step-desc">Lab Assistant creates the maintenance request with location, photo, and priority details.</p>
              <div class="how-step-connector">&rarr;</div>
            </div>

            <!-- Step 2 -->
            <div class="how-step-card">
              <div class="how-step-badge">02</div>
              <h3 class="how-step-title">Lab Review</h3>
              <p class="how-step-desc">Lab In-Charge reviews the technical feasibility and approves or rejects the submission.</p>
              <div class="how-step-connector">&rarr;</div>
            </div>

            <!-- Step 3 -->
            <div class="how-step-card">
              <div class="how-step-badge">03</div>
              <h3 class="how-step-title">HOD Approval</h3>
              <p class="how-step-desc">Head of Department authorizes budget, equipment replacement, or technical clearance.</p>
              <div class="how-step-connector">&rarr;</div>
            </div>

            <!-- Step 4 -->
            <div class="how-step-card">
              <div class="how-step-badge">04</div>
              <h3 class="how-step-title">HR Assignment</h3>
              <p class="how-step-desc">HR checks the category classification and assigns the ticket to the domain in-charge.</p>
              <div class="how-step-connector">&rarr;</div>
            </div>

            <!-- Step 5 -->
            <div class="how-step-card">
              <div class="how-step-badge">05</div>
              <h3 class="how-step-title">Department Work</h3>
              <p class="how-step-desc">The designated maintenance department accepts the work, assigns a technician, and commences repair.</p>
              <div class="how-step-connector">&rarr;</div>
            </div>

            <!-- Step 6 -->
            <div class="how-step-card how-step-completed">
              <div class="how-step-badge step-badge-check">06</div>
              <h3 class="how-step-title">Work Completed</h3>
              <p class="how-step-desc">Technician logs completion proof, actual expenses, and verified resolution certificate.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. COMPLETE WORKFLOW SECTION (BRANCHED FLOWCHART) -->
      <section class="home-section-padded bg-alt-tint" id="workflow">
        <div class="home-section-container">
          <div class="section-header-centered">
            <span class="section-badge-pill">SYSTEM ARCHITECTURE</span>
            <h2 class="section-main-heading">Complete Maintenance Workflow</h2>
            <p class="section-lead-subtitle">Explore the interconnected multi-tier governance model ensuring operational accountability.</p>
          </div>

          <div class="interactive-workflow-tree">
            <!-- Tier 1: Admin -->
            <div class="workflow-tree-tier">
              <div class="workflow-node-card">
                <div class="node-role-badge">ADMINISTRATION</div>
                <h4 class="node-title">Admin Management</h4>
                <p class="node-desc">Creates User IDs, passwords & manages role permissions</p>
              </div>
            </div>
            <div class="tree-vertical-line">↓</div>

            <!-- Tier 2: Lab Assistant -->
            <div class="workflow-tree-tier">
              <div class="workflow-node-card">
                <div class="node-role-badge">LABORATORY INITIATOR</div>
                <h4 class="node-title">Lab Assistant</h4>
                <p class="node-desc">Creates and submits maintenance request with equipment specifications</p>
              </div>
            </div>
            <div class="tree-vertical-line">↓</div>

            <!-- Tier 3: Lab In-Charge -->
            <div class="workflow-tree-tier">
              <div class="workflow-node-card">
                <div class="node-role-badge">TECHNICAL VERIFIER</div>
                <h4 class="node-title">Lab In-Charge</h4>
                <p class="node-desc">Inspects equipment breakdown • Accept / Reject with remarks</p>
              </div>
            </div>
            <div class="tree-vertical-line">↓</div>

            <!-- Tier 4: HOD -->
            <div class="workflow-tree-tier">
              <div class="workflow-node-card">
                <div class="node-role-badge">DEPARTMENT EXECUTIVE</div>
                <h4 class="node-title">Head of Department (HOD)</h4>
                <p class="node-desc">Departmental review & budget authorization • Accept / Reject</p>
              </div>
            </div>
            <div class="tree-vertical-line">↓</div>

            <!-- Tier 5: HR Routing Hub -->
            <div class="workflow-tree-tier">
              <div class="workflow-node-card node-card-highlight">
                <div class="node-role-badge">CENTRAL OPERATIONS</div>
                <h4 class="node-title">HR Operations & Routing</h4>
                <p class="node-desc">Verifies work category & auto-dispatches to specialized maintenance departments</p>
              </div>
            </div>

            <!-- Branching to 4 Departments -->
            <div class="tree-branch-split">
              <div class="branch-line-horiz"></div>
            </div>

            <div class="workflow-branches-grid">
              <!-- Civil -->
              <div class="branch-node-item">
                <div class="branch-dept-card">
                  <div class="branch-icon">🧱</div>
                  <h4>CIVIL IN-CHARGE</h4>
                  <p>Plumbing, building masonry, walls, ceiling & painting</p>
                </div>
              </div>

              <!-- Electrical -->
              <div class="branch-node-item">
                <div class="branch-dept-card">
                  <div class="branch-icon">⚡</div>
                  <h4>ELECTRICAL IN-CHARGE</h4>
                  <p>Power circuits, lighting, fans, wiring & MCB sockets</p>
                </div>
              </div>

              <!-- Furniture -->
              <div class="branch-node-item">
                <div class="branch-dept-card">
                  <div class="branch-icon">🪑</div>
                  <h4>FURNITURE IN-CHARGE</h4>
                  <p>Lab chairs, computer tables, desks & storage units</p>
                </div>
              </div>

              <!-- Computer -->
              <div class="branch-node-item">
                <div class="branch-dept-card">
                  <div class="branch-icon">💻</div>
                  <h4>COMPUTER IN-CHARGE</h4>
                  <p>Workstation PCs, monitors, LAN switches & peripherals</p>
                </div>
              </div>
            </div>

            <div class="tree-branch-merge">
              <div class="branch-line-horiz"></div>
            </div>
            <div class="tree-vertical-line">↓</div>

            <!-- Tier 6: Completion -->
            <div class="workflow-tree-tier">
              <div class="workflow-node-card node-card-completed">
                <div class="node-role-badge">FINAL RESOLUTION</div>
                <h4 class="node-title">✓ Work Completed & Certified</h4>
                <p class="node-desc">Repair executed, technician cost logged, tested operational & closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. FEATURES SECTION -->
      <section class="home-section-padded" id="features">
        <div class="home-section-container">
          <div class="section-header-centered">
            <span class="section-badge-pill">CORE CAPABILITIES</span>
            <h2 class="section-main-heading">Everything You Need to Manage Maintenance</h2>
            <p class="section-lead-subtitle">Purpose-built tools empowering campus administrators, lab assistants, and engineering teams.</p>
          </div>

          <div class="features-cards-grid">
            <!-- Feature 1 -->
            <div class="feature-box-card">
              <div class="feature-box-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              </div>
              <div class="feature-step-num">01</div>
              <h3 class="feature-box-title">Digital Requests</h3>
              <p class="feature-box-desc">Submit maintenance requests digitally with room location, photo upload, and priority severity levels.</p>
            </div>

            <!-- Feature 2 -->
            <div class="feature-box-card">
              <div class="feature-box-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div class="feature-step-num">02</div>
              <h3 class="feature-box-title">Role-Based Approval</h3>
              <p class="feature-box-desc">Each request moves systematically through Lab In-Charge and HOD approval tiers with feedback logging.</p>
            </div>

            <!-- Feature 3 -->
            <div class="feature-box-card">
              <div class="feature-box-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </div>
              <div class="feature-step-num">03</div>
              <h3 class="feature-box-title">Smart Assignment</h3>
              <p class="feature-box-desc">HR routes requests directly to the dedicated Civil, Electrical, Furniture, or Computer maintenance cell.</p>
            </div>

            <!-- Feature 4 -->
            <div class="feature-box-card">
              <div class="feature-box-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div class="feature-step-num">04</div>
              <h3 class="feature-box-title">Real-Time Tracking</h3>
              <p class="feature-box-desc">Interactive 8-stage visual timeline allowing initiators and management to monitor progress anytime.</p>
            </div>

            <!-- Feature 5 -->
            <div class="feature-box-card">
              <div class="feature-box-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              </div>
              <div class="feature-step-num">05</div>
              <h3 class="feature-box-title">Centralized Records</h3>
              <p class="feature-box-desc">Keep comprehensive maintenance audit trails, repair costs, technician details, and completion certificates.</p>
            </div>

            <!-- Feature 6 -->
            <div class="feature-box-card">
              <div class="feature-box-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              </div>
              <div class="feature-step-num">06</div>
              <h3 class="feature-box-title">Resolution Tracking</h3>
              <p class="feature-box-desc">Monitor work from task acceptance to final closure with performance metrics and CSV export.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. DEPARTMENTS SECTION -->
      <section class="home-section-padded bg-alt-tint" id="departments">
        <div class="home-section-container">
          <div class="section-header-centered">
            <span class="section-badge-pill">MAINTENANCE DOMAINS</span>
            <h2 class="section-main-heading">Maintenance Departments</h2>
            <p class="section-lead-subtitle">Specialized engineering divisions dedicated to preserving institutional infrastructure.</p>
          </div>

          <div class="dept-cards-grid">
            <!-- Civil -->
            <div class="dept-profile-card">
              <div class="dept-card-icon-wrap">🧱</div>
              <h3 class="dept-card-title">CIVIL</h3>
              <p class="dept-card-desc">Building and civil maintenance including structural repairs, plumbing valves, ceiling leakages, and painting works.</p>
              <div class="dept-card-tags">
                <span>Plumbing</span>
                <span>Masonry</span>
                <span>Painting</span>
              </div>
            </div>

            <!-- Electrical -->
            <div class="dept-profile-card">
              <div class="dept-card-icon-wrap">⚡</div>
              <h3 class="dept-card-title">ELECTRICAL</h3>
              <p class="dept-card-desc">Electrical maintenance including distribution boards, power sockets, ceiling fan capacitors, lighting, and wiring safety.</p>
              <div class="dept-card-tags">
                <span>Wiring</span>
                <span>Switchgear</span>
                <span>Fans & Lights</span>
              </div>
            </div>

            <!-- Furniture -->
            <div class="dept-profile-card">
              <div class="dept-card-icon-wrap">🪑</div>
              <h3 class="dept-card-title">FURNITURE</h3>
              <p class="dept-card-desc">Furniture repair and infrastructure maintenance including ergonomic lab chairs, hydraulic lifts, study desks, and store cabinets.</p>
              <div class="dept-card-tags">
                <span>Lab Chairs</span>
                <span>Workbenches</span>
                <span>Desks</span>
              </div>
            </div>

            <!-- Computer -->
            <div class="dept-profile-card">
              <div class="dept-card-icon-wrap">💻</div>
              <h3 class="dept-card-title">COMPUTER</h3>
              <p class="dept-card-desc">Computer and technical maintenance covering high-performance workstations, LAN connectivity, motherboard diagnostics, and displays.</p>
              <div class="dept-card-tags">
                <span>Hardware</span>
                <span>LAN & Network</span>
                <span>Monitors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. FAQ SECTION -->
      <section class="home-section-padded" id="faq">
        <div class="home-section-container">
          <div class="section-header-centered">
            <span class="section-badge-pill">CAMPUS HELP</span>
            <h2 class="section-main-heading">Frequently Asked Questions</h2>
            <p class="section-lead-subtitle">Common questions regarding maintenance request processing, timelines, and credentials.</p>
          </div>

          <div class="faq-accordion-container">
            <div class="faq-item">
              <button class="faq-question-btn">
                <span>Who can create a maintenance request in the system?</span>
                <span class="faq-toggle-icon">+</span>
              </button>
              <div class="faq-answer-content">
                <p>Laboratory Assistants and designated faculty members can create maintenance requests for their assigned laboratories and classrooms by signing into their portal.</p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-question-btn">
                <span>What happens if a request is rejected by Lab In-Charge or HOD?</span>
                <span class="faq-toggle-icon">+</span>
              </button>
              <div class="faq-answer-content">
                <p>When a request is rejected, the reviewer must provide a mandatory rejection reason. The request returns to the Lab Assistant who can review feedback, make corrections, and resubmit.</p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-question-btn">
                <span>How are requests assigned to maintenance departments?</span>
                <span class="faq-toggle-icon">+</span>
              </button>
              <div class="faq-answer-content">
                <p>After HOD approval, requests are verified by HR Operations and auto-routed to the specific maintenance in-charge based on work category (Civil, Electrical, Furniture, or Computer).</p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-question-btn">
                <span>Can I track the real-time status of submitted tickets?</span>
                <span class="faq-toggle-icon">+</span>
              </button>
              <div class="faq-answer-content">
                <p>Yes. The interactive Request Tracking view provides an 8-stage lifecycle timeline showing timestamps, approver names, comments, and technician completion certificates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 9. CALL TO ACTION SECTION -->
      <section class="home-cta-section">
        <div class="home-section-container">
          <div class="cta-banner-content">
            <h2 class="cta-heading">Ready to Manage Maintenance Digitally?</h2>
            <p class="cta-desc">Submit, approve, assign, track, and resolve maintenance requests through one centralized system.</p>
            <div class="cta-btn-group">
              <a href="#login" class="btn btn-hero-olive">
                <span>Submit Request</span>
              </a>
              <a href="#login" class="btn btn-hero-charcoal">
                <span>Login to Portal</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 10. COMPREHENSIVE INSTITUTIONAL FOOTER -->
      <footer class="home-footer-section">
        <div class="home-section-container">
          <div class="footer-top-grid">
            <!-- Left Info -->
            <div class="footer-brand-col">
              <div class="footer-brand-header">
                <img src="./src/assets/ifet_logo.png" alt="IFET Logo" class="footer-logo-img" onerror="this.onerror=null; this.src='./src/assets/ifet_logo.svg';" />
                <div>
                  <h4 class="footer-college-name">IFET College of Engineering</h4>
                  <p class="footer-portal-name">IFET Maintenance Management System</p>
                </div>
              </div>
              <p class="footer-about-text">
                Centralized digital platform facilitating automated laboratory maintenance workflows, institutional approvals, and infrastructure governance.
              </p>
            </div>

            <!-- Center Navigation Links -->
            <div class="footer-links-col">
              <h4 class="footer-col-title">Quick Links</h4>
              <div class="footer-links-list">
                <a href="#home">Home</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#workflow">Workflow</a>
                <a href="#features">Features</a>
                <a href="#departments">Departments</a>
                <a href="#faq">FAQ</a>
              </div>
            </div>

            <!-- Right Portal Entry -->
            <div class="footer-action-col">
              <h4 class="footer-col-title">Institutional Access</h4>
              <p class="footer-action-desc">Access your role-specific maintenance control portal.</p>
              <a href="#login" class="btn btn-primary" style="width: fit-content; margin-top: 10px;">
                <span>Login to Portal &rarr;</span>
              </a>
            </div>
          </div>

          <div class="footer-bottom-bar">
            <div class="footer-bottom-copy">
              &copy; 2026 IFET College of Engineering (Autonomous). All Rights Reserved. • Central Maintenance & Infrastructure Management Cell
            </div>
          </div>
        </div>
      </footer>
    </div>
  `;

  attachHomeEventListeners(container);
}

function attachHomeEventListeners(container) {
  // Dark Mode Toggle
  const themeBtn = container.querySelector('#btn-theme-toggle');
  if (themeBtn) {
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

  // Mobile Hamburger Toggle
  const hamburgerBtn = container.querySelector('#btn-home-hamburger');
  const navMenu = container.querySelector('#home-nav-menu');
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }

  // Smooth scroll for nav links
  container.querySelectorAll('.home-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#') && targetId !== '#login' && targetId !== '#home') {
        const targetElem = container.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({ behavior: 'smooth' });
          if (navMenu) navMenu.classList.remove('mobile-open');
        }
      }
    });
  });

  // FAQ Accordion Handlers
  container.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('active');
      
      // Close all
      container.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}
