import { getCurrentUser, signOut } from './auth.js';
import { getMyOrders } from './orders.js';
import { formatDate, formatCurrency, getStatusLabel, showNotification } from './utils.js';

async function checkAuth() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = '/index.html';
    }
  } catch (error) {
    window.location.href = '/index.html';
  }
}

async function loadOrders() {
  const loading = document.getElementById('loading');
  const container = document.getElementById('orders-container');

  try {
    const orders = await getMyOrders();

    loading.classList.add('hidden');

    if (orders.length === 0) {
      container.innerHTML = '<p class="text-muted">No orders yet. Create your first custom jewellery order!</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Type</th>
          <th>Material</th>
          <th>Budget</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td>${order.id.slice(0, 8)}...</td>
            <td>${order.jewellery_type}</td>
            <td>${order.material}</td>
            <td>${formatCurrency(order.budget)}</td>
            <td><span class="badge badge-${order.status}">${getStatusLabel(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
              <a href="/order-tracking.html?id=${order.id}" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">View Details</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;

    container.appendChild(table);
  } catch (error) {
    console.error('Error loading orders:', error);
    loading.classList.add('hidden');
    container.innerHTML = '<p class="form-error">Failed to load orders. Please try again.</p>';
  }
}

document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await signOut();
    window.location.href = '/index.html';
  } catch (error) {
    showNotification('Logout failed', 'error');
  }
});

checkAuth();
loadOrders();
