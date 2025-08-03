// lib/api.ts or utils/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000/api';

export async function fetchProduct(id: string) {
  try {
    // Ensure we have a valid base URL
    if (!API_BASE_URL || API_BASE_URL === 'undefined') {
      throw new Error('API_BASE_URL is not configured properly');
    }

    const url = `${API_BASE_URL}/products/${id}`;
    console.log('Fetching from URL:', url); // Debug log
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

// Alternative approach with better error handling
export async function fetchProductSafe(id: string) {
  // Fallback to relative URL if no base URL is configured
  const baseUrl = API_BASE_URL && API_BASE_URL !== 'undefined' 
    ? API_BASE_URL 
    : '';
  
  const url = baseUrl ? `${baseUrl}/products/${id}` : `/api/products/${id}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null; // Return null instead of throwing during build
  }
}