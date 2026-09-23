// src/js/views/reportsView.js - System Analytics, Interactive Charts & Export Reports

import { db } from '../db.js';

export function renderReportsView(container) {
  const requests = db.getRequests();

  const totalReqs = requests.length;
  const civilReqs = requests.filter(r => r.category === 'Civil').length;
  const elecReqs = requests.filter(r => r.category === 'Electrical').length;
  const furnReqs = requests.filter(r => r.category === 'Furniture').length;
  const compReqs = requests.filter(r => r.category === 'Computer').length;

  const completedReqs = requests.filter(r => r.status === 'Work Completed' || r.status === 'Closed').length;
  const pendingReqs = requests.filter(r => r.status.startsWith('Pending')).length;
  const rejectedReqs = requests.filter(r => r.status.startsWith('Rejected')).length;

  container.innerHTML = `
    <!-- Top Action Banner -->
    <div class="dashboard-banner-card">
      <div class="banner-welcome-content">
        <div class="banner-badge">REPORTS & ANALYTICS</div>
        <h2 class="banner-title">Maintenance Analytics & Metrics</h2>
        <p class="banner-desc">Real-time performance reports, domain breakdown, request status distribution, and CSV export.</p>
      </div>
      <div class="banner-actions-group">
        <button class="btn btn-primary" id="btn-export-csv" ${totalReqs === 0 ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Export CSV Report</span>
        </button>
      </div>
    </div>

    <!-- Top Summary Stat Cards -->
    <div class="metrics-grid">
      <div class="metric-card" style="--card-accent: #3b82f6;">
        <div class="metric-info">
          <span class="metric-label">Total Requests</span>
          <span class="metric-value">${totalReqs}</span>
        </div>
      </div>
      <div class="metric-card" style="--card-accent: #f59e0b;">
        <div class="metric-info">
          <span class="metric-label">Civil</span>
          <span class="metric-value">${civilReqs}</span>
        </div>
      </div>
      <div class="metric-card" style="--card-accent: #eab308;">
        <div class="metric-info">
          <span class="metric-label">Electrical</span>
          <span class="metric-value">${elecReqs}</span>
        </div>
      </div>
      <div class="metric-card" style="--card-accent: #8b5cf6;">
        <div class="metric-info">
          <span class="metric-label">Furniture</span>
          <span class="metric-value">${furnReqs}</span>
        </div>
      </div>
      <div class="metric-card" style="--card-accent: #06b6d4;">
        <div class="metric-info">
          <span class="metric-label">Computer</span>
          <span class="metric-value">${compReqs}</span>
        </div>
      </div>
      <div class="metric-card" style="--card-accent: #10b981;">
        <div class="metric-info">
          <span class="metric-label">Completed</span>
          <span class="metric-value">${completedReqs}</span>
        </div>
      </div>
    </div>

    ${totalReqs === 0 ? `
      <div class="content-card">
        <div class="empty-state-table" style="padding: 48px 24px;">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-title">No maintenance data available for reports.</div>
          <div class="empty-state-desc">Interactive charts and category distributions will be populated here automatically once maintenance requests are submitted.</div>
        </div>
      </div>
    ` : `
      <!-- Interactive Charts Grid -->
      <div class="reports-charts-grid">
        <div class="content-card">
          <h4 style="font-family: var(--font-heading); font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--primary-900);">
            Requests by Work Category
          </h4>
          <div style="position: relative; height: 260px;">
            <canvas id="chart-category"></canvas>
          </div>
        </div>

        <div class="content-card">
          <h4 style="font-family: var(--font-heading); font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--primary-900);">
            Requests by Lifecycle Status
          </h4>
          <div style="position: relative; height: 260px;">
            <canvas id="chart-status"></canvas>
          </div>
        </div>

        <div class="content-card">
          <h4 style="font-family: var(--font-heading); font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--primary-900);">
            Priority Level Distribution
          </h4>
          <div style="position: relative; height: 260px;">
            <canvas id="chart-priority"></canvas>
          </div>
        </div>

        <div class="content-card">
          <h4 style="font-family: var(--font-heading); font-size: 15px; font-weight: 700; margin-bottom: 16px; color: var(--primary-900);">
            Department Completion Performance
          </h4>
          <div style="position: relative; height: 260px;">
            <canvas id="chart-dept-perf"></canvas>
          </div>
        </div>
      </div>
    `}
  `;

  // Attach CSV Export Handler
  if (totalReqs > 0) {
    container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
      exportToCSV(requests);
    });

    // Render Chart.js Visuals
    setTimeout(() => {
      initCharts(civilReqs, elecReqs, furnReqs, compReqs, pendingReqs, completedReqs, rejectedReqs, requests);
    }, 100);
  }
}

function initCharts(civil, elec, furn, comp, pending, completed, rejected, requests) {
  if (typeof Chart === 'undefined') return;

  // 1. Category Chart (Doughnut)
  const ctxCat = document.getElementById('chart-category');
  if (ctxCat) {
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

  // 2. Status Chart (Bar)
  const ctxStatus = document.getElementById('chart-status');
  if (ctxStatus) {
    new Chart(ctxStatus, {
      type: 'bar',
      data: {
        labels: ['Pending', 'Completed', 'Rejected'],
        datasets: [{
          label: 'Requests Count',
          data: [pending, completed, rejected],
          backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
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

  // 3. Priority Distribution (Pie)
  const lowCount = requests.filter(r => r.priority === 'Low').length;
  const medCount = requests.filter(r => r.priority === 'Medium').length;
  const highCount = requests.filter(r => r.priority === 'High').length;
  const emgCount = requests.filter(r => r.priority === 'Emergency').length;

  const ctxPrio = document.getElementById('chart-priority');
  if (ctxPrio) {
    new Chart(ctxPrio, {
      type: 'pie',
      data: {
        labels: ['Low', 'Medium', 'High', 'Emergency'],
        datasets: [{
          data: [lowCount, medCount, highCount, emgCount],
          backgroundColor: ['#0284c7', '#8B9C1E', '#ea580c', '#dc2626']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  // 4. Department Performance (Bar)
  const ctxDept = document.getElementById('chart-dept-perf');
  if (ctxDept) {
    new Chart(ctxDept, {
      type: 'bar',
      data: {
        labels: ['Civil', 'Electrical', 'Furniture', 'Computer'],
        datasets: [
          {
            label: 'Total Assigned',
            data: [civil, elec, furn, comp],
            backgroundColor: '#3b82f6',
            borderRadius: 6
          },
          {
            label: 'Completed',
            data: [
              requests.filter(r => r.category === 'Civil' && (r.status === 'Work Completed' || r.status === 'Closed')).length,
              requests.filter(r => r.category === 'Electrical' && (r.status === 'Work Completed' || r.status === 'Closed')).length,
              requests.filter(r => r.category === 'Furniture' && (r.status === 'Work Completed' || r.status === 'Closed')).length,
              requests.filter(r => r.category === 'Computer' && (r.status === 'Work Completed' || r.status === 'Closed')).length
            ],
            backgroundColor: '#10b981',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}

function exportToCSV(requests) {
  const headers = ['Request ID', 'Department', 'Submitted By', 'Lab Name', 'Building', 'Room', 'Problem Title', 'Category', 'Priority', 'Status', 'Submitted Date'];
  const rows = requests.map(r => [
    `"${r.request_id}"`,
    `"${r.department || 'General'}"`,
    `"${r.created_by_name}"`,
    `"${r.lab_name}"`,
    `"${r.building}"`,
    `"${r.room_number}"`,
    `"${r.problem_title.replace(/"/g, '""')}"`,
    `"${r.category}"`,
    `"${r.priority}"`,
    `"${r.status}"`,
    `"${new Date(r.created_at).toLocaleString()}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `IFET_Maintenance_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
