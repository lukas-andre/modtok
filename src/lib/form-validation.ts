// Form Validation Utility
// Provides consistent client-side validation across all admin forms

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface FieldValidation {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+56\s?)?([0-9]\s?){8,9}$/,
  rut: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// Common validation messages
export const messages = {
  required: 'Este campo es requerido',
  email: 'Ingresa un email válido',
  phone: 'Ingresa un teléfono válido (ej: +56 9 1234 5678)',
  rut: 'Ingresa un RUT válido (ej: 12.345.678-9)',
  url: 'Ingresa una URL válida (ej: https://www.ejemplo.cl)',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede exceder ${max} caracteres`,
  min: (min: number) => `El valor mínimo es ${min}`,
  max: (max: number) => `El valor máximo es ${max}`
};

// Validate a single field
export function validateField(value: any, rule: ValidationRule): string | null {
  // Required check
  if (rule.required && (!value || value.toString().trim() === '')) {
    return messages.required;
  }

  // If field is empty and not required, skip other validations
  if (!value || value.toString().trim() === '') {
    return null;
  }

  const stringValue = value.toString();

  // Length validations
  if (rule.minLength && stringValue.length < rule.minLength) {
    return messages.minLength(rule.minLength);
  }

  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return messages.maxLength(rule.maxLength);
  }

  // Numeric validations
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = Number(value);

    if (rule.min !== undefined && numValue < rule.min) {
      return messages.min(rule.min);
    }

    if (rule.max !== undefined && numValue > rule.max) {
      return messages.max(rule.max);
    }
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    if (rule.pattern === patterns.email) return messages.email;
    if (rule.pattern === patterns.phone) return messages.phone;
    if (rule.pattern === patterns.rut) return messages.rut;
    if (rule.pattern === patterns.url) return messages.url;
    return 'Formato inválido';
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
}

// Validate entire form
export function validateForm(formData: FormData, rules: FieldValidation): ValidationResult {
  const errors: { [key: string]: string } = {};

  for (const [fieldName, rule] of Object.entries(rules)) {
    const value = formData.get(fieldName);
    const error = validateField(value, rule);

    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Show validation errors in the UI
export function showFieldError(fieldName: string, errorMessage: string) {
  const field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
  if (!field) return;

  // Remove existing error
  const existingError = field.parentElement?.querySelector('.validation-error');
  if (existingError) {
    existingError.remove();
  }

  // Add error class to field
  field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
  field.classList.remove('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');

  // Create and show error message
  const errorElement = document.createElement('div');
  errorElement.className = 'validation-error text-sm text-red-600 mt-1';
  errorElement.textContent = errorMessage;

  field.parentElement?.appendChild(errorElement);
}

// Clear field error
export function clearFieldError(fieldName: string) {
  const field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
  if (!field) return;

  // Remove error styling
  field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
  field.classList.add('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');

  // Remove error message
  const existingError = field.parentElement?.querySelector('.validation-error');
  if (existingError) {
    existingError.remove();
  }
}

// Clear all form errors
export function clearAllErrors(formElement: HTMLFormElement) {
  const errorElements = formElement.querySelectorAll('.validation-error');
  errorElements.forEach(el => el.remove());

  const fields = formElement.querySelectorAll('input, textarea, select');
  fields.forEach(field => {
    field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    field.classList.add('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');
  });
}

// Show all validation errors
export function showValidationErrors(errors: { [key: string]: string }) {
  for (const [fieldName, errorMessage] of Object.entries(errors)) {
    showFieldError(fieldName, errorMessage);
  }
}

// Provider-specific validation rules
export const providerValidationRules: FieldValidation = {
  company_name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  email: {
    required: true,
    pattern: patterns.email
  },
  phone: {
    required: true,
    pattern: patterns.phone
  },
  rut: {
    required: true,
    pattern: patterns.rut
  },
  website: {
    pattern: patterns.url
  },
  contact_name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  region: {
    required: true
  },
  temp_password: {
    required: true,
    minLength: 8,
    maxLength: 50
  },
  years_experience: {
    min: 0,
    max: 100
  },
  price_range_min: {
    min: 0,
    custom: (value: any) => {
      const maxField = document.querySelector('[name="price_range_max"]') as HTMLInputElement;
      if (maxField && maxField.value && Number(value) >= Number(maxField.value)) {
        return 'El precio mínimo debe ser menor al máximo';
      }
      return null;
    }
  },
  price_range_max: {
    min: 0,
    custom: (value: any) => {
      const minField = document.querySelector('[name="price_range_min"]') as HTMLInputElement;
      if (minField && minField.value && Number(value) <= Number(minField.value)) {
        return 'El precio máximo debe ser mayor al mínimo';
      }
      return null;
    }
  }
};

// Real-time validation setup
export function setupRealTimeValidation(formElement: HTMLFormElement, rules: FieldValidation) {
  const fields = formElement.querySelectorAll('input, textarea, select');

  fields.forEach(field => {
    const fieldName = field.getAttribute('name');
    if (!fieldName || !rules[fieldName]) return;

    // Clear error on focus
    field.addEventListener('focus', () => {
      clearFieldError(fieldName);
    });

    // Validate on blur
    field.addEventListener('blur', () => {
      const formData = new FormData(formElement);
      const error = validateField(formData.get(fieldName), rules[fieldName]);

      if (error) {
        showFieldError(fieldName, error);
      }
    });
  });
}