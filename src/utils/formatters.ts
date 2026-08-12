/**
 * Formats a numeric value into South African Rand (ZAR) currency format.
 * Example: 1299 -> "R 1,299.00"
 */
export function formatZAR(amount: number): string {
  if (isNaN(amount)) return 'R 0.00';
  return `R ${amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Validates a 17-character VIN according to ISO 3779 standard.
 * VINs cannot contain the letters I, O, or Q to prevent confusion with numbers 1 and 0.
 */
export function validateVIN(vin: string): { isValid: boolean; message?: string } {
  const cleanVin = vin.trim().toUpperCase();
  
  if (!cleanVin) {
    return { isValid: false, message: 'VIN number is required for fitment validation' };
  }
  
  if (cleanVin.length !== 17) {
    return { isValid: false, message: `VIN must be exactly 17 characters (currently ${cleanVin.length})` };
  }

  // Check for forbidden characters (I, O, Q)
  if (/[IOQ]/.test(cleanVin)) {
    return { isValid: false, message: 'VIN cannot contain letters I, O, or Q (confusable with 1 and 0)' };
  }

  // Check for invalid special characters
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) {
    return { isValid: false, message: 'VIN contains invalid characters. Use letters and numbers only.' };
  }

  return { isValid: true };
}

/**
 * Formats OEM Part numbers cleanly.
 * Example: "044650k280" -> "04465-0K280"
 */
export function formatOEM(oem: string): string {
  if (!oem) return '';
  const clean = oem.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (clean.length > 5 && !oem.includes('-')) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
  }
  return oem.toUpperCase();
}

/**
 * SA Phone number validator (e.g. +27 82 123 4567 or 0821234567)
 */
export function formatSAPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('27')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}
