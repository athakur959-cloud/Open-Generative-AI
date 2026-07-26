// HuggingFace API integration utilities
// Removes dependency on muapi_key and credits system

export async function validateHFToken(token) {
  try {
    const response = await fetch('https://huggingface.co/api/whoami', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.ok;
  } catch (err) {
    console.error('Token validation failed:', err);
    return false;
  }
}

export async function getUserInfo(token) {
  try {
    const response = await fetch('https://huggingface.co/api/whoami', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user info');
    return await response.json();
  } catch (err) {
    console.error('Failed to get user info:', err);
    return null;
  }
}

// Note: HuggingFace free tier doesn't use credit-based limits
// Instead it uses rate limiting. No need to fetch "balance"
