// Validation helper for 1-2 word labels

export function validateLabel(label: string): { valid: boolean; error?: string } {
  if (!label || typeof label !== 'string') {
    return { valid: false, error: 'Label is required' };
  }

  const trimmed = label.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Label cannot be empty' };
  }

  if (trimmed.length > 18) {
    return { valid: false, error: 'Label must be 18 characters or less' };
  }

  // Split on whitespace to count words
  const words = trimmed.split(/\s+/);

  if (words.length > 2) {
    return { valid: false, error: 'Label must be 1-2 words only' };
  }

  // Check for invalid punctuation (allow only hyphens)
  const validPattern = /^[a-zA-Z0-9\s-]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: 'Label can only contain letters, numbers, spaces, and hyphens' };
  }

  return { valid: true };
}
