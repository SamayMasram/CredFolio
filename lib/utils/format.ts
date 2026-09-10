/**
 * Returns initials from first name and last name.
 * e.g., "John Doe" -> "JD"
 * "Jane Alex Smith" -> "JS"
 * "Alex" -> "AL"
 */
export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'U';
  
  const cleanName = name.trim();
  const parts = cleanName.split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts[parts.length - 1].charAt(0);
  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Returns a formatted display name fallback if full_name is missing.
 */
export function formatDisplayName(fullName?: string | null, email?: string | null, fallback = 'Account Owner'): string {
  if (fullName && fullName.trim() && fullName.trim().toLowerCase() !== 'user profile') {
    return fullName.trim();
  }
  
  if (email && email.includes('@')) {
    const handle = email.split('@')[0].replace(/[._-]/g, ' ');
    return handle.charAt(0).toUpperCase() + handle.slice(1);
  }
  
  return fallback;
}
