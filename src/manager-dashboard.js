import { getCurrentUser, signOut, isManager } from './auth.js';
import { getPendingOrders, updateOrderStatus } from './orders.js';
import { formatDate, formatCurrency, formatDateTime, showNotification } from './utils.js';

let currentOrder = null;

async function checkAuth() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = '/index.html';
      return;
    }

    // Check if user is a manager
    if (!isManager(user)) {
      showNotification('Access denied. Manager role required.', 'error');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 2000);
      return;
    }

    return user;
  } catch (error) {
    window.location.href = '/index.html';
  }
}

async function loadPendingOrders() {
  const loading = document.getElementById('loading');
  const container = document.getElementById('orders-container');

  try {
    const orders = await getPendingOrders();

    loading.classList.add('hidden');

    if (orders.length === 0) {
      container.innerHTML = '<p class="text-muted">No pending orders at the moment.</p>';
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="card" style="border-left: 3px solid var(--accent-gold);">
        <div class="flex-between mb-2">
          <h4 style="color: var(--accent-gold);">${order.jewellery_type} - ${order.material}</h4>
          <span class="badge badge-requested">Pending Review</span>
        </div>

        <div class="grid grid-2 mb-2">
          <div>
            <strong>Order ID:</strong> ${order.id.slice(0, 8)}...
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

        <div class="mb-2">
          <strong>Description:</strong>
          <p>${order.description}</p>
        </div>

        ${order.design_file_path ? `
          <div class="mb-2">
            <strong>Design File:</strong> <a href="${order.design_file_path}" target="_blank" class="navbar-link">${order.design_file_name || 'View Design'}</a>
          </div>
        ` : ''}

        <div class="flex flex-gap">
          <button class="btn btn-success" onclick="window.openReviewModal('${order.id}', ${JSON.stringify(order).replace(/"/g, '&quot;')})">
            Review Order
          </button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading orders:', error);
    loading.classList.add('hidden');
    container.innerHTML = '<p class="form-error">Failed to load orders. Please try again.</p>';
  }
}

// Open review modal
window.openReviewModal = (orderId, orderData) => {
  currentOrder = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;
  const modal = document.getElementById('approval-modal');
  const details = document.getElementById('modal-order-details');

  details.innerHTML = `
    <div class="mb-2">
      <strong>Order ID:</strong> ${currentOrder.id.slice(0, 8)}...<br>
      <strong>Type:</strong> ${currentOrder.jewellery_type}<br>
      <strong>Material:</strong> ${currentOrder.material}<br>
      <strong>Budget:</strong> ${formatCurrency(currentOrder.budget)}<br>
      <strong>Required Date:</strong> ${formatDate(currentOrder.required_date)}
    </div>
  `;

  modal.style.display = 'flex';
  modal.classList.remove('hidden');
};

// Close modal
document.getElementById('close-modal-btn').addEventListener('click', () => {
  const modal = document.getElementById('approval-modal');
  modal.style.display = 'none';
  modal.classList.add('hidden');
  document.getElementById('manager-comment').value = '';
  currentOrder = null;
});

// Approve order
document.getElementById('approve-btn').addEventListener('click', async () => {
  const comment = document.getElementById('manager-comment').value.trim();

  if (!comment) {
    showNotification('Please add a comment before approving', 'warning');
    return;
  }

  if (!currentOrder) {
    showNotification('No order selected', 'error');
    return;
  }

  try {
    const user = await getCurrentUser();
    const approveBtn = document.getElementById('approve-btn');
    approveBtn.disabled = true;
    approveBtn.textContent = 'Approving...';

    await updateOrderStatus(currentOrder.id, 'approved', comment, user.id);

    showNotification('Order approved successfully!', 'success');
    document.getElementById('close-modal-btn').click();
    loadPendingOrders();
  } catch (error) {
    console.error('Approval error:', error);
    showNotification(error.message || 'Failed to approve order', 'error');
    document.getElementById('approve-btn').disabled = false;
    document.getElementById('approve-btn').textContent = 'Approve';
  }
});

// Reject order
document.getElementById('reject-btn').addEventListener('click', async () => {
  const comment = document.getElementById('manager-comment').value.trim();

  if (!comment) {
    showNotification('Please add a reason for rejection', 'warning');
    return;
  }

  if (!currentOrder) {
    showNotification('No order selected', 'error');
    return;
  }

  try {
    const user = await getCurrentUser();
    const rejectBtn = document.getElementById('reject-btn');
    rejectBtn.disabled = true;
    rejectBtn.textContent = 'Rejecting...';

    await updateOrderStatus(currentOrder.id, 'rejected', comment, user.id);

    showNotification('Order rejected', 'success');
    document.getElementById('close-modal-btn').click();
    loadPendingOrders();
  } catch (error) {
    console.error('Rejection error:', error);
    showNotification(error.message || 'Failed to reject order', 'error');
    document.getElementById('reject-btn').disabled = false;
    document.getElementById('reject-btn').textContent = 'Reject';
  }
});

// Logout handler
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await signOut();
    window.location.href = '/index.html';
  } catch (error) {
    showNotification('Logout failed', 'error');
  }
});

checkAuth().then(() => loadPendingOrders());
