// Input validation utilities for security and data integrity

export class ValidationService {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone number validation (Thai format)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+66|0)[6|8|9][0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }

  // Password strength validation
  static isStrongPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Sanitize HTML/XSS protection
  static sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // SQL injection protection (basic)
  static sanitizeString(input: string): string {
    return input.replace(/[<>\"'&]/g, (match) => {
      const escapeChars: { [key: string]: string } = {
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '&#x27;',
        '&': '&'
      };
      return escapeChars[match] || match;
    });
  }

  // Validate product data
  static validateProduct(data: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Product name is required');
    } else if (data.name.length > 100) {
      errors.push('Product name must be less than 100 characters');
    }

    if (data.description && data.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    if (!data.price || data.price <= 0) {
      errors.push('Price must be greater than 0');
    } else if (data.price > 1000000) {
      errors.push('Price cannot exceed ฿1,000,000');
    }

    if (data.stock !== undefined && data.stock < 0) {
      errors.push('Stock cannot be negative');
    }

    return { valid: errors.length === 0, errors };
  }

  // Validate order data
  static validateOrder(data: {
    quantity?: number;
    totalPrice?: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.quantity || data.quantity <= 0) {
      errors.push('Quantity must be at least 1');
    } else if (data.quantity > 100) {
      errors.push('Quantity cannot exceed 100');
    }

    if (!data.totalPrice || data.totalPrice <= 0) {
      errors.push('Total price must be greater than 0');
    }

    return { valid: errors.length === 0, errors };
  }

  // Validate message content
  static validateMessage(message: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!message?.trim()) {
      errors.push('Message cannot be empty');
    } else if (message.length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }

    return { valid: errors.length === 0, errors };
  }

  // Rate limiting check (basic implementation)
  private static requestCounts = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userRequests = this.requestCounts.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      this.requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userRequests.count >= maxRequests) {
      return false;
    }

    userRequests.count++;
    return true;
  }

  // File upload validation
  static validateFile(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be: ${allowedTypes.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }
}

// Input sanitization middleware for API routes
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return ValidationService.sanitizeString(input);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

// Rate limiting middleware
export function rateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000) {
  return (req: Request) => {
    if (!ValidationService.checkRateLimit(identifier, maxRequests, windowMs)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return null; // Continue to next handler
  };
}