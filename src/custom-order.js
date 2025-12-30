import { getCurrentUser, signOut } from './auth.js';
import { createCustomOrder, uploadDesignFile } from './orders.js';
import { showNotification, validateFile } from './utils.js';

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

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('required_date').setAttribute('min', today);

// File preview
document.getElementById('design_file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const fileError = document.getElementById('file-error');
  const preview = document.getElementById('image-preview');

  fileError.classList.add('hidden');
  preview.classList.add('hidden');

  if (!file) return;

  const validation = validateFile(file);
  if (!validation.valid) {
    fileError.textContent = validation.error;
    fileError.classList.remove('hidden');
    e.target.value = '';
    return;
  }

  // Show preview for images
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
});

// Handle form submission
document.getElementById('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const user = await getCurrentUser();
    const formData = new FormData(e.target);
    const designFile = document.getElementById('design_file').files[0];

    let designFilePath = null;
    let designFileName = null;

    // Upload design file if provided
    if (designFile) {
      try {
        showNotification('Uploading design file...', 'info');
        const uploadResult = await uploadDesignFile(designFile);
        designFilePath = uploadResult.path;
        designFileName = uploadResult.originalName;
      } catch (error) {
        console.error('File upload error:', error);
        showNotification('File upload failed, but order will be created without design file', 'warning');
      }
    }

    // Create order
    const orderData = {
      user_id: user.id,
      jewellery_type: formData.get('jewellery_type'),
      material: formData.get('material'),
      budget: parseFloat(formData.get('budget')),
      description: formData.get('description'),
      required_date: formData.get('required_date'),
      design_file_path: designFilePath,
      design_file_name: designFileName,
      status: 'requested'
    };

    const order = await createCustomOrder(orderData);
    showNotification('Order created successfully!', 'success');

    setTimeout(() => {
      window.location.href = `/order-tracking.html?id=${order.id}`;
    }, 1500);

  } catch (error) {
    console.error('Order creation error:', error);
    showNotification(error.message || 'Failed to create order', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Order';
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

checkAuth();
