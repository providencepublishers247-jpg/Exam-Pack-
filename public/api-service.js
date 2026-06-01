// ============================================================================
// API SERVICE FUNCTIONS FOR EXAM PACK FRONTEND
// ============================================================================

const API_URL = 'http://localhost:5000/api';

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Register a new user account
 * @param {string} fullName - User's full name
 * @param {string} email - User's email address
 * @param {string} phoneNumber - User's phone number
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response with token and user data
 */
async function registerUser(fullName, email, phoneNumber, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName,
        email,
        phoneNumber,
        password
      })
    });

    const data = await response.json();

    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Registration successful:', data.user);
    } else {
      console.error('Registration failed:', data.message);
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed', error: error.message };
  }
}

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Response with token and user data
 */
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Login successful:', data.user);
    } else {
      console.error('Login failed:', data.message);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed', error: error.message };
  }
}

/**
 * Get current logged-in user
 * @returns {Promise<Object>} User object with details
 */
async function getCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'No token found' };
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return { success: false, message: 'Failed to fetch user', error: error.message };
  }
}

/**
 * Logout user (client-side)
 */
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Logged out successfully');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
function isUserAuthenticated() {
  return !!localStorage.getItem('token');
}

// ============================================================================
// PACK/PRODUCT FUNCTIONS
// ============================================================================

/**
 * Get all available exam packs
 * @returns {Promise<Object>} Array of pack objects
 */
async function getAllPacks() {
  try {
    const response = await fetch(`${API_URL}/packs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching packs:', error);
    return { success: false, message: 'Failed to fetch packs', error: error.message };
  }
}

/**
 * Get packs by education level
 * @param {string} level - Education level (Nursery, Lower Primary, Higher Primary)
 * @returns {Promise<Object>} Array of packs for specified level
 */
async function getPacksByLevel(level) {
  try {
    const response = await fetch(`${API_URL}/packs/level/${level}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching packs by level:', error);
    return { success: false, message: 'Failed to fetch packs', error: error.message };
  }
}

/**
 * Get single pack details
 * @param {string} packId - Pack ID
 * @returns {Promise<Object>} Pack details
 */
async function getPackDetails(packId) {
  try {
    const response = await fetch(`${API_URL}/packs/${packId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pack details:', error);
    return { success: false, message: 'Failed to fetch pack', error: error.message };
  }
}

// ============================================================================
// PAYMENT FUNCTIONS (PAYSTACK)
// ============================================================================

/**
 * Initialize payment for a pack
 * @param {string} packId - Pack ID to purchase
 * @returns {Promise<Object>} Payment initialization with Paystack URL
 */
async function initializePayment(packId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Please login to make a purchase' };
    }

    const response = await fetch(`${API_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ packId })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Payment initialized:', data);
      // Store payment ID for verification later
      sessionStorage.setItem('paymentId', data.paymentId);
    }

    return data;
  } catch (error) {
    console.error('Payment initialization error:', error);
    return { success: false, message: 'Failed to initialize payment', error: error.message };
  }
}

/**
 * Verify payment after Paystack redirect
 * @param {string} reference - Paystack reference/transaction ID
 * @returns {Promise<Object>} Verification result
 */
async function verifyPayment(reference) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    const response = await fetch(`${API_URL}/payments/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('Payment verified successfully:', data);
      sessionStorage.removeItem('paymentId');
    }

    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    return { success: false, message: 'Payment verification failed', error: error.message };
  }
}

/**
 * Get user's payment history
 * @returns {Promise<Object>} Array of payment records
 */
async function getPaymentHistory() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    const response = await fetch(`${API_URL}/payments/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return { success: false, message: 'Failed to fetch payment history', error: error.message };
  }
}

// ============================================================================
// DOWNLOAD FUNCTIONS
// ============================================================================

/**
 * Download a purchased pack
 * @param {string} packId - Pack ID to download
 */
async function downloadPack(packId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to download files');
      return false;
    }

    // Initiate file download
    const downloadUrl = `${API_URL}/downloads/pack/${packId}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('Authorization', `Bearer ${token}`);
    
    // Alternative: Use fetch to handle auth properly
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.message || 'Download failed');
      return false;
    }

    // Create blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Try to get filename from content-disposition header
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'exam-pack';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
      if (filenameMatch) filename = filenameMatch[1];
    }
    
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    console.log('Download started:', filename);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    alert('Download failed: ' + error.message);
    return false;
  }
}

/**
 * Get user's download history
 * @returns {Promise<Object>} Array of download records
 */
async function getDownloadHistory() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    const response = await fetch(`${API_URL}/downloads/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching download history:', error);
    return { success: false, message: 'Failed to fetch download history', error: error.message };
  }
}

/**
 * Get user's purchased packs
 * @returns {Promise<Object>} Array of purchased pack objects
 */
async function getPurchasedPacks() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    const response = await fetch(`${API_URL}/downloads/purchased-packs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching purchased packs:', error);
    return { success: false, message: 'Failed to fetch purchased packs', error: error.message };
  }
}

// ============================================================================
// USER PROFILE FUNCTIONS
// ============================================================================

/**
 * Get user profile with purchase and download history
 * @returns {Promise<Object>} User profile object
 */
async function getUserProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { success: false, message: 'Failed to fetch profile', error: error.message };
  }
}

/**
 * Update user profile
 * @param {string} fullName - Updated full name
 * @param {string} phoneNumber - Updated phone number
 * @returns {Promise<Object>} Updated user object
 */
async function updateUserProfile(fullName, phoneNumber) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName,
        phoneNumber
      })
    });

    const data = await response.json();

    if (data.success) {
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Profile updated successfully');
    }

    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Failed to update profile', error: error.message };
  }
}

/**
 * Get user statistics (purchases, downloads, etc.)
 * @returns {Promise<Object>} User statistics object
 */
async function getUserStatistics() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    const response = await fetch(`${API_URL}/users/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return { success: false, message: 'Failed to fetch statistics', error: error.message };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format price with currency
 * @param {number} amount - Amount in kobo (for Paystack) or naira
 * @param {boolean} isKobo - If true, converts from kobo to naira
 * @returns {string} Formatted price string
 */
function formatPrice(amount, isKobo = false) {
  const naira = isKobo ? amount / 100 : amount;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(naira);
}

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

/**
 * Show notification/alert
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 */
function showNotification(message, type = 'info') {
  // Simple alert for now, can be replaced with custom toast
  const prefix = {
    success: '✓ ',
    error: '✕ ',
    info: 'ℹ ',
    warning: '⚠ '
  }[type] || '';

  alert(prefix + message);
  console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * Handle Paystack payment flow
 * @param {string} packId - Pack ID to purchase
 */
async function handlePaystackPayment(packId) {
  try {
    // Step 1: Initialize payment
    const initResult = await initializePayment(packId);
    
    if (!initResult.success) {
      showNotification(initResult.message, 'error');
      return;
    }

    // Step 2: Redirect to Paystack
    window.location.href = initResult.authorizationUrl;
  } catch (error) {
    console.error('Payment handling error:', error);
    showNotification('Payment initiation failed', 'error');
  }
}

/**
 * Handle payment verification after Paystack callback
 * @param {string} reference - Paystack reference from URL parameter
 */
async function handlePaymentVerification(reference) {
  try {
    showNotification('Verifying payment...', 'info');
    
    const result = await verifyPayment(reference);
    
    if (result.success) {
      showNotification('Payment verified! Your pack is ready to download.', 'success');
      // Redirect to download or dashboard
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 2000);
    } else {
      showNotification('Payment verification failed: ' + result.message, 'error');
    }
  } catch (error) {
    console.error('Verification error:', error);
    showNotification('Verification failed', 'error');
  }
}
