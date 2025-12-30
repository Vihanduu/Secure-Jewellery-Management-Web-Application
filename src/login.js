import { signIn, getSession, isManager } from './auth.js';

// Check if user is already logged in
async function checkAuth() {
  try {
    const session = await getSession();
    if (session) {
      // Redirect to appropriate dashboard
      const user = session.user;
      if (isManager(user)) {
        window.location.href = '/manager-dashboard.html';
      } else {
        window.location.href = '/dashboard.html';
      }
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
}

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('error-message');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Clear previous errors
  errorMessage.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const { user } = await signIn(email, password);

    // Redirect based on user role
    if (isManager(user)) {
      window.location.href = '/manager-dashboard.html';
    } else {
      window.location.href = '/dashboard.html';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.textContent = error.message || 'Invalid email or password';
    errorMessage.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
});

// Check auth on page load
checkAuth();
