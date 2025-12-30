import { getCurrentUser, signOut } from './auth.js';
import { getOrderById, getMyOrders } from './orders.js';
import { formatDate, formatCurrency, formatDateTime, getStatusLabel, showNotification } from './utils.js';

async function checkAuth() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = '/index.html';
    }
    return user;
  } catch (error) {
    window.location.href = '/index.html';
  }
}

function getTimelineSteps(status) {
  const allSteps = [
    { status: 'requested', label: 'Order Requested' },
    { status: 'approved', label: 'Approved by Manager' },
    { status: 'in_production', label: 'In Production' },
    { status: 'completed', label: 'Completed' }
  ];

  const statusOrder = ['requested', 'approved', 'in_production', 'completed'];
  const currentIndex = statusOrder.indexOf(status);

  if (status === 'rejected') {
    return [
      { status: 'requested', label: 'Order Requested', active: true },
      { status: 'rejected', label: 'Rejected', active: true }
    ];
  }

  return allSteps.map((step, index) => ({
    ...step,
    active: index <= currentIndex
  }));
}

async function loadOrderTracking() {
  const loading = document.getElementById('loading');
  const container = document.getElementById('order-container');

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    let order;

    if (orderId) {
      order = await getOrderById(orderId);
      if (!order) {
        container.innerHTML = '<p class="form-error">Order not found.</p>';
        loading.classList.add('hidden');
        return;
      }
    } else {
      // If no ID provided, show the most recent order
      const orders = await getMyOrders();
      if (orders.length === 0) {
        container.innerHTML = '<p class="text-muted">No orders found. <a href="/custom-order.html" class="navbar-link">Create your first order</a></p>';
        loading.classList.add('hidden');
        return;
      }
      order = orders[0];
    }

    loading.classList.add('hidden');

    const timelineSteps = getTimelineSteps(order.status);

    container.innerHTML = `
      <div class="mb-3">
        <div class="flex-between mb-2">
          <h3 style="color: var(--accent-gold);">Order Details</h3>
          <span class="badge badge-${order.status}">${getStatusLabel(order.status)}</span>
        </div>

        <div class="grid grid-2">
          <div>
            <strong>Order ID:</strong> ${order.id}
          </div>
          <div>
            <strong>Type:</strong> ${order.jewellery_type}
          </div>
          <div>
            <strong>Material:</strong> ${order.material}
          </div>
          <div>
            <strong>Budget:</strong> ${formatCurrency(order.budget)}
          </div>
          <div>
            <strong>Required Date:</strong> ${formatDate(order.required_date)}
          </div>
          <div>
            <strong>Submitted:</strong> ${formatDateTime(order.created_at)}
          </div>
        </div>

        <div class="mt-2">
          <strong>Description:</strong>
          <p>${order.description}</p>
        </div>

        ${order.design_file_path ? `
          <div class="mt-2">
            <strong>Design File:</strong>
            <a href="${order.design_file_path}" target="_blank" class="navbar-link">${order.design_file_name || 'View Design'}</a>
          </div>
        ` : ''}

        ${order.manager_comment ? `
          <div class="mt-2" style="padding: 1rem; background: var(--bg-hover); border-left: 3px solid var(--accent-gold); border-radius: 4px;">
            <strong>Manager Feedback:</strong>
            <p>${order.manager_comment}</p>
            <small class="text-muted">Last updated: ${formatDateTime(order.updated_at)}</small>
          </div>
        ` : ''}
      </div>

      <div class="card" style="background: var(--bg-hover);">
        <h4 class="mb-2" style="color: var(--accent-gold);">Order Timeline</h4>

        <div class="timeline">
          ${timelineSteps.map(step => `
            <div class="timeline-item ${step.active ? 'active' : ''}">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-title">${step.label}</div>
                ${step.active && order.status === step.status ? `
                  <div class="timeline-time">${formatDateTime(order.updated_at)}</div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="mt-3">
        <a href="/dashboard.html" class="btn btn-secondary">Back to My Orders</a>
      </div>
    `;

  } catch (error) {
    console.error('Error loading order:', error);
    loading.classList.add('hidden');
    container.innerHTML = '<p class="form-error">Failed to load order details. Please try again.</p>';
  }
}

// Logout handler
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await signOut();
    window.location.href = '/index.html';
  } catch (error) {
    showNotification('Logout failed', 'error');
  }
});

checkAuth().then(() => loadOrderTracking());
